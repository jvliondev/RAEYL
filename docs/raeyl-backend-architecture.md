# RAEYL Backend Architecture

This document defines the backend architecture for RAEYL as a production-grade SaaS platform. It is written to serve as the source of truth for schema design, persistence boundaries, permission enforcement, secret handling, service architecture, API planning, and operational observability.

## 1. Backend Goals

1. Model website ownership and operational control as first-class relational entities.
2. Enforce wallet boundaries and permissions server-side for every read and write path.
3. Treat provider credentials and secrets as highly sensitive encrypted assets.
4. Preserve an auditable event trail for ownership, access, billing, handoff, and support actions.
5. Support the current RAEYL product surface while remaining extensible for deeper provider integrations and enterprise governance later.

## 2. Core Relational Design

The schema is centered around `Wallet`, because the wallet is the product's core ownership unit.

Supporting entity clusters:

- Identity cluster:
  - `User`
  - `Account`
  - `Session`
  - `VerificationToken`
- Ownership cluster:
  - `Wallet`
  - `WalletMembership`
  - `Invite`
  - `HandoffRecord`
- Website and provider cluster:
  - `Website`
  - `EditRoute`
  - `ProviderTemplate`
  - `ProviderConnection`
  - `ProviderSecret`
- Billing cluster:
  - `WalletSubscription`
  - `BillingRecord`
- Operations cluster:
  - `Alert`
  - `SupportRequest`
  - `SupportMessage`
  - `Notification`
  - `NotificationPreference`
  - `Setting`
  - `AuditLog`
- Growth cluster:
  - `PartnerAccount`
  - `Referral`
  - `Payout`

The design intentionally separates:

- membership from invites
- provider records from provider secrets
- subscription state from generalized billing records
- audit trail from user-facing activity feed

This keeps the model normalized, permissionable, and scalable.

## 3. Enum Definitions

Defined in [prisma/schema.prisma](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/prisma/schema.prisma):

- `UserStatus`
- `UserType`
- `WalletStatus`
- `HandoffStatus`
- `OwnerAcceptanceStatus`
- `SetupStatus`
- `WalletRole`
- `MembershipStatus`
- `WebsiteStatus`
- `ProviderCategory`
- `ProviderConnectionMethod`
- `ProviderStatus`
- `HealthStatus`
- `SyncState`
- `SecretType`
- `SecretStatus`
- `InviteType`
- `InviteStatus`
- `AlertSeverity`
- `AlertStatus`
- `AlertCategory`
- `BillingSourceType`
- `BillingCadence`
- `BillingStatus`
- `SubscriptionProvider`
- `SupportPriority`
- `SupportStatus`
- `NotificationChannel`
- `NotificationStatus`
- `NotificationType`
- `AuditActorType`
- `AuditEntityType`
- `PartnerStatus`
- `ReferralStatus`
- `PayoutStatus`
- `SettingScope`
- `CredentialEnvironment`

These enums are intentionally comprehensive. They reduce implicit string drift across services, API payloads, admin tools, and analytics queries.

## 4. Table-by-Table Data Model

### `User`

Purpose:
Represents a platform identity. A user may belong to zero, one, or many wallets.

Primary key:
- `id`

Key fields:
- `email`
- `passwordHash`
- `status`
- `type`
- `isMfaEnrolled`
- `lastLoginAt`

Relationships:
- one-to-many with `Account`
- one-to-many with `Session`
- one-to-many with `WalletMembership`
- one-to-many with sent and accepted `Invite`
- one-to-many with `Notification`
- one-to-many with `NotificationPreference`
- one-to-many with `Setting` for user scope
- one-to-one with `PartnerAccount`

Indexes:
- unique `email`

Notes:
- Password auth remains optional to support magic-link-only or SSO-first users.
- `type` is kept separate from wallet role because global user identity and wallet-scoped role are different concerns.

### `Account`

