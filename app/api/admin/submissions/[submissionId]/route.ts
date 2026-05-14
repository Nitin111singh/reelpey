import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

const updateSchema = z.object({
  views:    z.number().int().min(0).optional(),
  earnings: z.number().min(0).optional(),
});

/**
 * PATCH /api/admin/submissions/[submissionId]
 * Update views and/or earnings for a submission.
 *
 * Efficiency: reads old values first, then delta-updates user totals.
 * No aggregate query — O(1) DB cost regardless of submission count.
 * Rule: rejected submissions do NOT contribute to user totals.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    await requireAdmin(request);
    const { submissionId } = await params;

    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Read old values before update
    const old = await prisma.campaignSubmission.findUnique({
      where: { id: submissionId },
      select: { userId: true, status: true, views: true, earnings: true },
    });
    if (!old) return errorResponse("Submission not found", 404);

    // Update the submission
    const submission = await prisma.campaignSubmission.update({
      where: { id: submissionId },
      data: validated,
      select: { id: true, userId: true, views: true, earnings: true, status: true },
    });

    // Only non-rejected submissions count toward user totals
    if (old.status !== "REJECTED") {
      const deltaViews    = (validated.views    ?? old.views    ?? 0) - (old.views    ?? 0);
      const deltaEarnings = (validated.earnings ?? old.earnings ?? 0) - (old.earnings ?? 0);

      if (deltaViews !== 0 || deltaEarnings !== 0) {
        await prisma.user.update({
          where: { id: old.userId },
          data: {
            totalViews:  { increment: deltaViews },
            moneyEarned: { increment: deltaEarnings },
          },
        });
      }
    }

    return successResponse({ submission });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Update submission stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
