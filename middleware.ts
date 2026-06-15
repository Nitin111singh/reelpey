import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Server-side route guard for the admin area.
 *
 * Runs on every /admin request BEFORE the page renders and verifies the signed
 * `accessToken` JWT cookie. Only a token with role === "ADMIN" is allowed
 * through; everyone else is redirected to /login. This is signature-verified,
 * so (unlike the client-side guard) it can't be bypassed by tampering with
 * localStorage. The admin API routes still enforce requireAdmin independently.
 *
 * NOTE: middleware runs on the Edge runtime, so we use `jose` (Web Crypto)
 * rather than `jsonwebtoken`, and read JWT_SECRET straight from process.env
 * instead of importing the dotenv-based config module.
 */

const secretKey = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : null;

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  // If the secret isn't configured, fail closed — never expose the admin area.
  if (!secretKey) {
    console.error("[middleware] JWT_SECRET is not set — blocking /admin access");
    return redirectToLogin(request);
  }

  const token = request.cookies.get("accessToken")?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.role !== "ADMIN") {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  } catch {
    // Invalid / expired / forged token
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
