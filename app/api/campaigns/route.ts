import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createCampaignSchema } from "@/types/campaign";
import campaignService from "@/service/campaign/campaign.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * POST /api/campaigns
 * Create a new campaign. ADMIN only.
 *
 * Accepts multipart/form-data:
 *  - images  (File[]) — one or more campaign images (required)
 *  - name    (string)
 *  - description (string)
 *  - totalBudget (number)
 *  - supportedPlatforms (JSON array string, e.g. '["INSTAGRAM","YOUTUBE"]')
 *  - maxSubmissionsPerAccount (number)
 *  - feePerCreator (number)
 *  - maxEarningPerPostPerCreator (number)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();

    // ── Extract image files ──────────────────────────────────────────────────
    const imageFiles = formData.getAll("images") as File[];
    if (!imageFiles || imageFiles.length === 0) {
      return errorResponse("At least one campaign image is required", 422);
    }

    // Convert File objects → Buffers for Sharp + R2
    const imageBuffers: Buffer[] = await Promise.all(
      imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }),
    );

    // ── Parse & coerce non-file fields ───────────────────────────────────────
    const rawBody = {
      name: formData.get("name"),
      description: formData.get("description"),
      totalBudget: Number(formData.get("totalBudget")),
      supportedPlatforms: JSON.parse(
        (formData.get("supportedPlatforms") as string) ?? "[]",
      ),
      maxSubmissionsPerAccount: Number(
        formData.get("maxSubmissionsPerAccount"),
      ),
      feePerCreator: Number(formData.get("feePerCreator")),
      maxEarningPerPostPerCreator: Number(
        formData.get("maxEarningPerPostPerCreator"),
      ),
    };

    // ── Validate ─────────────────────────────────────────────────────────────
    const validated = createCampaignSchema.parse(rawBody);

    // ── Create ───────────────────────────────────────────────────────────────
    const campaign = await campaignService.create(validated, imageBuffers);

    return successResponse(campaign, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return errorResponse(validationError.message, 422);
    }
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Create campaign error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/campaigns
 * List all campaigns. ADMIN only.
 *
 * Query params:
 *  - page  (number, default 1)
 *  - limit (number, default 20, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const rawStatus = searchParams.get("status");
    const status = rawStatus === "ACTIVE" || rawStatus === "COMPLETED" ? rawStatus : undefined;

    const result = await campaignService.list(page, limit, status);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("List campaigns error:", error);
    return errorResponse("Internal server error", 500);
  }
}
