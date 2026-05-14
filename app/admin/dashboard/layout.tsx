"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Film, Megaphone, Users, ClipboardList, LogOut, ShieldCheck, Instagram } from "lucide-react";
import SidebarBtn from "@/components/admin/SidebarBtn";
import Modal from "@/components/admin/Modal";
import Link from "next/link";

/**
 * Shared admin dashboard layout.
 * Renders the persistent sidebar; child routes render in the main content area.
 *
 * Routes:
 *  /admin/dashboard                          → Campaigns
 *  /admin/dashboard/users                    → Users
 *  /admin/dashboard/campaigns/[id]/submissions → Submissions
 */
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isUsersActive = pathname.startsWith("/admin/dashboard/users");
  const isRequestsActive = pathname.startsWith("/admin/dashboard/campaign-requests");
  const isIgVerificationsActive = pathname.startsWith("/admin/dashboard/instagram-verifications");
  const isCampaignsActive = !isUsersActive && !isRequestsActive && !isIgVerificationsActive;

  return (
    <div className="flex h-screen bg-[#060510] text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-[72px] bg-[#0c0a1e] border-r border-white/5 flex flex-col items-center py-6 shrink-0 z-20 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 cursor-pointer">
              <Film className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-3 w-full items-center">
          <SidebarBtn
            icon={Megaphone}
            label="Campaigns"
            active={isCampaignsActive}
            onClick={() => router.push("/admin/dashboard")}
          />
          <SidebarBtn
            icon={Users}
            label="Users"
            active={isUsersActive}
            onClick={() => router.push("/admin/dashboard/users")}
          />
          <SidebarBtn
            icon={ClipboardList}
            label="Requests"
            active={isRequestsActive}
            onClick={() => router.push("/admin/dashboard/campaign-requests")}
          />
          <SidebarBtn
            icon={Instagram}
            label="Instagram Verifications"
            active={isIgVerificationsActive}
            onClick={() => router.push("/admin/dashboard/instagram-verifications")}
          />
        </nav>

        {/* Bottom row: admin badge + logout */}
        <div className="flex flex-col gap-3 items-center pt-4">
          <div
            title="Admin"
            className="px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20"
          >
            <ShieldCheck className="w-4 h-4 text-violet-400" />
          </div>
          <button
            onClick={() => setIsLogoutOpen(true)}
            title="Logout"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ── Main content (child routes) ── */}
      < main className="flex-1 overflow-y-auto" > {children}</main >

      {/* ── Logout confirm modal ── */}
      {
        isLogoutOpen && (
          <Modal onClose={() => setIsLogoutOpen(false)} title="Confirm Logout">
            <p className="text-white/60 mb-6">
              Are you sure you want to log out of the admin panel?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => logout()}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/20"
              >
                Logout
              </button>
            </div>
          </Modal>
        )
      }
    </div >
  );
}
