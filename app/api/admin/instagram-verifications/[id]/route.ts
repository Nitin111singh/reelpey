import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import instagramService from "@/service/instagram/instagram.service";

const reviewSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(1000).optional(),
});

/**
 * PATCH /api/admin/instagram-verifications/[id]
 * Approve or reject a manual verification request.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Validation failed", 422);
    }

    const result = await instagramService.adminReviewVerification(
      id,
      parsed.data.action,
      parsed.data.adminNotes
    );

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Admin instagram review error:", error);
    return errorResponse("Internal server error", 500);
  }
}
