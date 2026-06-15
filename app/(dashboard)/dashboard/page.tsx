"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProfileView from "@/components/dashboard/ProfileView";
import CampaignsView from "@/components/dashboard/CampaignsView";
import SubmissionsView from "@/components/dashboard/SubmissionsView";
import LogoutModal from "@/components/dashboard/LogoutModal";
import AddInstagramModal from "@/components/AddInstagramModal";
import type { Tab, ConnectedAccount } from "@/components/dashboard/types";

export default function DashboardPage() {
  const { user: authUser, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAddInstagramOpen, setIsAddInstagramOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // Profile Data
  const user = {
    username: authUser?.username || "Guest",
    email: authUser?.email || "",
    phoneNumber: authUser?.phoneNumber ?? null,
    upiId: authUser?.upiId ?? null,
    memberSince: authUser?.createdAt
      ? new Date(authUser.createdAt).toLocaleDateString()
      : "Present",
  };

  const handlePhoneUpdated = (phoneNumber: string | null) => {
    if (authUser) login({ ...authUser, phoneNumber });
  };

  const handleUpiUpdated = (upiId: string | null) => {
    if (authUser) login({ ...authUser, upiId });
  };

  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/instagram/accounts");
      const result = await response.json();
      if (result.success) {
        setConnectedAccounts(result.data.accounts);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to remove this Instagram account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/instagram/accounts/${accountId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setConnectedAccounts((prev) => prev.filter((a) => a.id !== accountId));
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <div className="flex h-dvh bg-[#0B0C10] text-gray-100 overflow-hidden font-sans">
      {/* ─── SIDEBAR (desktop) + BOTTOM NAV (mobile) ─── */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-y-auto relative pb-16 md:pb-0">
        {activeTab === "profile" && (
          <ProfileView
            user={user}
            connectedAccounts={connectedAccounts}
            isLoadingAccounts={isLoadingAccounts}
            onAddAccount={() => setIsAddInstagramOpen(true)}
            onDeleteAccount={handleDeleteAccount}
            onPhoneUpdated={handlePhoneUpdated}
            onUpiUpdated={handleUpiUpdated}
          />
        )}
        {activeTab === "campaigns" && <CampaignsView />}
        {activeTab === "submissions" && <SubmissionsView />}
      </main>

      {/* ─── MODALS ─── */}
      <AddInstagramModal
        isOpen={isAddInstagramOpen}
        onClose={() => setIsAddInstagramOpen(false)}
        onAccountAdded={fetchConnectedAccounts}
      />

      {isLogoutModalOpen && (
        <LogoutModal
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={logout}
        />
      )}
    </div>
  );
}