Purpose:
Stores external identity provider links for NextAuth or equivalent auth infrastructure.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`

Indexes:
- unique `[provider, providerAccountId]`
- index `userId`

Notes:
- This is provider-login infrastructure, not wallet authorization.

### `Session`

Purpose:
Stores active login sessions.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`

Indexes:
- unique `sessionToken`
- index `userId`

Notes:
- IP and user agent fields enable fraud monitoring, account security, and session management later.

### `VerificationToken`

Purpose:
Stores verification or magic-link style tokens.

Primary key:
- none explicit beyond unique keys

Indexes:
- unique `token`
- unique `[identifier, token]`

Notes:
- This remains auth infrastructure, separate from wallet invites.

### `Wallet`

Purpose:
Represents the core ownership wallet for a business website ecosystem.

Primary key:
- `id`

Foreign keys:
- `createdById -> User.id`
- `primaryDeveloperId -> User.id`
- `primaryOwnerId -> User.id`

Indexes:
- unique `slug`
- index `[status, updatedAt]`
- index `primaryOwnerId`
- index `primaryDeveloperId`
- index `createdById`

Notes:
- The wallet stores business identity and lifecycle state.
- Owner and developer references are denormalized convenience pointers; true access is still governed by `WalletMembership`.

### `WalletMembership`

Purpose:
Represents a user’s membership within a wallet.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `userId -> User.id`
- `inviteId -> Invite.id`

Indexes:
- unique `[walletId, userId]`
- index `[walletId, role]`
- index `[userId, status]`
- index `inviteId`

Notes:
- This is the canonical wallet access model.
- It supports per-wallet role, membership status, and optional fine-grained permission overrides via `permissions` JSON.
- `isPrimaryOwner` and `isPrimaryDeveloper` are denormalized markers for quick lookup and validation support.

### `Website`

Purpose:
Models a website or managed stack record inside a wallet.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`

Indexes:
- unique `[walletId, name]`
- index `[walletId, status]`
- index `[walletId, primaryDomain]`

Notes:
- Website is separate from wallet because one wallet may contain multiple sites, brands, or environments.

### `EditRoute`

Purpose:
Stores actionable deep links that route users to the correct editing surface.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `websiteId -> Website.id`
- `providerId -> ProviderConnection.id`

Indexes:
- index `[walletId, websiteId]`
- index `providerId`
- index `[websiteId, isPrimary]`

Notes:
- `visibleToRoles` makes edit routing permission-aware at the route level.
- This is intentionally not embedded into website JSON because edit routing is a core product system that needs querying, auditing, and reordering.

### `ProviderTemplate`

Purpose:
Represents a reusable vendor template such as Vercel, Supabase, Cloudflare, Builder.io, or Stripe.

Primary key:
- `id`

Indexes:
- unique `slug`

Notes:
- Templates define category, supported connection methods, and validation/config schema hints.
- This supports future admin-managed provider library expansion.

### `ProviderConnection`

Purpose:
Represents an actual provider connected to a wallet or website.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `websiteId -> Website.id`
- `providerTemplateId -> ProviderTemplate.id`

Indexes:
- index `[walletId, category]`
- index `[walletId, status]`
- index `websiteId`
- index `providerTemplateId`

Notes:
- This is the owner-facing provider record.
- It intentionally separates display metadata from encrypted secrets.
- `status`, `healthStatus`, and `syncState` are distinct:
  - connection status answers “is it connected”
  - health answers “is it okay”
  - sync state answers “is our data fresh”

### `ProviderSecret`

Purpose:
Stores encrypted credentials or secret material tied to a provider connection.

Primary key:
- `id`

Foreign keys:
- `providerConnectionId -> ProviderConnection.id`

Indexes:
- index `[providerConnectionId, secretType]`
- index `[status, expiresAt]`

Notes:
- Only encrypted payloads are stored.
- `keyVersion` supports key rotation.
- `valueFingerprint` supports duplicate detection or validation without exposing raw secrets.
- `maskedPreview` is safe for UI display.

### `Invite`

Purpose:
Represents secure role-based invitation flows for wallet members or handoff owners.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `sentById -> User.id`
- `acceptedById -> User.id`

Indexes:
- unique `tokenHash`
- index `[walletId, status]`
- index `[email, status]`
- index `expiresAt`

Notes:
- Invites are separate from memberships because invites exist before access exists.
- `role` stores the intended wallet role to materialize at acceptance time.
- `context` can carry setup or handoff metadata without overfitting columns.

### `HandoffRecord`

Purpose:
Tracks ownership handoff lifecycle and checklist completion.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `completedById -> User.id`

Indexes:
- index `[walletId, status]`
- index `ownerInviteId`

Notes:
- Checklist is stored as structured JSON to support evolving handoff templates without constant migrations.

### `WalletSubscription`

Purpose:
Stores the RAEYL subscription record for a wallet.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`

