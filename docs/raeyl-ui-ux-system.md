# RAEYL UI/UX System

RAEYL should feel like a premium operational product: calm, exact, fast, and trustworthy. The visual and interaction standard is informed by Stripe, Linear, Vercel, and Notion, but the product expression should remain its own: lighter, more ownership-centric, and less engineering-native on the surface.

## 1. Experience Principles

1. The interface should make ownership feel legible.
2. Primary actions should be obvious without becoming loud.
3. Every screen should have a clear top-level task.
4. Business-friendly language should lead; technical detail should remain available underneath.
5. Dense information should be visually ordered, not visually noisy.
6. The product should feel premium through restraint, not decoration.
7. Mobile layouts should preserve clarity, not simply shrink desktop screens.

## 2. Global Design Language

### Visual Character

- Dark-first interface with crisp contrast and restrained glow.
- Surfaces are paneled, not bulky.
- Borders are subtle and precise.
- Radius stays tight at 8px or below.
- Shadows create hierarchy, not softness overload.
- Color is semantic and purposeful.

### Color Semantics

- Primary: mint-teal for confirmation, ownership, and active pathways.
- Accent: cyan for interactive emphasis and connected-system energy.
- Success: green for healthy/complete.
- Warning: amber for attention needed.
- Critical: coral-red for urgent risk.
- Neutral surfaces remain deep charcoal-green rather than flat gray or blue-slate.

### Typography

- Headings: compact, highly legible, medium-to-semibold weight.
- Supporting copy: direct and plain, never fluffy.
- Data labels: small uppercase or compact muted labels.
- Tables and system labels: mono only when technical metadata benefits from it.

### Interaction Feel

- Motion should be quick, low-distance, and confidence-building.
- Hover states should sharpen, not bounce.
- Loading should use skeletons and shimmer rails instead of spinners where possible.
- Confirmation UI should be explicit on destructive or ownership-changing actions.

## 3. Global Layout System

### Marketing Layout

- Fixed top navigation with transparent-to-solid scroll behavior.
- Wide content bands with constrained inner width.
- Visual rhythm alternates between narrative sections and product proof.

### App Layout

- Left rail navigation on desktop.
- Top utility bar for wallet switcher, search/command entry, notifications, and user menu.
- Main content area uses 12-column desktop grid.
- Right contextual panel is optional for detail, secondary actions, or help.

### Mobile App Layout

- Top bar with current page title and wallet switcher entry.
- Bottom-safe spacing for actions.
- Left rail becomes sheet navigation.
- Dashboard surfaces reorder by action priority rather than desktop order.

## 4. Shared Component System

### Core Components

- App shell
- Marketing header
- Side navigation rail
- Top utility bar
- Section header
- Stat card
- Action strip
- Provider card
- Website card
- Alert card
- Activity row
- Timeline item
- Billing summary card
- Empty state panel
- Inline status badge
- Role badge
- Health badge
- Tabs
- Table/list hybrid
- Slide-over detail panel
- Confirm dialog
- Multi-step wizard shell
- Settings panel
- Form row
- Command palette

### Component Rules

- Cards should never nest inside decorative cards.
- Repeated items may use cards; page sections should be bands or unframed layouts.
- Badge language should be short and stable.
- Every data panel should have a visible state treatment for loading, empty, and error.

---

## 5. Landing Pages

### 5.1 Home

#### Page Purpose

Introduce RAEYL as the website ownership wallet and control rail, then convert visitors into sign-up or demo intent.

#### User Type

- Business owners
- Developers
- Agencies
- Internal stakeholders evaluating the platform

#### Exact Layout

- Sticky top nav
- Full-bleed hero with live product composition in background plane
- Sequential narrative bands
- Pricing preview
- FAQ preview
- final CTA band
- premium footer

#### Exact Sections

