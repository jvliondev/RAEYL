# RAEYL Developer and Agency Handoff Experience

This document defines the full developer and agency handoff workflow for RAEYL. It is the operational path that turns a built website into a clearly owned business asset with a clean management layer for the client.

The handoff experience should feel:

- methodical without feeling heavy
- premium without feeling ceremonial
- obvious without being simplistic
- safe without being paranoid

For the developer or agency, RAEYL should feel like the professional closeout layer they always wished existed between launch and long-term ownership.

## 1. Core Handoff Principles

1. Setup should move in a natural working order.
2. The developer should always know what remains before handoff is complete.
3. The owner invite should feel important, not casual.
4. Ownership transfer should be explicit and auditable.
5. The developer should be able to stay involved after handoff in a controlled role.
6. Referral and attribution should happen naturally within setup, not as a separate sales admin task.
7. No step should feel ambiguous about what comes next.

## 2. Handoff Workflow Overview

The complete handoff lifecycle:

1. Developer account creation
2. Initial workspace onboarding
3. Wallet creation
4. Website setup
5. Provider connection setup
6. Edit routing setup
7. Owner data entry
8. Access and invite setup
9. Handoff checklist review
10. Owner invitation
11. Ownership acceptance
12. Handoff completion
13. Post-handoff developer choice
14. Referral attribution and payout state
15. Wallet completion state resolution

## 3. Developer Account Creation

### Purpose

Get the developer or agency into RAEYL and route them into setup quickly.

### Screen

`/get-started`

### User Type

- freelancer
- agency owner
- technical lead
- implementation partner

### Layout

- focused auth shell
- developer path selected by default if entry came from "For developers"
- right-side panel on desktop with short value stack:
  - Set up the wallet
  - Connect the stack
  - Hand off with confidence

### Fields

- Full name
- Work email
- Password
- Agency / studio name
- Optional website
- Terms acceptance

### Validations

- email valid and normalized
- password minimum 12 characters
- agency name optional but max length enforced
- website URL valid if provided

### Success State

- account created
- developer lands in guided onboarding

### Warnings

- email already in use
- invite already exists for this email
- OAuth account conflict

### Edge Cases

- developer already invited into an existing wallet
- developer uses personal email rather than agency email
- agency owner wants multi-user workspace later

### Permission Rules

- initial developer account has no wallet access until wallet created or invite accepted

### Copywriting

Headline:
- "Set up client websites with a clean handoff"

Support line:
- "Create the wallet, connect the stack, and give your client one clear control center."

### Timeline

- expected completion: under 2 minutes

### Audit Events

- `user.created`
- `developer.onboarding.started`

## 4. Developer Onboarding Home

### Purpose

Orient the developer around the setup flow before the first wallet exists.

### Screen

`/app/onboarding`

### Layout

- progress stepper at top
- primary CTA panel
- optional template shortcuts beneath

### Sections

1. Welcome
2. What you will do
3. Start first wallet
4. Referral note if partner account active

### Actions

- Create wallet
- Import existing client later
- Skip intro

### Copywriting

Headline:
- "Set up the wallet your client will actually use"

Supporting line:
- "RAEYL helps you document the website stack, define the right edit paths, and hand ownership over cleanly."

## 5. Wallet Setup

### Purpose

Create the core ownership container for one client website ecosystem.

### Screen

`/app/wallets/new`

### Layout

Recommended 4-step wizard:

1. Wallet identity
2. Business details
3. Website details
4. Plan and support defaults

Desktop:

- left step rail
- center form pane
- right contextual guidance pane

Mobile:

- top stepper
- full-width form
- sticky footer actions

### Fields

#### Step 1: Wallet identity

- Wallet name
- Wallet slug
- Business name

#### Step 2: Business details

- Owner contact name
- Owner email
- Owner phone
- Business category
- Timezone

#### Step 3: Website details

- Website name
- Website URL
- Website description

#### Step 4: Plan and support defaults

- Plan tier
- Primary support email
- Support preference note
- Internal notes

### Validations

- wallet name required
- slug required, lowercase and unique
- business name required
- owner email valid if present
- website URL valid if present
- timezone valid if selected

### Success State

- wallet created
- routed immediately to wallet setup flow

