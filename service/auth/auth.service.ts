import prisma from "@/lib/prisma";
import authRegistry from "./auth.registry";
import { AuthenticationError, ConflictError, AppError } from "@/lib/errors";
import { generateSecureToken, getTokenExpiry } from "@/lib/token";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/lib/email";
import type {
  SignupInput,
  LoginInput,
  AuthResponse,
  JwtPayload,
} from "@/types/auth";

/**
 * Auth service — Facade that orchestrates auth flows
 * using strategies retrieved from the AuthRegistry.
 */

class AuthService {
  /**
   * Register a new user.
   * Creates user with username = email, sends verification email.
   * Phone number is NOT collected at signup — it can be added later via profile.
   */
  async register(input: SignupInput): Promise<AuthResponse> {
    const passwordStrategy = authRegistry.getPasswordStrategy();
    const tokenStrategy = authRegistry.getTokenStrategy();

    // Check for existing user by email only
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("A user with this email already exists");
    }

    // Hash password
    const hashedPassword = await passwordStrategy.hash(input.password);

    // Generate email verification token (valid for 24 hours)
    const emailToken = generateSecureToken();
    const tokenExpiry = getTokenExpiry(24 * 60); // 24 hours

    // Create user — username defaults to email, no phone number at signup
    const user = await prisma.user.create({
      data: {
        username: input.email,
        email: input.email,
        password: hashedPassword,
        emailVerificationToken: emailToken,
        tokenExpiry,
      },
    });

    // Send verification email (non-blocking — don't fail signup if email fails)
    sendVerificationEmail(user.email, emailToken).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    // Generate access token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = tokenStrategy.generateAccessToken(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        upiId: user.upiId,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Verify email using token from the verification link.
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    // Check expiry
    if (user.tokenExpiry && new Date() > user.tokenExpiry) {
      throw new AppError("Verification token has expired. Please request a new one.", 400);
    }

    // Mark as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        tokenExpiry: null,
      },
    });

    return { message: "Email verified successfully" };
  }

  /**
   * Resend email verification link.
   * Generates a new token and sends a fresh email.
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal whether the email exists
    if (!user) {
      return { message: "If an account exists with that email, a new verification link has been sent." };
    }

    // Already verified
    if (user.isEmailVerified) {
      return { message: "Email is already verified. You can log in." };
    }

    // Generate new verification token (valid for 24 hours)
    const emailToken = generateSecureToken();
    const tokenExpiry = getTokenExpiry(24 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: emailToken,
        tokenExpiry,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, emailToken);

    return { message: "If an account exists with that email, a new verification link has been sent." };
  }

  /**
   * Login with email + password.
   * Rejects if email is not verified.
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const passwordStrategy = authRegistry.getPasswordStrategy();
    const tokenStrategy = authRegistry.getTokenStrategy();

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await passwordStrategy.compare(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check email verification
    if (!user.isEmailVerified) {
      throw new AppError(
        "Please verify your email address before logging in. Check your inbox for the verification link.",
        403
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = tokenStrategy.generateAccessToken(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        upiId: user.upiId,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Forgot password — sends reset email with secure token.
   * Uses separate resetPasswordTokenExpiry to avoid conflicting with email verification.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If an account exists with that email, a reset link has been sent." };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateSecureToken();
    const resetPasswordTokenExpiry = getTokenExpiry(60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry,
      },
    });

    // Send reset email
    await sendResetPasswordEmail(user.email, resetToken);

    return { message: "If an account exists with that email, a reset link has been sent." };
  }

  /**
   * Reset password using token from reset email.
   * Checks resetPasswordTokenExpiry (separate from email verification expiry).
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const passwordStrategy = authRegistry.getPasswordStrategy();

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Check expiry using the dedicated reset password expiry field
    if (user.resetPasswordTokenExpiry && new Date() > user.resetPasswordTokenExpiry) {
      throw new AppError("Reset token has expired. Please request a new one.", 400);
    }

    // Hash new password and clear token
    const hashedPassword = await passwordStrategy.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return { message: "Password reset successfully. You can now log in with your new password." };
  }

  /**
   * Update user's phone number (from profile page).
   * Phone is optional and not verified for now.
   */
  async updatePhone(
    userId: string,
    phoneNumber: string | undefined
  ): Promise<{ phoneNumber: string | null }> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneNumber || null,
      },
    });

    return { phoneNumber: user.phoneNumber };
  }

  /**
   * Update the authenticated user's profile fields (phone, UPI ID).
   * Only fields explicitly provided are changed; empty strings clear a field.
   */
  async updateProfile(
    userId: string,
    data: { phoneNumber?: string; upiId?: string }
  ): Promise<{ phoneNumber: string | null; upiId: string | null }> {
    const updateData: { phoneNumber?: string | null; upiId?: string | null } =
      {};
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber || null;
    }
    if (data.upiId !== undefined) {
      updateData.upiId = data.upiId || null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { phoneNumber: user.phoneNumber, upiId: user.upiId };
  }
}

const authService = new AuthService();
export default authService;