1. Hero
2. One place for everything your website needs
3. Problem vs solution comparison
4. How the wallet works
5. Developer handoff workflow
6. Connected systems layer
7. Billing visibility layer
8. Edit routing layer
9. Ownership clarity section
10. Testimonials
11. Pricing preview
12. FAQ preview
13. Final CTA
14. Footer

#### Card Hierarchy

- Hero uses immersive product frame, not a centered marketing card.
- Product proof sections use one primary panel with supporting stats.
- Testimonials use individual quote cards.
- Pricing preview uses three pricing cards.

#### Navigation Placement

- Logo left
- main nav centered or slightly left-weighted
- Sign in and Get started on right

#### Actions

- Get started
- Sign in
- View product
- See pricing
- Learn how it works

#### States

- Default browsing
- Scrolled nav compact state
- CTA hover/focus

#### Visual Cues

- Connection lines, grid texture, and layered product planes evoke control rail and system mapping.
- Product preview should hint at dashboard, provider network, billing visibility, and action routing.

#### Component Interactions

- Nav compresses slightly on scroll.
- Product preview panels shift subtly on pointer move.
- CTA hover brightens border and foreground contrast.

#### Copy Tone

- Premium
- precise
- confident
- simple
- no jargon-forward bragging

#### Empty States

- None product-critical; testimonials may use tasteful placeholder quotes if real ones unavailable.

#### Error States

- Contact/demo forms later should fail inline with concise recovery copy.

#### Loading States

- Page should render nearly fully server-side.
- Any product preview animation assets should fade in progressively.

#### Accessibility Notes

- Strong contrast on hero text over visuals.
- Skip link to main content.
- Motion reduced for users preferring reduced motion.

#### Responsive Behavior

- Hero text stays directly over background, not split layout.
- A hint of next section must remain visible below fold.
- Product collage scales down without truncating heading.

### 5.2 Product

#### Page Purpose

Explain product areas in structured depth.

#### User Type

- Evaluators who want more substance before signup

#### Exact Layout

- Intro band
- category-based product modules
- dashboard and stack control breakdown
- architecture and integration overview
- CTA close

#### Exact Sections

1. Product overview
2. Wallet architecture
3. Connected systems
4. Edit routing
5. Ownership and access
6. Billing visibility
7. Alerts and support
8. Admin and developer workflow

#### Card Hierarchy

- Each module uses a wide feature panel plus 2-3 supporting mini-panels.

#### Navigation Placement

- Standard marketing nav

#### Actions

- Get started
- View pricing
- Contact

#### States

- Default

#### Visual Cues

- Dense but elegant system diagrams
- controlled use of icons per category

#### Component Interactions

- Hover reveals deeper bullet detail or secondary screenshots

#### Copy Tone

- Concrete and product-literate

#### Empty / Error / Loading

- Static marketing handling

#### Accessibility / Responsive

- Sections become stacked narrative blocks on mobile

### 5.3 How It Works

#### Page Purpose

Teach the wallet setup-to-handoff lifecycle.

#### User Type

- Developers
- Owners
- Agencies

#### Exact Layout

- Timeline-based page with three macro phases:
  - Build
  - Connect
  - Handoff

#### Exact Sections

1. Process intro
2. Developer setup
3. Provider connection
4. Owner invitation
5. Ownership confirmation
6. Ongoing control

#### Card Hierarchy

- Horizontal timeline on desktop
- stacked timeline cards on mobile

#### Navigation Placement

- standard marketing nav

#### Actions

- Start setup
- View developer path
- View owner path

#### States / Visual / Copy / Accessibility / Responsive

- same marketing standards as above, with strong ordered step cues

### 5.4 For Owners

#### Page Purpose

Frame RAEYL from the owner's point of view.

#### User Type

- business owner
- operator
- office manager

#### Exact Layout

- Hero
- pain relief section
- clarity/control section
- dashboard walkthrough
- billing/access/support section
- CTA

#### Exact Sections

