# RAEYL Product Architecture

RAEYL is the ownership wallet and control rail for modern websites. It gives business owners one trusted place to understand, manage, and act on the systems that power their website after build handoff, without pretending to replace the tools already in the stack.

This document defines the product architecture and implementation plan for the major systems in RAEYL.

## Product Principles

1. Owners should feel clarity within 30 seconds of opening the wallet.
2. Developers should be able to configure a handoff-ready wallet without custom admin work.
3. RAEYL should route users to the right external tool, not trap them in fake abstraction.
4. Technical truth should remain intact underneath simplified owner-facing language.
5. Every critical action should be permissioned, auditable, and recoverable.
6. Every system should degrade gracefully when a provider cannot be deeply integrated.
7. The UI should feel premium and calm even when the system is surfacing issues.

## User Archetypes

- Wallet owner: business owner with final authority over the website ecosystem.
- Developer/setup collaborator: agency, freelancer, or internal technical team creating and configuring the wallet.
- Editor: content operator who needs guided access to CMS and content routes.
- Billing manager: finance stakeholder responsible for subscription visibility.
- Viewer: read-only stakeholder.
- Support collaborator: operations or assistant role with limited support and status access.
- Platform admin: internal RAEYL staff with elevated operational permissions.

## 1. Authentication System

### Purpose

Authenticate users securely across marketing, onboarding, application, invite acceptance, billing, and admin surfaces.

### User Value

- Owners get a trusted, low-friction sign-in flow.
- Developers can onboard clients without support intervention.
- Teams can be invited into existing wallets with role-specific access.
- Admins can securely operate the platform without bypass tooling.

### Page-Level Breakdown

- `/sign-in`
  - Email/password form
  - Magic link request form
  - Google SSO button
  - Invite-aware messaging if user arrived via secure invite
- `/get-started`
  - Account creation
  - Developer vs owner path selection
  - Terms acceptance
- `/accept-invite/[token]`
  - Invite validation
  - Existing account sign-in path
  - New account creation path
  - Role preview and wallet preview
- `/auth/verify-request`
  - Magic link pending confirmation
- `/auth/error`
  - Provider or session error state
- `/settings/account`
  - Password change
  - Connected auth methods
  - MFA-prepared architecture surface

### States

- Anonymous
- Authenticated, no wallets
- Authenticated, one wallet
- Authenticated, multi-wallet
- Invite-token pending
- Invite accepted, onboarding incomplete
- Password reset pending
- SSO linked
- SSO conflict detected
- Session expired
- Suspended account

### Edge Cases

- User receives invite for email already tied to an account.
- User receives invite for email different from signed-in account.
- Google account exists but password account also exists with same email.
- Invite expires before acceptance.
- Invite accepted after role changed or revoked.
- Wallet owner removed before completing account setup.
- Browser blocks magic-link open in same device flow.
- Sign-in is attempted for suspended or archived user.

### Actions

- Register account
- Sign in with email/password
- Request magic link
- Sign in with Google
- Accept invite
- Decline invite
- Reset password
- Link auth provider
- Revoke active sessions
- Update password

### Server-Side Requirements

- `User`, `Account`, `Session`, `VerificationToken` tables.
- Secure password hashing with bcrypt or argon2.
- Invite-token lookup, hashing, expiration, and one-time consumption.
- Session strategy using secure cookies and rotating session validation.
- OAuth provider callbacks.
- Risk-aware sign-in logging and audit records.
- Optional email verification gating based on role or org policy.
- Middleware for route protection and role-aware redirects.

### Client-Side Requirements

- Clear path selection: owner, developer, invited collaborator.
- Progressive disclosure for alternate auth methods.
- Friendly error recovery for expired links and provider conflicts.
- Session-aware redirect handling after login.
- Invite details visible before password creation.

### Validation Requirements

- Email format, normalization, and uniqueness.
- Password length, complexity baseline, breach-awareness architecture placeholder.
- Invite token validity and intended email enforcement.
- Provider callback state verification.
- Sign-in rate-limit and repeated-failure throttling.

### Security Concerns

- Credential stuffing protection.
- Session fixation prevention.
- CSRF-safe auth actions where applicable.
- One-time magic-link consumption.
- Secure cookie settings.
- Prevent account enumeration in error messages.
- Invite hijacking prevention through hashed token storage and intended-email matching.

### Permission Rules

- Anonymous users access marketing and auth pages only.
- Invite acceptance requires either matching signed-in identity or a new account bound to invited email.
- Admin auth uses standard auth plus role gate; no hidden backdoor route.

### Empty States

- No wallets yet after auth.
- No linked auth methods besides primary sign-in.
- No active sessions other than current device.

### Error States

- Invalid credentials
- Expired magic link
- OAuth callback failure
- Invite revoked
- Invite expired
- Email already in use with incompatible provider state
- Account suspended

### Loading States

- Submitting auth form
- Validating invite token
- Completing provider callback
- Establishing session after redirect

### Mobile Considerations

- Keyboard-safe forms
- Magic-link flows that survive mail app switching
- Large tap targets for auth options
- Minimal auth chrome for speed

### Extensibility Notes

- Add MFA with TOTP and recovery codes later.
- Support SAML/SCIM for agency and enterprise tiers.
- Device trust and sign-in challenge framework can attach to existing session model.

## 2. Wallet System

### Purpose

Represent the core ownership container for a business website ecosystem.

### User Value

