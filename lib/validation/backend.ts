import { z } from "zod";

export const walletRoleSchema = z.enum([
  "PLATFORM_ADMIN",
  "WALLET_OWNER",
  "DEVELOPER",
  "EDITOR",
  "VIEWER",
  "BILLING_MANAGER",
  "SUPPORT"
]);

export const providerCategorySchema = z.enum([
  "HOSTING",
  "DATABASE",
  "CMS",
  "DOMAIN",
  "EMAIL_FORMS",
  "ANALYTICS",
  "PAYMENTS",
  "SCHEDULING",
  "AUTOMATION",
  "SUPPORT",
  "STORAGE",
  "AUTH_IDENTITY",
  "CUSTOM"
]);

export const providerConnectionMethodSchema = z.enum([
  "OAUTH",
  "API_TOKEN",
  "MANUAL",
  "SECURE_LINK"
]);

export const healthStatusSchema = z.enum([
  "HEALTHY",
  "ATTENTION_NEEDED",
  "ISSUE_DETECTED",
  "DISCONNECTED",
  "UNKNOWN"
]);

export const inviteTypeSchema = z.enum([
  "WALLET_MEMBER",
  "OWNER_HANDOFF",
  "PARTNER"
]);

export const inviteStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "REVOKED"
]);

export const alertSeveritySchema = z.enum(["INFO", "WARNING", "CRITICAL"]);

export const billingCadenceSchema = z.enum([
  "MONTHLY",
  "ANNUAL",
  "QUARTERLY",
  "ONE_TIME",
  "USAGE_BASED"
]);

export const billingStatusSchema = z.enum([
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "INCOMPLETE",
  "PAUSED"
]);

export const supportPrioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
export const supportStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "WAITING_ON_PROVIDER",
  "RESOLVED",
  "CLOSED"
]);

export const notificationTypeSchema = z.enum([
  "INVITE",
  "HANDOFF",
  "ALERT",
  "BILLING",
  "SUPPORT",
  "SYSTEM"
]);

export const notificationChannelSchema = z.enum(["IN_APP", "EMAIL"]);

export const cuidSchema = z.string().cuid();
export const emailSchema = z.string().trim().toLowerCase().email();
export const urlSchema = z.string().trim().url();

export const walletCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  businessName: z.string().trim().min(2).max(160),
  businessCategory: z.string().trim().max(120).optional(),
  ownerContactName: z.string().trim().max(120).optional(),
  ownerEmail: emailSchema.optional(),
  ownerPhone: z.string().trim().max(40).optional(),
  websiteName: z.string().trim().max(160).optional(),
  websiteUrl: urlSchema.optional(),
  websiteDescription: z.string().trim().max(1000).optional(),
  timezone: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(4000).optional(),
  planTier: z.string().trim().max(60).optional()
});

export const walletUpdateSchema = walletCreateSchema.partial().extend({
  status: z
    .enum([
      "DRAFT",
      "IN_SETUP",
      "READY_FOR_HANDOFF",
      "ACTIVE",
      "ATTENTION",
      "ARCHIVED",
      "SUSPENDED"
    ])
    .optional(),
  handoffStatus: z
    .enum([
      "NOT_STARTED",
      "IN_PROGRESS",
      "OWNER_INVITED",
      "OWNER_ACCEPTED",
      "COMPLETED",
      "REOPENED",
      "CANCELED"
    ])
    .optional()
});

export const websiteCreateSchema = z.object({
  walletId: cuidSchema,
  name: z.string().trim().min(2).max(160),
  primaryDomain: z.string().trim().max(255).optional(),
  productionUrl: urlSchema.optional(),
  stagingUrl: urlSchema.optional(),
  siteCategory: z.string().trim().max(120).optional(),
  framework: z.string().trim().max(120).optional(),
  deploymentNotes: z.string().trim().max(4000).optional(),
  ownerNotes: z.string().trim().max(4000).optional(),
  developerNotes: z.string().trim().max(4000).optional()
});

export const editRouteSchema = z.object({
  walletId: cuidSchema,
  websiteId: cuidSchema,
  providerId: cuidSchema.optional(),
  label: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  destinationUrl: urlSchema,
  contentKey: z.string().trim().max(120).optional(),
  isPrimary: z.boolean().default(false),
  visibleToRoles: z.array(walletRoleSchema).min(1),
  sortOrder: z.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true)
});

export const providerConnectionSchema = z.object({
  walletId: cuidSchema,
  websiteId: cuidSchema.optional(),
  providerTemplateId: cuidSchema.optional(),
  providerName: z.string().trim().min(2).max(120),
  displayLabel: z.string().trim().max(120).optional(),
  category: providerCategorySchema,
  connectionMethod: providerConnectionMethodSchema,
  connectedAccountLabel: z.string().trim().max(160).optional(),
  externalProjectId: z.string().trim().max(160).optional(),
  externalTeamId: z.string().trim().max(160).optional(),
  dashboardUrl: urlSchema.optional(),
  billingUrl: urlSchema.optional(),
  editUrl: urlSchema.optional(),
  supportUrl: urlSchema.optional(),
  ownerDescription: z.string().trim().max(500).optional(),
  tokenMetadata: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  notes: z.string().trim().max(4000).optional(),
  monthlyCostEstimate: z.number().nonnegative().optional(),
  renewalDate: z.coerce.date().optional()
});

export const inviteCreateSchema = z.object({
  walletId: cuidSchema,
  email: emailSchema,
  role: walletRoleSchema,
  inviteType: inviteTypeSchema.default("WALLET_MEMBER"),
  expiresAt: z.coerce.date(),
  context: z.record(z.any()).optional()
});

