import crypto from "crypto";
import prisma from "@/lib/prisma";
import { AppError, ConflictError } from "@/lib/errors";
import { getTokenExpiry } from "@/lib/token";
import type {
  ConnectedAccountResponse,
  InitiateVerificationResponse,
  VerifyAccountResponse,
  AdminVerificationRequest,
} from "@/types/instagram";

class InstagramService {
  private readonly CODE_PREFIX = "reelpe";
  private readonly CODE_EXPIRY_MINUTES = 30;

  generateVerificationCode(): string {
    const randomDigits = crypto.randomInt(10000, 99999);
    return `${this.CODE_PREFIX}-${randomDigits}`;
  }

  extractUsername(input: string): string {
    if (input.startsWith("@")) {
      return input.slice(1).toLowerCase();
    }

    try {
      let urlString = input;
      if (!urlString.startsWith("http")) {
        urlString = `https://${urlString}`;
      }

      const url = new URL(urlString);

      if (
        url.hostname === "instagram.com" ||
        url.hostname === "www.instagram.com"
      ) {
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          const reserved = ["p", "reel", "reels", "stories", "explore", "accounts"];
          if (!reserved.includes(pathParts[0].toLowerCase())) {
            return pathParts[0].toLowerCase();
          }
        }
      }
    } catch {
      // Not a valid URL, treat as username
    }

