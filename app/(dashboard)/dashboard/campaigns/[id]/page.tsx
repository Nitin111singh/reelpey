"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Film,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import CampaignHero from "@/components/dashboard/campaigns/CampaignHero";
import CampaignMeta from "@/components/dashboard/campaigns/CampaignMeta";
import CampaignStatsGrid from "@/components/dashboard/campaigns/CampaignStatsGrid";
import CampaignProgress from "@/components/dashboard/campaigns/CampaignProgress";
import SubmitVideoModal from "@/components/dashboard/campaigns/SubmitVideoModal";
import SubmitCTA from "@/components/dashboard/campaigns/SubmitCTA";

interface CampaignDetail {
  id: string;
  images: string[];
  name: string;
  description: string;
  totalBudget: number;
  supportedPlatforms: string[];
  maxSubmissionsPerAccount: number;
  feePerCreator: number;
  maxEarningPerPostPerCreator: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Submission modal state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/user/campaigns/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error?.message ?? "Campaign not found");
          return;
        }

        setCampaign(data.data);
      } catch {
        setError("Failed to load campaign");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaign();
  }, [id]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoLink.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/user/campaigns/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoLink: videoLink.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error?.message ?? "Submission failed.", false);
      } else {
        showToast("Submission sent successfully!", true);
        setVideoLink("");
        setIsSubmitOpen(false);
      }
    } catch {
      showToast("Network error. Please try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0C10]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0B0C10] text-white gap-4 px-4">
        <Film className="w-12 h-12 text-white/10" />
        <p className="text-white/60 text-center">{error ?? "Campaign not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-60 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-fade-in-up max-w-[calc(100vw-2rem)] ${
            toast.ok
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">{toast.msg}</span>
        </div>
      )}

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 sm:gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Campaigns</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            onClick={() => setIsSubmitOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Video</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <CampaignHero
          images={campaign.images}
          name={campaign.name}
          activeImage={activeImage}
          onImageChange={setActiveImage}
        />

        <CampaignMeta
          name={campaign.name}
          supportedPlatforms={campaign.supportedPlatforms}
          createdAt={campaign.createdAt}
        />

        <CampaignStatsGrid
          totalBudget={campaign.totalBudget}
          feePerCreator={campaign.feePerCreator}
          maxEarningPerPostPerCreator={campaign.maxEarningPerPostPerCreator}
          maxSubmissionsPerAccount={campaign.maxSubmissionsPerAccount}
        />

        {/* Completion progress */}
        <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6">
          <CampaignProgress value={campaign.completionPercentage} />
        </div>

        {/* Description */}
        <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            About this Campaign
          </h2>
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {campaign.description}
          </p>
        </div>

        <SubmitCTA
          maxEarningPerPostPerCreator={campaign.maxEarningPerPostPerCreator}
          onSubmit={() => setIsSubmitOpen(true)}
        />
      </div>

      {/* ── Submit Video Modal ── */}
      <SubmitVideoModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        campaignName={campaign.name}
        maxSubmissionsPerAccount={campaign.maxSubmissionsPerAccount}
        videoLink={videoLink}
        onVideoLinkChange={setVideoLink}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