- Owners get one clear asset-level control center.
- Developers have a structured, repeatable handoff container.
- Teams can collaborate around a shared website business system.

### Page-Level Breakdown

- `/app`
  - Wallet switcher if multi-wallet
  - Default redirect to selected wallet dashboard
- `/app/wallets`
  - Wallet list
  - Search, filter, sort
  - Create wallet
- `/app/wallets/new`
  - Wallet creation wizard
- `/app/wallets/[walletId]`
  - Wallet overview summary
- `/app/wallets/[walletId]/settings`
  - Business profile
  - Owner profile
  - Support preferences
  - Plan and lifecycle state

### States

- Draft
- In setup
- Ready for handoff
- Owner invited
- Active
- Attention needed
- Archived
- Suspended

### Edge Cases

- Wallet created with no website record yet.
- Wallet owner leaves before handoff completion.
- Multiple owners requested.
- Wallet imported from prior agency records with incomplete metadata.
- Wallet archived while providers still connected.
- Wallet transferred between developers or agencies.

### Actions

- Create wallet
- Edit wallet profile
- Archive wallet
- Restore wallet
- Transfer primary owner
- Reassign primary developer
- Duplicate wallet setup template
- Export wallet summary

### Server-Side Requirements

- `Wallet` table with lifecycle status, metadata, billing tier, primary contacts.
- `WalletMember` join model with roles and invitation linkage.
- Audit log creation for all wallet lifecycle events.
- Wallet scoping middleware and data access layer.
- Soft-delete or archive strategy.

### Client-Side Requirements

- Wizard-based creation for developers.
- Business-friendly labels and setup progress.
- Wallet switcher and persistent selected wallet state.
- Clear health and ownership summary at wallet top level.

### Validation Requirements

- Wallet name required.
- Business name required.
- Website URL normalized and validated.
- Plan tier must map to allowed pricing catalog.
- Primary owner and primary developer references must be valid members when assigned.

### Security Concerns

- Strict wallet scoping by membership.
- Prevent cross-wallet data leakage in list views and APIs.
- Audit every ownership transfer.
- Archive should not destroy billing or audit history.

### Permission Rules

- Platform admin: all wallets.
- Wallet owner: full wallet configuration except platform-level controls.
- Developer: full setup access until explicitly reduced.
- Billing manager: wallet and billing visibility, limited settings.
- Viewer/editor/support: restricted by section.

### Empty States

- No wallets for user.
- Wallet created but no websites yet.
- Wallet created but no members beyond creator.

### Error States

- Wallet inaccessible
- Wallet archived
- Missing primary owner
- Invalid transfer target

### Loading States

- Wallet switch
- Wallet creation submission
- Settings save
- Archive/restore confirmation

### Mobile Considerations

- Wallet switcher as compact sheet or dropdown
- Summary cards stack vertically
- Long wallet setup forms split into steps

### Extensibility Notes

- Multi-brand or multi-site subwallet grouping can be added later.
- Template library for repeated agency setups can sit on top of wallet creation.

## 3. Website Records

### Purpose

Model one or more managed websites or stack records inside a wallet.

### User Value

- Owners understand which site properties are covered.
- Developers can document production, staging, framework, and edit routes cleanly.
- Teams can manage multi-site businesses inside a single wallet.

### Page-Level Breakdown

- `/app/wallets/[walletId]/websites`
  - Website list
  - Filters by status, domain, category
- `/app/wallets/[walletId]/websites/[websiteId]`
  - Website overview
  - Environment links
  - Stack notes
  - Edit routes
- `/app/wallets/[walletId]/websites/[websiteId]/edit`
  - Metadata management
  - Route configuration

### States

- Draft
- Live
- Staging only
- Under maintenance
- Archived
- Replatforming

### Edge Cases

- No staging URL exists.
- Multiple domains route to same website.
- Site has multiple CMS targets.
- One wallet contains several brands or microsites.
- Website exists but production domain is not launched yet.

### Actions

- Add website
- Edit website metadata
- Set primary domain
- Add staging URL
- Add/edit deployment notes
- Set default edit route
- Archive website record

### Server-Side Requirements

- `Website` table linked to wallet.
- Unique constraints for wallet + website name and wallet + primary domain where appropriate.
- Edit route relation.
- Launch date and status tracking.

### Client-Side Requirements

- Technical detail summary for developer users.
- Owner-friendly translation for framework and environment fields.
- Links to live/staging/admin surfaces.

### Validation Requirements

- Domain normalization.
- URL validation for production and staging.
- Framework enum or controlled freeform with suggestions.
- At least one primary domain or production URL.

### Security Concerns

- Environment URLs may expose admin surfaces; visibility should follow permissions.
- Staging URLs may require masking or warnings if non-public.

### Permission Rules

- Owners/developers can manage website records.
- Editors/viewers can view if permitted.
- Sensitive notes may be developer-only if flagged.

### Empty States

- No websites yet.
- Website exists but no edit routes configured.
- Website exists but no live URL yet.

### Error States

- Invalid domain
- Duplicate site record
- Broken external URL
- Missing primary website in owner dashboard

### Loading States

- Website list fetch
- Save website metadata
- Edit route assignment

### Mobile Considerations

- Domains and URLs should wrap cleanly.
- Environment links grouped into action buttons.
- Notes collapse into accordions.

### Extensibility Notes

- Add environment health checks later.
- Add site map and page inventory layers later.

## 4. Provider Connections

### Purpose

Represent the external services powering the website stack and give users guided action paths into them.

