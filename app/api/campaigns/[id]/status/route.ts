import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError, NotFoundError } from "@/lib/errors";
import { getImageUrls } from "@/lib/storage";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED"]),
});

/**
 * PATCH /api/campaigns/[id]/status
 * Set a campaign's status to ACTIVE or COMPLETED. ADMIN only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("status must be ACTIVE or COMPLETED", 422);
    }

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Campaign not found");

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return successResponse({ ...updated, images: getImageUrls(updated.images) });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Update campaign status error:", error);
    return errorResponse("Internal server error", 500);
  }
}
