"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  FileVideo,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  DollarSign,
} from "lucide-react";
import type { SubmissionItem } from "@/components/dashboard/types";

const LIMIT = 10;

const STATUS_UI = {
  PENDING:  { label: "Pending",  icon: Clock,        cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25" },
  APPROVED: { label: "Approved", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" },
  REJECTED: { label: "Rejected", icon: XCircle,      cls: "bg-red-500/15 text-red-400 border border-red-500/25" },
} as const;

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const { label, icon: Icon, cls } = STATUS_UI[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function SubmissionsView() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/submissions?page=${p}&limit=${LIMIT}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data.submissions);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions(page);
  }, [page, fetchSubmissions]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">
            My Submissions
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            {total} total submission{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileVideo className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white font-medium mb-1">No submissions yet</p>
          <p className="text-sm text-white/40">
            Browse campaigns and submit your first video
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table (hidden on mobile) ── */}
          <div className="hidden md:block bg-[#14161F] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5 font-medium w-12">#</th>
                    <th className="px-5 py-3.5 font-medium">Campaign</th>
                    <th className="px-5 py-3.5 font-medium">Platforms</th>
                    <th className="px-5 py-3.5 font-medium">Video Link</th>
                    <th className="px-5 py-3.5 font-medium text-center">Status</th>
                    <th className="px-5 py-3.5 font-medium text-right">Views</th>
                    <th className="px-5 py-3.5 font-medium text-right">Earnings</th>
                    <th className="px-5 py-3.5 font-medium text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {submissions.map((s, i) => (
                    <tr
                      key={s.id}
                      className="hover:bg-white/2 transition-colors"
                    >
                      {/* # */}
                      <td className="px-5 py-4 text-white/30 font-mono text-xs">
                        {(page - 1) * LIMIT + i + 1}
                      </td>

                      {/* Campaign */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/campaigns/${s.campaign.id}`
                            )
                          }
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                            {s.campaign.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={s.campaign.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-4 h-4 text-white/10" />
                              </div>
                            )}
                          </div>
                          <span className="text-white font-medium truncate max-w-[200px]">
                            {s.campaign.name}
                          </span>
                        </button>
                      </td>

                      {/* Platforms */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.campaign.supportedPlatforms
                            .slice(0, 2)
                            .map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/15 text-red-400 rounded-md"
                              >
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

                      {/* Video */}
                      <td className="px-5 py-4">
                        <a
                          href={s.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-all max-w-[220px] truncate"
                          title={s.videoLink}
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{s.videoLink}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <StatusBadge status={s.status} />
                      </td>

                      {/* Views */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-cyan-400 font-semibold text-sm">
                          <Eye className="w-3.5 h-3.5" />
                          {(s.views ?? 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Earnings */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-emerald-400 font-semibold text-sm">
                          <DollarSign className="w-3.5 h-3.5" />
                          {(s.earnings ?? 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Card Layout (hidden on desktop) ── */}
          <div className="md:hidden space-y-3">
            {submissions.map((s, i) => (
              <div
                key={s.id}
                className="bg-[#14161F] border border-white/5 rounded-xl p-4 space-y-3"
              >
                {/* Top row: # + campaign */}
                <div className="flex items-center gap-3">
                  <span className="text-white/30 font-mono text-xs shrink-0 w-5 text-center">
                    {(page - 1) * LIMIT + i + 1}
                  </span>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/campaigns/${s.campaign.id}`)
                    }
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                      {s.campaign.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.campaign.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-white/10" />
                        </div>
                      )}
                    </div>
                    <span className="text-white font-medium truncate text-sm">
                      {s.campaign.name}
                    </span>
                  </button>
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1 pl-8">
                  {s.campaign.supportedPlatforms.slice(0, 3).map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/15 text-red-400 rounded-md"
                    >
                      {p}
                    </span>
                  ))}
                  {s.campaign.supportedPlatforms.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] text-white/30 bg-white/5 rounded-md">
                      +{s.campaign.supportedPlatforms.length - 3}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="pl-8">
                  <StatusBadge status={s.status} />
                </div>

                {/* Views + Earnings */}
                <div className="flex items-center gap-4 pl-8">
                  <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                    <Eye className="w-3 h-3" />
                    {(s.views ?? 0).toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <DollarSign className="w-3 h-3" />
                    ${(s.earnings ?? 0).toLocaleString()} earned
                  </div>
                </div>

                {/* Video link + date */}
                <div className="flex items-center justify-between gap-3 pl-8">
                  <a
                    href={s.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium transition-all truncate max-w-[60%]"
                    title={s.videoLink}
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.videoLink}</span>
                  </a>
                  <div className="flex items-center gap-1 text-white/30 text-xs shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-white/40">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