### User Value

- Owners see what tools they are paying for and why they matter.
- Developers can structure provider setup consistently.
- RAEYL can become the trust layer between non-technical owners and technical infrastructure.

### Page-Level Breakdown

- `/app/wallets/[walletId]/providers`
  - Provider grid/list
  - Category filters
  - Health filters
- `/app/wallets/[walletId]/providers/new`
  - Add connection flow
  - Choose category
  - Choose connection method
- `/app/wallets/[walletId]/providers/[providerId]`
  - Provider detail
  - Status, billing, actions, metadata, issues, permissions
- `/app/wallets/[walletId]/providers/[providerId]/settings`
  - Connection settings
  - Reconnect
  - Secret rotation metadata
- `/app/wallets/[walletId]/provider-templates`
  - Optional admin/developer templates for repeated setups

### States

- Not connected
- Connected
- Pending verification
- Requires reconnect
- Manual record only
- Disconnected
- Archived

### Edge Cases

- Provider supports only manual link record, not API integration.
- Dashboard URL exists but billing URL does not.
- OAuth token revoked externally.
- Provider connected at wallet level but shared across multiple websites.
- Multiple provider records for same vendor across environments.
- Secret is present but insufficient permission scope.

### Actions

- Add provider
- Connect via OAuth
- Connect via API key
- Add manual record
- Save secure link record
- Reconnect
- Rotate credentials
- Update billing URL
- Change linked website
- Archive provider
- Test connection

### Server-Side Requirements

- `Provider`, `ProviderConnection`, `ConnectionToken`, and category taxonomy.
- Encrypted storage for tokens and secrets.
- Sync job architecture and sync state fields.
- Provider-specific adapters for OAuth and API test routines.
- Masked metadata serialization for UI.
- Health and connection status derivation.

### Client-Side Requirements

- Provider cards with category icon, health, cost, and action shortcuts.
- Setup wizard that adapts fields by connection method.
- Owner-friendly description field mandatory during setup.
- Technical metadata section for developers/admins.
- Reconnect and test result feedback.

### Validation Requirements

- Provider category required.
- Vendor name or template selection required.
- URLs validated and normalized.
- Secret fields required only for token-based methods.
- OAuth completion must bind provider record to wallet and website.

### Security Concerns

- Secrets encrypted at rest.
- Secret values never fully returned to client after write.
- Token scopes stored and surfaced to admins.
- Prevent SSRF via untrusted dashboard URLs if testing server-side.
- Audit credential creation, rotation, and revocation.

### Permission Rules

- Owners can view provider overview and owner-facing links.
- Developers can create and configure provider connections.
- Billing managers can view billing fields and renewal reminders.
- Editors/viewers usually cannot access technical connection settings.

### Empty States

- No providers connected.
- Provider exists but no billing data.
- Provider exists but no edit action mapped.

### Error States

- OAuth failed
- Token invalid
- Permission scope insufficient
- Manual record incomplete
- External API timeout

### Loading States

- Category load
- Connection test
- OAuth completion
- Save connection settings
- Sync refresh

### Mobile Considerations

- Provider cards should prioritize status, label, and action.
- Metadata collapses below main detail.
- Reconnect and billing links remain prominent but compact.

### Extensibility Notes

- Adapter interface should support vendor-specific enrichments later.
- Shared provider templates can accelerate agency setup.
- Health checks can mature from manual statuses to scheduled live sync.

## 5. Billing System

### Purpose

Provide subscription management for RAEYL and owner-friendly visibility into website stack costs without replacing external vendor billing.

### User Value

- Owners understand what they are paying for.
- Developers reduce billing confusion during handoff.
- RAEYL earns recurring revenue through its own subscription layer.

### Page-Level Breakdown

- `/pricing`
  - Public plan comparison
- `/app/wallets/[walletId]/billing`
  - Monthly summary
  - Provider cost breakdown
  - Upcoming renewals
  - RAEYL subscription
  - Invoice history
- `/app/wallets/[walletId]/billing/manage`
  - Stripe portal launch
  - Plan change
  - Payment method summary
- `/app/wallets/[walletId]/billing/costs`
  - Provider billing records
  - Notes and renewal reminders

### States

- Trialing
- Active
- Past due
- Payment failed
- Canceled
- Scheduled cancellation
- Incomplete
- Billing hidden pending owner handoff

### Edge Cases

- Wallet subscription active before owner accepts.
- Owner and billing manager both need access.
- Provider cost known but renewal date unknown.
- Annual and monthly costs mixed in same summary.
- Provider bill managed by agency, not owner.
- Stripe customer exists but wallet not linked.

### Actions

- Start trial
- Start subscription
- Upgrade plan
- Downgrade plan
- Cancel subscription
- Resume subscription
- Open billing portal
- Add provider cost record
- Mark cost as agency-managed
- Add renewal reminder

### Server-Side Requirements

- `WalletSubscription`, `BillingRecord`, `Invoice`, and Stripe customer/subscription linkage.
- Stripe checkout session creation.
- Stripe webhook processing.
- Plan entitlement mapping.
- Provider billing record storage.
- Renewal reminder scheduler.

### Client-Side Requirements

- Clean cost breakdown with owner-friendly descriptions.
- Clear separation between RAEYL bill and third-party bills.
- Renewal urgency indicators.
- Portal launch and plan actions.
- Billing access gating by role.

### Validation Requirements

