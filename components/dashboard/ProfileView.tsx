"use client";

import type { ConnectedAccount } from "@/components/dashboard/types";
import UserHeaderCard from "@/components/dashboard/profile/UserHeaderCard";
import ConnectedAccountsCard from "@/components/dashboard/profile/ConnectedAccountsCard";
import StatisticsCard from "@/components/dashboard/profile/StatisticsCard";
import ProfileBottomGrid from "@/components/dashboard/profile/ProfileBottomGrid";

interface ProfileViewProps {
  user: {
    username: string;
    email: string;
    phoneNumber?: string | null;
    upiId?: string | null;
    memberSince: string;
  };
  connectedAccounts: ConnectedAccount[];
  isLoadingAccounts: boolean;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
  onPhoneUpdated?: (phone: string | null) => void;
  onUpiUpdated?: (upiId: string | null) => void;
}

export default function ProfileView({
  user,
  connectedAccounts,
  isLoadingAccounts,
  onAddAccount,
  onDeleteAccount,
  onPhoneUpdated,
  onUpiUpdated,
}: ProfileViewProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6">
        Profile
      </h1>

      <UserHeaderCard user={user} />

      <ConnectedAccountsCard
        connectedAccounts={connectedAccounts}
        isLoadingAccounts={isLoadingAccounts}
        onAddAccount={onAddAccount}
        onDeleteAccount={onDeleteAccount}
      />

      <StatisticsCard />

      <ProfileBottomGrid
        user={user}
        onPhoneUpdated={onPhoneUpdated}
        onUpiUpdated={onUpiUpdated}
      />
    </div>
  );
}
