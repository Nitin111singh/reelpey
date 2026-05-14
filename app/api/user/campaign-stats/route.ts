import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { getImageUrls } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const submissions = await prisma.campaignSubmission.findMany({
      where: { userId },
      select: {
        campaignId: true,
        status: true,
        views: true,
        earnings: true,
        campaign: { select: { id: true, name: true, images: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by campaign; rejected submissions don't contribute to views/earnings
    const map = new Map<
      string,
      {
        campaignId: string;
        campaignName: string;
        campaignImage: string | null;
        campaignStatus: string;
        submissionCount: number;
        approvedCount: number;
        totalViews: number;
        totalEarnings: number;
      }
    >();

    for (const s of submissions) {
      if (!map.has(s.campaignId)) {
        const images = getImageUrls(s.campaign.images);
        map.set(s.campaignId, {
          campaignId:     s.campaignId,
          campaignName:   s.campaign.name,
          campaignImage:  images[0] ?? null,
          campaignStatus: s.campaign.status,
          submissionCount: 0,
          approvedCount:   0,
          totalViews:      0,
          totalEarnings:   0,
        });
      }
      const g = map.get(s.campaignId)!;
      g.submissionCount++;
      if (s.status === "APPROVED") g.approvedCount++;
      // Only non-rejected submissions count toward views/earnings
      if (s.status !== "REJECTED") {
        g.totalViews    += s.views    ?? 0;
        g.totalEarnings += s.earnings ?? 0;
      }
    }

    return successResponse({ campaigns: [...map.values()] });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Get campaign stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