- Plan ID must exist in pricing catalog.
- Cost amounts non-negative.
- Currency normalization.
- Renewal dates valid and timezone-aware.
- Provider cost record must link to wallet and optionally provider.

### Security Concerns

- Verify Stripe webhook signatures.
- No raw payment data stored in app database.
- Billing access limited to owners, billing managers, admins.
- Protect against tampering with plan change requests.

### Permission Rules

- Wallet owner: full billing access.
- Billing manager: full billing visibility and Stripe portal access.
- Developer: optional visibility if granted; not default for live owner-managed billing.
- Editor/viewer/support: no billing access by default.

### Empty States

- No RAEYL subscription yet.
- No provider costs entered.
- No invoices yet.
- Renewal dates missing.

### Error States

- Checkout session failed
- Portal session failed
- Webhook mismatch
- Payment failed
- Billing data out of sync

### Loading States

- Creating checkout session
- Opening billing portal
- Refreshing invoices
- Saving provider cost note

### Mobile Considerations

- Cost summary top-line should appear before detailed table.
- Renewal reminders should be tappable cards.
- Invoice history becomes stacked list.

### Extensibility Notes

- Add multi-currency support later.
- Add cost anomaly reporting later.
- Add spend forecasting once enough billing history exists.

## 6. Handoff System

### Purpose

Move a wallet cleanly from developer-led setup into owner-controlled operational reality.

### User Value

- Developers can deliver a website in a professional, repeatable way.
- Owners gain explicit ownership confirmation and confidence.
- RAEYL becomes the handoff record, not a loose email thread.

### Page-Level Breakdown

- `/app/wallets/[walletId]/handoff`
  - Checklist
  - Timeline
  - Invite status
  - Ownership confirmation
  - Developer retention settings
- `/accept-invite/[token]`
  - Owner acceptance flow
- `/app/wallets/[walletId]/handoff/complete`
  - Completion summary
  - Follow-up tasks

### States

- Not started
- In progress
- Owner invited
- Owner viewed invite
- Owner accepted
- Billing pending
- Completed
- Reopened

### Edge Cases

- Owner accepts after invite replacement.
- Ownership transferred after initial handoff.
- Developer should remain as support collaborator.
- Owner declines handoff.
- Billing required before handoff completion.
- One wallet has multiple owners but one must be primary.

### Actions

- Start handoff
- Mark checklist item complete
- Invite owner
- Resend invite
- Confirm ownership transfer
- Retain developer role
- Remove developer access
- Reopen handoff

### Server-Side Requirements

- `HandoffRecord` with status, timestamps, checklist state, participants.
- Ownership transfer transaction logic.
- Audit timeline events.
- Completion rules engine.

### Client-Side Requirements

- Checklist with clear required vs optional steps.
- Ownership status banner.
- Timeline and next action guidance.
- Post-handoff state summary for owner.

### Validation Requirements

- Primary owner must exist for completion.
- Required provider and website metadata presence can be configurable.
- Billing requirement rules depend on plan policy.

### Security Concerns

- Ownership transfer must be deliberate and auditable.
- Prevent accidental removal of last privileged member.
- Protect completion actions behind re-auth for critical operations if needed.

### Permission Rules

- Developer and owner can see handoff.
- Only owner or admin can finalize primary ownership assignment.
- Only privileged members can remove developer access.

### Empty States

- Handoff not started.
- Owner not invited yet.
- No checklist configured.

### Error States

- Invite expired during handoff
- Missing owner
- Conflicting ownership records
- Completion blocked by billing or required metadata

### Loading States

- Checklist update
- Invite resend
- Ownership confirmation
- Completion processing

### Mobile Considerations

- Checklist must work as full-width list.
- Timeline cards stack vertically.
- Critical actions need confirm dialogs sized for thumb reach.

### Extensibility Notes

- Add handoff templates by industry or agency.
- Add signed acknowledgment flows later.

## 7. Invite System

### Purpose

Add users into wallets securely with role-specific access.

### User Value

- Owners can invite staff cleanly.
- Developers can onboard owners and collaborators during setup.
- Role clarity exists before acceptance.

### Page-Level Breakdown

- `/app/wallets/[walletId]/access`
  - Member list
  - Invite form
  - Pending invites
- `/accept-invite/[token]`
  - Acceptance flow

### States

- Draft
- Sent
- Delivered
- Viewed
- Accepted
- Expired
- Revoked

### Edge Cases

- Same email invited twice with different roles.
- Existing member re-invited after removal.
- Invite resent after role change.
- Invite intended for owner but accepted after owner role transferred.

### Actions

- Send invite
- Resend invite
- Revoke invite
- Change invite role
- Accept invite
- Decline invite

### Server-Side Requirements

- `Invite` table with hashed token, status, intended email, inviter, target role.
- Email dispatch hooks.
- Expiration management.
- Acceptance transaction creating or linking `WalletMember`.

### Client-Side Requirements

- Invite form with role explanation.
- Pending invite list with expiry and resend.
- Invite acceptance view with wallet/business context.

### Validation Requirements

- Email required and normalized.
- Role required.
- Prevent duplicate active invite collisions.
- Prevent invite for invalid or unauthorized role.

### Security Concerns

- Token hashing.
- One-time consumption.
- Intended-email enforcement.
- Revoke invalidates token immediately.

### Permission Rules

- Owners and developers with access-management privilege can invite.
- Only owner/admin can invite another owner or transfer ownership.

### Empty States

- No members beyond current user.
- No pending invites.

### Error States

