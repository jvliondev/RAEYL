export type Role =
  | "platform_admin"
  | "wallet_owner"
  | "developer"
  | "editor"
  | "viewer"
  | "billing_manager"
  | "support";

export type WalletRole = Role;

export type HealthState =
  | "healthy"
  | "attention"
  | "issue"
  | "disconnected"
  | "unknown";

export type AlertSeverity = "info" | "warning" | "critical";

export type ProviderCategory =
  | "hosting"
  | "database"
  | "cms"
  | "domain"
  | "email_forms"
  | "analytics"
  | "payments"
  | "scheduling"
  | "automation"
  | "support"
  | "storage"
  | "auth_identity"
  | "custom";

export interface EditRoute {
  id: string;
  label: string;
  description: string;
  destinationUrl: string;
  providerName: string;
  isPrimary?: boolean;
}

export interface ProviderRecord {
  id: string;
  name: string;
  category: ProviderCategory;
  label: string;
  accountLabel: string;
  status: string;
  health: HealthState;
  connectionMethod?: string;
  syncState?: string;
  dashboardUrl: string;
  billingUrl?: string;
  editUrl?: string;
  supportUrl?: string;
  monthlyCost: number;
  renewalDate?: string;
  ownerDescription: string;
  metadata: Record<string, string>;
  credentials?: Array<{
    id: string;
    type: string;
    status: string;
    maskedPreview: string;
    expiresAt?: string | null;
  }>;
  lastSyncAt?: string | null;
  lastHealthCheckAt?: string | null;
}

export interface AlertRecord {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  status: "open" | "dismissed" | "resolved";
  providerId?: string;
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  actor: string;
  action: string;
  detail: string;
  createdAt: string;
}

export interface WebsiteRecord {
  id: string;
  name: string;
  primaryDomain: string;
  productionUrl: string;
  stagingUrl?: string;
  category: string;
  framework: string;
  launchDate: string;
  status: string;
  editRoutes: EditRoute[];
}

export interface WalletMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "pending";
}

export interface BillingRecord {
  id: string;
  label: string;
  amount: number;
  cadence: "monthly" | "annual";
  nextRenewal: string;
  type: "raeyl" | "provider";
  providerId?: string;
  description: string;
}

export interface SupportCase {
  id: string;
  subject: string;
  priority: "low" | "normal" | "high";
  status: "open" | "in_progress" | "resolved";
  relatedProvider?: string;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  partnerName: string;
  walletName: string;
  commissionRate: number;
  monthlyPayout: number;
  status: "active" | "pending" | "paid";
}

export interface WalletRecord {
  id: string;
  name: string;
  businessName: string;
  websiteUrl: string;
  timezone: string;
  planTier: string;
  handoffStatus: string;
  setupStatus: string;
  health: HealthState;
  monthlyCost: number;
  urgentAlerts: number;
  ownerStatus: string;
  primaryOwner: string;
  primaryDeveloper: string;
  websites: WebsiteRecord[];
  providers: ProviderRecord[];
  alerts: AlertRecord[];
  activity: ActivityRecord[];
  members: WalletMember[];
  billing: BillingRecord[];
  supportCases: SupportCase[];
  referrals: ReferralRecord[];
}
