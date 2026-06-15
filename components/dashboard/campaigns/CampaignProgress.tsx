interface CampaignProgressProps {
  /** Completion percentage, 0–100. */
  value: number;
  /** Optional smaller, compact variant for cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Animated gradient progress bar showing how much of a campaign is completed.
 * Reuses the global `.progress-bar` / `.progress-bar-fill` styles.
 */
export default function CampaignProgress({
  value,
  compact = false,
  className = "",
}: CampaignProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value || 0)));

  return (
    <div className={className}>
      <div
        className={`flex items-center justify-between mb-1.5 ${
          compact ? "text-[10px]" : "text-xs"
        } text-white/40`}
      >
        <span className="uppercase tracking-wider">Campaign Completed</span>
        <span className="font-semibold text-white/70 tabular-nums">{pct}%</span>
      </div>
      <div className="progress-bar" style={{ height: compact ? 4 : 8 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
