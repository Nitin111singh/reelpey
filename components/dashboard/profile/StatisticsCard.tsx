"use client";

import { useEffect, useState } from "react";
import {
  Compass,
  Video,
  DollarSign,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  Film,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Stats {
  totalVideos: number;
  totalViews: number;
  moneyEarned: number;
}

interface CampaignStat {
  campaignId: string;
  campaignName: string;
  campaignImage: string | null;
  campaignStatus: string;
  submissionCount: number;
  approvedCount: number;
  totalViews: number;
  totalEarnings: number;
}

export default function StatisticsCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    fetch("/api/user/campaign-stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCampaigns(d.data.campaigns); })
      .catch(console.error)
      .finally(() => setLoadingCampaigns(false));
  }, []);

  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 text-white font-bold mb-6 sm:mb-8">
        <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
          <Compass className="w-4 h-4" />
        </div>
        Statistics
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {loadingStats ? (
          <div className="sm:col-span-3 flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : (
          <>
            <StatItem icon={Video} label="Total videos" value={String(stats?.totalVideos ?? 0)} />
            <StatItem
              icon={DollarSign}
              label="Money earned"
              value={`$${(stats?.moneyEarned ?? 0).toLocaleString()}`}
            />
            <StatItem icon={Eye} label="Total views" value={(stats?.totalViews ?? 0).toLocaleString()} />
          </>
        )}
      </div>

      {/* Campaign breakdown */}
      <div className="mt-6">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-left group"
        >
          <span className="text-sm font-semibold text-white/60 group-hover:text-white/80 transition-colors">
            Campaign Breakdown
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-white/40" />
            : <ChevronDown className="w-4 h-4 text-white/40" />}
        </button>

        {expanded && (
          <div className="mt-3">
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Film className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-sm text-white/30">No campaigns joined yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div
                    key={c.campaignId}
                    className="bg-[#0B0C10] border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3"
                  >
                    {/* Campaign image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {c.campaignImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.campaignImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Campaign name + status */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{c.campaignName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          c.campaignStatus === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/5 text-white/40"
                        }`}>
                          {c.campaignStatus === "ACTIVE"
                            ? <><CheckCircle2 className="w-2.5 h-2.5" /> Active</>
                            : <><Clock className="w-2.5 h-2.5" /> Completed</>}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {c.submissionCount} submission{c.submissionCount !== 1 ? "s" : ""}
                          {c.approvedCount > 0 && ` · ${c.approvedCount} approved`}
                        </span>
                      </div>
                    </div>

                    {/* Views + Earnings */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                        <Eye className="w-3 h-3" />
                        {c.totalViews.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <DollarSign className="w-3 h-3" />
                        {c.totalEarnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#0B0C10] border border-white/5 rounded-xl p-4 sm:p-5 relative overflow-hidden group">
      <p className="text-sm text-white/50 mb-2">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-red-500">{value}</p>
      <Icon className="absolute right-4 bottom-4 w-10 h-10 sm:w-12 sm:h-12 text-red-500/5 group-hover:scale-110 transition-transform" />
    </div>
  );
}
