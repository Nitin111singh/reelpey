"use client";

import { Video, Send, Loader2, X, Link as LinkIcon } from "lucide-react";

interface SubmitVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  maxSubmissionsPerAccount: number;
  videoLink: string;
  onVideoLinkChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SubmitVideoModal({
  isOpen,
  onClose,
  campaignName,
  maxSubmissionsPerAccount,
  videoLink,
  onVideoLinkChange,
  isSubmitting,
  onSubmit,
}: SubmitVideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-[#12102a] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-red-400" />
            <h3 className="text-base font-bold text-white">Submit Video</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <p className="text-sm text-white/50 mb-4">
              Paste the link to your{" "}
              <span className="text-white font-medium">Instagram</span> reel or
              post for{" "}
              <span className="text-white font-medium">{campaignName}</span>.
              You can submit up to{" "}
              <span className="text-white font-medium">
                {maxSubmissionsPerAccount}
              </span>{" "}
              videos for this campaign. Each link can only be submitted once.
            </p>

            <label className="text-sm font-medium text-white/70 mb-1.5 block">
              Instagram URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="url"
                required
                value={videoLink}
                onChange={(e) => onVideoLinkChange(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
