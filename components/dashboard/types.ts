export type Tab = "profile" | "campaigns" | "submissions";

export interface ConnectedAccount {
  id: string;
  username: string;
  accountUrl: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  manualVerificationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
}

export interface CampaignItem {
  id: string;
  images: string[];
  name: string;
  description: string;
  totalBudget: number;
  supportedPlatforms: string[];
  maxSubmissionsPerAccount: number;
  feePerCreator: number;
  maxEarningPerPostPerCreator: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionItem {
  id: string;
  videoLink: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  views: number;
  earnings: number;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    images: string[];
    supportedPlatforms: string[];
    feePerCreator: number;
  };
}
