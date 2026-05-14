import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        connectedAccounts: true,
        _count: {
          select: { campaignSubmissions: true },
        },
      },
      // totalViews and moneyEarned are included automatically (scalar fields)
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Omit password
    const { password: _, ...userWithoutPassword } = user;

    return successResponse({ user: userWithoutPassword });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    console.error("Get user details error:", error);
    return errorResponse("Internal server error", 500);
  }
}