### Warnings

- slug already taken
- owner email missing will block later handoff completion
- website URL missing will reduce owner clarity

### Edge Cases

- business has multiple websites
- agency sets up wallet before client contact is final
- plan tier unknown at creation

### Permission Rules

- creator becomes developer member
- if creator is partner, referral attribution can be initialized here

### Copywriting

Step header:
- "Create the website wallet"

Helper copy:
- "This becomes the central ownership view your client will use."

### Timeline

- 3 to 5 minutes

### Audit Events

- `wallet.created`
- `wallet.membership.created`
- `referral.initialized` if applicable

## 6. Website Setup

### Purpose

Record the actual website or websites covered by the wallet.

### Screen

`/app/wallets/[walletId]/websites/new`

### Layout

- wizard continuation or setup page within wallet shell

### Fields

- Website name
- Primary domain
- Production URL
- Staging URL
- Site category
- Framework / stack
- Launch date
- Owner notes
- Developer notes

### Validations

- website name required
- at least one of primary domain or production URL required
- staging URL valid if provided
- launch date valid if provided

### Success State

- website appears in setup summary
- next step unlocked: provider connections

### Warnings

- no production URL yet
- staging URL not public
- framework not entered reduces technical documentation quality

### Edge Cases

- multiple websites in one wallet
- microsite or staging-only handoff
- domain not live yet

### Permission Rules

- developer, owner, admin can create
- editors/viewers cannot

### Copywriting

Header:
- "Add the website this wallet supports"

Helper copy:
- "Include the live address, any staging link, and enough detail for a clear handoff."

### Timeline

- 2 to 4 minutes per website

### Audit Events

- `website.created`
- `website.updated`

## 7. Provider Connections

### Purpose

Document and connect the services that power the website.

### Screen

- `/app/wallets/[walletId]/providers`
- `/app/wallets/[walletId]/providers/new`

### Layout

- provider setup progress strip
- provider category picker
- connection wizard
- existing provider list below

### Recommended Order

1. Hosting
2. CMS
3. Domain
4. Database
5. Payments
6. Analytics
7. Support
8. Custom tools

### Fields

Generic fields:

- Provider category
- Provider template / custom provider name
- Connected account label
- Dashboard URL
- Billing URL
- Edit URL
- Support URL
- Owner-facing description
- Website linkage
- Connection method
- Credential input if applicable
- Cost estimate
- Renewal date
- Notes

### Validations

- category required
- provider name/template required
- URL fields valid if present
- credential required only for credential-based methods
- owner-facing description strongly recommended, may be required for owner-facing readiness

### Success State

- provider card added to wallet
- setup progress increments
- sync or manual status displayed

### Warnings

- provider added manually only
- no billing information provided
- no owner-facing description
- no edit destination for CMS

### Edge Cases

- multiple CMS tools
- one provider linked to multiple sites
- credentials unavailable because client owns account
- provider billed through agency

### Permission Rules

- developer and owner can configure
- billing managers can edit billing-only records if permitted

### Copywriting

Section title:
- "Connect the website tools"

Helper copy:
- "Add the systems your client will need to understand, review, or open later."

### Timeline

- 2 to 10 minutes per provider depending on depth

### Audit Events

- `provider.created`
- `provider.connected`
- `provider.connection.failed`
- `provider.secret.stored`
- `provider.billing.updated`

## 8. Edit Routing Setup

### Purpose

Define exactly where the owner should be sent when they want to make changes.

### Screen

- `/app/wallets/[walletId]/websites/[websiteId]/edit-routes`

### Layout

- route coverage summary
- primary route panel
- page-specific route list
- suggested routes panel if CMS adapter supports it

### Fields

- Route label
- Description
- Destination URL
- Related provider
- Route type
- Visible roles
- Set as primary
- Sort order

### Suggested Starter Routes

- Edit website
- Edit homepage
- Edit services
- Edit blog
- Edit team
- Edit site settings

### Validations

- label required
- destination URL required
- only one primary route per website
- related provider should belong to same wallet if set

### Success State

- route coverage status improves
- owner dashboard quick actions become available

### Warnings

- no primary edit route
- CMS connected but no page-specific routes
- destination uses broad workspace fallback rather than exact page route

