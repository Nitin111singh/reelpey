import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";

const updateStatsSchema = z.object({
  totalViews: z.number().int().min(0).optional(),
  moneyEarned: z.number().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const body = await request.json();
    const validated = updateStatsSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: validated,
      select: { id: true, totalViews: true, moneyEarned: true },
    });

    return successResponse({ user });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Update user stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
