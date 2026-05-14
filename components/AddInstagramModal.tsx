"use client";

import { useState } from "react";
import {
  X,
  Instagram,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Clock,
} from "lucide-react";

type Step = "input" | "verify" | "success" | "pending";

interface VerificationData {
  accountId: string;
  verificationCode: string;
  username: string;
  accountUrl: string;
  instructions: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

export default function AddInstagramModal({
  isOpen,
  onClose,
  onAccountAdded,
}: Props) {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [showManualConfirm, setShowManualConfirm] = useState(false);

  const resetModal = () => {
    setStep("input");
    setInput("");
    setIsLoading(false);
    setError("");
    setVerificationData(null);
    setCopied(false);
    setVerifyMessage("");
    setShowManualConfirm(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleInitiate = async () => {
    if (!input.trim()) {
      setError("Please enter an Instagram username or URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instagram/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Failed to initiate verification");
        return;
      }

      setVerificationData(result.data);
      setStep("verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!verificationData) return;

    try {
      await navigator.clipboard.writeText(verificationData.verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = verificationData.verificationCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (!verificationData) return;

    setIsLoading(true);
    setError("");
    setVerifyMessage("");
    setShowManualConfirm(false);

    try {
      const response = await fetch("/api/instagram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: verificationData.accountId }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Verification failed");
        return;
      }

      if (result.data.success) {
        setStep("success");
        onAccountAdded();
      } else if (result.data.pendingAdminReview) {
        setStep("pending");
        onAccountAdded();
      } else {
        setVerifyMessage(result.data.message);
        if (result.data.requiresManualConfirmation) {
          setShowManualConfirm(true);
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!verificationData) return;

    setIsLoading(true);
    setError("");
    setVerifyMessage("");

    try {
      const response = await fetch("/api/instagram/manual-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: verificationData.accountId }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Verification failed");
        return;
      }

      if (result.data.success) {
        setStep("success");
        onAccountAdded();
      } else if (result.data.pendingAdminReview) {
        setStep("pending");
        onAccountAdded();
      } else {
        setVerifyMessage(result.data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-[#1A1D27] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {step === "input" && "Connect Instagram"}
                {step === "verify" && "Verify Account"}
                {step === "success" && "Connected!"}
                {step === "pending" && "Review Pending"}
              </h3>
              <p className="text-xs text-white/50">
                {step === "input" && "Link your Instagram account"}
                {step === "verify" && `@${verificationData?.username}`}
                {step === "success" && `@${verificationData?.username}`}
                {step === "pending" && `@${verificationData?.username}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Instagram Username or Profile URL
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError("");
                  }}
                  placeholder="@username or instagram.com/username"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleInitiate()}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-white/40">
                We&apos;ll generate a unique code for you to add to your
                Instagram bio to verify ownership.
              </p>
            </div>
          )}

          {/* Step 2: Verify */}
          {step === "verify" && verificationData && (
            <div className="space-y-5">
              {/* Code Display */}
              <div className="bg-[#0B0C10] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/50 mb-2">
                  Your verification code:
                </p>
                <div className="flex items-center justify-between">
                  <code className="text-xl font-mono font-bold text-red-500">
                    {verificationData.verificationCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">
                  Follow these steps:
                </h4>
                <ol className="space-y-2 text-sm text-white/70">
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Copy the verification code above</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>
                      Go to your{" "}
                      <a
                        href={verificationData.accountUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                      >
                        Instagram profile
                        <ExternalLink className="w-3 h-3" />
                      </a>{" "}
                      and edit your bio
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>Add the code anywhere in your bio</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <span>Click Verify below to check automatically, or confirm manually</span>
                  </li>
                </ol>
              </div>

              {/* Error or verification message */}
              {error && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {verifyMessage && !error && (
                <div className="flex items-start gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{verifyMessage}</span>
                </div>
              )}

              <p className="text-xs text-white/40">
                Code expires in 30 minutes. You can remove it from your bio
                after verification.
              </p>
            </div>
          )}

          {/* Step 3: Pending admin review */}
          {step === "pending" && verificationData && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Request Submitted
              </h4>
              <p className="text-white/60 text-sm">
                Your verification request for{" "}
                <span className="text-white font-medium">@{verificationData.username}</span>{" "}
                is pending admin review.
              </p>
              <p className="text-white/40 text-xs mt-3">
                An admin will check your Instagram bio for the code and approve or reject within 24 hours. Keep the code in your bio until then.
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && verificationData && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Account Verified!
              </h4>
              <p className="text-white/60 text-sm">
                @{verificationData.username} has been successfully connected to
                your account.
              </p>
              <p className="text-white/40 text-xs mt-3">
                You can now remove the verification code from your bio.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-white/5 bg-[#14161F]">
          {step === "input" && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                disabled={isLoading || !input.trim()}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Code"
                )}
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <button
                onClick={() => setStep("input")}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              {showManualConfirm ? (
                <button
                  onClick={handleManualVerify}
                  disabled={isLoading}
                  className="px-5 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Request Manual Review
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              )}
            </>
          )}

          {step === "pending" && (
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
            >
              Got it
            </button>
          )}

          {step === "success" && (
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg shadow-red-500/20"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
