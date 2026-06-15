import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { updateCampaignSchema } from "@/types/campaign";
import campaignService from "@/service/campaign/campaign.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * GET /api/campaigns/[id]
 * Get a single campaign by ID. ADMIN only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const campaign = await campaignService.getById(id);
    return successResponse(campaign);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Get campaign error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update a campaign. ADMIN only.
 *
 * Accepts multipart/form-data (all fields optional):
 *  - images  (File[]) — replaces all existing images when provided
 *  - name, description, totalBudget, supportedPlatforms,
 *    maxSubmissionsPerAccount, feePerCreator, maxEarningPerPostPerCreator
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const formData = await request.formData();

    // ── Optional new images ──────────────────────────────────────────────────
    const imageFiles = formData.getAll("images") as File[];
    let imageBuffers: Buffer[] | undefined;

    if (imageFiles.length > 0) {
      imageBuffers = await Promise.all(
        imageFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return Buffer.from(arrayBuffer);
        })
      );
    }

    // ── Parse non-file fields (only include fields that were actually sent) ──
    const rawBody: Record<string, unknown> = {};

    const name = formData.get("name");
    if (name !== null) rawBody.name = name;

    const description = formData.get("description");
    if (description !== null) rawBody.description = description;

    const totalBudget = formData.get("totalBudget");
    if (totalBudget !== null) rawBody.totalBudget = Number(totalBudget);

    const supportedPlatforms = formData.get("supportedPlatforms");
    if (supportedPlatforms !== null)
      rawBody.supportedPlatforms = JSON.parse(supportedPlatforms as string);

    const maxSubmissionsPerAccount = formData.get("maxSubmissionsPerAccount");
    if (maxSubmissionsPerAccount !== null)
      rawBody.maxSubmissionsPerAccount = Number(maxSubmissionsPerAccount);

    const feePerCreator = formData.get("feePerCreator");
    if (feePerCreator !== null) rawBody.feePerCreator = Number(feePerCreator);

    const maxEarningPerPostPerCreator = formData.get(
      "maxEarningPerPostPerCreator"
    );
    if (maxEarningPerPostPerCreator !== null)
      rawBody.maxEarningPerPostPerCreator = Number(maxEarningPerPostPerCreator);

    const completionPercentage = formData.get("completionPercentage");
    if (completionPercentage !== null)
      rawBody.completionPercentage = Number(completionPercentage);

    // ── Validate ─────────────────────────────────────────────────────────────
    const validated = updateCampaignSchema.parse(rawBody);

    // ── Update ───────────────────────────────────────────────────────────────
    const campaign = await campaignService.update(id, validated, imageBuffers);

    return successResponse(campaign);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return errorResponse(validationError.message, 422);
    }
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Update campaign error:", error);
    return errorResponse("Internal server error", 500);
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a campaign and its R2 images. ADMIN only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await campaignService.delete(id);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Delete campaign error:", error);
    return errorResponse("Internal server error", 500);
  }
}