- Invite expired
- Invite revoked
- Role no longer available
- User already active in wallet

### Loading States

- Sending invite
- Validating invite
- Accepting invite

### Mobile Considerations

- Pending invite cards instead of dense tables.
- Invite form should remain short and segmented.

### Extensibility Notes

- Add batch invites later.
- Add invite approval workflow for enterprise orgs later.

## 8. Permissions System

### Purpose

Enforce least-privilege access across all wallet and platform surfaces.

### User Value

- Owners retain control.
- Developers can stay involved without overreaching.
- Editors and staff only see what they need.

### Page-Level Breakdown

- `/app/wallets/[walletId]/access`
  - Roles table
  - Member permissions summary
- `/admin/roles`
  - Internal role template management if needed

### States

- Effective role active
- Custom permission override active
- Suspended member
- Pending invite role

### Edge Cases

- One user has multiple roles across different wallets.
- A user is both billing manager and editor.
- Last owner removal attempt.
- Developer loses access during active setup.

### Actions

- Change role
- Revoke member
- Transfer ownership
- Apply section-level override

### Server-Side Requirements

- Role matrix utility.
- Permission guards for server actions and route loaders.
- Optional capability overrides.
- Audit logs for changes.

### Client-Side Requirements

- Permission-aware navigation.
- Hide actions user cannot perform.
- Explain why restricted actions are unavailable when useful.

### Validation Requirements

- Prevent invalid role transitions.
- Ensure one active owner minimum.
- Verify actor has authority to change target role.

### Security Concerns

- Never rely on client-only access control.
- Every mutation checks wallet membership and capability.
- Prevent privilege escalation via crafted request payloads.

### Permission Rules

- Platform admin: full platform access.
- Wallet owner: all wallet-level actions.
- Developer: setup and provider actions, optional billing visibility, no owner-only transfer unless granted.
- Editor: edit route visibility, content-facing access, limited provider visibility.
- Viewer: read-only wallet overview.
- Billing manager: billing and subscription management.
- Support: support tickets, alerts, selected provider/support visibility.

### Empty States

- No custom overrides.
- Single-member wallet.

### Error States

- Unauthorized
- Forbidden transition
- No remaining owner

### Loading States

- Role save
- Member removal
- Ownership transfer

### Mobile Considerations

- Role badges and actions should be stacked, not table-only.

### Extensibility Notes

- Capability-based permissions can supplement role model later.
- Enterprise custom roles can be layered on top of existing system.

## 9. Alerts and Health

### Purpose

Surface issues, risks, and configuration gaps in a lightweight way that owners can actually understand.

### User Value

- Owners know what needs attention.
- Developers can monitor handoff readiness and provider health.
- RAEYL becomes the calm signal layer between chaotic vendor dashboards.

### Page-Level Breakdown

- `/app/wallets/[walletId]/alerts`
  - Alert list
  - Severity filters
  - Related provider links
- Dashboard alert summary section
- Provider detail issue panels
- Admin global alert overview

### States

- Open
- Dismissed
- Resolved
- Snoozed

### Edge Cases

- Alert triggered by derived rule but underlying provider deleted.
- Duplicate alerts from repeated failed sync.
- Owner dismisses alert but developer still needs visibility.
- Alert severity escalates over time as due date nears.

### Actions

- Dismiss alert
- Resolve alert
- Snooze alert
- Open recommended action
- Create manual alert

### Server-Side Requirements

- `Alert` table with severity, status, wallet, provider, creator, timestamps.
- Rule engine hooks for due dates, sync failures, missing edit routes, pending handoff.
- Background jobs for recalculation and escalation.

### Client-Side Requirements

- Severity-coded cards and badges.
- Clear action recommendation text.
- Owner-friendly language first, technical detail second.

### Validation Requirements

- Valid severity and category enums.
- Recommendation required for actionable alerts.
- Provider and wallet linkage integrity.

### Security Concerns

- Some technical alerts may include sensitive metadata; limit visibility.
- Prevent malicious manual alert spam via role checks and rate limits.

### Permission Rules

- Owners, developers, support, admins can view alerts.
- Resolve/dismiss privileges can be role-based by alert type.
- Billing alerts visible to billing managers.

### Empty States

- No active alerts.
- No critical alerts.

### Error States

- Alert action failed
- Related provider missing
- Health sync stale

### Loading States

- Alert feed load
- Dismiss action
- Resolve action

### Mobile Considerations

- Alert cards with one primary CTA.
- Severity visible without opening detail.

### Extensibility Notes

- Add subscriptions to specific alert types.
- Add issue correlation across multiple providers later.

## 10. Support System

### Purpose

Give wallet users a structured way to request help tied to the right wallet and provider context.

### User Value

- Owners know how to get help without searching for the right vendor.
- Developers can leave support pathways behind during handoff.
- RAEYL can become the coordination layer even before full helpdesk depth exists.

### Page-Level Breakdown

- `/app/wallets/[walletId]/support`
  - New request form
  - Existing cases
  - Suggested help paths
- `/app/wallets/[walletId]/support/[caseId]`
  - Case detail
  - Status timeline
- `/admin/support`
  - All support cases
  - Triage view

### States

- Open
- In progress
- Waiting on customer
- Waiting on provider
- Resolved
- Closed

### Edge Cases

- Support case tied to removed provider.
- User files support request without enough context.
- Multiple cases opened for same issue.
- Owner needs provider-specific contact but RAEYL only stores link.

### Actions

