"use client";

import {
  Instagram,
  Plus,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Trash2,
  XCircle,
  HourglassIcon,
} from "lucide-react";
import type { ConnectedAccount } from "@/components/dashboard/types";

interface ConnectedAccountsCardProps {
  connectedAccounts: ConnectedAccount[];
  isLoadingAccounts: boolean;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
}

export default function ConnectedAccountsCard({
  connectedAccounts,
  isLoadingAccounts,
  onAddAccount,
  onDeleteAccount,
}: ConnectedAccountsCardProps) {
  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2 text-white font-bold">
          <div className="w-6 h-6 rounded bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shrink-0">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm sm:text-base">Connected Accounts</span>
          {connectedAccounts.filter((a) => a.isVerified).length > 0 && (
            <span className="ml-1 sm:ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/70">
              {connectedAccounts.filter((a) => a.isVerified).length}
            </span>
          )}
        </div>
        <button
          onClick={onAddAccount}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Instagram
        </button>
      </div>

      {/* Content */}
      {isLoadingAccounts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
        </div>
      ) : connectedAccounts.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/30">
            <Instagram className="w-6 h-6" />
          </div>
          <p className="text-white font-medium mb-1 text-sm sm:text-base">
            No Instagram accounts connected
          </p>
          <p className="text-xs sm:text-sm text-white/40 mb-4">
            Connect your Instagram account to start participating in campaigns
          </p>
          <button
            onClick={onAddAccount}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {connectedAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 sm:gap-4 bg-[#0B0C10] border border-white/5 rounded-xl px-3 sm:px-4 py-3 group hover:border-white/10 transition-colors"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shrink-0">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={account.accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-red-400 transition-colors inline-flex items-center gap-1 text-sm"
                  >
                    @{account.username}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  {account.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : account.manualVerificationStatus === "PENDING" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium" title="Admin is reviewing your Instagram bio">
                      <HourglassIcon className="w-3 h-3" />
                      Under Review
                    </span>
                  ) : account.manualVerificationStatus === "REJECTED" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium" title="Verification was rejected. Please try again.">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  {account.isVerified && account.verifiedAt
                    ? `Verified on ${new Date(account.verifiedAt).toLocaleDateString()}`
                    : account.manualVerificationStatus === "PENDING"
                    ? "Awaiting admin review — keep the code in your bio"
                    : account.manualVerificationStatus === "REJECTED"
                    ? "Verification rejected — please re-add the code and try again"
                    : `Added on ${new Date(account.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => onDeleteAccount(account.id)}
                className="text-white/20 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all p-2"
                title="Remove account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