### Edge Cases

- content edited in multiple tools
- custom admin tool used instead of CMS
- only one generic edit path exists

### Permission Rules

- developer, owner, admin can manage
- editor can view/use only

### Copywriting

Header:
- "Set the editing paths your client will use"

Helper copy:
- "These actions let RAEYL send the owner to the right place instead of making them guess."

### Timeline

- 3 to 8 minutes

### Audit Events

- `edit_route.created`
- `edit_route.updated`
- `edit_route.primary_set`

## 9. Owner Data Entry

### Purpose

Capture the information needed to invite the client and present a credible ownership handoff.

### Screen

- `/app/wallets/[walletId]/handoff`
- owner details panel inside handoff flow

### Fields

- Owner full name
- Owner email
- Owner phone
- Preferred role
- Billing owner same as primary owner toggle
- Welcome note

### Validations

- owner name required for premium handoff experience
- owner email required for invite
- email normalization and uniqueness checks
- welcome note length bounded

### Success State

- owner card becomes ready
- invite step unlocks

### Warnings

- owner email missing blocks handoff
- owner email already belongs to unexpected existing account
- owner phone missing is allowed but noted as incomplete contact record

### Edge Cases

- owner uses assistant email
- multiple owners requested
- client wants finance contact separate from primary owner

### Permission Rules

- developer, owner, admin
- only authorized members can set primary owner target

### Copywriting

Header:
- "Add the owner who will receive this wallet"

Helper copy:
- "This person becomes the main business owner for the website wallet."

### Timeline

- under 2 minutes

### Audit Events

- `handoff.owner_details_updated`

## 10. Invite Flow

### Purpose

Send a secure ownership invitation that feels deliberate and trustworthy.

### Screens

- invite modal or panel within handoff page
- invite sent confirmation state
- invite status card
- owner acceptance screen

### Invite Creation Fields

- Owner email
- Owner role
- Personalized note
- Expiration window

### Validations

- email required
- role must be `WALLET_OWNER` for ownership handoff invite
- expiration date valid and within policy bounds

### Success State

- invite status becomes `sent`
- handoff timeline updates
- owner invite card shows resend and copy-link actions if allowed

### Warnings

- owner has not yet accepted
- invite will expire soon
- invite sent to address not matching recorded owner contact

### Edge Cases

- invite resent after changes
- invite accepted by existing account
- invite expires before owner accepts
- owner email changed after invite was sent

### Permission Rules

- developer with handoff privilege
- wallet owner
- admin

### Copywriting

Invite CTA:
- "Send ownership invite"

Confirmation text:
- "The owner has been invited to review and accept this website wallet."

Pending state text:
- "Waiting for the owner to accept access"

Expired state text:
- "The invite expired before it was accepted"

### Timeline

- sent immediately
- follow-up reminders suggested after 2 days and 5 days

### Audit Events

- `invite.created`
- `invite.sent`
- `invite.resent`
- `invite.expired`
- `invite.revoked`

## 11. Handoff Checklist

### Purpose

Make handoff quality visible and measurable before ownership is transferred.

### Screen

- `/app/wallets/[walletId]/handoff`

### Layout

- checklist as primary column
- timeline and owner state as secondary column

### Checklist Items

Required:

1. Wallet details completed
2. At least one website added
3. Core website tools added
4. Primary owner entered
5. Primary edit path set
6. Owner invite sent

Recommended:

7. Billing details added
8. At least one page-specific edit route added
9. Support contact added
10. Monthly cost summary reviewed

### Validations

- checklist items may auto-complete based on data state
- some items require manual confirmation if subjective

### Success State

- checklist reaches handoff-ready state
- completion meter shows 100% required readiness

### Warnings

- owner can still be invited before checklist complete
- but wallet cannot be marked complete until required items pass

### Edge Cases

- client wants early invite before setup is done
- some providers intentionally omitted
- no CMS exists because site edits happen elsewhere

### Permission Rules

- developer, owner, admin can view
- developer and admin can manage checklist during setup

### Copywriting

Title:
- "Handoff readiness"

Support line:
- "Complete the key setup steps before ownership is finalized."

### Timeline

- persistent across setup

