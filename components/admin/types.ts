// ─── Admin Dashboard shared types ───────────────────────────────────────────

export type AdminTab = "campaigns" | "users" | "campaign-requests";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  _count: {
    campaignSubmissions: number;
    connectedAccounts: number;
  };
}

export interface Campaign {
  id: string;
  images: string[];
  name: string;
  description: string;
  totalBudget: number;
  supportedPlatforms: string[];
  maxSubmissionsPerAccount: number;
  feePerCreator: number;
  maxEarningPerPostPerCreator: number;
  status: "ACTIVE" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  campaignId: string;
  videoLink: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  views: number;
  earnings: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    phoneNumber: string | null;
  };
}
