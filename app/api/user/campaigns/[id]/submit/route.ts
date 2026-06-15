import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { AppError, NotFoundError } from "@/lib/errors";
import instagramService from "@/service/instagram/instagram.service";

const submitSchema = z.object({
  videoLink: z
    .string()
    .url("Please provide a valid video URL")
    .min(1, "Video link is required")
    .refine((v) => instagramService.extractMediaShortcode(v) !== null, {
      message: "Please submit a valid Instagram post or reel link.",
    }),
});

/**
 * POST /api/user/campaigns/[id]/submit
 * Submit a video link for a campaign. Authenticated users only.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth(request);
    const { id } = await params;

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Parse body
    const body = await request.json();
    const { videoLink } = submitSchema.parse(body);

    // Normalize to the Instagram media shortcode (validated by the schema above)
    const mediaShortcode = instagramService.extractMediaShortcode(videoLink)!;

    // Reject duplicate links for THIS user only — a different user pasting the
    // same reel earlier must never block the real owner from submitting it.
    const duplicate = await prisma.campaignSubmission.findFirst({
      where: { userId, mediaShortcode },
      select: { id: true },
    });
    if (duplicate) {
      return errorResponse("You have already submitted this link.", 409);
    }

    // Check submission limit per user
    const existingCount = await prisma.campaignSubmission.count({
      where: { campaignId: id, userId },
    });

    if (existingCount >= campaign.maxSubmissionsPerAccount) {
      return errorResponse(
        `You have reached the maximum of ${campaign.maxSubmissionsPerAccount} submissions for this campaign.`,
        422,
      );
    }

    // Create submission
    try {
      const submission = await prisma.campaignSubmission.create({
        data: {
          userId,
          campaignId: id,
          videoLink,
          mediaShortcode,
        },
      });
      return successResponse(submission, 201);
    } catch (createError) {
      // Race-safe fallback: composite unique constraint on (userId, mediaShortcode)
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        return errorResponse("You have already submitted this link.", 409);
      }
      throw createError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fromZodError } = await import("zod-validation-error");
      return errorResponse(fromZodError(error).message, 422);
    }
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Submit campaign error:", error);
    return errorResponse("Internal server error", 500);
  }
}