1. You should know what powers your website
2. One calm control center
3. Edit the right thing in the right place
4. Understand costs and ownership
5. Get help without guessing

#### Visual Cues

- Owner-facing screenshots with callout highlights

#### Copy Tone

- reassuring, non-technical, empowering

### 5.5 For Developers / Agencies

#### Page Purpose

Position RAEYL as a handoff and retention product.

#### User Type

- freelancers
- studios
- agencies
- internal dev teams

#### Exact Layout

- Hero
- setup workflow
- template/repeatability section
- handoff professionalism section
- referral model preview
- CTA

#### Copy Tone

- crisp, operational, credibility-forward

### 5.6 Pricing

#### Page Purpose

Explain RAEYL plan tiers and included capabilities.

#### User Type

- owner
- developer
- partner

#### Exact Layout

- Intro
- plan cards
- comparison table
- FAQ strip
- CTA

#### Card Hierarchy

- Three plan cards
- compact highlight badge on recommended tier

#### Actions

- Start free trial
- Contact sales

#### Empty/Error/Loading

- Static unless driven by pricing config API later

### 5.7 Security

#### Page Purpose

Establish trust around ownership, permissions, sessions, and secret handling.

#### User Type

- security-conscious buyers
- agencies
- technical evaluators

#### Exact Layout

- trust intro
- security pillars
- data and credential handling
- access control
- audit and visibility

#### Copy Tone

- sober, exact, not marketing-fuzzy

### 5.8 FAQ

#### Exact Layout

- grouped accordion sections:
  - product
  - setup
  - billing
  - security
  - handoff

### 5.9 Contact

#### Exact Layout

- left: compact intro and contact promise
- right: contact form panel

#### Actions

- Submit contact request

### 5.10 Sign In and Get Started Entry Pages

These route into auth-specific screens described below.

---

## 6. Sign In / Sign Up

### 6.1 Sign In

#### Page Purpose

Authenticate returning users quickly and securely.

#### User Type

- all authenticated users

#### Exact Layout

- Minimal centered auth shell
- Brand mark top
- page title and supporting line
- primary auth card
- alternate auth footer links

#### Exact Sections

1. Header
2. Email/password form
3. Magic link trigger
4. Google sign-in
5. Invite-aware callout if applicable
6. Footer links

#### Card Hierarchy

- One primary auth card
- One optional low-emphasis contextual note panel beneath

#### Navigation Placement

- Minimal top-left logo only

#### Actions

- Sign in
- Continue with Google
- Email me a magic link
- Forgot password
- Create account

#### States

- default
- submitting
- magic-link sent
- invite context active
- auth error
- locked/rate-limited

#### Visual Cues

- Focus ring strong and premium
- Error state uses inline field feedback plus top-level form alert

#### Component Interactions

- Tabs or segmented control can switch between password and magic-link modes
- Submit button enters loading and disables duplicate submissions

#### Copy Tone

- direct
- calm
- never robotic

#### Empty States

- Not applicable

#### Error States

- invalid credentials
- expired session callback
- provider conflict
- invite mismatch

#### Loading States

- button spinner plus preserved layout

#### Accessibility Notes

- Full label association
- Error summary announced to screen readers
- Social auth buttons must have descriptive text, not icon-only

#### Responsive Behavior

- Full-width card on mobile with generous edge padding

### 6.2 Sign Up / Get Started

#### Page Purpose

Create a new account and branch into owner or developer onboarding.

#### Exact Layout

- Auth shell
- two-path chooser above or within form
- account creation card

#### Sections

1. Account type choice
2. Name/email/password form
3. Google option
4. Terms acknowledgment
5. Existing account link

#### Actions

- Create account
- Continue with Google
- Sign in instead

#### States

- default
- developer path selected
- owner path selected
- invite-aware path
- submitting
- success redirect

#### Accessibility / Responsive

- same auth pattern as sign-in

---

## 7. Onboarding

### 7.1 Developer Onboarding

