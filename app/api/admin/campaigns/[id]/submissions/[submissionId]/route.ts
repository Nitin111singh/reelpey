import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError, NotFoundError } from "@/lib/errors";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

/**
 * PATCH /api/admin/campaigns/[id]/submissions/[submissionId]
 * Approve or reject a submission.
 *
 * Efficiency: delta-updates user totals (no aggregate query).
 * Rule: only non-REJECTED submissions count toward user stats.
 *   - Going TO REJECTED   → subtract this submission's views/earnings
 *   - Coming FROM REJECTED → add this submission's views/earnings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    await requireAdmin(request);
    const { submissionId } = await params;

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return errorResponse("status must be APPROVED or REJECTED", 422);

    const newStatus = parsed.data.status;

    // Fetch current state (need views, earnings, old status for delta calc)
    const existing = await prisma.campaignSubmission.findUnique({
      where: { id: submissionId },
      select: { userId: true, status: true, views: true, earnings: true },
    });
    if (!existing) throw new NotFoundError("Submission not found");

    const oldStatus = existing.status;

    // Update status
    const updated = await prisma.campaignSubmission.update({
      where: { id: submissionId },
      data: { status: newStatus },
      include: {
        user: { select: { id: true, username: true, email: true, phoneNumber: true } },
      },
    });

    // Delta-update user totals (no aggregate needed)
    const wasRejected = oldStatus === "REJECTED";
    const nowRejected = newStatus === "REJECTED";

    if (!wasRejected && nowRejected) {
      // Subtract this submission's contribution
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          totalViews:  { decrement: existing.views   ?? 0 },
          moneyEarned: { decrement: existing.earnings ?? 0 },
        },
      });
    } else if (wasRejected && !nowRejected) {
      // Add this submission's contribution back
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          totalViews:  { increment: existing.views   ?? 0 },
          moneyEarned: { increment: existing.earnings ?? 0 },
        },
      });
    }
    // APPROVED → PENDING or PENDING → APPROVED: no total change

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Review submission error:", error);
    return errorResponse("Internal server error", 500);
  }
}
