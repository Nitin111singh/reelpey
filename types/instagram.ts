import { z } from "zod";

/**
 * Zod schemas and types for Instagram account verification.
 */

// ── Instagram URL/Username Input ───────────────────────────

const instagramUsernameRegex = /^[a-zA-Z0-9._]{1,30}$/;

export const initiateVerificationSchema = z.object({
  input: z
    .string()
    .min(1, "Instagram username or URL is required")
    .transform((val) => val.trim()),
});

export const verifyAccountSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
});

export const deleteAccountSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
});

// ── Response Types ─────────────────────────────────────────

export type ManualVerificationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface ConnectedAccountResponse {
  id: string;
  username: string;
  accountUrl: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  manualVerificationStatus: ManualVerificationStatus;
}

export interface InitiateVerificationResponse {
  accountId: string;
  verificationCode: string;
  username: string;
  accountUrl: string;
  instructions: string;
}

export interface VerifyAccountResponse {
  success: boolean;
  message: string;
  account?: ConnectedAccountResponse;
  requiresManualConfirmation?: boolean;
  pendingAdminReview?: boolean;
}

export interface AdminVerificationRequest {
  id: string;
  username: string;
  accountUrl: string;
  verificationCode: string;
  manualVerificationStatus: ManualVerificationStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// ── Inferred Types ─────────────────────────────────────────

export type InitiateVerificationInput = z.infer<typeof initiateVerificationSchema>;
export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
