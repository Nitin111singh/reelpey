"use client";

import { Instagram, ExternalLink } from "lucide-react";
import type { AdminVerificationRequest } from "@/types/instagram";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/25",
};

interface Props {
  verification: AdminVerificationRequest;
  onClick: () => void;
}

export default function InstagramVerificationRow({ verification, onClick }: Props) {
  const submittedAt = new Date(verification.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] cursor-pointer transition-colors"
    >
      {/* Instagram account */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shrink-0">
          <Instagram className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <a
            href={verification.accountUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-white hover:text-pink-400 transition-colors inline-flex items-center gap-1 truncate"
          >
            @{verification.username}
            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
          </a>
          <p className="text-xs text-white/40 font-mono truncate">{verification.verificationCode}</p>
        </div>
      </div>

      {/* User */}
      <div className="min-w-0">
        <p className="text-sm text-white/80 truncate">{verification.user.username}</p>
        <p className="text-xs text-white/40 truncate">{verification.user.email}</p>
      </div>

      {/* Verification code */}
      <div>
        <code className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-1 rounded-md">
          {verification.verificationCode}
        </code>
      </div>

      {/* Status */}
      <div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[verification.manualVerificationStatus]}`}
        >
          {verification.manualVerificationStatus}
        </span>
      </div>

      {/* Date */}
      <div className="text-sm text-white/40">{submittedAt}</div>
    </div>
  );
}
