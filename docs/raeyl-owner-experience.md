# RAEYL Owner Experience

This document defines the business owner experience for RAEYL. It intentionally narrows the product away from technical setup language and toward confidence, clarity, and calm operational control.

RAEYL for owners should feel like:

- the clearest place to understand their website
- the safest place to act
- the fastest way to know what matters
- a premium control center that never assumes technical knowledge

## 1. Core Owner Experience Principles

1. Owners should understand the state of their website in under 20 seconds.
2. Owners should never have to decode tool names to know what those tools are for.
3. The interface should explain what matters before it explains how it works.
4. The product should guide action, not dump dashboards.
5. Health, cost, access, and editing should feel legible at a glance.
6. Every owner-facing screen should reduce uncertainty.
7. Technical detail should be available only after the owner has already been oriented.

## 2. The Emotional Job of the Product

For a business owner, the real product is not "provider visibility."

The real product is:

- I know what powers my website.
- I know whether things are okay.
- I know where to go when I need to change something.
- I know who has access.
- I know what I am paying for.
- I know this website is actually under control.

Every owner-facing screen should reinforce one or more of those outcomes.

## 3. First Login Experience

### Purpose

Turn what could feel like a technical handoff into an immediate feeling of clarity and ownership.

### What the Owner Should Feel

- welcomed
- oriented
- reassured
- not overwhelmed

### First Login Sequence

1. Owner signs in or accepts invite.
2. RAEYL confirms that this is their website wallet.
3. RAEYL shows a calm summary of the website, not a busy dashboard wall.
4. RAEYL highlights three things first:
   - your website is here
   - these are the systems behind it
   - here is what you can do next
5. Only then does the interface reveal deeper sections.

### First Login Screen Structure

Hero panel:

- headline:
  - "Welcome to your website control center"
- supporting line:
  - "This is the simplest place to see how your website is set up, what it costs, and where to go when you need to make a change."

Primary confirmation panel:

- Website name
- live site URL
- ownership status
- primary support contact

Three confidence cards:

1. "Your website systems"
   - "Everything connected to your website is listed here in one place."
2. "Your editing path"
   - "When you need to update content, RAEYL sends you to the right place."
3. "Your ownership view"
   - "You can see who has access, what services are active, and what needs attention."

Primary actions:

- Open dashboard
- See how editing works
- Review access

### First Login Copy Tone

- warm
- crisp
- not congratulatory in a fluffy way
- clear without sounding instructional

### First Login Microcopy

Instead of:
- "Integrations connected"

Use:
- "Your website tools are connected"

Instead of:
- "Provider sync completed"

Use:
- "Your website information is up to date"

Instead of:
- "Role assignment successful"

Use:
- "Your access has been confirmed"

## 4. First-Time Wallet Walkthrough

### Purpose

Give owners a fast mental model of the wallet without making them read documentation.

### Walkthrough Philosophy

- 4 to 5 steps maximum
- dismissible
- visually anchored to real UI
- action-oriented, not feature-oriented

### Walkthrough Steps

#### Step 1: Your website at a glance

Copy:
"This is your main view. It shows whether your website is healthy, what systems are connected, and what needs attention."

#### Step 2: Where to make changes

Copy:
"When you want to update content, use the edit actions here. RAEYL sends you to the correct tool so you do not have to guess."

#### Step 3: What each service does

Copy:
"Each connected service includes a simple explanation, so you can understand what it is for without technical language."

#### Step 4: Costs and renewals

Copy:
"You can see what services cost money, when renewals are coming up, and where each bill is managed."

#### Step 5: Access and support

Copy:
"You can check who has access, invite teammates, and know where to go if you need help."

### Walkthrough Completion Copy

"You are ready. If you ever forget where to go, RAEYL will guide you."

## 5. What the Owner Sees Immediately

The first dashboard view should answer five questions in this order:

1. Is my website okay?
2. What powers it?
3. What do I pay for?
4. Where do I go to make changes?
5. Who has access?

### Immediate Dashboard Priorities

Top rail:

- Website status
- Connected tools count
- Monthly cost summary
- Attention needed count