### Audit Events

- `handoff.checklist_item.completed`
- `handoff.checklist_item.reopened`
- `handoff.ready`

## 12. Ownership Acceptance

### Purpose

Let the client accept the wallet in a way that feels formal, clear, and reassuring.

### Screens

- `/accept-invite/[token]`
- owner acceptance confirmation
- post-acceptance onboarding screen

### Owner Acceptance Screen Content

- business name
- website summary
- what the wallet includes
- role they are accepting
- primary actions after acceptance

### Acceptance Actions

- Accept ownership
- Sign in to existing account
- Create account and accept

### Validations

- token valid
- intended email match
- invite not expired or revoked
- user identity linked correctly

### Success State

- owner membership activated
- primary owner assigned
- handoff timeline advances
- owner lands in onboarding or dashboard

### Warnings

- accepting this wallet will make you the primary owner
- developer may still remain as collaborator if configured

### Edge Cases

- owner already has RAEYL account
- invite token expired
- another owner already assigned in interim
- acceptance occurs after developer removed self accidentally

### Permission Rules

- only invited recipient may accept
- admin may repair broken acceptance flows operationally

### Copywriting

Headline:
- "Accept your website wallet"

Support line:
- "This gives you a clear place to review your website systems, editing paths, billing, and access."

Success confirmation:
- "Ownership confirmed"

### Timeline

- immediate on acceptance

### Audit Events

- `invite.accepted`
- `membership.activated`
- `wallet.primary_owner_assigned`
- `handoff.owner_accepted`

## 13. Post-Handoff Options

### Purpose

Let the developer decide how their relationship to the wallet continues after the owner accepts.

### Screen

- post-handoff decision panel on handoff page

### Available Options

1. Stay as website setup partner
2. Stay with reduced support access
3. Remove your access after handoff

### Option 1: Stay as website setup partner

Use when:

- agency retains support or maintenance role

Result:

- developer remains active member with `DEVELOPER` role

### Option 2: Stay with reduced support access

Use when:

- agency only wants limited ongoing access

Result:

- developer role changes to `SUPPORT` or `VIEWER` depending on policy

### Option 3: Remove your access

Use when:

- full clean handoff desired

Result:

- developer membership revoked after confirmation

### Warnings

- removing access is immediate
- if no other collaborator remains, the owner becomes sole active member
- this action can be reversed only by re-invitation

### Copywriting

Section title:
- "After handoff, choose your access"

Option copy:
- "Stay as website setup partner"
- "Stay with limited support access"
- "Remove my access after handoff"

### Audit Events

- `membership.role_changed`
- `membership.revoked`
- `handoff.post_access_selected`

## 14. Developer Collaborator Mode

### Purpose

Define how agencies remain involved after ownership transfer without blurring control.

### Experience Rules

- owner remains clearly primary
- developer sees collaborator framing, not hidden ownership
- certain owner-only actions remain visibly restricted

### Developer View After Handoff

Show:

- handoff complete badge
- owner confirmed
- your current collaborator role
- open support/setup responsibilities

### Allowed Actions

Depending on role:

- update provider connections
- adjust edit routes
- respond to support
- view dashboard

Restricted Actions:

- transfer primary ownership
- manage owner-only billing unless role permits
- remove primary owner

### Copywriting

Header badge:
- "Handoff complete"

Support text:
- "You remain connected as a website setup partner."

## 15. Developer Removal Flow

### Purpose

Allow a clean and deliberate exit from the wallet after handoff.

### Screen

- confirmation dialog launched from post-handoff section or access settings

### Confirmation Content

- current role
- wallet name
- statement that access will end immediately
- statement that future access requires re-invitation

### Actions

- Remove my access
- Cancel

### Validations

- owner must already be active
- at least one owner remains
- actor confirms identity if needed

### Success State

- developer removed
- redirected out of wallet

### Warnings

- unrecoverable without invite
- pending support responsibilities may be orphaned

### Edge Cases

- developer is only active member because owner never accepted
- wrong developer account selected in multi-user agency

### Permission Rules

- self-removal allowed only if ownership is safe
- owner/admin can also remove developer after handoff

### Copywriting

Dialog title:
- "Remove your access?"

