"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginInput } from "@/types/auth";
import { Film, Eye, EyeOff, Loader2, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  const [form, setForm] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Unverified-email recovery (shown when login returns 403)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resendMessage, setResendMessage] = useState("");

  async function handleResend() {
    if (!form.email || resendStatus === "loading") return;

    setResendStatus("loading");
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResendStatus("error");
        setResendMessage(
          data.error?.message ?? "Failed to resend. Please try again."
        );
        return;
      }

      setResendStatus("success");
      setResendMessage("Verification email sent! Check your inbox.");
    } catch {
      setResendStatus("error");
      setResendMessage("Something went wrong. Please try again.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setNeedsVerification(false);
    setResendStatus("idle");
    setResendMessage("");

    // Client-side validation
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(
          data.error?.message ?? "Login failed. Please try again."
        );
        // 403 = email not verified — offer a resend path instead of a dead end
        if (res.status === 403) setNeedsVerification(true);
        return;
      }

      // Save via context
      const authedUser = data.data?.user;
      if (authedUser) {
        login(authedUser);

        // Redirect to admin page if user is ADMIN
        if (authedUser.role === "ADMIN") {
          router.push("/admin/dashboard");
          return;
        }
      }

      // Default redirect
      router.push("/dashboard");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Aurora orbs */}
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6 py-12 animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 mb-6 cursor-pointer"
            aria-label="Go to home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-violet to-cosmic-cyan flex items-center justify-center shadow-lg shadow-cosmic-violet/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-wide text-white">
              REELPEY
            </span>
          </Link>

          <h1 className="text-4xl font-extrabold text-white text-center leading-tight">
            Welcome <span className="gradient-text">back.</span>
          </h1>
          <p className="mt-3 text-white/50 text-sm text-center">
            Sign in to continue creating and earning.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 space-y-5">
          {serverError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          {/* Unverified email — let the user resend the verification link */}
          {needsVerification && (
            <div className="rounded-xl border border-cosmic-blue/25 bg-cosmic-blue/5 px-4 py-3 space-y-3">
              <p className="text-xs text-white/50 leading-relaxed">
                Haven&apos;t received it? We can send a new verification link to{" "}
                <span className="text-white/80 font-medium">{form.email}</span>.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === "loading" || resendStatus === "success"}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendStatus === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : resendStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Email Sent!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
              {resendStatus === "error" && resendMessage && (
                <p className="text-xs text-red-400">{resendMessage}</p>
              )}
              {resendStatus === "success" && resendMessage && (
                <p className="text-xs text-emerald-400">{resendMessage}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-white/70"
                htmlFor="email"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-xl bg-white/[0.07] border px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:bg-white/[0.1] focus:border-cosmic-violet/60 focus:ring-2 focus:ring-cosmic-violet/20 ${errors.email ? "border-red-500/50" : "border-white/10"
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-white/70"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cosmic-purple hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl bg-white/[0.07] border px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all focus:bg-white/[0.1] focus:border-cosmic-violet/60 focus:ring-2 focus:ring-cosmic-violet/20 ${errors.password ? "border-red-500/50" : "border-white/10"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:shadow-cosmic-violet/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-cosmic-purple hover:text-white transition-colors underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-white/20">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline hover:text-white/40 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline hover:text-white/40 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