Indexes:
- unique `stripeCustomerId`
- unique `stripeSubscriptionId`
- index `[walletId, status]`

Notes:
- Subscription state is isolated from general billing records because lifecycle and webhook processing are specialized.

### `BillingRecord`

Purpose:
Stores owner-visible cost items, including RAEYL plan records and external provider costs.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `providerConnectionId -> ProviderConnection.id`

Indexes:
- index `[walletId, sourceType]`
- index `[walletId, renewalDate]`
- index `providerConnectionId`

Notes:
- This is the billing visibility layer, not payment processing itself.
- `isOwnerManaged` distinguishes owner-managed costs from agency-managed or internal costs.

### `Alert`

Purpose:
Stores user-facing issues and operational warnings.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `providerConnectionId -> ProviderConnection.id`

Indexes:
- index `[walletId, status, severity]`
- index `providerConnectionId`

Notes:
- Alerts are durable records, not transient UI banners.

### `SupportRequest`

Purpose:
Represents a support issue or help request tied to a wallet and optionally a provider.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `providerConnectionId -> ProviderConnection.id`
- `requesterId -> User.id`

Indexes:
- index `[walletId, status, priority]`
- index `requesterId`
- index `providerConnectionId`

Notes:
- Internal notes are stored separately from public user description.

### `SupportMessage`

Purpose:
Stores conversation or internal notes attached to a support request.

Primary key:
- `id`

Foreign keys:
- `supportRequestId -> SupportRequest.id`
- `authorId -> User.id`

Indexes:
- index `[supportRequestId, createdAt]`

Notes:
- `isInternal` supports support-team-only notes later.

### `PartnerAccount`

Purpose:
Stores partner/developer payout identity and recurring commission terms.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`

Indexes:
- unique `userId`
- index `status`

Notes:
- Separate from `User` because not every user is a partner and payout data is operationally distinct.

### `Referral`

Purpose:
Stores wallet attribution to a partner account.

Primary key:
- `id`

Foreign keys:
- `walletId -> Wallet.id`
- `partnerAccountId -> PartnerAccount.id`

Indexes:
- unique `[walletId, partnerAccountId]`
- index `[partnerAccountId, status]`
- index `[walletId, status]`

Notes:
- Commission rate is stored here rather than only on partner account so referral terms can vary over time or by deal.

### `Payout`

Purpose:
Stores actual partner payout records for a time period.

Primary key:
- `id`

Foreign keys:
- `partnerAccountId -> PartnerAccount.id`

Indexes:
- index `[partnerAccountId, status]`
- index `[periodStart, periodEnd]`

Notes:
- This decouples payout execution from referral attribution.

### `Notification`

Purpose:
Stores in-app and email notifications.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`
- `walletId -> Wallet.id`

Indexes:
- index `[userId, status, createdAt]`
- index `[walletId, type]`