Body:
- "You will no longer be able to open or manage this wallet unless the owner invites you back."

### Audit Events

- `membership.self_removed`
- `membership.removed_by_owner`

## 16. Referral Attribution

### Purpose

Tie partner or agency attribution naturally to wallet creation and completion.

### Where It Happens

- silently at wallet creation if developer has partner account
- visibly in partner/referral summary area
- reviewed before payout periods begin

### Fields

- Attributed partner
- Commission rate
- Referral status
- Commission window

### Validations

- partner account active
- wallet not already attributed to conflicting partner
- commission rate valid

### Success State

- referral row created
- wallet linked to partner account

### Warnings

- attribution conflict
- partner not active
- client already belongs to another partner attribution rule

### Edge Cases

- multiple agency collaborators
- wallet transferred between agencies
- owner created wallet later but initial setup came from partner

### Copywriting

Internal developer-facing copy:
- "This wallet is attributed to your partner account."

### Audit Events

- `referral.created`
- `referral.approved`
- `referral.disputed`

## 17. Wallet Completion Logic

### Purpose

Decide when a wallet is merely configured, handoff-ready, owner-accepted, or truly complete.

### Completion States

1. Draft
2. In setup
3. Ready for handoff
4. Owner invited
5. Owner accepted
6. Handoff complete

### Required Logic for Ready for Handoff

All must be true:

- wallet exists with core business details
- at least one website exists
- at least one core provider exists
- primary owner info entered
- ownership invite created or ready to create
- at least one primary edit route exists or explicit no-edit-routing waiver recorded

### Required Logic for Owner Accepted

- invite accepted
- owner active as member
- owner set as primary owner

### Required Logic for Handoff Complete

- owner accepted
- developer selected post-handoff role or removal
- required checklist items complete
- no critical unresolved handoff-blocking alerts

### Warning Logic

Show setup warnings if:

- no billing summary
- no support contact
- no page-specific edit routes
- provider health unknown for critical services

### Edge Cases

- owner accepted before setup fully complete
- developer removed self before final confirmation
- handoff reopened after ownership changes

### Audit Events

- `wallet.setup_state_changed`
- `wallet.handoff_state_changed`
- `wallet.completed`

## 18. Timeline Model

### Purpose

Make progress visible and professional.

### Timeline Events to Surface

- Wallet created
- Website added
- Provider connected
- Edit route added
- Owner details entered
- Owner invited
- Owner accepted
- Handoff completed
- Developer role retained or removed

### Presentation Rules

- newest first in compact feed
- also visible as ordered milestone history in handoff page

### Copywriting Examples

- "Wallet created"
- "Website details added"
- "Content editing path set"
- "Owner invited"
- "Ownership accepted"
- "Handoff completed"

## 19. Screen-by-Screen Flow Summary

### A. Developer Sign Up

- create account
- start onboarding

### B. Create Wallet

- business and owner basics

### C. Add Website

- production, staging, stack, notes

### D. Connect Providers

- stack systems and owner-facing explanations

### E. Add Edit Routes

- define what owner clicks later

### F. Add Owner Details

- capture contact and ownership target

### G. Review Handoff Checklist

- ensure quality and clarity

### H. Send Ownership Invite

- secure and auditable invite flow

### I. Owner Accepts

- membership activation and ownership confirmation

### J. Finalize Post-Handoff Mode

- stay, reduce access, or remove self

### K. Wallet Marked Complete

- handoff complete state visible to both parties

## 20. Premium Workflow Copy System

Use:

- "Set up the wallet"
- "Connect the website tools"
- "Set editing paths"
- "Invite the owner"
- "Review handoff readiness"
- "Ownership confirmed"
- "Handoff complete"

Avoid:

- "Provision resource"
- "Finalize transfer artifact"
- "Revoke collaborator"
- "Mutate ownership state"

## 21. Final Standard

The developer handoff experience is successful when the implementer feels:

- "I know exactly what to do next."
- "The client will understand what they are receiving."
- "Ownership is being transferred cleanly."
- "I can stay involved or step away without ambiguity."

If the flow feels like a checklist stapled onto a dashboard, it is not good enough.

It should feel like a polished operational ceremony for turning a completed website into a clearly owned asset.