#### Page Purpose

Guide a developer from account creation into first wallet creation.

#### User Type

- developer
- agency
- technical collaborator

#### Exact Layout

- Multi-step wizard in app shell but with focused onboarding framing
- left: progress rail
- right: active step content

#### Exact Sections

1. Account ready
2. Business and website basics
3. Add first website
4. Add provider systems
5. Define edit routes
6. Invite owner
7. Review handoff checklist

#### Card Hierarchy

- Primary wizard panel
- Secondary contextual help panel on desktop

#### Navigation Placement

- Limited app nav during onboarding to avoid drift

#### Actions

- Continue
- Save draft
- Go back
- Skip for later where allowed

#### States

- incomplete
- saved draft
- validation blocked
- completed step

#### Visual Cues

- Progress rail with clear completion markers
- Required steps flagged

#### Component Interactions

- Step-to-step transitions should feel immediate
- Validation errors stay inline, not modal

#### Copy Tone

- concise and instructive

#### Empty States

- first wallet creation encouragement

#### Error States

- failed save
- invite send failure
- duplicate wallet slug

#### Loading States

- step save skeleton or button loading only

#### Accessibility Notes

- Step progress must be screen-reader legible

#### Responsive Behavior

- Progress rail collapses into top stepper on mobile

### 7.2 Owner Onboarding

#### Page Purpose

Help invited owners accept access, understand the wallet, and take first actions.

#### Exact Layout

- Focused onboarding flow
- summary-first rather than form-first

#### Exact Sections

1. Welcome to your website wallet
2. Business and website summary
3. Connected systems preview
4. Ownership confirmation
5. Billing activation if required
6. First quick actions

#### Actions

- Accept ownership
- Review billing
- Open dashboard

#### States

- invite pending
- accepted
- billing required
- onboarding complete

---

## 8. Create Wallet

### Page Purpose

Create the core wallet record with enough business context to support setup and handoff.

### User Type

- developer
- admin

### Exact Layout

- Step wizard or single long form with logical segmentation
- better default: 4-step wizard

### Exact Sections

1. Wallet identity
2. Business owner details
3. Website details
4. Plan and support defaults

### Card Hierarchy

- One primary form pane
- one secondary info pane with examples and field guidance

### Navigation Placement

- App shell with subdued side nav

### Actions

- Create wallet
- Save draft
- Cancel

### States

- clean create
- draft save
- validation errors
- success redirect to wallet dashboard or setup flow

### Visual Cues

- Section dividers clear but minimal
- Required inputs marked subtly

### Empty States

- Entire page is inherently an empty-start flow

### Error States

- duplicate slug
- malformed URL
- owner email invalid

### Loading States

- button loading
- optimistic redirect after success

### Accessibility / Responsive

- mobile turns into vertically stacked sections with sticky footer action bar

---

## 9. Wallet Home Dashboard

### Page Purpose

Provide the owner's central control center for the website ecosystem.

### User Type

- wallet owner primary
- billing manager
- developer
- editor/viewer with reduced surface

### Exact Layout

- App shell
- Top summary rail across full width
- 12-column content grid below

Desktop recommendation:

- Row 1: 4 summary stat panels
- Row 2 left: website status and quick actions
- Row 2 right: alerts panel
- Row 3 left: connected systems
- Row 3 right: monthly cost summary
- Row 4 left: edit website and access summary
- Row 4 right: support panel
- Row 5 full width: recent activity

### Exact Sections

1. Wallet header
2. Summary stat rail
3. Website status
4. Quick actions
5. Alerts and issues
6. Connected systems
7. Monthly cost summary
8. Edit website
9. Manage access
10. Support
11. Recent activity

### Card Hierarchy

- Level 1: summary stat cards
- Level 2: functional action panels
- Level 3: supporting feeds/lists

### Navigation Placement

- Left rail:
  - Dashboard
  - Websites
  - Providers
  - Billing
  - Access
  - Handoff
  - Alerts
  - Activity
  - Support
  - Settings
