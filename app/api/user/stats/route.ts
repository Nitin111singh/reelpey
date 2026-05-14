import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const [totalVideos, agg] = await Promise.all([
      // Total videos = all submissions regardless of status
      prisma.campaignSubmission.count({ where: { userId } }),
      // Views/earnings exclude REJECTED
      prisma.campaignSubmission.aggregate({
        where: { userId, status: { not: "REJECTED" } },
        _sum: { views: true, earnings: true },
      }),
    ]);

    return successResponse({
      totalVideos,
      totalViews:  agg._sum.views    ?? 0,
      moneyEarned: agg._sum.earnings ?? 0,
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Get user stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
