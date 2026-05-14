import { DollarSign, TrendingUp, Pencil, Trash2, Video, Image as ImageIcon, CheckCircle2, RotateCcw } from "lucide-react";
import type { Campaign } from "@/components/admin/types";
import { PLATFORM_COLORS } from "@/components/admin/constants";

interface StatChipProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

function StatChip({ icon: Icon, label, value, color }: StatChipProps) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3 h-3 ${color}`} />
        <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  onViewSubmissions: () => void;
  onStatusChange: (id: string, status: "ACTIVE" | "COMPLETED") => void;
}

export default function CampaignCard({
  campaign: c,
  onEdit,
  onDelete,
  onViewSubmissions,
  onStatusChange,
}: CampaignCardProps) {
  const isCompleted = c.status === "COMPLETED";

  return (
    <div className={`group relative bg-[#0f0d24] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:shadow-xl ${
      isCompleted
        ? "border-white/[0.04] opacity-75 hover:opacity-90 hover:border-white/10"
        : "border-white/[0.06] hover:border-violet-500/30 hover:shadow-violet-500/10"
    }`}>
      {/* ── Image strip ── */}
      <div className="relative h-44 bg-[#0a0818] overflow-hidden shrink-0">
        {c.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.images[0]}
            alt={c.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isCompleted ? "" : "group-hover:scale-105"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/10" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#0f0d24] to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isCompleted ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-500/30 backdrop-blur-sm text-[10px] font-semibold text-slate-300 border border-slate-500/40 uppercase tracking-wider">
              Completed
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Active
            </span>
          )}
        </div>

        {c.images.length > 1 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/70 border border-white/10">
            +{c.images.length - 1} more
          </span>
        )}

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {c.supportedPlatforms.slice(0, 3).map((p) => (
            <span
              key={p}
              className={`inline-flex items-center rounded-full border bg-linear-to-r px-2 py-0.5 text-[10px] font-semibold ${
                PLATFORM_COLORS[p] ?? "text-white/50 border-white/10"
              }`}
            >
              {p}
            </span>
          ))}
          {c.supportedPlatforms.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
              +{c.supportedPlatforms.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-white text-base line-clamp-1 mb-1">{c.name}</h3>
        <p className="text-xs text-white/40 line-clamp-2 mb-4">{c.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
          <StatChip
            icon={DollarSign}
            label="Budget"
            value={`$${c.totalBudget.toLocaleString()}`}
            color="text-emerald-400"
          />
          <StatChip
            icon={TrendingUp}
            label="Fee / Creator"
            value={`$${c.feePerCreator.toLocaleString()}`}
            color="text-violet-400"
          />
        </div>

        {/* ── Action footer ── */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
          <button
            onClick={onViewSubmissions}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            Submissions
          </button>

          {/* Complete / Reactivate */}
          {isCompleted ? (
            <button
              onClick={() => onStatusChange(c.id, "ACTIVE")}
              title="Reactivate campaign"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(c.id, "COMPLETED")}
              title="Mark as completed"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-300 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onEdit}
            title="Edit campaign"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 hover:text-violet-300 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Delete campaign"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