- Top bar:
  - wallet switcher
  - search or command
  - notifications
  - user menu

### Actions

- Edit website
- Open CMS
- Open hosting
- Open domain
- View billing
- Manage access
- Contact support
- Review alerts

### States

- healthy
- attention needed
- issue present
- setup incomplete
- handoff pending
- role-restricted dashboard

### Visual Cues

- Health colors should be prominent but controlled.
- Urgent alerts appear as elevated cards, not full-screen interruption.
- Quick actions should look executable immediately.

### Component Interactions

- Provider cards open detail pane or route page.
- Alert actions can dismiss or open recommended path.
- Quick actions hover with directional cue.

### Copy Tone

- deeply clear
- owner-safe
- action-led

### Empty States

- No providers connected yet
- No active alerts
- No recent activity
- No edit routes configured

### Error States

- Partial dashboard load
- Missing linked provider
- Permissions changed mid-session

### Loading States

- skeleton stat cards
- skeleton provider cards
- feed shimmer rows

### Accessibility Notes

- Cards must remain keyboard-reachable in reading order
- summary stats should have descriptive labels
- alert severity should not rely on color alone

### Responsive Behavior

- Summary stats become stacked 2x2 or 1x4
- Quick actions move above dense provider list
- Activity feed goes to bottom in single column

---

## 10. Website Detail Page

### Page Purpose

Present one managed website's status, environments, notes, providers, and edit routes.

### User Type

- owner
- developer
- editor

### Exact Layout

- Header with website title, domain, status badge, environment actions
- Two-column detail body

Left column:
- Overview card
- Environments card
- Edit routes

Right column:
- Linked providers
- Notes
- launch metadata

### Exact Sections

1. Header
2. Environment links
3. Site metadata
4. Edit routes
5. Linked providers
6. Owner notes
7. Developer notes

### Card Hierarchy

- Primary: website overview and edit routes
- Secondary: notes and metadata

### Actions

- Open production
- Open staging
- Edit routes
- View linked provider
- Edit website record

### States

- live
- staging only
- maintenance
- archived

### Visual Cues

- Domain and environment links should feel operational
- Primary edit route visually emphasized

### Empty States

- No staging URL
- No edit routes
- No linked providers

### Error / Loading / Accessibility / Responsive

- Follow app conventions with two-column collapsing to single column on mobile

---

## 11. Provider Connection Page

### Page Purpose

Help developers or privileged users add a provider cleanly.

### User Type

- developer
- owner
- admin

### Exact Layout

- Step-based creation panel
- right-side contextual provider guidance on desktop

### Exact Sections

1. Choose category
2. Choose provider template or custom provider
3. Choose connection method
4. Enter metadata and links
5. Add credentials if needed
6. Owner-facing description
7. Review and connect

### Card Hierarchy

- Primary wizard panel
- Secondary help panel

### Actions

- Connect
- Save as manual record
- Test connection
- Cancel

### States

- template selected
- custom provider selected
- oauth route
- api-token route
- manual route
- secure-link route

### Visual Cues

- Category chips with strong iconography
- Connection method differences should be unmistakable

### Empty States

- No template selected yet

### Error States

- OAuth failure
- invalid token
- missing URL

### Loading States

- connection test
- provider create
- OAuth handshake wait

### Accessibility / Responsive

- wizard becomes top progress stepper on mobile

---

## 12. Provider Detail Page

### Page Purpose

Show one provider's operational meaning, status, links, costs, health, permissions, and technical metadata.

### User Type

- owner
- developer
- billing manager
- support

### Exact Layout

- Header with provider name, category, health, status, and action buttons
- Two-column body

Left:
- Overview
- Action shortcuts
- Issues
- Cost summary

Right:
- Technical metadata
- Connection details
- Permissions visibility
- notes

### Exact Sections

