import prisma from "@/lib/prisma";
import {
  uploadCampaignImages,
  deleteCampaignImage,
  getImageUrls,
} from "@/lib/storage";
import { NotFoundError } from "@/lib/errors";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignResponse,
  CampaignListResponse,
  CampaignCursorListResponse,
} from "@/types/campaign";

/**
 * CampaignService — handles all Campaign CRUD operations.
 *
 * Responsibilities:
 *  - Validate business rules (delegated to Zod in the route layer)
 *  - Upload / delete images via Cloudflare R2 (with Sharp compression)
 *  - Persist and retrieve Campaign records via Prisma
 *
 * NOTE: The `images` column in the DB stores storage keys (relative paths),
 * e.g. "campaigns/abc123.webp". Full URLs are resolved at the API response
 * layer using `getImageUrls()`.
 */
class CampaignService {
  /**
   * Create a new campaign.
   *
   * @param data        - Validated campaign fields
   * @param imageBuffers - Raw image file buffers (≥ 1 required)
   * @returns The newly created campaign (with full image URLs)
   */
  async create(
    data: CreateCampaignInput,
    imageBuffers: Buffer[],
  ): Promise<CampaignResponse> {
    if (imageBuffers.length === 0) {
      throw new Error("At least one campaign image is required");
    }

    // Upload (compress → R2) in parallel — returns storage keys
    const imageKeys = await uploadCampaignImages(imageBuffers);

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        images: imageKeys,
      },
    });

    return this.toResponse(campaign);
  }

  /**
   * Update an existing campaign.
   * If new image buffers are provided, they replace the current images
   * and the old ones are deleted from R2.
   *
   * @param id          - Campaign ID
   * @param data        - Partial campaign fields to update
   * @param imageBuffers - Optional new image buffers (replaces existing images)
   */
  async update(
    id: string,
    data: UpdateCampaignInput,
    imageBuffers?: Buffer[],
  ): Promise<CampaignResponse> {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Campaign with id "${id}" not found`);
    }

    let imageKeys: string[] | undefined;

    if (imageBuffers && imageBuffers.length > 0) {
      // Upload new images first — returns storage keys
      imageKeys = await uploadCampaignImages(imageBuffers);

      // Then delete the old ones from R2 (non-blocking — don't fail the update)
      Promise.all(
        existing.images.map((key) => {
          try {
            return deleteCampaignImage(key);
          } catch {
            // Log but don't throw — R2 cleanup is best-effort
            console.warn(`Failed to delete old campaign image: ${key}`);
            return Promise.resolve();
          }
        }),
      ).catch(console.warn);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        ...(imageKeys ? { images: imageKeys } : {}),
      },
    });

    return this.toResponse(updated);
  }

  /**
   * Delete a campaign and clean up its images from R2.
   *
   * @param id - Campaign ID
   */
  async delete(id: string): Promise<{ message: string }> {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Campaign with id "${id}" not found`);
    }

    // Delete images from R2 (best-effort, non-blocking)
    Promise.all(
      existing.images.map((key) => {
        try {
          return deleteCampaignImage(key);
        } catch {
          console.warn(`Failed to delete campaign image: ${key}`);
          return Promise.resolve();
        }
      }),
    ).catch(console.warn);

    await prisma.campaign.delete({ where: { id } });

    return { message: "Campaign deleted successfully" };
  }

  /**
   * List all campaigns with optional pagination.
   *
   * @param page  - Page number (1-indexed, default 1)
   * @param limit - Items per page (default 20, max 100)
   */
  async list(
    page: number = 1,
    limit: number = 20,
    status?: "ACTIVE" | "COMPLETED",
  ): Promise<CampaignListResponse> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;
    const where = status ? { status } : {};

    const [campaigns, total] = await prisma.$transaction([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return {
      campaigns: campaigns.map((c) => this.toResponse(c)),
      total,
    };
  }

  /**
   * Get a single campaign by its ID.
   *
   * @param id - Campaign ID
   */
  async getById(id: string): Promise<CampaignResponse> {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new NotFoundError(`Campaign with id "${id}" not found`);
    }
    return this.toResponse(campaign);
  }

  /**
   * List campaigns for authenticated users with cursor-based pagination.
   * Designed for infinite scroll on the frontend.
   *
   * @param cursor - ID of the last campaign from the previous page (undefined for first page)
   * @param limit  - Number of items to fetch (default 12)
   */
  async listForUsers(
    cursor?: string,
    limit: number = 12,
  ): Promise<CampaignCursorListResponse> {
    const safeLimit = Math.min(limit, 50);

    // Only show ACTIVE campaigns to users
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: safeLimit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = campaigns.length > safeLimit;
    const items = hasMore ? campaigns.slice(0, safeLimit) : campaigns;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      campaigns: items.map((c) => this.toResponse(c)),
      nextCursor,
      hasMore,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Transform a raw Prisma campaign into a CampaignResponse,
   * resolving storage keys → full public image URLs.
   */
  private toResponse(campaign: {
    id: string;
    images: string[];
    name: string;
    description: string;
    totalBudget: number;
    supportedPlatforms: string[];
    maxSubmissionsPerAccount: number;
    feePerCreator: number;
    maxEarningPerPostPerCreator: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): CampaignResponse {
    return {
      ...campaign,
      images: getImageUrls(campaign.images),
    } as CampaignResponse;
  }
}

const campaignService = new CampaignService();
export default campaignService;
