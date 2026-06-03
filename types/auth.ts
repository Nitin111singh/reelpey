import { z } from "zod";

/**
 * Zod schemas for auth request validation.
 * Inferred TypeScript types are exported alongside.
 */

// ── Signup ───────────────────────────────────────────

/** Single-step signup: Email + Password (no phone required) */
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ── Login ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Email Verification ───────────────────────────────

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ── Forgot / Reset Password ──────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ── Profile Update ───────────────────────────────────

export const updatePhoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(
      /^\+?[0-9]+$/,
      "Phone number can only contain digits and an optional + prefix"
    )
    .optional()
    .or(z.literal("")),
});

const upiIdField = z
  .string()
  .regex(
    /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
    "Enter a valid UPI ID (e.g. name@bank)"
  )
  .optional()
  .or(z.literal(""));

export const updateUpiSchema = z.object({
  upiId: upiIdField,
});

/**
 * Combined profile update — every field optional so callers can send
 * partial payloads (just phoneNumber, just upiId, or both).
 */
export const updateProfileSchema = z.object({
  phoneNumber: updatePhoneSchema.shape.phoneNumber,
  upiId: upiIdField,
});

// ── Inferred Types ───────────────────────────────────

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;
export type UpdateUpiInput = z.infer<typeof updateUpiSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ── JWT & Response ───────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string | null;
    upiId: string | null;
    role: string;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  accessToken: string;
}
