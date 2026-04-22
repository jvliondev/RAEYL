import type { ProviderCategory, ProviderConnectionMethod } from "@prisma/client/index";

export type ProviderCapability =
  | "oauth"
  | "apiToken"
  | "dashboardUrl"
  | "resourceDiscovery"
  | "billingSync"
  | "healthChecks"
  | "editRouteInference"
  | "reconnect"
  | "writeAccess"
  | "manualFallback"
  | "webhookSupport";

export type ProviderAuthStrategyType = "oauth" | "api_token" | "manual" | "dashboard_guided" | "hybrid";

export type NormalizedResourceType =
  | "account"
  | "team"
  | "site"
  | "project"
  | "domain"
  | "dataset"
  | "environment"
  | "editor_surface"
  | "billing_record"
  | "support_endpoint";

export type ConnectionLifecycleState =
  | "INITIATED"
  | "AWAITING_AUTH"
  | "VERIFYING"
  | "DISCOVERING"
  | "AWAITING_SELECTION"
  | "CONNECTED"
  | "DEGRADED"
  | "RECONNECT_REQUIRED"
  | "DISCONNECTED"
  | "FAILED";

export type NormalizedHealthState = "HEALTHY" | "ATTENTION_NEEDED" | "ISSUE_DETECTED" | "DISCONNECTED" | "UNKNOWN";

export type SyncLifecycleState = "NEVER_SYNCED" | "SYNCED" | "PENDING" | "FAILED" | "DISABLED";

export type WalletProviderContext = {
  walletId: string;
  businessName: string;
  websiteName?: string | null;
  websiteUrl?: string | null;
  primaryDomain?: string | null;
  websiteDescription?: string | null;
  businessCategory?: string | null;
  setupProfile?: Record<string, unknown> | null;
};

export type AuthFieldDefinition = {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  placeholder?: string;
  required?: boolean;
  hint?: string;
};

export type ProviderAuthStrategy = {
  type: ProviderAuthStrategyType;
  connectionMethod: ProviderConnectionMethod;
  title: string;
  description: string;
  fields: AuthFieldDefinition[];
  securityNote: string;
  redirectRequired?: boolean;
  callbackPath?: string;
  supportsReconnect?: boolean;
  tokenStorageExpectation?: string;
};

export type ProviderOAuthConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnvKey: string;
  clientSecretEnvKey?: string;
  includeNonce?: boolean;
  extraAuthorizationParams?: Record<string, string>;
  extraTokenParams?: Record<string, string>;
};

export type NormalizedProviderResource = {
  id: string;
  type: NormalizedResourceType;
  label: string;
  value: string;
  parentId?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown>;
};

export type ResourceResolution = {
  teams: NormalizedProviderResource[];
  resources: NormalizedProviderResource[];
  selectedTeamId?: string | null;
  selectedResourceValue?: string | null;
  confidenceScore: number;
  autoSelected: boolean;
  clarificationNeeded: boolean;
  explanation: string;
};

export type ProviderVerificationResult = {
  verified: boolean;
  accountLabel?: string;
  dashboardUrl?: string;
  billingUrl?: string;
  editUrl?: string;
  connectedAccountLabel?: string;
  externalProjectId?: string;
  externalTeamId?: string;
  tokenMetadata?: Record<string, unknown>;
  providerMetadata?: Record<string, unknown>;
  connectionState: ConnectionLifecycleState;
  syncState: SyncLifecycleState;
  healthState: NormalizedHealthState;
  confidenceScore: number;
  failureCode?: string;
  failureSummary?: string;
  diagnostics?: Record<string, unknown>;
};

export type NormalizedProviderMetadata = {
  providerName: string;
  providerSlug: string;
  category: ProviderCategory;
  accountLabel?: string;
  connectedAccountLabel?: string;
  accountId?: string | null;
  teamId?: string | null;
  projectId?: string | null;
  dashboardUrl?: string;
  billingUrl?: string;
  supportUrl?: string;
  editUrl?: string;
  domainData?: string[];
  metadataSnapshot: Record<string, unknown>;
};

export type ProviderBillingItem = {
  label: string;
  description?: string;
  amount?: number | null;
  cadence: "MONTHLY" | "ANNUAL" | "QUARTERLY" | "ONE_TIME" | "USAGE_BASED";
  billingUrl?: string;
  invoiceUrl?: string;
  renewalDate?: string | null;
  accountLabel?: string;
};

