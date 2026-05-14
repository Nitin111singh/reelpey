"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Video,
  ExternalLink,
  Loader2,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  Pencil,
  Check,
  X,
  Film,
  TrendingUp,
  Search,
} from "lucide-react";
import type { Submission } from "@/components/admin/types";

const LIMIT = 20;

const STATUS_STYLES = {
  PENDING:  { label: "Pending",  icon: Clock,        cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  APPROVED: { label: "Approved", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  REJECTED: { label: "Rejected", icon: XCircle,      cls: "bg-red-500/15 text-red-400 border-red-500/25" },
} as const;

interface CampaignInfo {
  id: string;
  name: string;
  images: string[];
  totalBudget: number;
  feePerCreator: number;
}

interface CampaignStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  totalViews: number;
  totalEarnings: number;
}

export default function CampaignSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [stats, setStats] = useState<CampaignStats>({ total: 0, approved: 0, rejected: 0, pending: 0, totalViews: 0, totalEarnings: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // search
  const [searchInput, setSearchInput] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // approve/reject
  const [reviewing, setReviewing] = useState<string | null>(null);

  // inline stats edit: submissionId → { views, earnings }
  const [editing, setEditing] = useState<Record<string, { views: number; earnings: number }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = useCallback(async (p: number, username: string) => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (username) qs.set("username", username);
      const res = await fetch(`/api/admin/campaigns/${campaignId}/submissions?${qs}`);
      const data = await res.json();
      if (data.success) {
        const subs: Submission[] = data.data.submissions;
        setSubmissions(subs);
        setTotal(data.data.total);
        if (data.data.campaign) setCampaign(data.data.campaign);

        // compute stats — rejected submissions don't count toward views/earnings
        const approved      = subs.filter((s) => s.status === "APPROVED").length;
        const rejected      = subs.filter((s) => s.status === "REJECTED").length;
        const pending       = subs.filter((s) => s.status === "PENDING").length;
        const totalViews    = subs.filter((s) => s.status !== "REJECTED").reduce((a, s) => a + (s.views    ?? 0), 0);
        const totalEarnings = subs.filter((s) => s.status !== "REJECTED").reduce((a, s) => a + (s.earnings ?? 0), 0);
        setStats({ total: data.data.total, approved, rejected, pending, totalViews, totalEarnings });
      }
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  // Debounce search input → usernameFilter
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setUsernameFilter(searchInput.trim());
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  useEffect(() => { load(page, usernameFilter); }, [page, usernameFilter, load]);

  function recomputeStats(subs: Submission[], apiTotal: number) {
    const approved      = subs.filter((s) => s.status === "APPROVED").length;
    const rejected      = subs.filter((s) => s.status === "REJECTED").length;
    const pending       = subs.filter((s) => s.status === "PENDING").length;
    const totalViews    = subs.filter((s) => s.status !== "REJECTED").reduce((a, s) => a + (s.views    ?? 0), 0);
    const totalEarnings = subs.filter((s) => s.status !== "REJECTED").reduce((a, s) => a + (s.earnings ?? 0), 0);
    setStats({ total: apiTotal, approved, rejected, pending, totalViews, totalEarnings });
  }

  async function handleReview(submissionId: string, newStatus: "APPROVED" | "REJECTED") {
    setReviewing(submissionId);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = submissions.map((s) =>
          s.id === submissionId ? { ...s, status: newStatus } : s
        );
        setSubmissions(updated);
        recomputeStats(updated, total);
      }
    } finally {
      setReviewing(null);
    }
  }

  function startEdit(s: Submission) {
    setEditing((prev) => ({ ...prev, [s.id]: { views: s.views ?? 0, earnings: s.earnings ?? 0 } }));
  }

  function cancelEdit(id: string) {
    setEditing((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  async function saveEdit(id: string) {
    const vals = editing[id];
    if (!vals) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals),
      });
      const data = await res.json();
      if (data.success) {
        const updated = submissions.map((s) => s.id === id ? { ...s, ...vals } : s);
        setSubmissions(updated);
        recomputeStats(updated, total);
        cancelEdit(id);
      }
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-full bg-[#060510] text-white">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-[#060510]/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-5 w-px bg-white/10 shrink-0" />
            <div className="flex items-center gap-3 min-w-0">
              {campaign?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={campaign.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4 text-white/30" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white leading-tight">Submissions</h1>
                {campaign && <p className="text-xs text-white/30 truncate">{campaign.name}</p>}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 font-medium shrink-0">
            {total} total
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Summary stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total",    value: stats.total,                          color: "text-white",        bg: "bg-white/5",           border: "border-white/8" },
            { label: "Approved", value: stats.approved,                       color: "text-emerald-400",  bg: "bg-emerald-500/8",     border: "border-emerald-500/15" },
            { label: "Rejected", value: stats.rejected,                       color: "text-red-400",      bg: "bg-red-500/8",         border: "border-red-500/15" },
            { label: "Pending",  value: stats.pending,                        color: "text-amber-400",    bg: "bg-amber-500/8",       border: "border-amber-500/15" },
            { label: "Views",    value: stats.totalViews.toLocaleString(),    color: "text-cyan-400",     bg: "bg-cyan-500/8",        border: "border-cyan-500/15" },
            { label: "Earned",   value: `$${stats.totalEarnings.toLocaleString()}`, color: "text-violet-400", bg: "bg-violet-500/8", border: "border-violet-500/15" },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-3 text-center`}>
              <p className="text-xs text-white/40 mb-1">{card.label}</p>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search / filter ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by username…"
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Video className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-white font-medium mb-1">No submissions yet</p>
            <p className="text-sm text-white/40">
              {usernameFilter
                ? `No submissions found for "${usernameFilter}".`
                : "Users haven't submitted video links for this campaign."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-[#0c0a1e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
                      <th className="px-4 py-3.5 font-medium w-10">#</th>
                      <th className="px-4 py-3.5 font-medium">User</th>
                      <th className="px-4 py-3.5 font-medium">Email</th>
                      <th className="px-4 py-3.5 font-medium">Video</th>
                      <th className="px-4 py-3.5 font-medium text-center">Status</th>
                      <th className="px-4 py-3.5 font-medium text-center">Review</th>
                      <th className="px-4 py-3.5 font-medium text-right">Views</th>
                      <th className="px-4 py-3.5 font-medium text-right">Earnings ($)</th>
                      <th className="px-4 py-3.5 font-medium text-center">Edit Stats</th>
                      <th className="px-4 py-3.5 font-medium text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {submissions.map((s, i) => {
                      const si = STATUS_STYLES[s.status];
                      const StatusIcon = si.icon;
                      const isReviewing = reviewing === s.id;
                      const isEditing = !!editing[s.id];
                      const isSaving = !!saving[s.id];
                      const editVals = editing[s.id];

                      return (
                        <tr key={s.id} className="hover:bg-white/[0.015] transition-colors">
                          {/* # */}
                          <td className="px-4 py-4 text-white/25 font-mono text-xs">
                            {(page - 1) * LIMIT + i + 1}
                          </td>

                          {/* User */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => router.push(`/admin/dashboard/users/${s.userId}`)}
                              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                                {s.user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium truncate max-w-[120px] text-xs">
                                @{s.user.username}
                              </span>
                            </button>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-white/40 text-xs">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px]">{s.user.email}</span>
                            </div>
                          </td>

                          {/* Video link */}
                          <td className="px-4 py-4">
                            <a
                              href={s.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-medium transition-all max-w-[180px] truncate"
                              title={s.videoLink}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{s.videoLink}</span>
                            </a>
                          </td>

                          {/* Status badge */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${si.cls}`}>
                              <StatusIcon className="w-3 h-3" />
                              {si.label}
                            </span>
                          </td>

                          {/* Approve / Reject */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleReview(s.id, "APPROVED")}
                                disabled={isReviewing || s.status === "APPROVED"}
                                title="Approve"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => handleReview(s.id, "REJECTED")}
                                disabled={isReviewing || s.status === "REJECTED"}
                                title="Reject"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Views */}
                          <td className="px-4 py-4 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                value={editVals.views}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [s.id]: { ...prev[s.id], views: Number(e.target.value) } }))
                                }
                                className="w-20 bg-white/5 border border-cyan-500/30 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-cyan-500/60"
                              />
                            ) : (
                              <div className="flex items-center justify-end gap-1 text-cyan-400 font-semibold text-xs">
                                <Eye className="w-3 h-3" />
                                {(s.views ?? 0).toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Earnings */}
                          <td className="px-4 py-4 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={editVals.earnings}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [s.id]: { ...prev[s.id], earnings: Number(e.target.value) } }))
                                }
                                className="w-20 bg-white/5 border border-emerald-500/30 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-emerald-500/60"
                              />
                            ) : (
                              <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold text-xs">
                                <DollarSign className="w-3 h-3" />
                                {(s.earnings ?? 0).toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Edit stats actions */}
                          <td className="px-4 py-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => saveEdit(s.id)}
                                  disabled={isSaving}
                                  title="Save"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-50"
                                >
                                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => cancelEdit(s.id)}
                                  title="Cancel"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(s)}
                                title="Edit views & earnings"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors mx-auto"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center gap-1 justify-end text-white/30 text-xs">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Totals footer row */}
                  {submissions.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-white/10 bg-white/[0.02]">
                        <td colSpan={6} className="px-4 py-3 text-xs text-white/30 font-medium">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Page totals
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-cyan-400 font-bold text-xs">
                            <Eye className="w-3 h-3" />
                            {submissions.reduce((a, s) => a + (s.views ?? 0), 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold text-xs">
                            <DollarSign className="w-3 h-3" />
                            {submissions.reduce((a, s) => a + (s.earnings ?? 0), 0).toLocaleString()}
                          </div>
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-white/40">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