First visible action area:

- Edit website
- Review alerts
- Manage access
- View billing

First visible explanation area:

- "How your website is set up"
  - short list of connected systems with plain-language descriptions

## 6. Explaining Connected Systems Without Jargon

### Rule

Never lead with the provider brand alone.

Always use:

- business function first
- provider name second

### Pattern

Instead of:
- "Supabase"

Use:
- "Website data and forms"
  - "Powered by Supabase"

Instead of:
- "Vercel"

Use:
- "Website hosting"
  - "Powered by Vercel"

Instead of:
- "Cloudflare"

Use:
- "Domain and website routing"
  - "Managed in Cloudflare"

Instead of:
- "Builder.io"

Use:
- "Website content editing"
  - "Managed in Builder.io"

### Owner-Facing Description Format

Each connected system should show:

1. Plain-language label
2. One-line explanation
3. Provider name in secondary position
4. Health state
5. Relevant action

### Examples

Hosting:
- "Website hosting"
- "This is where your live website is published."
- "Powered by Vercel"

CMS:
- "Website content editing"
- "This is where page content and updates are managed."
- "Powered by Builder.io"

Domain:
- "Domain and routing"
- "This controls your website address and where it points."
- "Managed in Cloudflare"

Payments:
- "Website payments"
- "This handles website payments, invoices, or deposits."
- "Powered by Stripe"

Analytics:
- "Website reporting"
- "This shows website traffic and visitor activity."
- "Powered by Google Analytics"

## 7. How We Show Costs

### Owner Goal

Owners want to know:

- what costs money
- why it costs money
- what is included
- when it renews
- where to manage it

### Cost Presentation Rules

1. Start with total monthly estimate.
2. Break costs into named service rows.
3. Explain what each cost is for in plain language.
4. Mark whether the bill is handled in RAEYL or elsewhere.
5. Surface upcoming renewals clearly.

### Billing Summary Copy

Headline:
- "Your website costs"

Supporting line:
- "See what tools are active, what they are for, and where each bill is managed."

Service row pattern:

- "Website hosting"
- "$84/month"
- "Keeps your website live online"
- "Managed in Vercel"

### Labels to Use

- "Managed in RAEYL"
- "Managed with provider"
- "Renews on Apr 20"
- "Annual renewal"
- "Monthly service"

### Labels to Avoid

- "Recurring charge object"
- "Billing source"
- "External subscription artifact"

## 8. How We Show Health

### Owner Goal

Owners do not need infrastructure telemetry. They need confidence.

### Health Language Model

Use five owner-friendly states:

- Healthy
  - "Everything looks in good shape."
- Attention needed
  - "Something needs a quick review."
- Issue detected
  - "Something may affect your website or access."
- Disconnected
  - "RAEYL can no longer confirm this connection."
- Not enough information
  - "This system is listed, but live status is not available."

### Health Presentation Rules

1. Use a simple health label first.
2. Add one sentence explaining what it means.
3. Give one clear next action when needed.

### Example

- "Attention needed"
- "Your domain renewal is coming up soon."
- CTA: "Review domain billing"

### Avoid

- "Sync stale"
- "Auth revoked"
- "Scope mismatch"

If those conditions matter, translate them:

- "RAEYL can no longer confirm access to this tool."

## 9. How We Show Ownership Confidence

### Owner Goal

Owners need proof that the website is actually theirs to oversee.

### Ownership Confidence Section

Title:
- "Ownership and access"

Contents:

- Primary owner confirmed
- Website support contact
- Active team members
- Developer access status
- Handoff completed or pending

### Confidence Statements

- "You are the primary owner of this website wallet."
- "Your website tools have been documented in one place."
- "You can review who has access at any time."
- "Your developer can remain connected only with the access you allow."

### What Builds Trust

- clear owner designation
- visible access list
- visible handoff state
- documented connected systems
- costs and renewals visible

## 10. How We Guide Editing Actions

### Owner Goal

Owners should never wonder:
- "Where do I edit this?"

### Editing Guidance Model

Every edit action should be:

- action-led
- plain-language
- specific
- safe

### Primary Editing CTA

