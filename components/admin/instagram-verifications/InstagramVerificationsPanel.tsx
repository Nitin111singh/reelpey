"use client";

import { useCallback, useEffect, useState } from "react";
import { Instagram, Filter, Loader2 } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import EmptyState from "@/components/admin/EmptyState";
import InstagramVerificationRow from "./InstagramVerificationRow";
import InstagramVerificationDetailModal from "./InstagramVerificationDetailModal";
import type { AdminVerificationRequest } from "@/types/instagram";

const LIMIT = 15;

type StatusFilter = "" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function InstagramVerificationsPanel() {
  const [verifications, setVerifications] = useState<AdminVerificationRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AdminVerificationRequest | null>(null);

  const load = useCallback(async (p: number, status: StatusFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/instagram-verifications?${params}`);
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data.verifications);
        setTotal(data.data.total);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    load(page, statusFilter);
  }, [page, statusFilter, load]);

  const handleReviewed = () => {
    setSelected(null);
    load(page, statusFilter);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Instagram Verifications
            <span className="ml-3 text-base font-normal text-white/30">({total})</span>
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Review manual verification requests — check the code in the user&apos;s Instagram bio before approving
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 w-fit mb-6">
        <Filter className="w-4 h-4 text-white/30 ml-2 mr-1" />
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                : "text-white/45 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : verifications.length === 0 ? (
        <EmptyState
          icon={Instagram}
          title={statusFilter ? `No ${statusFilter.toLowerCase()} requests` : "No verification requests"}
          desc={
            statusFilter
              ? `No ${statusFilter.toLowerCase()} Instagram verification requests.`
              : "Instagram verification requests will appear here when users submit them."
          }
        />
      ) : (
        <div className="bg-[#0f0d24] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5 text-xs font-semibold text-white/30 uppercase tracking-wider">
            <span>Instagram Account</span>
            <span>Creator</span>
            <span>Code</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          <div className="divide-y divide-white/4">
            {verifications.map((v) => (
              <InstagramVerificationRow
                key={v.id}
                verification={v}
                onClick={() => setSelected(v)}
              />
            ))}
          </div>
        </div>
      )}

      <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />

      {selected && (
        <InstagramVerificationDetailModal
          verification={selected}
          onClose={() => setSelected(null)}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  );
}
