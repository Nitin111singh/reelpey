"use client";

import { useState } from "react";
import { Wallet, Save, Loader2, CheckCircle2, X } from "lucide-react";

interface PaymentMethodCardProps {
  upiId: string | null | undefined;
  onUpiUpdated?: (upiId: string | null) => void;
}

export default function PaymentMethodCard({
  upiId: initialUpi,
  onUpiUpdated,
}: PaymentMethodCardProps) {
  const [upi, setUpi] = useState(initialUpi ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(value: string): string | null {
    if (!value) return null; // optional
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value))
      return "Enter a valid UPI ID (e.g. name@bank)";
    return null;
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);

    const validationError = validate(upi);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: upi || "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Failed to update UPI ID.");
        return;
      }

      setSuccess(true);
      setIsEditing(false);
      onUpiUpdated?.(data.data?.upiId ?? null);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-white">
          Payment Methods
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-medium text-cosmic-purple hover:text-white transition-colors"
          >
            {upi ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="relative">
            <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={upi}
              onChange={(e) => {
                setUpi(e.target.value);
                setError(null);
              }}
              placeholder="name@bank"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`w-full rounded-xl bg-[#0B0C10] border pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-cosmic-violet/60 focus:ring-2 focus:ring-cosmic-violet/20 ${
                error ? "border-red-500/50" : "border-white/10"
              }`}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-blue px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cosmic-violet/20 transition-all hover:shadow-xl hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setUpi(initialUpi ?? "");
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>

          <p className="text-xs text-white/30 leading-relaxed">
            ℹ️ Your UPI ID is used to send your campaign earnings.
          </p>
        </div>
      ) : upi ? (
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cosmic-violet/10 flex items-center justify-center text-cosmic-violet shrink-0">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/50">UPI ID</p>
            <p className="text-sm text-white font-medium truncate">{upi}</p>
          </div>
          {success && (
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Saved</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-white/10 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center h-[180px] sm:h-[200px]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/30">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-white font-medium mb-1 text-sm sm:text-base">
            No payment method added
          </p>
          <p className="text-xs sm:text-sm text-white/40">
            Add a UPI ID to receive earnings
          </p>
        </div>
      )}
    </div>
  );
}
