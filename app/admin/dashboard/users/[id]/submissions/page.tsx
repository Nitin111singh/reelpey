"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Video,
  ExternalLink,
  Loader2,
  Calendar,
  Film,
  User as UserIcon,
  Eye,
  DollarSign,
  Pencil,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const LIMIT = 20;

interface UserSubmission {
  id: string;
  videoLink: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  views: number;
  earnings: number;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    images: string[];
    supportedPlatforms: string[];
  };
}

const STATUS_UI = {
  PENDING:  { label: "Pending",  icon: Clock,        cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25" },
  APPROVED: { label: "Approved", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  REJECTED: { label: "Rejected", icon: XCircle,      cls: "bg-red-500/15 text-red-400 border border-red-500/25" },
} as const;

function StatusBadge({ status }: { status: keyof typeof STATUS_UI }) {
  const { label, icon: Icon, cls } = STATUS_UI[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

interface EditState {
  views: number;
  earnings: number;
}

export default function AdminUserSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // editing: submissionId → { views, earnings }
  const [editing, setEditing] = useState<Record<string, EditState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = useCallback(
    async (p: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}/submissions?page=${p}&limit=${LIMIT}`);
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.data.submissions);
          setTotal(data.data.total);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => { load(page); }, [page, load]);

  const totalPages = Math.ceil(total / LIMIT);

  function startEdit(s: UserSubmission) {
    setEditing((prev) => ({
      ...prev,
      [s.id]: { views: s.views ?? 0, earnings: s.earnings ?? 0 },
    }));
  }

  function cancelEdit(id: string) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function saveEdit(id: string) {
    const values = editing[id];
    if (!values) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...values } : s))
        );
        cancelEdit(id);
      }
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="h-full text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#060510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/admin/dashboard/users/${userId}`)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Detail
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-white leading-tight">User Submissions</h1>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 font-medium">
            {total} total
          </span>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Video className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-white font-medium mb-1">No submissions yet</p>
            <p className="text-sm text-white/40">This user hasn&apos;t submitted any video links.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#0c0a1e] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium w-14">#</th>
                      <th className="px-6 py-4 font-medium">Campaign</th>
                      <th className="px-6 py-4 font-medium">Platforms</th>
                      <th className="px-6 py-4 font-medium text-center">Status</th>
                      <th className="px-6 py-4 font-medium">Video Link</th>
                      <th className="px-6 py-4 font-medium text-right">Views</th>
                      <th className="px-6 py-4 font-medium text-right">Earnings ($)</th>
                      <th className="px-6 py-4 font-medium text-center">Edit</th>
                      <th className="px-6 py-4 font-medium text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {submissions.map((s, i) => {
                      const isEditing = !!editing[s.id];
                      const isSaving = !!saving[s.id];
                      const editVals = editing[s.id];
                      return (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white/25 font-mono text-xs">
                            {(page - 1) * LIMIT + i + 1}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() => router.push(`/admin/dashboard/campaigns/${s.campaign.id}/submissions`)}
                              className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                            >
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                                {s.campaign.images.length > 0 ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={s.campaign.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-4 h-4 text-white/10" />
                                  </div>
                                )}
                              </div>
                              <span className="text-white font-medium truncate max-w-[160px]">
                                {s.campaign.name}
                              </span>
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {s.campaign.supportedPlatforms.slice(0, 2).map((p) => (
                                <span key={p} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 rounded-md">
                                  {p}
                                </span>
                              ))}
                              {s.campaign.supportedPlatforms.length > 2 && (
                                <span className="px-2 py-0.5 text-[10px] text-white/30 bg-white/5 rounded-md">
                                  +{s.campaign.supportedPlatforms.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <StatusBadge status={s.status} />
                          </td>

                          <td className="px-6 py-4">
                            <a
                              href={s.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 text-xs font-medium transition-all max-w-[200px] truncate"
                              title={s.videoLink}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{s.videoLink}</span>
                            </a>
                          </td>

                          {/* Views */}
                          <td className="px-6 py-4 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                value={editVals.views}
                                onChange={(e) =>
                                  setEditing((prev) => ({
                                    ...prev,
                                    [s.id]: { ...prev[s.id], views: Number(e.target.value) },
                                  }))
                                }
                                className="w-24 bg-white/5 border border-cyan-500/30 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-cyan-500/60"
                              />
                            ) : (
                              <div className="flex items-center justify-end gap-1 text-cyan-400 font-semibold text-sm">
                                <Eye className="w-3.5 h-3.5" />
                                {(s.views ?? 0).toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Earnings */}
                          <td className="px-6 py-4 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={editVals.earnings}
                                onChange={(e) =>
                                  setEditing((prev) => ({
                                    ...prev,
                                    [s.id]: { ...prev[s.id], earnings: Number(e.target.value) },
                                  }))
                                }
                                className="w-24 bg-white/5 border border-emerald-500/30 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none focus:border-emerald-500/60"
                              />
                            ) : (
                              <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold text-sm">
                                <DollarSign className="w-3.5 h-3.5" />
                                {(s.earnings ?? 0).toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Edit actions */}
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => saveEdit(s.id)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors disabled:opacity-50"
                                  title="Save"
                                >
                                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => cancelEdit(s.id)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEdit(s)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Edit stats"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center gap-1.5 justify-end text-white/30 text-xs">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
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