- Create support case
- Add note
- Change priority
- Link provider
- Resolve case
- Reopen case

### Server-Side Requirements

- `SupportRequest` table with subject, category, wallet, provider, priority, notes, status.
- Comment/timeline architecture.
- Optional attachment placeholder model.
- Notification triggers.

### Client-Side Requirements

- Simple request form with business-friendly categories.
- Case list with status and recency.
- Support escalation guidance and provider shortcuts.

### Validation Requirements

- Subject and category required.
- Priority constrained.
- Wallet scope enforced.

### Security Concerns

- Attachments later need malware scanning and secure storage.
- Prevent cross-wallet visibility.
- Internal notes should be separately permissioned if added later.

### Permission Rules

- Owner, developer, support role can create and view support requests.
- Editors may create if enabled.
- Billing manager may create billing-related cases.

### Empty States

- No open support cases.
- No provider linked to request.

### Error States

- Submission failed
- Case not found
- Unauthorized access

### Loading States

- Case submission
- Timeline fetch
- Status update

### Mobile Considerations

- Prioritize new request CTA.
- Case detail as stacked timeline.

### Extensibility Notes

- Add live chat, email threading, SLA, and internal assignment later.

## 11. Referral and Partner System

### Purpose

Track developer or agency-driven client acquisition and recurring commission eligibility.

### User Value

- Agencies have incentive to adopt RAEYL.
- RAEYL can attribute growth channels cleanly.
- Platform ops can audit payouts and referral health.

### Page-Level Breakdown

- `/app/partner`
  - Partner overview
  - Referred wallets
  - Estimated earnings
- `/app/partner/payouts`
  - Payout history
- `/admin/referrals`
  - Global referral management

### States

- Pending attribution
- Active
- Commissioning
- Paused
- Paid out
- Expired window
- Disputed

### Edge Cases

- Wallet changes developer after signup.
- Multiple developers claim same client.
- Subscription canceled and reactivated.
- Commission rate differs by plan.

### Actions

- Register partner
- Attribute wallet
- Approve referral
- Calculate payout
- Mark payout paid
- Dispute referral

### Server-Side Requirements

- `Referral`, `PartnerAccount`, `Payout` models.
- Subscription linkage to referral records.
- Monthly payout calculation jobs.
- Admin override tools.

### Client-Side Requirements

- Earnings summary
- Referred wallet list
- Payout status detail

### Validation Requirements

- Partner account identity required.
- Wallet attribution uniqueness rules.
- Commission rate within allowed bounds.

### Security Concerns

- Payout data sensitive.
- Referral fraud and duplicate attribution prevention.
- Admin approval required before payout release.

### Permission Rules

- Partner sees only own referrals and payouts.
- Admin sees all.
- Wallet owner does not automatically see partner economics unless product policy allows.

### Empty States

- No referrals yet.
- No payouts yet.

### Error States

- Attribution conflict
- Payout calculation failed
- Partner inactive

### Loading States

- Referral dashboard fetch
- Payout calculation
- Status change

### Mobile Considerations

- Earnings cards compact and legible.
- Referred wallet list as cards.

### Extensibility Notes

- Add referral links, codes, and marketplace partner profiles later.

## 12. Notification System

### Purpose

Deliver in-app and email communications for invites, alerts, billing, support, and handoff milestones.

### User Value

- Owners stay informed without living in the app.
- Developers know when handoff actions are complete.
- RAEYL can communicate like a premium operating system rather than a noisy app.

### Page-Level Breakdown

- `/app/notifications`
  - In-app inbox
  - Preferences link
- `/settings/notifications`
  - Channel preferences
  - Event preferences
- `/admin/notifications`
  - Template and delivery monitoring

### States

- Queued
- Sent
- Delivered
- Failed
- Read
- Archived

### Edge Cases

- Notification event fires for user without access anymore.
- Email bounces.
- In-app notification references deleted entity.
- User muted event class but event is legally or operationally required.

### Actions

- Mark read
- Mark unread
- Archive
- Update preferences
- Retry failed send

### Server-Side Requirements

- `Notification` and `NotificationPreference` models.
- Template rendering service.
- Queue or job abstraction.
- Email provider integration.
- Event publisher for app domain actions.

### Client-Side Requirements

- Inbox badge counts
- Notification center
- Preference toggles
- Contextual deep links

### Validation Requirements

- Preference keys must map to known event types.
- Required notifications cannot be disabled.

### Security Concerns

- Avoid leaking sensitive details via email.
- Secure deep links requiring auth.
- Respect least privilege when rendering notification content.

### Permission Rules

- Users view their own notifications.
- Admin can monitor template/delivery health, not impersonate inbox casually.

### Empty States

- No notifications.
- All caught up.

### Error States

- Delivery failed
- Preference save failed
- Linked entity missing

### Loading States

- Inbox load
- Mark-as-read action
- Preference save

### Mobile Considerations

- Notification tray optimized for one-thumb interaction.
- Email previews should remain short.

### Extensibility Notes

- Add SMS or Slack later for admin/support alerts.
- Add digest batching later.

## 13. Admin Console

### Purpose

Provide RAEYL internal staff with full platform operations tooling.

### User Value

- Internal teams can manage growth, support, billing, and platform quality without raw database access.

### Page-Level Breakdown

- `/admin`
  - Platform overview
- `/admin/users`
- `/admin/wallets`
- `/admin/subscriptions`
- `/admin/referrals`
- `/admin/providers`
- `/admin/support`
- `/admin/alerts`
- `/admin/audit`
- `/admin/pricing`
- `/admin/feature-flags`
- `/admin/email-templates`
- `/admin/onboarding`

