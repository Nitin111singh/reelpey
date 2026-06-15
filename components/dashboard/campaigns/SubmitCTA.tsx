"use client";

import { Send } from "lucide-react";

interface SubmitCTAProps {
  maxEarningPerPostPerCreator: number;
  onSubmit: () => void;
}

export default function SubmitCTA({
  maxEarningPerPostPerCreator,
  onSubmit,
}: SubmitCTAProps) {
  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">
          Ready to participate?
        </h3>
        <p className="text-xs sm:text-sm text-white/40">
          Submit your video link to earn up to ₹
          {maxEarningPerPostPerCreator.toLocaleString()} per post
        </p>
      </div>
      <button
        onClick={onSubmit}
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] shrink-0 w-full sm:w-auto"
      >
        <Send className="w-4 h-4" />
        Submit Video
      </button>
    </div>
  );
}