Notes:
- Notifications are durable, queryable records.
- Delivery and read states are explicit.

### `NotificationPreference`

Purpose:
Stores per-user channel preferences for specific notification types.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`

Indexes:
- unique `[userId, type, channel]`

Notes:
- Keeps preference rows sparse and explicit rather than large settings blobs.

### `Setting`

Purpose:
Stores structured configuration values at user, wallet, or platform scope.

Primary key:
- `id`

Foreign keys:
- `userId -> User.id`
- `walletId -> Wallet.id`

Indexes:
- unique `[scope, userId, walletId, key]`
- index `[walletId, key]`
- index `[userId, key]`

Notes:
- A semi-structured `value` field is appropriate here because settings shape evolves faster than operational entities.
- The uniqueness constraint prevents duplicate setting keys within a scope.

### `AuditLog`

Purpose:
Stores immutable backend events for compliance, security review, troubleshooting, and operational history.

Primary key:
- `id`

Foreign keys:
- `actorUserId -> User.id`
- `walletId -> Wallet.id`

Indexes:
- index `[walletId, createdAt]`
- index `[entityType, entityId, createdAt]`
- index `[actorUserId, createdAt]`
- index `[action, createdAt]`

Notes:
- This is the canonical system audit structure.
- The user-facing activity feed can later be generated from audit events plus product-specific presentation rules.

## 5. Role Definitions

Global role:

- `PLATFORM_ADMIN`
  - internal platform operator
  - may access admin console and all wallets

Wallet-scoped roles:

- `WALLET_OWNER`
  - full control over wallet, billing, access, settings, handoff
- `DEVELOPER`
  - setup, provider configuration, websites, edit routes, support, handoff assistance
- `EDITOR`
  - edit-facing actions and limited wallet visibility
- `VIEWER`
  - read-only summary access
- `BILLING_MANAGER`
  - billing and subscription control
- `SUPPORT`
  - support and alert visibility with limited operational actions

Role-to-capability mapping is implemented in [lib/auth/permissions.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/auth/permissions.ts).

## 6. Audit and Event Structure

Audit events should be written for all critical domain actions:

- wallet created, updated, archived, restored
- membership invited, accepted, role changed, revoked
- owner transferred
- provider created, updated, reconnected, archived
- provider secret created, rotated, revoked
- subscription started, changed, canceled, failed
- billing record created or changed
- alert created, dismissed, resolved
- support request created, updated, resolved
- handoff started, owner invited, owner accepted, completed, reopened
- notification queued or failed
- referral approved, payout issued

Audit payload shape:

- actor type
- actor user id if present
- wallet id if applicable
- entity type
- entity id
- action
- summary
- metadata JSON
- request id
- ip address
- user agent
- timestamp

Scaffold exists at [lib/audit.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/audit.ts).

## 7. Invite Model

Invite lifecycle:

1. privileged user creates invite
2. backend hashes token and stores `tokenHash`
3. email notification is queued
4. invite is marked `SENT`
5. recipient opens invite link, backend validates token and expiry
6. acceptance flow either signs into existing user or creates user
7. backend creates or updates `WalletMembership`
8. invite is marked `ACCEPTED`
9. audit event is recorded

Security notes:

- store token hash only
- use one-time tokens
- bind invite acceptance to intended email
- revoke old invites on role changes if policy requires

## 8. Billing Model

Two-layer design:

1. `WalletSubscription`
   - authoritative record for RAEYL subscription lifecycle
   - tied to Stripe identifiers
2. `BillingRecord`
   - owner-visible summary records for RAEYL and provider costs

This allows RAEYL to:

- manage its own subscription lifecycle with precision
- summarize external cost landscape without pretending to own external payment systems

Recommended billing write paths:

- Stripe webhooks update `WalletSubscription`
- service layer derives or updates matching `BillingRecord` entries where appropriate
- manual or provider-synced cost rows populate the rest of the billing summary

## 9. Referral Model

Three-table design:

- `PartnerAccount`
  - who earns referral commissions
- `Referral`
  - which wallet is attributed and on what terms
- `Payout`
  - actual money owed or paid over a period

This separation prevents payout logic from contaminating wallet or user tables.

## 10. Token and Credential Storage Model

Provider secrets are stored in `ProviderSecret`, not on `ProviderConnection`.

Stored fields:

- secret type
- environment
- encrypted value
- key version
- fingerprint
- masked preview
- scopes
- status
- expiry metadata

Encryption strategy:

- AES-256-GCM with a 32-byte base64-decoded application key
- random IV per secret
- authentication tag stored in payload
- key version stored per row for future rotation

Implemented scaffold:
[lib/security/encryption.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/security/encryption.ts)

Operational rules:

- raw secrets never logged
- raw secrets never returned from read APIs
- UI only receives masked preview and metadata
- services decrypt only inside trusted server execution path
- rotation creates new row state or updates current row with audit trail, depending on policy

## 11. Provider Model

Provider architecture layers:

1. `ProviderTemplate`
   - reusable vendor definition
2. `ProviderConnection`
   - actual wallet-level instance of a provider
3. `ProviderSecret`
   - encrypted credentials for the provider instance
4. `EditRoute`
   - end-user action layer that may reference a provider

This prevents the common trap of mixing vendor definitions, connected accounts, credentials, and UI shortcuts into one overloaded table.

## 12. Wallet Membership Model

`WalletMembership` is the source of truth for wallet authorization.

Key design choices:

- one row per user per wallet
- role is explicit and queryable
- status supports pending, revoked, suspended workflows
- invite linkage preserves provenance
- optional JSON `permissions` allows future capability overrides without schema breakage

Critical invariants:

- a wallet must never end a transaction with zero active owners
- owner transfer should be transactional
- removing the last privileged member should fail

## 13. Settings Model

Settings are stored in `Setting` rather than scattered columns for evolving preference areas.

Recommended key namespaces:

- user:
  - `profile.theme`
  - `notifications.email.alerts`
  - `notifications.in_app.billing`
- wallet:
  - `support.contactPreference`
  - `dashboard.defaultView`
  - `editRoutes.ownerCopyMode`
- platform:
  - `featureFlags.providerHealthPolling`
  - `pricing.defaultTrialDays`

Rules:

- validate every setting write with Zod based on key
- no arbitrary unvalidated JSON writes from clients
- reserve direct platform setting writes for admins only

## 14. Notification Model

Two-layer approach:

- `Notification`
  - delivery record
- `NotificationPreference`
  - user preference state

Notification flow:

1. domain event occurs
2. service resolves target users
3. preference layer filters optional sends
4. `Notification` rows are created
5. delivery worker sends email or marks in-app
6. read and archive state remain queryable

## 15. Prisma Schema

The full Prisma schema is implemented in:
[prisma/schema.prisma](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/prisma/schema.prisma)

It includes:

- complete enums
- table relations
- foreign keys
- uniqueness constraints
- operational indexes

## 16. Zod Validation Model

Validation contracts are implemented in:
[lib/validation/backend.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/validation/backend.ts)

Covered schemas:

- wallet create/update
- website create
- edit route
- provider connection
- invite create/accept
- membership role update
- billing record
- wallet subscription
- alert create
- support request/message
- referral
- notification
- setting
- provider secret
- audit log

Validation rules:

- all external inputs validated at the edge
- all service-level writes validated again server-side
- URL, email, role, enum, and monetary values normalized early

## 17. API Route and Server Action Plan

Recommended split:

- server actions for authenticated UI-bound mutations inside App Router
- route handlers for webhooks, OAuth callbacks, async jobs, and external system entry points

### Auth

- `POST /api/auth/[...nextauth]`
- `POST /api/auth/invite/accept`
- `POST /api/auth/magic-link/request`

### Wallets

- `GET /api/wallets`
- `POST /api/wallets`
- `GET /api/wallets/:walletId`
- `PATCH /api/wallets/:walletId`
- `POST /api/wallets/:walletId/archive`
- `POST /api/wallets/:walletId/restore`

### Memberships and Invites

- `GET /api/wallets/:walletId/members`
- `POST /api/wallets/:walletId/invites`
- `POST /api/invites/:inviteId/resend`
- `POST /api/invites/:inviteId/revoke`
- `POST /api/wallets/:walletId/members/:memberId/role`
- `DELETE /api/wallets/:walletId/members/:memberId`

### Websites and Edit Routes

- `GET /api/wallets/:walletId/websites`
- `POST /api/wallets/:walletId/websites`
- `PATCH /api/websites/:websiteId`
- `POST /api/websites/:websiteId/edit-routes`
- `PATCH /api/edit-routes/:editRouteId`
- `DELETE /api/edit-routes/:editRouteId`

### Providers

- `GET /api/wallets/:walletId/providers`
- `POST /api/wallets/:walletId/providers`
- `PATCH /api/providers/:providerId`
- `POST /api/providers/:providerId/test`
- `POST /api/providers/:providerId/reconnect`
- `POST /api/providers/:providerId/secrets`
- `POST /api/providers/:providerId/archive`

### Billing

- `GET /api/wallets/:walletId/billing`
- `POST /api/wallets/:walletId/billing/records`
- `POST /api/wallets/:walletId/subscription/checkout`
- `POST /api/wallets/:walletId/subscription/portal`
- `POST /api/stripe/webhooks`

### Alerts

- `GET /api/wallets/:walletId/alerts`
- `POST /api/wallets/:walletId/alerts`
- `POST /api/alerts/:alertId/dismiss`
- `POST /api/alerts/:alertId/resolve`
- `POST /api/alerts/:alertId/snooze`

### Support

- `GET /api/wallets/:walletId/support`
- `POST /api/wallets/:walletId/support`
- `GET /api/support/:supportId`
- `POST /api/support/:supportId/messages`
- `POST /api/support/:supportId/status`

### Handoff

- `GET /api/wallets/:walletId/handoff`
- `POST /api/wallets/:walletId/handoff/start`
- `POST /api/wallets/:walletId/handoff/checklist`
- `POST /api/wallets/:walletId/handoff/complete`
- `POST /api/wallets/:walletId/handoff/reopen`

### Referrals and Partners

- `GET /api/partner/referrals`
- `POST /api/partner/referrals`
- `GET /api/partner/payouts`
- `POST /api/admin/referrals/:referralId/approve`
- `POST /api/admin/payouts/:payoutId/pay`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications/:notificationId/read`
- `POST /api/notifications/preferences`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/wallets`
- `GET /api/admin/subscriptions`
- `GET /api/admin/alerts`
- `GET /api/admin/support`
- `GET /api/admin/audit`
- `POST /api/admin/feature-flags`

## 18. Repository and Service Architecture

Recommended structure:

- repositories:
  - thin persistence adapters around Prisma
  - no permission decisions
  - no UI shaping
- services:
  - transactional domain logic
  - permission assertions
  - audit emission
  - notification triggers
- policies:
  - capability resolution
  - wallet scope enforcement
- controllers/actions:
  - validate input
  - load identity
  - call service
  - map domain result to response

Suggested modules:

- `repositories/user-repository.ts`
- `repositories/wallet-repository.ts`
- `repositories/provider-repository.ts`
- `repositories/billing-repository.ts`
- `repositories/support-repository.ts`
- `services/wallet-service.ts`
- `services/invite-service.ts`
- `services/provider-service.ts`
- `services/billing-service.ts`
- `services/handoff-service.ts`
- `services/support-service.ts`
- `services/referral-service.ts`
- `services/notification-service.ts`
- `services/audit-service.ts`

Service responsibilities:

- `wallet-service`
  - create/update/archive wallet
  - ownership transfer rules
- `invite-service`
  - create invite, hash token, send notification, accept invite
- `provider-service`
  - create connection, encrypt secrets, test connection, rotate credentials
- `billing-service`
  - Stripe checkout/portal orchestration, billing record sync
- `handoff-service`
  - checklist progression and completion validation
- `notification-service`
  - create/send notifications according to preferences

## 19. Permission Enforcement Strategy

Rules:

1. all permissions are enforced server-side
2. wallet-scoped actions require wallet membership lookup
3. admin actions require global admin status
4. client UI can hide actions, but hiding is never authorization

Enforcement layers:

- route middleware:
  - ensure authenticated access to app/admin areas
- action/controller layer:
  - validate wallet scope and load actor membership
- service layer:
  - assert capability before mutation
- repository layer:
  - use wallet-scoped query filters when possible

Capability model scaffold exists in:
[lib/auth/permissions.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/auth/permissions.ts)

Recommended helper pattern:

- `requireSession()`
- `requireWalletAccess(walletId)`
- `requireCapability(walletId, capability)`
- `requireAdmin()`

## 20. Token Encryption Strategy

Goals:

- protect provider credentials at rest
- support rotation
- support masked preview in UI
- avoid plaintext leakage

Approach:

- application-level encryption before database write
- AES-256-GCM
- base64-encoded 32-byte master key from environment
- random IV per secret
- store key version per row
- derive fingerprint for duplicate detection
- store masked preview for non-sensitive display

Key rotation strategy:

1. maintain active key version in application config
2. encrypt new secrets with current version
3. decrypt old secrets using version-aware resolver
4. background job re-encrypts old rows gradually
5. mark previous key deprecated only after migration

## 21. Logging Strategy

Two classes of logs:

- application logs
  - runtime diagnostics
  - service failures
  - webhook processing
  - job execution
- audit logs
  - user and system actions with business meaning

Structured logging scaffold:
[lib/logging.ts](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/lib/logging.ts)

Mandatory log context fields when available:

- request id
- actor user id
- wallet id
- action
- entity id

Rules:

- never log secrets
- never log full invite tokens
- redact provider payloads before logging
- error logs should include machine-readable code and human-readable summary

## 22. Audit Trail Strategy

Audit trail requirements:

- immutable append-only writes
- recorded inside service layer transaction boundary when possible
- actor and target entity always explicit
- request metadata included for investigations

Audit categories:

- security
- access
- ownership
- billing
- provider credentials
- support
- admin operations

Audit retention:

- long-lived by default
- archive to cold storage if scale demands it later

## 23. Suggested Service-Level Transaction Boundaries

Use database transactions for:

- invite acceptance + membership creation + audit write
- ownership transfer + membership updates + wallet pointer updates + audit write
- provider secret rotation + status update + audit write
- subscription webhook reconciliation + billing record update + notification create + audit write
- handoff completion + owner designation + invite closeout + notification create + audit write

## 24. Backend Implementation Priorities

1. Prisma client, migrations, and core schema.
2. Auth integration and session loading.
3. Wallet membership policy helpers.
4. Invite and handoff services.
5. Provider connection and secret services.
6. Billing and Stripe webhooks.
7. Alert, notification, and support flows.
8. Referral and payout services.
9. Admin reporting queries.

## 25. Summary

RAEYL’s backend is designed as a wallet-centric relational system with clear separation between identity, ownership, provider integration, billing visibility, support operations, referral economics, notification delivery, and immutable audit history.

The resulting shape supports:

- secure ownership handoff
- principled permissions
- encrypted credential storage
- Stripe-backed subscriptions
- provider-based website management
- clean operational visibility for owners and admins

This is the correct backbone for a serious SaaS platform, not a demo-tier dashboard app.
