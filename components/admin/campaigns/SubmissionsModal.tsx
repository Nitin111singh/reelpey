"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
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
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/admin/EmptyState";
import type { Campaign, Submission } from "@/components/admin/types";

interface SubmissionsModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const LIMIT = 10;

const STATUS_STYLES: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-500/15 text-amber-400 border-amber-500/25",       icon: Clock },
  APPROVED: { label: "Approved", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-500/15 text-red-400 border-red-500/25",             icon: XCircle },
};

export default function SubmissionsModal({ campaign, onClose }: SubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const [editing, setEditing] = useState<Record<string, { views: number; earnings: number }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/submissions?page=${p}&limit=${LIMIT}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data.submissions);
        setTotal(data.data.total);
      }
    } finally {
      setIsLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => { load(page); }, [page, load]);

  async function handleReview(submissionId: string, status: "APPROVED" | "REJECTED") {
    setReviewing(submissionId);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.map((s) => s.id === submissionId ? { ...s, status } : s));
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
        setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...vals } : s));
        cancelEdit(id);
      }
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in-up">
      <div className="bg-[#12102a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-400" />
              <h3 className="text-base font-bold text-white">Submissions</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-xs text-white/50">{total}</span>
            </div>
            <p className="text-xs text-white/30 mt-0.5 truncate max-w-sm">{campaign.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <EmptyState icon={Video} title="No submissions yet" desc="Users haven't submitted video links for this campaign." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-3 py-3 font-medium w-8">#</th>
                    <th className="px-3 py-3 font-medium">User</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Video</th>
                    <th className="px-3 py-3 font-medium text-center">Status</th>
                    <th className="px-3 py-3 font-medium text-center">Review</th>
                    <th className="px-3 py-3 font-medium text-right">Views</th>
                    <th className="px-3 py-3 font-medium text-right">Earnings</th>
                    <th className="px-3 py-3 font-medium text-center">Edit</th>
                    <th className="px-3 py-3 font-medium text-right">Date</th>
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
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-3 py-3.5 text-white/25 font-mono text-xs">{(page - 1) * LIMIT + i + 1}</td>

                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                              {s.user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium truncate max-w-[100px] text-xs">@{s.user.username}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{s.user.email}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <a
                            href={s.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs font-medium transition-all max-w-[160px] truncate"
                            title={s.videoLink}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{s.videoLink}</span>
                          </a>
                        </td>

                        <td className="px-3 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${si.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            {si.label}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleReview(s.id, "APPROVED")}
                              disabled={isReviewing || s.status === "APPROVED"}
                              title="Approve"
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleReview(s.id, "REJECTED")}
                              disabled={isReviewing || s.status === "REJECTED"}
                              title="Reject"
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Views */}
                        <td className="px-3 py-3.5 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={editVals.views}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [s.id]: { ...prev[s.id], views: Number(e.target.value) } }))}
                              className="w-18 bg-white/5 border border-cyan-500/30 rounded px-1.5 py-1 text-white text-xs text-right focus:outline-none focus:border-cyan-500/60"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-cyan-400 font-semibold text-xs">
                              <Eye className="w-3 h-3" />
                              {(s.views ?? 0).toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Earnings */}
                        <td className="px-3 py-3.5 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={editVals.earnings}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [s.id]: { ...prev[s.id], earnings: Number(e.target.value) } }))}
                              className="w-18 bg-white/5 border border-emerald-500/30 rounded px-1.5 py-1 text-white text-xs text-right focus:outline-none focus:border-emerald-500/60"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold text-xs">
                              <DollarSign className="w-3 h-3" />
                              {(s.earnings ?? 0).toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Edit actions */}
                        <td className="px-3 py-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => saveEdit(s.id)}
                                disabled={isSaving}
                                title="Save"
                                className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-50"
                              >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => cancelEdit(s.id)}
                                title="Cancel"
                                className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/50 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(s)}
                              title="Edit stats"
                              className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors mx-auto"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-right">
                          <div className="flex items-center gap-1 justify-end text-white/30 text-xs">
                            <Calendar className="w-3 h-3" />
                            {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