export type ProviderHealthCheckResult = {
  state: NormalizedHealthState;
  summary: string;
  syncState: SyncLifecycleState;
  warnings: string[];
  nextStep?: string;
  checkedAt: string;
  metadata?: Record<string, unknown>;
};

export type InferredEditDestination = {
  label: string;
  purpose: string;
  destinationUrl: string;
  destinationType: "cms" | "dashboard" | "content_collection" | "settings" | "custom";
  confidenceScore: number;
  visibleToRoles: string[];
  recommendedPrimary: boolean;
};

export type ProviderOwnerSummary = {
  plainLanguagePurpose: string;
  importedSummary: string;
  whyItMatters: string;
  actionGuidance: string;
  healthyMeans: string;
  warningMeans: string;
};

export type ProviderSetupSignal = {
  key: string;
  label: string;
  complete: boolean;
  recommendation?: string;
};

export type AdapterDiagnostics = {
  adapterKey: string;
  capabilityCoverage: ProviderCapability[];
  lifecycleState: ConnectionLifecycleState;
  confidenceScore: number;
  summary: string;
  details?: Record<string, unknown>;
};

export type ProviderConnectionInput = {
  providerName: string;
  providerSlug?: string | null;
  walletId: string;
  websiteId?: string;
  category: ProviderCategory;
  connectionMethod: ProviderConnectionMethod;
  apiToken?: string;
  oauthAccessToken?: string;
  oauthRefreshToken?: string;
  oauthExpiresAt?: Date;
  oauthScopes?: string[];
  secureCredential?: string;
  externalProjectId?: string;
  externalTeamId?: string;
  connectedAccountLabel?: string;
  dashboardUrl?: string;
  billingUrl?: string;
  editUrl?: string;
  supportUrl?: string;
  ownerDescription?: string;
  displayLabel?: string;
  notes?: string;
  monthlyCostEstimate?: number;
  renewalDate?: Date;
};

export type ProviderAdapterDefinition = {
  key: string;
  slug: string;
  displayName: string;
  category: ProviderCategory;
  ownerLabel: string;
};

export type ProviderConnectResult = {
  adapterKey: string;
  authStrategyKey: ProviderAuthStrategyType;
  verification: ProviderVerificationResult;
  resourceResolution?: ResourceResolution;
  normalizedMetadata: NormalizedProviderMetadata;
  billing: ProviderBillingItem[];
  health: ProviderHealthCheckResult;
  editDestinations: InferredEditDestination[];
  ownerSummary: ProviderOwnerSummary;
  setupSignals: ProviderSetupSignal[];
  handoffSignals: ProviderSetupSignal[];
  diagnostics: AdapterDiagnostics;
};

export interface ConnectProviderAdapter {
  getProviderDefinition(): ProviderAdapterDefinition;
  getCapabilities(): ProviderCapability[];
  getAuthStrategy(): ProviderAuthStrategy;
  getOAuthConfig?(): ProviderOAuthConfig | null;
  verifyConnection(
    context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ProviderVerificationResult>;
  discoverResources?(
    context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ResourceResolution>;
  normalizeConnectionMetadata(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    verification: ProviderVerificationResult,
    resourceResolution?: ResourceResolution
  ): Promise<NormalizedProviderMetadata>;
  syncBilling?(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<ProviderBillingItem[]>;
  runHealthCheck?(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<ProviderHealthCheckResult>;
  inferEditDestinations?(
    context: WalletProviderContext,
    input: ProviderConnectionInput,
    metadata: NormalizedProviderMetadata
  ): Promise<InferredEditDestination[]>;
  getOwnerSummary(
    context: WalletProviderContext,
    metadata: NormalizedProviderMetadata
  ): ProviderOwnerSummary;
  getSetupSignals?(
    context: WalletProviderContext,
    metadata: NormalizedProviderMetadata
  ): ProviderSetupSignal[];
  getHandoffSignals?(
    context: WalletProviderContext,
    metadata: NormalizedProviderMetadata
  ): ProviderSetupSignal[];
  reconnect?(
    context: WalletProviderContext,
    input: ProviderConnectionInput
  ): Promise<ProviderVerificationResult>;
  disconnectCleanup?(
    context: WalletProviderContext,
    metadata: NormalizedProviderMetadata
  ): Promise<void>;
  getDiagnostics(
    metadata: NormalizedProviderMetadata,
    verification: ProviderVerificationResult,
    resourceResolution?: ResourceResolution
  ): AdapterDiagnostics;
}