1. Header
2. What this system does
3. Action shortcuts
4. Connection status
5. Health and sync
6. Billing and renewal
7. Linked website
8. Metadata
9. Credential state summary
10. Notes

### Card Hierarchy

- Owner-facing overview is always highest
- Technical metadata lower in hierarchy

### Actions

- Open dashboard
- Open billing
- Open edit tool
- Open support link
- Reconnect
- Rotate credential
- Archive provider

### States

- connected healthy
- connected attention
- reconnect required
- disconnected
- manual record only

### Visual Cues

- Health badge and sync indicator distinct
- Action strip should read as immediate gateway

### Empty States

- No billing URL
- No edit URL
- No cost known
- No notes

### Error States

- failed reconnect
- missing credential scope
- provider inaccessible

### Loading States

- health refresh
- reconnect
- secret rotation status

### Accessibility Notes

- External links must announce opening destination clearly

### Responsive Behavior

- Action strip becomes vertical buttons
- Metadata shifts below overview

---

## 13. Billing Page

### Page Purpose

Give owners and billing managers a clear picture of RAEYL subscription and website stack costs.

### User Type

- wallet owner
- billing manager
- admin

### Exact Layout

- Header with billing status and portal actions
- Summary band
- Two-column body

Left:
- cost breakdown
- renewal timeline

Right:
- RAEYL subscription card
- payment method summary
- invoice history

### Exact Sections

1. Billing summary
2. Monthly total estimate
3. RAEYL subscription
4. Provider costs
5. Upcoming renewals
6. Invoices
7. Billing notes

### Card Hierarchy

- Topline spend summary first
- Then actionable subscription card
- Then detailed breakdown

### Actions

- Upgrade plan
- Manage subscription
- Open billing portal
- Open provider billing
- Add cost record

### States

- trialing
- active
- past due
- canceled
- no provider costs

### Visual Cues

- Renewal urgency surfaced with date proximity
- RAEYL billing and provider billing visually differentiated

### Empty States

- No provider costs yet
- No invoices yet
- Trial not started

### Error States

- failed portal session
- billing sync failed
- missing cost links

### Loading States

- invoice skeleton rows
- summary shimmer

### Accessibility / Responsive

- Cost table becomes stacked item list on mobile

---

## 14. Access Management

### Page Purpose

Manage who can access the wallet and what role they hold.

### User Type

- wallet owner
- developer with access-management rights
- admin

### Exact Layout

- Header with member count and invite CTA
- main members list
- pending invites section
- role explanation side panel on desktop

### Exact Sections

1. Active members
2. Pending invites
3. Role permissions summary
4. Ownership transfer controls

### Card Hierarchy

- Members list is primary
- pending invites secondary
- role explanation tertiary

### Actions

- Invite user
- Resend invite
- Revoke invite
- Change role
- Transfer ownership
- Remove member

### States

- stable access
- pending invites
- transfer in progress
- restricted role changes

### Visual Cues

- Role badges distinct but restrained
- Primary owner visually marked

### Empty States

- No members beyond you
- No pending invites

### Error States

- cannot remove last owner
- role change forbidden
- invite send failed

### Loading States

- row-level action loading
- invite modal submission loading

### Accessibility / Responsive

- tables collapse into stacked member cards on mobile

---

## 15. Handoff Page

### Page Purpose

Coordinate and visualize the developer-to-owner handoff process.

### User Type

- developer
- owner
- admin

### Exact Layout

- Header with handoff status and completion meter
- Two-column body

Left:
- checklist
- transfer controls

Right:
- timeline
- owner invite state
- post-handoff configuration

### Exact Sections

1. Handoff status
2. Completion checklist
3. Owner invite and acceptance
4. Primary owner confirmation
5. Developer retention/removal
6. Timeline

### Card Hierarchy

- Checklist is dominant
- timeline is supportive

### Actions

- Start handoff
- Invite owner
- Resend invite
- Mark item complete
- Complete handoff
- Reopen handoff