### States

- Healthy operations
- Elevated support load
- Billing issues active
- Queue backlog
- Feature flag mismatch

### Edge Cases

- Admin edits live wallet data during active owner session.
- Admin changes pricing with existing subscriptions.
- Internal support note must not appear externally.
- Feature flag rollout partially applied.

### Actions

- Search users/wallets
- Impersonation architecture placeholder
- Adjust subscription metadata
- Review alerts
- Resolve support queues
- Manage templates
- Toggle features

### Server-Side Requirements

- Admin-only route group and middleware.
- Audit logging for every admin mutation.
- Read models for platform metrics.
- Feature flag persistence.

### Client-Side Requirements

- Dense but clear operations UI.
- Search and filtering across large datasets.
- Detail drawers or pages for entity inspection.

### Validation Requirements

- Admin-only mutations strongly typed and policy checked.
- Config values constrained and versioned where possible.

### Security Concerns

- Strict admin role enforcement.
- Elevated actions logged and reviewable.
- Avoid accidental secret exposure in admin UI.

### Permission Rules

- Only platform admins.
- Future split roles: support admin, finance admin, ops admin.

### Empty States

- No active support cases
- No unresolved alerts
- No flagged onboarding failures

### Error States

- Forbidden
- Misconfigured feature flag
- Failed metrics fetch

### Loading States

- Table loads
- Filter changes
- Config save

### Mobile Considerations

- Admin console desktop-first, mobile read-only acceptable for v1.

### Extensibility Notes

- Add granular internal roles and approval flows later.

## 14. Settings System

### Purpose

Allow wallet-level and user-level configuration across identity, behavior, communication, and presentation.

### User Value

- Owners can shape the wallet around their operating preferences.
- Users can control notifications and profile details.
- Developers can tune how wallet guidance is presented after handoff.

### Page-Level Breakdown

- `/settings/account`
- `/settings/preferences`
- `/settings/notifications`
- `/app/wallets/[walletId]/settings`
  - Business info
  - Website defaults
  - Support settings
  - Billing settings
  - Provider display rules

### States

- Default
- Customized
- Restricted by role
- Pending verification for changed email

### Edge Cases

- User changes email while invite is pending elsewhere.
- Wallet settings conflict with provider-level settings.
- Theme or localization placeholder exists before full implementation.

### Actions

- Update profile
- Change password
- Adjust notification preferences
- Update wallet defaults
- Save support preferences

### Server-Side Requirements

- `UserSetting` and `WalletSetting` tables or JSON configs with validation layer.
- Change-audit records for important settings.

### Client-Side Requirements

- Sectioned settings panels.
- Dirty-state handling.
- Role-aware disabled controls.

### Validation Requirements

- Strong schema validation via Zod.
- Controlled enums for support and notification settings.

### Security Concerns

- Sensitive settings changes may require re-auth.
- Prevent unauthorized wallet preference modification.

### Permission Rules

- User settings are self-managed.
- Wallet settings follow wallet role.

### Empty States

- Defaults in effect
- No support preferences configured

### Error States

- Save conflict
- Unauthorized
- Invalid value

### Loading States

- Settings fetch
- Save
- Re-auth challenge placeholder

### Mobile Considerations

- Accordion-style sections
- Sticky save bar for long forms

### Extensibility Notes

- Add localization and advanced brand controls later.

## 15. Dashboard UX

### Purpose

Give owners instant understanding of their website ecosystem and guide them toward the right next action.

### User Value

- They know whether the site is healthy.
- They know what it costs.
- They know where to click to make changes.
- They know who owns what and where help lives.

### Page-Level Breakdown

- `/app/wallets/[walletId]/dashboard`
  - Top summary rail
  - Website health
  - Connected systems
  - Monthly costs
  - Alerts
  - Quick actions
  - Edit website
  - Access summary
  - Activity feed
  - Support summary

### States

- Healthy and calm
- Needs attention
- Critical issue present
- Setup incomplete
- Handoff pending
- No providers yet

### Edge Cases

- Owner has multiple websites in one wallet.
- No billing visibility because owner has not activated subscription.
- Developer-only wallet before owner exists.
- Dashboard for viewer should be much slimmer.

### Actions

- Open edit route
- Review alerts
- Open provider
- Manage access
- View billing
- Contact support

### Server-Side Requirements

- Aggregated wallet dashboard query.
- Derived metrics: provider count, unresolved alerts, monthly cost, ownership completeness.
- Permission-aware field selection.

### Client-Side Requirements

- Strong information hierarchy.
- Quick actions tied to actual configured routes.
- Business-friendly language.
- Empty states that tell user what to do next.

### Validation Requirements

- Dashboard query must tolerate missing subrecords.
- Null-safe aggregated totals.

### Security Concerns

- Hide sensitive provider metadata and billing where role restricted.
- Ensure quick actions do not reveal hidden provider URLs to unauthorized users.

### Permission Rules

- Content adapts by role.
- Owners get full owner dashboard.
- Developers see setup status overlays.
- Editors see edit-focused actions.

### Empty States

- No providers connected
- No edit routes configured
- No recent activity
- No alerts

### Error States

- Partial data load
- Dashboard unavailable
- Linked provider missing

### Loading States

- Skeleton for summary rail, cards, and feed
- Optimistic refresh after actions like alert dismiss

