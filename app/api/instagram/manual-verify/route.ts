import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { verifyAccountSchema } from "@/types/instagram";
import instagramService from "@/service/instagram/instagram.service";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/instagram/manual-verify
 * Submit account for admin manual review when auto-verify fails.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    // Rate limit: 3 requests per minute per user
    const rateLimitKey = `instagram-manual-verify:${userId}`;
    const rateLimitResult = rateLimit(rateLimitKey, 3, 60 * 1000);

    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many verification attempts. Please try again in ${Math.ceil(rateLimitResult.resetInMs / 1000)} seconds.`,
        429
      );
    }

    const body = await request.json();
    const parsed = verifyAccountSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return errorResponse("Validation failed", 422, errors as Record<string, string[]>);
    }

    const result = await instagramService.requestManualVerification(
      userId,
      parsed.data.accountId
    );

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Instagram manual verify error:", error);
    return errorResponse("An unexpected error occurred", 500);
  }
}
