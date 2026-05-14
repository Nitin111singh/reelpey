import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import instagramService from "@/service/instagram/instagram.service";

/**
 * GET /api/admin/instagram-verifications
 * List manual verification requests. Supports ?status=PENDING|APPROVED|REJECTED and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "15")));
    const status = searchParams.get("status") ?? undefined;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    const resolvedStatus = status && validStatuses.includes(status) ? status : undefined;

    const result = await instagramService.getPendingVerifications({
      page,
      limit,
      status: resolvedStatus,
    });

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Admin instagram verifications list error:", error);
    return errorResponse("Internal server error", 500);
  }
}
