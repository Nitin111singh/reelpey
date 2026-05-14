import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { getImageUrls } from "@/lib/storage";
import { AppError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const { searchParams } = request.nextUrl;
    const page     = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit    = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const username = searchParams.get("username")?.trim() || undefined;
    const skip     = (page - 1) * limit;

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return errorResponse("Campaign not found", 404);

    const where = {
      campaignId: id,
      ...(username ? { user: { username: { contains: username, mode: "insensitive" as const } } } : {}),
    };

    const [submissions, total] = await prisma.$transaction([
      prisma.campaignSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, email: true, phoneNumber: true } },
        },
      }),
      prisma.campaignSubmission.count({ where }),
    ]);

    return successResponse({
      submissions,
      total,
      page,
      limit,
      campaign: { ...campaign, images: getImageUrls(campaign.images) },
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("List submissions error:", error);
    return errorResponse("Internal server error", 500);
  }
}