### States

- not started
- in progress
- owner invited
- owner accepted
- completed
- reopened

### Visual Cues

- Completion meter
- step chips for done/pending/blocked

### Empty States

- No handoff started
- No owner invite sent

### Error States

- missing owner
- completion blocked
- invite expired

### Loading / Accessibility / Responsive

- checklist items remain large and touch-friendly on mobile

---

## 16. Alerts Page

### Page Purpose

Show all active and historical alerts with recommended actions.

### User Type

- owner
- developer
- support
- admin

### Exact Layout

- Header with filters and unresolved counts
- alerts feed below

### Exact Sections

1. Severity summary
2. Filter row
3. Alert list
4. Resolved or dismissed history

### Card Hierarchy

- Critical alerts pinned first
- alert cards ordered by urgency and freshness

### Actions

- Dismiss
- Resolve
- Snooze
- Open related provider
- Open recommended action

### States

- no alerts
- active alerts
- critical-only view
- archived history view

### Visual Cues

- severity stripe or badge
- related provider and due timing shown quickly

### Empty States

- No active alerts. Everything looks good.

### Error States

- failed alert action
- missing related record

### Loading States

- skeleton alert cards

### Accessibility / Responsive

- severity should be text-labeled, not color-only

---

## 17. Activity Page

### Page Purpose

Provide a clear operational history of important wallet events.

### User Type

- owner
- developer
- admin

### Exact Layout

- Header with filters
- timeline feed

### Exact Sections

1. Filter controls
2. Timeline feed

### Card Hierarchy

- Activity rows should feel light, not card-heavy

### Actions

- Filter by type
- Filter by actor
- Open related entity

### States

- full feed
- filtered feed
- empty feed

### Visual Cues

- actor, action, object, and time should be easy to parse at a glance

### Empty States

- No recent activity yet

### Error States

- feed unavailable

### Loading States

- shimmer timeline rows

### Responsive Behavior

- timeline becomes single-column stacked rows

---

## 18. Support Page

### Page Purpose

Give users a structured place to request help and track support progress.

### User Type

- owner
- developer
- support collaborator
- billing manager for billing issues

### Exact Layout

- Header with New request button
- Two-column body

Left:
- request list

Right:
- new request form or selected case detail

### Exact Sections

1. Open cases
2. Resolved cases
3. New request form
4. Case timeline
5. Related provider context

### Card Hierarchy

- Cases use list cards
- selected case detail uses one larger pane

### Actions

- Submit request
- Add message
- Change priority if allowed
- Resolve case

### States

- no support history
- open case selected
- resolved case selected
- submission success

### Empty States

- No support cases yet

### Error States

- failed submission
- case load failed

### Loading States

- loading case list
- submitting form

### Accessibility / Responsive

- mobile defaults to list first, detail second via drill-in

---

## 19. Settings Pages

### 19.1 User Settings

#### Page Purpose

Manage personal profile, auth methods, notifications, and preferences.

#### Exact Layout

- Settings shell with subnav tabs or sidebar:
  - Account
  - Security
  - Notifications
  - Preferences

#### Sections

- Profile info
- Password/auth methods
- Theme and display
- Notification preferences

#### Actions

- Save changes
- Change password
- Link auth method

#### States

- default
- dirty form
- saved
- auth reverify needed

### 19.2 Wallet Settings

#### Page Purpose

Configure wallet-level behavior and business details.

#### Sections

1. Business info
2. Website defaults
3. Support settings
4. Billing settings
5. Provider display options

#### Layout

- Sectioned panels in one column with sticky local subnav on desktop

#### Empty / Error / Loading / Responsive

- standard settings behavior with sticky save bar on mobile

---

## 20. Admin Console

### Page Purpose

Give internal RAEYL operators a powerful but controlled platform management surface.

### User Type

- platform admin only

### Exact Layout