Use:
- "Edit website"

Supporting line:
- "RAEYL will open the right place for website updates."

### Secondary Editing Actions

Use labels like:

- "Edit homepage"
- "Edit services"
- "Edit team"
- "Edit blog"
- "Edit site settings"

### Action Confidence Copy

When exact route exists:
- "Opens your homepage editor"

When broad route exists:
- "Opens your content workspace"

When only fallback exists:
- "Opens the main tool used for website updates"

When no route exists:
- "No editing path has been set up yet"
- CTA: "Contact support"

### Editing Guidance Rules

1. Never expose raw CMS jargon as the main label.
2. Never make owners choose from unexplained tools first.
3. Always explain where the action will open.

## 11. How We Handle Alerts for Owners

### Owner Goal

Owners should understand:

- what is wrong
- whether it is urgent
- what to do next

### Alert Card Structure

1. Severity label
2. Plain-language title
3. One-sentence explanation
4. One recommended action
5. Optional related service label

### Alert Language Examples

Instead of:
- "Provider connection expired"

Use:
- "RAEYL can no longer confirm one of your website tools"

Instead of:
- "Billing sync failed"

Use:
- "Billing details for one service could not be refreshed"

Instead of:
- "Edit route missing"

Use:
- "A website editing shortcut has not been set up yet"

### Severity Labels

- "For review"
- "Needs attention"
- "Important"

Avoid overly technical or alarming labels unless truly necessary.

## 12. How We Help Owners Manage Access

### Owner Goal

Owners want to know:

- who can access the website wallet
- who can make changes
- whether the former developer still has access

### Access Screen Priorities

1. Who has access now
2. What each person can do
3. Invite someone new
4. Remove or adjust access safely

### Owner-Friendly Role Labels

Instead of:
- Developer

Use:
- "Website setup partner"

Instead of:
- Billing manager

Use:
- "Billing access"

Instead of:
- Viewer

Use:
- "View only"

Instead of:
- Editor

Use:
- "Content editor"

### Role Explanations

- Primary owner
  - "Full control of the website wallet"
- Website setup partner
  - "Can help manage connected tools and setup"
- Content editor
  - "Can open editing tools and update content"
- Billing access
  - "Can review website costs and billing"
- View only
  - "Can see the wallet but cannot make changes"

### Safe Action Copy

- "Remove access"
- "Change access"
- "Transfer primary ownership"

Not:
- "Revoke member"
- "Mutate role"

## 13. How We Help Owners Understand What Each Service Does

### Rule

Every service card must answer:

- What is this?
- Why does it matter?
- What can I do here?

### Service Card Pattern

Top:
- Plain-language title
- health badge

Middle:
- one-line explanation
- provider name in secondary text

Bottom:
- one primary action
- optional secondary action

### Example Cards

#### Website hosting

- "Website hosting"
- "This keeps your live website online."
- "Powered by Vercel"
- Action: "Open hosting"

#### Website content editing

- "Website content editing"
- "This is where text, pages, and content updates are made."
- "Powered by Builder.io"
- Action: "Edit website"

#### Domain and routing

- "Domain and routing"
- "This controls your website address and where it points."
- "Managed in Cloudflare"
- Action: "Open domain"

## 14. Revised Owner-Facing Surfaces

This section revises the owner-facing screens and microcopy direction.

## 14.1 Owner Dashboard

### Old Product Framing

- too tool-centric
- too provider-first

### New Owner Framing

Header:
- "Your website control center"

Subheading:
- "See what powers your website, what needs attention, and where to go when you need to make a change."

Top summary cards:

1. "Website status"
   - "Healthy"
   - support: "Everything looks in good shape."

2. "Connected tools"
   - "6 tools"
   - support: "Everything listed in one place."

3. "Monthly website cost"
   - "$518/month"
   - support: "Across active website services."

4. "Needs attention"
   - "2 items"
   - support: "Nothing urgent is hidden."

Quick action section title:
- "What would you like to do?"

Actions:
- Edit website
- Review alerts
- Manage access
- View billing

Connected systems section title:
- "How your website is set up"

