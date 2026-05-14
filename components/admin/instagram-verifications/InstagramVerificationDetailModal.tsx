"use client";

import { useState } from "react";
import Modal from "@/components/admin/Modal";
import type { AdminVerificationRequest } from "@/types/instagram";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Mail,
  Instagram,
  Code,
  ExternalLink,
  StickyNote,
  Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-emerald-400",
  REJECTED: "text-red-400",
};

interface Props {
  verification: AdminVerificationRequest;
  onClose: () => void;
  onReviewed: () => void;
}

export default function InstagramVerificationDetailModal({
  verification,
  onClose,
  onReviewed,
}: Props) {
  const [adminNotes, setAdminNotes] = useState(verification.adminNotes ?? "");
  const [isUpdating, setIsUpdating] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState("");

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    setIsUpdating(action);
    setError("");

    try {
      const res = await fetch(`/api/admin/instagram-verifications/${verification.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes: adminNotes.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to update status");
        return;
      }

      onReviewed();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  const submittedAt = new Date(verification.updatedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isPending = verification.manualVerificationStatus === "PENDING";

  return (
    <Modal onClose={onClose} title="Instagram Verification Request" wide>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Status & date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white/40">{submittedAt}</span>
          </div>
          <span className={`text-sm font-bold ${STATUS_COLORS[verification.manualVerificationStatus]}`}>
            {verification.manualVerificationStatus}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <DetailItem icon={User} label="Creator" value={verification.user.username} />
          <DetailItem icon={Mail} label="Email" value={verification.user.email} />

          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 min-w-[140px]">
              <Instagram className="w-4 h-4 text-white/30" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Instagram
              </span>
            </div>
            <a
              href={verification.accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-400 hover:text-pink-300 inline-flex items-center gap-1"
            >
              @{verification.username}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Verification code — admin needs to check for this in the bio */}
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                Verification Code to Find in Bio
              </span>
            </div>
            <code className="text-xl font-mono font-bold text-violet-300">
              {verification.verificationCode}
            </code>
            <p className="text-xs text-white/40 mt-2">
              Go to the Instagram profile above, open the bio, and confirm this code is present before approving.
            </p>
          </div>
        </div>

        {/* Admin notes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-white/30" />
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Admin Notes
            </span>
          </div>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Add internal notes (optional)..."
            disabled={!isPending}
            className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:bg-white/[0.09] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-y min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Show existing admin notes when already reviewed */}
        {!isPending && verification.adminNotes && (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Admin Notes</p>
            <p className="text-sm text-white/70">{verification.adminNotes}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleAction("REJECTED")}
              disabled={isUpdating !== null}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating === "REJECTED" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject
            </button>
            <button
              onClick={() => handleAction("APPROVED")}
              disabled={isUpdating !== null}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating === "APPROVED" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 min-w-[140px]">
        <Icon className="w-4 h-4 text-white/30" />
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}