- Dedicated admin shell
- left rail for admin domains
- dense content area
- filters and search in top utility row

### Exact Sections / Screens

#### Admin Home

- platform metrics
- support backlog
- billing health
- onboarding issues
- recent critical alerts

#### Users

- user table
- filters
- status chips
- user detail drawer

#### Wallets

- wallet table
- lifecycle filters
- ownership visibility
- handoff state

#### Subscriptions

- billing status table
- failed payment list
- plan distribution summary

#### Referrals

- partner table
- attribution queue
- payout queue

#### Providers

- provider template library
- provider health overview

#### Support

- triage board/list

#### Alerts

- global unresolved alerts

#### Audit

- immutable audit feed with filters

#### Pricing / Feature Flags / Email Templates / Onboarding

- configuration and operations panels

### Card Hierarchy

- Admin prefers tables first, cards second, drawers for inspection

### Actions

- Filter
- inspect
- mutate config
- resolve support
- approve payouts

### States

- healthy
- backlog elevated
- billing incident

### Visual Cues

- More data-dense than wallet UI
- stronger use of tables and status chips

### Accessibility Notes

- Keyboard-accessible tables and row actions

### Responsive Behavior

- Desktop-first; mobile allows read-only triage and summary access

---

## 21. Referral Dashboard

### Page Purpose

Give partners visibility into referred wallets, earnings, and payout state.

### User Type

- partner/developer

### Exact Layout

- Header with total earnings and active referrals
- summary cards
- referred wallet list
- payout history panel

### Exact Sections

1. Earnings summary
2. Active referrals
3. Wallet attribution list
4. Monthly payout history
5. Referral terms

### Card Hierarchy

- Summary stats first
- referral list second
- payout history third

### Actions

- View referred wallet summary
- Download payout history later
- Contact support

### States

- no referrals
- active referrals
- pending approval
- payout pending

### Visual Cues

- Financial figures crisp and high-trust
- status indicators for pending vs active vs paid

### Empty States

- No referrals yet. Bring your first client wallet into RAEYL to start tracking recurring rewards.

### Error States

- payout data unavailable
- attribution conflict pending review

### Loading States

- summary skeletons
- payout list shimmer

### Accessibility / Responsive

- cards stack cleanly, figures remain readable without truncation

---

## 22. Global Copy System

### Tone Rules

- premium without sounding expensive for its own sake
- clear without sounding tutorial-heavy
- technically credible without technical peacocking
- warm enough to reduce owner anxiety

### Preferred Language Patterns

- "Open content editor"
- "Review billing"
- "Ownership confirmed"
- "Attention needed"
- "Connected systems"
- "Primary editing path"

### Avoid

- "manage your digital ecosystem seamlessly"
- "all-in-one website solution"
- "AI-powered synergy"
- "revolutionary"
- vague marketing filler

## 23. Global State Patterns

### Empty States

- Always explain what the surface is for.
- Always offer a next action when user has permission.
- Never feel dead or generic.

### Error States

- One-line explanation
- one recovery path
- technical detail only when useful

### Loading States

- Prefer skeletons that preserve layout.
- Avoid spinner-only full-screen waits for normal page loads.

## 24. Accessibility Standard

- WCAG-minded contrast across all semantic states.
- Focus rings visible and consistent.
- Headings follow logical structure.
- Tables have accessible labels and row actions.
- Statuses never rely on color alone.
- Reduced motion respected globally.
- Form errors associated to fields and summarized where necessary.

## 25. Responsive Strategy

- Desktop is the primary operating surface.
- Mobile is not secondary quality; it is simplified priority.
- Reorder by task importance, not by source order alone.
- Collapse dense tables into stacked records.
- Preserve primary CTA visibility near thumb reach.

## 26. Product Quality Bar

Every RAEYL screen should answer three questions immediately:

1. Where am I?
2. What matters here?
3. What should I do next?

If a screen fails one of those, it is not finished.