    const cleaned = input.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9._]{1,30}$/;
    if (!usernameRegex.test(cleaned)) {
      throw new AppError("Invalid Instagram username format", 400);
    }

    return cleaned;
  }

  buildAccountUrl(username: string): string {
    return `https://www.instagram.com/${username}/`;
  }

  /**
   * Fetch the actual Instagram bio text for a given username.
   * Returns null only when we genuinely cannot reach/parse the profile.
   *
   * NOTE: Instagram's og:description contains a generic summary like
   * "155 Followers, 203 Following - @username" — NOT the bio. We skip
   * those meta tags and go straight for the embedded JSON / internal API.
   */
  async fetchInstagramBio(username: string): Promise<string | null> {
    // Strategy 1: extract "biography" key from the JSON data embedded in the page
    const htmlBio = await this._fetchBioFromPageJson(username);
    if (htmlBio !== undefined) return htmlBio; // may be "" for empty bio

    // Strategy 2: Instagram's internal profile-info API (often works server-side)
    const apiBio = await this._fetchBioMobileApi(username);
    if (apiBio !== undefined) return apiBio;

    return null;
  }

  /**
   * Fetch the Instagram profile HTML and extract biography from embedded JSON.
   * Returns undefined when the page couldn't be fetched/parsed at all.
   * Returns "" (empty string) when the profile was found but bio is empty.
   */
  private async _fetchBioFromPageJson(username: string): Promise<string | undefined> {
    try {
      const url = this.buildAccountUrl(username);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Upgrade-Insecure-Requests": "1",
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        console.error(`[ig-verify] HTML fetch failed for @${username}: HTTP ${response.status}`);
        return undefined;
      }

      const html = await response.text();

      // Primary: "biography" key in embedded script JSON blobs
      // Instagram embeds profile JSON in <script> tags — this is the real bio
      const bioMatch = html.match(/"biography"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (bioMatch) {
        try {
          const bio = JSON.parse(`"${bioMatch[1]}"`);
          console.log(`[ig-verify] HTML JSON biography for @${username}: "${bio}"`);
          return bio as string;
        } catch {
          console.log(`[ig-verify] HTML JSON biography (raw) for @${username}: "${bioMatch[1]}"`);
          return bioMatch[1];
        }
      }

      // Fallback: JSON-LD description (sometimes contains bio)
      const jsonLdMatch = html.match(
        /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
      );
      if (jsonLdMatch) {
        try {
          const data = JSON.parse(jsonLdMatch[1]);
          if (typeof data.description === "string") {
            console.log(`[ig-verify] JSON-LD description for @${username}: "${data.description}"`);
            return data.description;
          }
        } catch {
          // ignore
        }
      }

      // Page loaded but no bio data found — Instagram may be serving a login wall
      console.warn(`[ig-verify] Page loaded for @${username} but no biography found in HTML. Page length: ${html.length}`);
      return undefined;
    } catch (error) {
      console.error(`[ig-verify] HTML fetch error for @${username}:`, error);
      return undefined;
    }
  }

  /**
   * Instagram's internal profile API — returns actual biography field.
   * Returns undefined when the endpoint is unavailable/blocked.
   */
  private async _fetchBioMobileApi(username: string): Promise<string | undefined> {
    try {
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          Accept: "application/json",
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest",
          Referer: `https://www.instagram.com/${username}/`,
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        console.error(`[ig-verify] Mobile API failed for @${username}: HTTP ${response.status}`);
        return undefined;
      }

      const data = await response.json();
      const bio: string | undefined = data?.data?.user?.biography;
      console.log(`[ig-verify] Mobile API biography for @${username}: "${bio}"`);
      return bio ?? undefined;
    } catch (error) {
      console.error(`[ig-verify] Mobile API error for @${username}:`, error);
      return undefined;
    }
  }

  verifyBioContainsCode(bio: string, code: string): boolean {
    return bio.toLowerCase().includes(code.toLowerCase());
  }

  async initiateVerification(
    userId: string,
    input: string
  ): Promise<InitiateVerificationResponse> {
    const username = this.extractUsername(input);
    const accountUrl = this.buildAccountUrl(username);

    const existing = await prisma.connectedAccount.findFirst({
      where: { userId, username },
    });

    if (existing?.isVerified) {
      throw new ConflictError("This Instagram account is already connected");
    }

    const verificationCode = this.generateVerificationCode();
    const codeExpiresAt = getTokenExpiry(this.CODE_EXPIRY_MINUTES);

    let account;

    if (existing) {
      account = await prisma.connectedAccount.update({
        where: { id: existing.id },
        data: {
          verificationCode,
          codeExpiresAt,
          isVerified: false,
          verifiedAt: null,
          manualVerificationStatus: "NONE",
          adminNotes: null,
          reviewedAt: null,
        },
      });
    } else {
      account = await prisma.connectedAccount.create({
        data: {
          userId,
          username,
          accountUrl,
          verificationCode,
          codeExpiresAt,
          isVerified: false,
          manualVerificationStatus: "NONE",
        },
      });
    }

    return {
      accountId: account.id,
      verificationCode,
      username,
      accountUrl,
      instructions: `Add "${verificationCode}" to your Instagram bio, then click Verify. Code expires in ${this.CODE_EXPIRY_MINUTES} minutes.`,
    };
  }

  async verifyAccount(
    userId: string,
    accountId: string
  ): Promise<VerifyAccountResponse> {
    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new AppError("Account not found", 404);
    if (account.userId !== userId) throw new AppError("Unauthorized", 403);

    if (account.isVerified) {
      return {
        success: true,
        message: "Account is already verified",
        account: this.formatAccount(account),
      };
    }

    if (new Date() > account.codeExpiresAt) {
      throw new AppError(
        "Verification code has expired. Please generate a new one.",
        400
      );
    }

    const bio = await this.fetchInstagramBio(account.username);

    if (bio === null) {
      // Completely failed to reach Instagram
      console.warn(`[ig-verify] Could not fetch profile for @${account.username} — offering manual review`);
      return {
        success: false,
        message:
          "Unable to reach your Instagram profile automatically. Click 'Request Manual Review' and an admin will check your bio manually.",
        requiresManualConfirmation: true,
      };
    }

    if (!this.verifyBioContainsCode(bio, account.verificationCode)) {
      // Bio was fetched but code not found — could be extraction issue or code genuinely missing
      console.warn(
        `[ig-verify] Code "${account.verificationCode}" NOT found in bio for @${account.username}. Bio snippet: "${bio.slice(0, 200)}"`
      );
      return {
        success: false,
        message: `Could not find the verification code in your Instagram bio. Make sure "${account.verificationCode}" is saved in your bio, then try again. If you already added it, use 'Request Manual Review'.`,
        requiresManualConfirmation: true,
      };
    }

    const verified = await prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        manualVerificationStatus: "NONE",
      },
    });

    return {
      success: true,
      message: "Instagram account verified successfully! You can now remove the code from your bio.",
      account: this.formatAccount(verified),
    };
  }

  /**
   * Submit account for admin manual review instead of auto-approving.
   * Admin will check the bio manually and approve or reject.
   */
  async requestManualVerification(
    userId: string,
    accountId: string
  ): Promise<VerifyAccountResponse> {
    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new AppError("Account not found", 404);
    if (account.userId !== userId) throw new AppError("Unauthorized", 403);

    if (account.isVerified) {
      return {
        success: true,
        message: "Account is already verified",
        account: this.formatAccount(account),
      };
    }

    if (new Date() > account.codeExpiresAt) {
      throw new AppError(
        "Verification code has expired. Please generate a new one.",
        400
      );
    }

    if (account.manualVerificationStatus === "PENDING") {
      return {
        success: false,
        message: "A manual review request is already pending. Please wait for admin approval.",
        pendingAdminReview: true,
        account: this.formatAccount(account),
      };
    }

    const updated = await prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        manualVerificationStatus: "PENDING",
        adminNotes: null,
        reviewedAt: null,
      },
    });

    return {
      success: false,
      message: "Manual review request submitted. An admin will check your Instagram bio and approve or reject within 24 hours.",
      pendingAdminReview: true,
      account: this.formatAccount(updated),
    };
  }

  async getAccounts(userId: string): Promise<ConnectedAccountResponse[]> {
    const accounts = await prisma.connectedAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return accounts.map(this.formatAccount);
  }

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new AppError("Account not found", 404);
    if (account.userId !== userId) throw new AppError("Unauthorized", 403);

    await prisma.connectedAccount.delete({ where: { id: accountId } });
  }

  // ── Admin methods ──────────────────────────────────────────────────────────

  async getPendingVerifications(opts: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{ verifications: AdminVerificationRequest[]; total: number }> {
    const statusValues: Array<"PENDING" | "APPROVED" | "REJECTED"> = ["PENDING", "APPROVED", "REJECTED"];
    const where = opts.status
      ? { manualVerificationStatus: opts.status as "PENDING" | "APPROVED" | "REJECTED" }
      : { manualVerificationStatus: { in: statusValues } };

    const [verifications, total] = await Promise.all([
      prisma.connectedAccount.findMany({
        where,
        include: { user: { select: { id: true, username: true, email: true } } },
        orderBy: [
          { manualVerificationStatus: "asc" },
          { updatedAt: "desc" },
        ],
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      prisma.connectedAccount.count({ where }),
    ]);

    return {
      verifications: verifications.map((v) => this.formatAdminVerification(v)),
      total,
    };
  }

  async adminReviewVerification(
    accountId: string,
    action: "APPROVED" | "REJECTED",
    adminNotes?: string
  ): Promise<AdminVerificationRequest> {
    const account = await prisma.connectedAccount.findUnique({
      where: { id: accountId },
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    if (!account) throw new AppError("Account not found", 404);

    if (account.manualVerificationStatus !== "PENDING") {
      throw new AppError("This request is not in a pending state", 400);
    }

    const updated = await prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        manualVerificationStatus: action,
        isVerified: action === "APPROVED",
        verifiedAt: action === "APPROVED" ? new Date() : account.verifiedAt,
        adminNotes: adminNotes?.trim() || null,
        reviewedAt: new Date(),
      },
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    return this.formatAdminVerification(updated);
  }

  private formatAccount(account: {
    id: string;
    username: string;
    accountUrl: string;
    isVerified: boolean;
    verifiedAt: Date | null;
    createdAt: Date;
    manualVerificationStatus: string;
  }): ConnectedAccountResponse {
    return {
      id: account.id,
      username: account.username,
      accountUrl: account.accountUrl,
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      manualVerificationStatus: account.manualVerificationStatus as ConnectedAccountResponse["manualVerificationStatus"],
    };
  }

  private formatAdminVerification(account: {
    id: string;
    username: string;
    accountUrl: string;
    verificationCode: string;
    manualVerificationStatus: string;
    adminNotes: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; username: string; email: string };
  }): AdminVerificationRequest {
    return {
      id: account.id,
      username: account.username,
      accountUrl: account.accountUrl,
      verificationCode: account.verificationCode,
      manualVerificationStatus: account.manualVerificationStatus as AdminVerificationRequest["manualVerificationStatus"],
      adminNotes: account.adminNotes,
      reviewedAt: account.reviewedAt?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      user: account.user,
    };
  }
}

const instagramService = new InstagramService();
export default instagramService;
