"use client";

import { IndianRupee, Users, TrendingUp, Video } from "lucide-react";

interface CampaignStatsGridProps {
  totalBudget: number;
  feePerCreator: number;
  maxEarningPerPostPerCreator: number;
  maxSubmissionsPerAccount: number;
}

export default function CampaignStatsGrid({
  totalBudget,
  feePerCreator,
  maxEarningPerPostPerCreator,
  maxSubmissionsPerAccount,
}: CampaignStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        icon={IndianRupee}
        label="Total Budget"
        value={`₹${totalBudget.toLocaleString()}`}
        color="text-emerald-400"
        bg="bg-emerald-500/10"
      />
      <StatCard
        icon={Users}
        label="Fee / Creator"
        value={`₹${feePerCreator.toLocaleString()}`}
        color="text-violet-400"
        bg="bg-violet-500/10"
      />
      <StatCard
        icon={TrendingUp}
        label="Max / Post"
        value={`₹${maxEarningPerPostPerCreator.toLocaleString()}`}
        color="text-red-400"
        bg="bg-red-500/10"
      />
      <StatCard
        icon={Video}
        label="Max Submissions"
        value={maxSubmissionsPerAccount.toString()}
        color="text-cyan-400"
        bg="bg-cyan-500/10"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#14161F] border border-white/5 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${bg} flex items-center justify-center`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] sm:text-[11px] text-white/40 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
