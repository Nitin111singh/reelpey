import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { updateProfileSchema } from "@/types/auth";
import { requireAuth } from "@/lib/auth";
import authService from "@/service/auth/auth.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

/**
 * PATCH /api/user/profile
 * Update authenticated user's profile (phone number, UPI ID).
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const result = await authService.updateProfile(userId, validated);

    return successResponse(
      { message: "Profile updated successfully", ...result },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return errorResponse(validationError.message, 422);
    }

    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }

    console.error("Update profile error:", error);
    return errorResponse("Internal server error", 500);
  }
}
