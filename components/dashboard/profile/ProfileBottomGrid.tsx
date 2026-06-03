"use client";

import { User, Copy, Trash2 } from "lucide-react";
import PhoneNumberCard from "@/components/dashboard/profile/PhoneNumberCard";
import PaymentMethodCard from "@/components/dashboard/profile/PaymentMethodCard";

interface ProfileBottomGridProps {
  user: {
    username: string;
    email: string;
    phoneNumber?: string | null;
    upiId?: string | null;
  };
  onPhoneUpdated?: (phone: string | null) => void;
  onUpiUpdated?: (upiId: string | null) => void;
}

export default function ProfileBottomGrid({
  user,
  onPhoneUpdated,
  onUpiUpdated,
}: ProfileBottomGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <PhoneNumberCard
        phoneNumber={user.phoneNumber}
        onPhoneUpdated={onPhoneUpdated}
      />
      <PaymentMethodCard upiId={user.upiId} onUpiUpdated={onUpiUpdated} />
      <LoginMethodsCard email={user.email} />
      <UsernameCard username={user.username} />
    </div>
  );
}

/* ── Login Methods ── */
function LoginMethodsCard({ email }: { email: string }) {
  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">
        Login Methods
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/50">Email</p>
            <p className="text-sm text-white font-medium truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <span className="font-bold text-sm sm:text-base">G</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Google</p>
          </div>
          <button className="text-white/20 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Username ── */
function UsernameCard({ username }: { username: string }) {
  return (
    <div className="bg-[#14161F] border border-white/5 rounded-2xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">
        Username
      </h3>
      <div className="flex items-center bg-[#0B0C10] border border-white/5 rounded-xl px-3 sm:px-4 py-3 mb-4">
        <span className="text-amber-500 mr-2 sm:mr-3 shrink-0">🔒</span>
        <input
          type="text"
          readOnly
          value={username}
          className="bg-transparent border-none outline-none text-white text-sm w-full"
        />
        <button className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors shrink-0">
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copy</span>
        </button>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">
        ℹ️ Your username cannot be changed once set. It is used for your referral
        link and profile URL.
      </p>
    </div>
  );
}
