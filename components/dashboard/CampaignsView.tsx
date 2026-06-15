"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Film, Compass, Video, Loader2 } from "lucide-react";
import type { CampaignItem } from "@/components/dashboard/types";
import CampaignProgress from "@/components/dashboard/campaigns/CampaignProgress";

export default function CampaignsView() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchCampaigns = useCallback(async (cursor?: string) => {
    const isFirstLoad = !cursor;
    if (isFirstLoad) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const url = cursor
        ? `/api/user/campaigns?cursor=${cursor}&limit=12`
        : `/api/user/campaigns?limit=12`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setCampaigns((prev) =>
          isFirstLoad ? data.data.campaigns : [...prev, ...data.data.campaigns]
        );
        setNextCursor(data.data.nextCursor);
        setHasMore(data.data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && hasMore && !isFetchingMore) {
          fetchCampaigns(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, nextCursor, isFetchingMore, fetchCampaigns]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">
          Campaigns
        </h1>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#14161F] border border-white/5 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-[180px] sm:h-[200px] bg-white/5" />
              <div className="p-4 sm:p-5 space-y-3">
                <div className="h-5 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white font-medium mb-1">No campaigns available</p>
          <p className="text-sm text-white/40">
            Check back later for new opportunities
          </p>
        </div>
      ) : (
        <>
          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/dashboard/campaigns/${c.id}`)}
                className="bg-[#14161F] border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 group flex flex-col cursor-pointer hover:shadow-xl hover:shadow-red-500/5"
              >
                {/* Image */}
                <div className="relative h-[180px] sm:h-[200px] overflow-hidden bg-black/50">
                  {c.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.images[0]}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/2">
                      <Film className="w-10 h-10 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/80 to-transparent" />

                  {/* Platform badges */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    {c.supportedPlatforms.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white rounded-md shadow-sm backdrop-blur-sm"
                      >
                        {p}
                      </span>
                    ))}
                    {c.supportedPlatforms.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white/60 bg-white/10 rounded-md backdrop-blur-sm">
                        +{c.supportedPlatforms.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-3 sm:mb-4">
                    {c.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 mt-auto">
                    <div className="bg-white/3 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        Fee / Creator
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-emerald-400">
                        ₹{c.feePerCreator.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/3 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        Max / Post
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-red-400">
                        ₹{c.maxEarningPerPostPerCreator.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <CampaignProgress
                    value={c.completionPercentage}
                    compact
                    className="mb-3 sm:mb-4"
                  />

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-xs text-white/40">
                        {c.maxSubmissionsPerAccount} max
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-red-400 group-hover:text-red-300 transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div
            ref={observerRef}
            className="flex items-center justify-center py-8"
          >
            {isFetchingMore && (
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            )}
            {!hasMore && campaigns.length > 0 && (
              <p className="text-sm text-white/20">
                You&apos;ve seen all campaigns
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