Section support:
- "Each service below includes a simple explanation and the right place to go when action is needed."

## 14.2 Owner Provider Detail

### Header Copy

Title:
- "Website content editing"

Subtitle:
- "Managed in Builder.io"

Description:
- "This is where page content and updates are managed."

Status module:

- "Connection status"
- "Connected"

- "Health"
- "Healthy"

- "Last checked"
- "Today"

Action buttons:
- Open editor
- Review billing
- Contact support

## 14.3 Owner Billing Screen

### Page Header

- "Your website costs"

Support line:
- "See what services are active, what they are for, and where each bill is managed."

Row labels:

- "Website hosting"
- "Website content editing"
- "Domain and routing"
- "Website payments"

Secondary row copy:

- "Keeps your website live online"
- "Where page updates are managed"
- "Controls your website address"
- "Handles payments from your website"

## 14.4 Owner Access Screen

### Page Header

- "Who can access this website"

Support line:
- "Review access, invite teammates, and keep ownership clear."

Member row labels:

- "Primary owner"
- "Website setup partner"
- "Content editor"
- "Billing access"
- "View only"

Primary owner highlight copy:

- "You are the primary owner of this wallet."

## 14.5 Owner Alerts Screen

### Page Header

- "Attention and updates"

Support line:
- "Anything that needs a review appears here with the right next step."

Alert CTA labels:

- "Review billing"
- "Open connected tool"
- "See what this means"
- "Mark as reviewed"

## 14.6 Owner Edit Surface

### Page Header

- "Website editing"

Support line:
- "Choose what you want to update and RAEYL will open the right place."

Card labels:

- Edit homepage
- Edit services
- Edit team
- Edit blog
- Edit website content

Fallback copy:

- "A direct editing shortcut has not been set up yet."
- "Open the main content tool"

## 15. Owner Microcopy Rewrite Rules

### Replace Technical Language

Replace:
- provider
With:
- tool
- connected service
- website service

Replace:
- integration
With:
- connection
- connected tool

Replace:
- dashboard URL
With:
- tool dashboard

Replace:
- billing portal
With:
- billing page

Replace:
- sync
With:
- updated information
- connection check

Replace:
- credentials
With:
- connection access

Only reveal the technical term if needed in a lower-emphasis detail block.

## 16. Owner Empty States

### No Alerts

- "Everything looks good right now."
- "If something needs your attention, it will appear here with the next step."

### No Edit Routes

- "Your editing shortcuts are not ready yet."
- "Your website setup partner can finish this for you."

### No Extra Team Members

- "Only you can access this wallet right now."
- "Invite a teammate when you are ready."

### No Cost Records

- "No website costs have been added yet."
- "You can still review connected tools and billing links."

## 17. Owner Error States

### Generic Principle

Explain the problem in plain language, then give one next action.

### Examples

- "This page could not be loaded right now."
- "Try again in a moment."

- "RAEYL could not open this connected tool."
- "Open the main dashboard instead."

- "This connection needs to be reviewed before RAEYL can guide you there."
- "Contact your website setup partner."

## 18. Owner Loading States

### Principle

Loading should feel calm and stable.

Use:

- skeleton summary cards
- skeleton service rows
- skeleton alert cards

Avoid:

- blank screens
- spinner-only pages

Loading helper copy if needed:

- "Loading your website overview"
- "Checking connected tools"

## 19. Owner Accessibility Notes

- Use plain language labels for screen readers too.
- Health and alert meaning must not rely on color alone.
- Primary actions should have descriptive accessible names.
- Service cards should read in meaningful order:
  - title
  - explanation
  - status
  - action

## 20. Owner Responsive Behavior

On mobile, owner priorities should be:

1. Website status
2. Edit website
3. Alerts
4. Connected systems
5. Costs
6. Access

Never lead mobile owners with dense metadata or multi-column tool lists.

## 21. Final Standard

If an owner opens RAEYL and feels like they are looking at a developer admin panel, the screen is wrong.

If an owner opens RAEYL and feels:

- "I get this"
- "I know what matters"
- "I know where to click"
- "I know my website is under control"

then the product is doing its job.