### Mobile Considerations

- Top summary as stacked stat cards
- Quick actions first
- Activity and detail panels lower down

### Extensibility Notes

- Personalized dashboard modules can be added later.
- Industry-specific widgets can be layered in by template.

## 16. Edit Routing System

### Purpose

Guide users to the correct place to edit the website across CMS and stack tools rather than editing content directly inside RAEYL.

### User Value

- Owners stop guessing where changes should be made.
- Editors get one-click access to the right tool.
- Developers can reduce support overhead by mapping clear edit destinations.

### Page-Level Breakdown

- Dashboard quick actions
- `/app/wallets/[walletId]/websites/[websiteId]/edit-routes`
  - Edit route list
  - Primary route
  - Page-specific routes
- `/app/wallets/[walletId]/edit`
  - Owner-facing launchpad of edit actions

### States

- No routes configured
- Primary route only
- Multiple routes configured
- Route missing destination
- Route disabled

### Edge Cases

- Website edits happen in multiple systems.
- Same CMS has multiple spaces/environments.
- Route changes after handoff.
- Deep link becomes stale or removed externally.
- Certain routes should only be visible to editors/developers.

### Actions

- Add route
- Set primary route
- Label route
- Assign route to provider
- Restrict route by role
- Disable route
- Open route

### Server-Side Requirements

- `EditRoute` model linked to wallet, website, and optionally provider.
- Role visibility and priority fields.
- Optional content area metadata.
- Health validation job for broken links if feasible.

### Client-Side Requirements

- Route cards with clear labels like "Edit homepage" or "Update team page".
- Warnings when no route exists.
- Owner-safe copy explaining where the action will open.

### Validation Requirements

- Destination URL required.
- Label required.
- Website linkage required.
- One primary route per website.
- Role visibility values valid.

### Security Concerns

- Route URLs may point into sensitive admin tools.
- Avoid exposing privileged deep links to unauthorized users.
- Warn when route points to external tool requiring separate auth.

### Permission Rules

- Developers and owners can manage routes.
- Editors can use routes but not edit route definitions by default.
- Viewers may not see edit routes.

### Empty States

- No edit routes yet.
- No page-specific routes.

### Error States

- Invalid route
- Unauthorized route visibility
- Broken deep link

### Loading States

- Route launch validation
- Save route
- Reorder route list

### Mobile Considerations

- Route cards full-width and tappable.
- Labels should be short and action-led.

### Extensibility Notes

- Add smart route suggestions from CMS schema later.
- Add page inventory to route mapping later.

## Cross-System Implementation Plan

### Backend Architecture

- Next.js App Router with server components for read-heavy surfaces.
- Server actions or route handlers for mutations with shared policy guards.
- Prisma for relational schema and type-safe data access.
- NextAuth for user/session/account model.
- Stripe for RAEYL subscription management.
- Notification event service for in-app and email events.
- Provider adapter interface for OAuth, API-key, and manual records.
- Background job abstraction for sync checks, reminders, and payout calculation.

### Frontend Architecture

- Route-group separation:
  - `(marketing)`
  - `(auth)`
  - `(app)`
  - `(admin)`
- Shared design system:
  - stat cards
  - badges
  - provider cards
  - action panels
  - empty states
  - timeline items
  - table/list primitives
- Domain-specific feature folders:
  - `features/auth`
  - `features/wallets`
  - `features/providers`
  - `features/billing`
  - `features/handoff`
  - `features/support`
  - `features/admin`

### Shared States to Standardize Across the Product

- `empty`
- `loading`
- `error`
- `success`
- `restricted`
- `archived`
- `pending_action`

### Shared Validation Strategy

- Zod schemas for all form payloads and route params.
- Server-side validation repeated for every mutation.
- URL normalization utilities.
- Email normalization utilities.
- Enum-safe role and status validation.

### Shared Security Strategy

- Server-only permission enforcement.
- Secrets encrypted at rest.
- Tokens masked in UI.
- Auditable mutations across critical entities.
- Invite and handoff actions stored as immutable timeline events.
- Admin operations logged separately with actor and context.

### Shared Mobile Strategy

- Owner dashboard optimized for stacked cards and primary actions first.
- Dense admin tables collapse into cards or remain desktop-first where acceptable.
- External links and edit routes remain large-touch targets.
- Long settings and setup flows broken into steps or accordions.

### Shared Extensibility Strategy

- Provider adapter pattern.
- Capability-based permissions layered over base roles.
- Event-driven notification and audit architecture.
- Template-driven onboarding, provider setup, and handoff flows.
- Multi-wallet and multi-site support as first-class architecture, not bolt-on behavior.

## Recommended Build Order

1. Auth, user model, and wallet scoping.
2. Wallet CRUD, website records, and dashboard aggregate queries.
3. Invites, permissions, and handoff skeleton.
4. Provider connection records, categories, and edit routing.
5. Billing records plus Stripe subscription flow.
6. Alerts, activity, and notifications.
7. Support and referrals.
8. Admin console and operational tooling.

## Definition of Done for v1

- Owner can sign in, accept invite, and see a complete wallet dashboard.
- Developer can create a wallet, add websites, connect provider records, define edit routes, and hand off ownership.
- Billing exists for RAEYL plus provider cost visibility.
- Alerts, activity, and support are visible and permissioned.
- Admin can inspect users, wallets, subscriptions, referrals, alerts, and support.
- All critical actions are authenticated, permission-checked, and auditable.
