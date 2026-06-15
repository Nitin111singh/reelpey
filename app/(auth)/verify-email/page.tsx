"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Film,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const isPending = searchParams.get("pending") === "true";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    isPending ? "pending" : token ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Resend state
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!token || isPending) return;

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setErrorMessage(
            data.error?.message ?? "Verification failed. The link may be expired."
          );
          return;
        }

        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token, isPending]);

  async function handleResend() {
    if (!email || resendStatus === "loading") return;

    setResendStatus("loading");
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResendStatus("error");
        setResendMessage(data.error?.message ?? "Failed to resend. Please try again.");
        return;
      }

      setResendStatus("success");
      setResendMessage("Verification email sent! Check your inbox.");
    } catch {
      setResendStatus("error");
      setResendMessage("Something went wrong. Please try again.");
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
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cosmic-violet to-cosmic-cyan flex items-center justify-center shadow-lg shadow-cosmic-violet/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-wide text-white">
              REELPEY
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* ── Pending (just signed up) ── */}
          {status === "pending" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cosmic-blue/10 border border-cosmic-blue/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-cosmic-blue" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Check your email
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                We&apos;ve sent a verification link to{" "}
                <span className="text-white/80 font-medium">
                  {email || "your email"}
                </span>
                . Click the link to verify your email and activate your account.
              </p>
              <div className="pt-4 space-y-3">
                <Link
                  href="/login"
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:shadow-cosmic-violet/30 hover:scale-[1.01]"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Resend verification button */}
                {email && (
                  <button
                    onClick={handleResend}
                    disabled={resendStatus === "loading" || resendStatus === "success"}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}

                {/* Resend feedback messages */}
                {resendStatus === "error" && resendMessage && (
                  <p className="text-xs text-red-400 text-center">{resendMessage}</p>
                )}
                {resendStatus === "success" && resendMessage && (
                  <p className="text-xs text-emerald-400 text-center">{resendMessage}</p>
                )}
              </div>
              <p className="text-xs text-white/25 pt-2">
                Didn&apos;t get the email? Check your spam folder or click resend above.
              </p>
            </div>
          )}

          {/* ── Loading ── */}
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-cosmic-violet animate-spin mx-auto" />
              <h2 className="text-2xl font-bold text-white">Verifying…</h2>
              <p className="text-sm text-white/50">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Email <span className="gradient-text">verified!</span>
              </h2>
              <p className="text-sm text-white/50">
                Your email has been successfully verified. You can now log in to
                your account.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:shadow-cosmic-violet/30 hover:scale-[1.01]"
                >
                  Go to Login
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Verification failed
              </h2>
              <p className="text-sm text-white/50">
                {errorMessage ||
                  "The verification link is invalid or has expired."}
              </p>
              <div className="pt-4 space-y-3">
                {/* Resend a fresh link when we know the email */}
                {email ? (
                  <button
                    onClick={handleResend}
                    disabled={resendStatus === "loading" || resendStatus === "success"}
                    className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:shadow-cosmic-violet/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {resendStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : resendStatus === "success" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Email Sent!
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Send a New Verification Link
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:shadow-cosmic-violet/30 hover:scale-[1.01]"
                  >
                    Try Again
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}

                {/* Resend feedback messages */}
                {resendStatus === "error" && resendMessage && (
                  <p className="text-xs text-red-400 text-center">{resendMessage}</p>
                )}
                {resendStatus === "success" && resendMessage && (
                  <p className="text-xs text-emerald-400 text-center">{resendMessage}</p>
                )}

                <Link
                  href="/login"
                  className="block text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
