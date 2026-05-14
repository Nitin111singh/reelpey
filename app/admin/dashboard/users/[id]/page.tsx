"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Video,
  ExternalLink,
  Instagram,
  Loader2,
  User as UserIcon,
  Eye,
  DollarSign,
} from "lucide-react";

interface AdminUserDetail {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  totalViews: number;
  moneyEarned: number;
  _count: {
    campaignSubmissions: number;
  };
  connectedAccounts: Array<{
    id: string;
    username: string;
    accountUrl: string;
    isVerified: boolean;
    createdAt: string;
  }>;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (data.success) setUser(data.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-4">
        <UserIcon className="w-12 h-12 text-white/10" />
        <p className="text-white/60">User not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060510] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#060510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/dashboard/users")}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
        {/* User Card */}
        <div className="bg-[#0c0a1e] border border-white/5 rounded-2xl p-8 flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-violet-500/30 to-cyan-500/30 flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                @{user.username}
                {user.isEmailVerified ? (
                  <span title="Email Verified"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></span>
                ) : (
                  <span title="Email Not Verified"><AlertCircle className="w-5 h-5 text-amber-400" /></span>
                )}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                user.role === "ADMIN"
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                  : "bg-white/5 border-white/10 text-white/50"
              }`}>
                {user.role === "ADMIN" ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                {user.role}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/30" />
                {user.email}
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/30" />
                  {user.phoneNumber}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/30" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Creator Stats — computed from campaign submissions */}
        <div className="bg-[#0c0a1e] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Creator Stats</h2>
            <span className="text-xs text-white/30 font-medium">Aggregated from campaign submissions</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white/50">Total Videos</span>
              </div>
              <p className="text-2xl font-bold text-violet-400">
                {user._count.campaignSubmissions.toLocaleString()}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/50">Total Views</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {(user.totalViews ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/50">Money Earned</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                ${(user.moneyEarned ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#0c0a1e] border border-cyan-500/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Campaign Submissions</h2>
              <p className="text-sm text-white/40 mb-6 font-medium">
                {user._count.campaignSubmissions} total submission{user._count.campaignSubmissions !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/dashboard/users/${user.id}/submissions`)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all"
            >
              View & Edit Submissions
            </button>
          </div>

          <div className="bg-[#0c0a1e] border border-violet-500/10 rounded-2xl p-6 flex flex-col hover:border-violet-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                {user.connectedAccounts.length} Linked
              </span>
            </div>

            <h2 className="text-lg font-bold text-white mb-4">Connected Accounts</h2>

            <div className="space-y-3 flex-1">
              {user.connectedAccounts.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">No accounts linked</p>
              ) : (
                user.connectedAccounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500/20 to-orange-400/20 flex flex-col items-center justify-center">
                        <Instagram className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-sm font-medium text-white flex items-center gap-1.5">
                        @{acc.username}
                        {acc.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </p>
                    </div>
                    <a
                      href={acc.accountUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
