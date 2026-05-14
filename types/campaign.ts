import { z } from "zod";

/**
 * Supported social-media platforms for a campaign.
 * Must stay in sync with the `Platform` enum in schema.prisma.
 */
export const PlatformEnum = z.enum([
  "INSTAGRAM",
  "YOUTUBE",
  "TIKTOK",
  "TWITTER",
  "FACEBOOK",
]);
export type Platform = z.infer<typeof PlatformEnum>;

// ── Create Campaign ──────────────────────────────────────────────────────────

/**
 * Validates the non-file fields when creating a campaign.
 * Image buffers are handled separately via multipart/form-data parsing.
 */
export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name must be at most 100 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),

  totalBudget: z
    .number({ message: "Total budget must be a number" })
    .positive("Total budget must be greater than 0"),

  supportedPlatforms: z
    .array(PlatformEnum)
    .min(1, "At least one platform is required"),

  maxSubmissionsPerAccount: z
    .number({ message: "Max submissions must be a number" })
    .int("Max submissions must be a whole number")
    .positive("Max submissions must be greater than 0"),

  feePerCreator: z
    .number({ message: "Fee per creator must be a number" })
    .nonnegative("Fee per creator cannot be negative"),

  maxEarningPerPostPerCreator: z
    .number({ message: "Max earning must be a number" })
    .nonnegative("Max earning cannot be negative"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// ── Update Campaign ──────────────────────────────────────────────────────────

/**
 * All fields are optional for PATCH semantics.
 * Images are handled separately via multipart/form-data.
 */
export const updateCampaignSchema = createCampaignSchema.partial();

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

// ── Response Types ───────────────────────────────────────────────────────────

export interface CampaignResponse {
  id: string;
  images: string[];
  name: string;
  description: string;
  totalBudget: number;
  supportedPlatforms: Platform[];
  maxSubmissionsPerAccount: number;
  feePerCreator: number;
  maxEarningPerPostPerCreator: number;
  status: "ACTIVE" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignListResponse {
  campaigns: CampaignResponse[];
  total: number;
}

export interface CampaignCursorListResponse {
  campaigns: CampaignResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CampaignSubmissionResponse {
  id: string;
  userId: string;
  campaignId: string;
  videoLink: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}