export const inviteAcceptSchema = z.object({
  token: z.string().min(20),
  email: emailSchema.optional(),
  name: z.string().trim().min(2).max(120).optional(),
  password: z.string().min(12).max(128).optional()
});

export const membershipRoleUpdateSchema = z.object({
  walletId: cuidSchema,
  memberId: cuidSchema,
  role: walletRoleSchema
});

export const billingRecordSchema = z.object({
  walletId: cuidSchema,
  providerConnectionId: cuidSchema.optional(),
  sourceType: z.enum([
    "RAEYL_SUBSCRIPTION",
    "PROVIDER_COST",
    "MANUAL_ADJUSTMENT"
  ]),
  label: z.string().trim().min(2).max(120),
  description: z.string().trim().max(400).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().trim().length(3).default("USD"),
  cadence: billingCadenceSchema,
  status: billingStatusSchema.default("ACTIVE"),
  providerReference: z.string().trim().max(160).optional(),
  invoiceUrl: urlSchema.optional(),
  billingUrl: urlSchema.optional(),
  renewalDate: z.coerce.date().optional(),
  isOwnerManaged: z.boolean().default(true)
});

export const billingRecordUpdateSchema = billingRecordSchema.extend({
  id: cuidSchema
});

export const billingRecordDeleteSchema = z.object({
  walletId: cuidSchema,
  id: cuidSchema
});

export const walletSubscriptionSchema = z.object({
  walletId: cuidSchema,
  provider: z.enum(["STRIPE", "MANUAL"]).default("STRIPE"),
  planKey: z.string().trim().min(2).max(80),
  stripePriceId: z.string().trim().max(120).optional(),
  trialEndsAt: z.coerce.date().optional()
});

export const alertCreateSchema = z.object({
  walletId: cuidSchema,
  providerConnectionId: cuidSchema.optional(),
  severity: alertSeveritySchema,
  category: z.enum([
    "PROVIDER_DISCONNECTED",
    "RENEWAL_EXPIRING",
    "MISSING_EDIT_ROUTE",
    "BILLING_SYNC_FAILED",
    "HANDOFF_PENDING",
    "WALLET_INCOMPLETE",
    "DOMAIN_ISSUE",
    "HOSTING_ISSUE",
    "CMS_ISSUE",
    "MANUAL"
  ]),
  title: z.string().trim().min(2).max(160),
  message: z.string().trim().min(2).max(1000),
  recommendation: z.string().trim().max(1000).optional()
});

export const supportRequestSchema = z.object({
  walletId: cuidSchema,
  providerConnectionId: cuidSchema.optional(),
  subject: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(80),
  priority: supportPrioritySchema.default("NORMAL"),
  description: z.string().trim().min(10).max(4000)
});

export const supportMessageSchema = z.object({
  supportRequestId: cuidSchema,
  body: z.string().trim().min(1).max(4000),
  isInternal: z.boolean().default(false)
});

export const accountSettingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional()
});

export const walletSettingsUpdateSchema = z.object({
  walletId: cuidSchema,
  businessName: z.string().trim().min(2).max(160),
  websiteUrl: urlSchema.optional(),
  notes: z.string().trim().max(4000).optional()
});

export const referralSchema = z.object({
  walletId: cuidSchema,
  partnerAccountId: cuidSchema,
  commissionRateBps: z.number().int().min(0).max(10000),
  attributionSource: z.string().trim().max(120).optional(),
  commissionWindowEnds: z.coerce.date().optional()
});

export const notificationSchema = z.object({
  userId: cuidSchema,
  walletId: cuidSchema.optional(),
  type: notificationTypeSchema,
  channel: notificationChannelSchema,
  subject: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1).max(4000),
  ctaUrl: urlSchema.optional(),
  metadata: z.record(z.any()).optional()
});

export const settingSchema = z.object({
  scope: z.enum(["USER", "WALLET", "PLATFORM"]),
  userId: cuidSchema.optional(),
  walletId: cuidSchema.optional(),
  key: z.string().trim().min(2).max(120),
  value: z.record(z.any())
});

export const providerSecretSchema = z.object({
  providerConnectionId: cuidSchema,
  secretType: z.enum([
    "ACCESS_TOKEN",
    "REFRESH_TOKEN",
    "API_KEY",
    "WEBHOOK_SECRET",
    "PASSWORD_HASH",
    "CLIENT_SECRET",
    "SECURE_LINK_CREDENTIAL"
  ]),
  environment: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT", "SHARED"]),
  rawValue: z.string().min(1),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().optional()
});

export const auditLogSchema = z.object({
  actorUserId: cuidSchema.optional(),
  actorType: z.enum(["USER", "SYSTEM", "ADMIN", "PARTNER"]),
  walletId: cuidSchema.optional(),
  entityType: z.enum([
    "USER",
    "WALLET",
    "MEMBERSHIP",
    "WEBSITE",
    "PROVIDER",
    "SECRET",
    "BILLING",
    "SUBSCRIPTION",
    "INVITE",
    "HANDOFF",
    "ALERT",
    "SUPPORT",
    "REFERRAL",
    "PAYOUT",
    "NOTIFICATION",
    "SETTING"
  ]),
  entityId: z.string().min(1),
  action: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(2).max(400),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().trim().max(80).optional(),
  userAgent: z.string().trim().max(1000).optional(),
  requestId: z.string().trim().max(120).optional()
});

export type WalletCreateInput = z.infer<typeof walletCreateSchema>;
export type ProviderConnectionInput = z.infer<typeof providerConnectionSchema>;
