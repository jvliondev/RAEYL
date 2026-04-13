# RAEYL Provider Integration Architecture

RAEYL is not the system of record for hosting, content, domains, analytics, or payments. It is the ownership and control layer that understands those systems, stores the right connection context, surfaces owner-safe meaning, and routes users to the correct action destination at the right moment.

This document defines the full provider integration architecture for RAEYL as a generic, extensible provider framework.

## 1. Integration Architecture Goals

1. Support a wide variety of provider categories through one coherent framework.
2. Allow deep integrations where available and graceful manual records where they are not.
3. Separate provider definition, connection state, secrets, sync, health, billing, and action routing.
4. Surface business-friendly meaning to owners without losing technical truth.
5. Make provider actions dependable, permissioned, and auditable.
6. Support progressively richer integrations over time without breaking the base model.

## 2. Supported Provider Categories

RAEYL's provider framework must support at minimum:

- Hosting providers
- Databases
- CMS / content tools
- Domain providers
- Analytics providers
- Payments providers
- Support tools
- Custom / other tools

Recommended extended categories already supported by the relational model:

- Email and form tools
- Scheduling tools
- Automation tools
- Storage tools
- Auth and identity tools

## 3. Provider Framework Layers

The provider architecture has six layers.

### 3.1 Provider Template Layer

Represents reusable vendor definitions such as:

- Vercel
- Netlify
- Supabase
- Builder.io
- Sanity
- Cloudflare
- Stripe
- Google Analytics
- Intercom

Purpose:

- define category
- define supported connection methods
- define metadata schema
- define available actions
- define health-check strategy
- define billing field expectations
- define edit-routing compatibility

Table:
- `ProviderTemplate`

### 3.2 Provider Connection Layer

Represents an actual connected provider instance inside a wallet.

Examples:

- "Evergreen Dental Production on Vercel"
- "Evergreen Content Space in Builder.io"
- "evergreendental.com in Cloudflare"
- "Evergreen GA4 Property"

Purpose:

- tie a provider to a wallet and optionally a website
- store current status, display data, URLs, fetched metadata, and sync state

Table:
- `ProviderConnection`

### 3.3 Secret and Credential Layer

Represents encrypted secret material required for deeper integration.

Examples:

- OAuth access token
- refresh token
- API key
- webhook secret
- secure access credential

Purpose:

- keep secret storage isolated and encrypted
- support rotation and reauthorization

Table:
- `ProviderSecret`

### 3.4 Sync and Health Layer

Represents the background operational lifecycle of the integration.

Purpose:

- know whether RAEYL's connection data is fresh
- know whether the provider is healthy
- know whether user action is needed

Fields live on:

- `ProviderConnection`
- `Alert`
- future sync run log table if needed

### 3.5 Owner Experience Layer

Represents what owners actually see:

- what the tool does
- what it costs
- whether it is healthy
- what actions they can take
- where they should go next

This is driven by:

- provider connection fields
- provider template metadata
- action routing rules

### 3.6 Action Routing Layer

Represents the actual destinations RAEYL can send users to.

Examples:

- open hosting dashboard
- open billing portal
- open CMS space
- edit homepage
- manage DNS
- review analytics dashboard
- contact support

This layer is powered by:

- `ProviderConnection`
- `EditRoute`
- provider template action capabilities

## 4. Generic Provider Data Model

The base relational model already lives in:
[prisma/schema.prisma](c:/Users/julia/OneDrive/Desktop/AI%20Projects/Raeyl/prisma/schema.prisma)

Relevant entities:

- `ProviderTemplate`
- `ProviderConnection`
- `ProviderSecret`
- `EditRoute`
- `BillingRecord`
- `Alert`

### 4.1 ProviderTemplate Data Contract

Purpose:
Reusable blueprint for a provider vendor.

Core fields:

- `id`
- `slug`
- `displayName`
- `category`
- `defaultDescription`
- `defaultOwnerLabel`
- `connectionMethods`
- `configSchema`
- `metadataSchema`

Recommended logical extension fields:

- `logoUrl`
- `brandColor`
- `supportsBilling`
- `supportsHealthChecks`
- `supportsEditRouting`
- `supportsOAuth`
- `supportsWebhooks`
- `actionDefinitions`
- `healthCheckDefinition`
- `billingFieldDefinition`

### 4.2 ProviderConnection Data Contract

Purpose:
Operational instance of a provider inside a wallet.

Core fields:

- `walletId`
- `websiteId`
- `providerTemplateId`
- `providerName`
- `displayLabel`
- `category`
- `status`
- `healthStatus`
- `syncState`
- `connectedAccountLabel`
- `externalProjectId`
- `externalTeamId`
- `dashboardUrl`
- `billingUrl`
- `editUrl`
- `supportUrl`
- `ownerDescription`
- `connectionMethod`
- `tokenMetadata`
- `metadata`
- `notes`
- `monthlyCostEstimate`
- `renewalDate`
- `lastSyncAt`
- `lastHealthCheckAt`

Recommended metadata shape:

- `ownerSummary`
- `technicalSummary`
- `environment`
- `region`
- `projectName`
- `workspaceName`
- `resourceType`
- `capabilities`
- `editCapabilities`
- `billingCapabilities`
- `statusSource`

### 4.3 ProviderSecret Data Contract

Purpose:
Encrypted credentials associated with a provider connection.

Core fields:

- `providerConnectionId`
- `secretType`
- `environment`
- `encryptedValue`
- `keyVersion`
- `valueFingerprint`
- `maskedPreview`
- `scopes`
- `status`
- `expiresAt`
- `rotatedAt`

### 4.4 Billing Fields

Provider-level billing fields should exist in either `ProviderConnection` summary form or normalized `BillingRecord` rows.

Required provider billing fields:

- `monthlyCostEstimate`
- `renewalDate`
- `billingUrl`
- `currency`
- `billingAccountLabel`
- `billingOwnerType`
  - owner-managed
  - agency-managed
  - unknown
- `planName`
- `planInterval`
- `invoiceUrl` when available

### 4.5 Edit Routing Fields

Provider-level routing fields should support:

- `editUrl`
- `dashboardUrl`
- `supportUrl`
- provider action definitions
- route labels
- route visibility by role
- deep links into specific content or admin surfaces

Edit-routing data should live in `EditRoute`, not overloaded provider fields.

Recommended route attributes:

- route type
  - primary edit
  - section edit
  - operational admin
  - billing
  - support
- provider source
- destination URL
- label
- description
- visible roles
- priority
- is primary
- enabled

## 5. Connection Method Architecture

RAEYL must support four connection methods across categories.

### 5.1 OAuth Connection

Best for:

- analytics providers
- support tools
- payments
- some CMS tools
- some hosting platforms

Flow:

1. user chooses provider template
2. RAEYL creates pending provider connection row
3. server generates signed OAuth state containing:
   - wallet id
   - website id if applicable
   - provider template id
   - actor id
   - nonce
4. user is redirected to provider auth screen
5. provider redirects back to RAEYL callback
6. callback validates state and exchanges code for tokens
7. tokens are encrypted into `ProviderSecret`
8. metadata fetch runs
9. connection status becomes `CONNECTED` or `PENDING_VERIFICATION`
10. audit event and notification can be emitted

OAuth flow requirements:

- signed and expiring state
- CSRF-safe callback validation
- provider-specific token exchange handling
- refresh token storage if available
- scope capture and validation
- graceful failure handling

Token-based flow requirements under OAuth:

- support refresh
- record expiration
- record granted scopes
- detect insufficient scope
- alert if refresh fails

Manual fallback:

- if OAuth fails or is unsupported, allow manual record with dashboard URL and account metadata

### 5.2 API Token / Key Connection

Best for:

- databases
- hosting tools
- analytics APIs
- custom tools
- some CMS tools

Flow:

1. user selects API token method
2. user enters token or key
3. server validates input format
4. token is encrypted and stored in `ProviderSecret`
5. adapter runs provider-specific test call
6. fetched metadata populates `ProviderConnection`
7. connection status set accordingly

Requirements:

- secure server-side handling only
- masked preview after write
- never echo raw secret back to client
- scope verification if provider exposes it
- environment labeling if token is staging or production

Manual fallback:

- allow saving record without valid token if user needs owner visibility before integration is complete
- status becomes `PENDING_VERIFICATION` or `MANUAL`

### 5.3 Manual Connection Record

Best for:

- domain providers with no API integration
- support tools not worth deep integration
- one-off vendor systems
- client-owned tools where credentials should not be shared

Flow:

1. user selects manual connection
2. enters display info, URLs, billing data, owner description, and notes
3. provider saves without credentials
4. status remains `CONNECTED` or `MANUAL` depending on product semantics
5. health defaults to `UNKNOWN` unless manually updated or rule-derived

Requirements:

- clearly label as manual in UI
- do not imply active sync
- still allow links, billing records, alerts, and edit routing

### 5.4 Secure Link Record

Best for:

- systems where RAEYL should store a secure destination but not full API integration
- admin portals
- private environments

Flow:

1. user stores destination and optional credential note
2. optional secret or access note is encrypted
3. provider actions use the secure destination as launch point

Requirements:

- same encrypted secret handling if sensitive fields are stored
- permission gating by role
- external auth expected

## 6. Provider Adapter Framework

Use an adapter interface per provider template.

### 6.1 Generic Adapter Interface

Each adapter should expose:

- `getTemplateDefinition()`
- `getSupportedConnectionMethods()`
- `buildOAuthStartUrl()`
- `handleOAuthCallback()`
- `validateCredentials()`
- `fetchMetadata()`
- `fetchBillingData()`
- `fetchHealthData()`
- `getOwnerSummary()`
- `getAvailableActions()`
- `getEditRoutingSuggestions()`
- `refreshConnection()`
- `handleDisconnect()`

### 6.2 Template Definition Contract

Each provider template should define:

- provider name
- category
- supported methods
- fields required for manual mode
- metadata mapping rules
- health-check method
- sync cadence recommendation
- owner-visible label rules
- action menu definitions
- edit-route compatibility rules

### 6.3 Category Adapter Base Classes

Recommended abstraction:

- `BaseProviderAdapter`
- `HostingProviderAdapter`
- `DatabaseProviderAdapter`
- `CmsProviderAdapter`
- `DomainProviderAdapter`
- `AnalyticsProviderAdapter`
- `PaymentsProviderAdapter`
- `SupportProviderAdapter`
- `CustomProviderAdapter`

This allows shared category behavior while preserving provider-specific overrides.

## 7. Category-by-Category Integration Architecture

---

## 7.1 Hosting Providers

Examples:

- Vercel
- Netlify
- Render
- Fly.io
- Cloudflare Pages

### Purpose in RAEYL

Represent where the website is deployed and how owners or developers can access deployment status, project settings, runtime health, and hosting billing.

### Data Model

Core metadata to fetch:

- project name
- team/workspace name
- environment names
- production URL
- preview/staging URL
- region
- framework/runtime
- latest deployment timestamp
- latest deployment status
- deployment URL
- project dashboard URL
- account/team identifier
- billing plan if available

Recommended `metadata` fields:

- `projectName`
- `teamName`
- `runtime`
- `productionUrl`
- `previewUrl`
- `latestDeploymentStatus`
- `latestDeploymentAt`
- `region`
- `environmentLabels`

### Connection Methods

- OAuth if supported
- API token for deeper project access
- manual record fallback

### OAuth Flow Requirements

- request project read scopes
- if billing visibility is supported, request billing-read scope separately and explicitly
- after callback, fetch account/team and project list or selected project metadata

### Token-Based Flow Requirements

- validate token against account/project endpoint
- store token scopes and expiry if available
- allow project selection if token grants access to many projects

### Manual Connection Fallback

Collect:

- provider name
- hosting project label
- dashboard URL
- production URL
- staging URL
- owner description
- billing URL
- support link

### Metadata to Fetch

- deployment status
- last deployment timestamp
- runtime/framework
- production URL
- environment labels
- project/team identifier

### What Should Be Displayed to Owners

- what hosting does
- where the live website is published
- whether deployments are healthy
- link to hosting dashboard
- monthly/estimated cost

### What Actions Should Be Available

- Open hosting dashboard
- Open production site
- Open staging site
- View hosting billing
- View latest deployment
- Contact support

### How Reconnect Should Work

- if token invalid or revoked, status becomes `REQUIRES_RECONNECT`
- preserve non-secret metadata and action links
- reconnect should reauthorize and optionally reselect project

### How Sync Should Work

Recommended cadence:

- hourly or on-demand

Sync fetches:

- deployment health
- project metadata
- environment URLs

### How Health Checks Should Work

Signals:

- latest deployment failed
- project inaccessible
- production URL mismatch
- repeated sync failure

### What Billing Fields Should Exist

- hosting plan name
- monthly estimate
- billing owner type
- billing URL
- renewal or invoice date if accessible

### What Edit-Routing Fields Should Exist

Usually hosting is not primary edit route, but may expose:

- preview deployment
- open deployment logs
- open environment variables if developer-visible only

---

## 7.2 Databases

Examples:

- Supabase
- Neon
- PlanetScale
- Railway Postgres
- MongoDB Atlas

### Purpose in RAEYL

Represent backend data storage and related operational visibility without encouraging non-technical owners to manage raw database internals.

### Data Model

Fetchable metadata:

- project name
- database engine
- region
- environment
- status
- storage tier
- backup status if available
- linked project label

### Connection Methods

- API token
- OAuth where available
- manual record fallback

### OAuth Flow Requirements

- usually project or org read scope
- fetch org, project, region, and runtime metadata

### Token-Based Flow Requirements

- validate token against project endpoint
- never expose direct database credentials in owner UI
- distinguish admin API token from runtime keys

### Manual Fallback

Store:

- provider label
- dashboard URL
- owner description
- environment label
- technical notes

### What Metadata Should Be Fetched

- project status
- region
- environment
- service tier
- backup or branch status

### What Should Be Displayed to Owners

- what the database supports in plain language
- whether backend services are connected
- cost estimate
- operational status in business-safe terms

### What Actions Should Be Available

- Open backend dashboard
- View billing
- Contact support

Developer-only actions may include:

- view project details
- open console

### How Reconnect Should Work

- revalidate token
- preserve current metadata if reconnect fails
- alert if backend visibility becomes stale

### How Sync Should Work

- daily or on-demand depending on provider support

### How Health Checks Should Work

- project reachable
- status active
- API token valid
- sync freshness acceptable

### What Billing Fields Should Exist

- plan name
- monthly estimate
- storage or compute tier
- billing URL

### What Edit-Routing Fields Should Exist

- generally none owner-facing
- may expose admin destination for developer role only

---

## 7.3 CMS / Content Tools

Examples:

- Builder.io
- Sanity
- Storyblok
- Contentful
- WordPress admin

### Purpose in RAEYL

This category is the most important for edit routing. RAEYL uses CMS integrations to route owners and editors to the exact place where website content should be changed.

### Data Model

Fetchable metadata:

- space / project / environment name
- content models
- environment label
- preview/edit URL
- users or access scope summary if available
- publish status capabilities

Recommended metadata:

- `spaceName`
- `environmentName`
- `contentModels`
- `supportsVisualEditing`
- `defaultEditorUrl`
- `routeMappings`

### Connection Methods

- OAuth where possible
- API token or management token
- secure admin link
- manual record fallback

### OAuth Flow Requirements

- content read scope minimum
- content management scope optional if creating deep edit routes programmatically
- fetch available spaces/environments and let user bind the correct one

### Token-Based Flow Requirements

- validate token against management/content API
- detect environment access
- optionally fetch model names for route suggestion

### Manual Fallback

Store:

- CMS name
- space/environment label
- dashboard URL
- edit URL
- owner description

### What Metadata Should Be Fetched

- space name
- environment name
- default editor URL
- model names
- preview capability
- publish capability

### What Should Be Displayed to Owners

- this is where you update website content
- what kinds of content live here
- primary edit actions
- who typically uses it

### What Actions Should Be Available

- Open CMS
- Edit homepage
- Edit services
- Edit blog
- Edit team
- Edit global settings

These may be generated from `EditRoute` records rather than provider actions alone.

### How Reconnect Should Work

- if token expires or scope lost, reconnect should preserve route definitions where possible
- invalid routes should degrade gracefully to provider root dashboard

### How Sync Should Work

- sync route suggestions
- sync environment name
- sync model inventory if provider supports it
- daily or on-demand

### How Health Checks Should Work

- editor URL reachable
- token valid
- environment accessible
- route targets still configured if verifiable

### What Billing Fields Should Exist

- space plan
- monthly estimate
- billing URL
- seats count if available

### What Edit-Routing Fields Should Exist

This category has the richest routing fields:

- primary edit URL
- model-specific base URLs
- content section labels
- route slug templates
- environment identifier
- visual editor capability
- page-specific route map

---

## 7.4 Domain Providers

Examples:

- Cloudflare
- GoDaddy
- Namecheap
- Squarespace Domains

### Purpose in RAEYL

Represent where the domain is managed and whether the business owner can renew, edit DNS, or understand domain risk.

### Data Model

Fetchable metadata:

- primary domain
- registrar or DNS manager
- zone name
- renewal date
- auto-renew state if available
- nameserver status
- SSL mode if applicable

### Connection Methods

- API token if provider supports DNS APIs
- manual record fallback is common

### OAuth Flow Requirements

- rare, but if available fetch zone and account context

### Token-Based Flow Requirements

- validate zone access
- fetch renewal and DNS summary where supported

### Manual Fallback

Store:

- domain name
- registrar label
- dashboard URL
- billing URL
- support URL
- renewal date

### What Metadata Should Be Fetched

- zone status
- nameserver state
- SSL / protection state
- domain expiration or renewal date

### What Should Be Displayed to Owners

- who manages the domain
- when renewal is due
- whether the domain looks healthy

### What Actions Should Be Available

- Open domain dashboard
- Review billing
- Review DNS
- Contact support

### How Reconnect Should Work

- preserve renewal data
- ask user to restore API access if zone can no longer be read

### How Sync Should Work

- daily recommended
- faster if renewal date is near

### How Health Checks Should Work

- renewal expiring soon
- zone inaccessible
- SSL or protection issue
- nameserver mismatch if detectable

### What Billing Fields Should Exist

- renewal amount
- renewal date
- billing URL
- registrar label

### What Edit-Routing Fields Should Exist

- not content editing
- operational routing only:
  - manage DNS
  - review domain renewal

---

## 7.5 Analytics Providers

Examples:

- Google Analytics
- Plausible
- Fathom
- Mixpanel

### Purpose in RAEYL

Provide visibility into where traffic and measurement live, with lightweight business-level context for owners.

### Data Model

Fetchable metadata:

- property or site name
- account/workspace name
- tracking status
- reporting URL
- property ID
- last data received timestamp if available

### Connection Methods

- OAuth
- API token
- manual record fallback

### OAuth Flow Requirements

- read-only analytics scopes
- fetch accessible accounts/properties
- allow property selection

### Token-Based Flow Requirements

- validate site/property access
- fetch property label and reporting link

### Manual Fallback

Store:

- analytics tool name
- report URL
- property label
- owner description

### What Metadata Should Be Fetched

- property name
- account name
- last data freshness
- high-level health indicator

### What Should Be Displayed to Owners

- where website traffic and performance are reviewed
- whether analytics appears to be connected

### What Actions Should Be Available

- Open analytics dashboard
- Review reports
- Contact support

### How Reconnect Should Work

- reauthorize if reporting access fails

### How Sync Should Work

- daily or on-demand

### How Health Checks Should Work

- stale data signal
- invalid property access
- inaccessible property

### What Billing Fields Should Exist

- plan/tier if paid analytics
- billing URL when available

### What Edit-Routing Fields Should Exist

- usually none
- report-view routes only

---

## 7.6 Payments Providers

Examples:

- Stripe
- Square
- PayPal

### Purpose in RAEYL

Represent where website payments, invoices, deposits, or subscriptions are processed.

### Data Model

Fetchable metadata:

- account name
- account status
- mode (test/live)
- statement descriptor
- payout cadence
- dashboard URL
- billing/settings URL

### Connection Methods

- OAuth
- API token / restricted key
- manual record fallback

### OAuth Flow Requirements

- account read scope
- optional payment or balance scopes depending on product policy
- bind to correct account

### Token-Based Flow Requirements

- validate restricted scope
- distinguish live vs test mode
- never store raw secret in UI-facing structures

### Manual Fallback

Store:

- payment provider label
- dashboard URL
- support URL
- owner description

### What Metadata Should Be Fetched

- account label
- live/test status
- payout schedule
- business profile label

### What Should Be Displayed to Owners

- where website payments are handled
- whether the account is live
- who should use it

### What Actions Should Be Available

- Open payments dashboard
- Open billing/settings
- Review payouts
- Contact support

### How Reconnect Should Work

- reconnect if account access revoked or wrong mode connected

### How Sync Should Work

- daily or on-demand
- faster around billing or payout incidents if needed

### How Health Checks Should Work

- account restricted
- wrong environment connected
- revoked access
- payout or capability issue if detectable

### What Billing Fields Should Exist

- processor fees not usually modeled as standard subscription cost unless manually added
- account plan if applicable
- payout schedule
- billing URL

### What Edit-Routing Fields Should Exist

- not content editing
- operational routes:
  - review payment settings
  - review payout settings

---

## 7.7 Support Tools

Examples:

- Intercom
- Zendesk
- Help Scout
- Crisp

### Purpose in RAEYL

Represent where customer conversations, chat widgets, or support operations live.

### Data Model

Fetchable metadata:

- workspace name
- inbox name
- widget/install status if available
- support dashboard URL

### Connection Methods

- OAuth
- API token
- manual record fallback

### OAuth Flow Requirements

- workspace read scope
- fetch workspace/inbox details

### Token-Based Flow Requirements

- validate inbox or workspace access

### Manual Fallback

Store:

- workspace label
- dashboard URL
- owner description
- support link

### What Metadata Should Be Fetched

- workspace name
- inbox label
- installation/connection summary

### What Should Be Displayed to Owners

- where website chat or customer support is managed

### What Actions Should Be Available

- Open support tool
- Contact support admin

### How Reconnect / Sync / Health Should Work

- similar to analytics/support-light operational cadence

### What Billing Fields Should Exist

- plan name
- seat count
- billing URL

### What Edit-Routing Fields Should Exist

- not content routing
- operational destination only

---

## 7.8 Custom Tools

Examples:

- proprietary CMS
- bespoke booking tool
- internal CRM
- custom admin panel

### Purpose in RAEYL

Allow any important website-adjacent system to be represented even when no first-class adapter exists.

### Data Model

Minimum fields:

- provider name
- category
- dashboard URL
- edit URL if relevant
- billing URL
- support URL
- owner description
- notes
- monthly cost estimate
- renewal date

### Connection Methods

- manual
- secure link
- API token if custom integration later exists

### OAuth Flow Requirements

- none by default

### Token-Based Flow Requirements

- custom adapter only if implemented later

### Manual Fallback

- this is the primary mode

### What Metadata Should Be Fetched

- none required
- manual metadata supported

### What Should Be Displayed to Owners

- clearly marked as custom connected system
- plain-language explanation of what it is for

### What Actions Should Be Available

- Open dashboard
- Open edit tool
- Review billing
- Contact support

### How Reconnect / Sync / Health Should Work

- mostly manual or rule-driven
- health often remains `UNKNOWN` unless manual alerting exists

### What Billing Fields Should Exist

- full manual support required

### What Edit-Routing Fields Should Exist

- fully manual route mapping supported

## 8. Sync Architecture

Sync is the process of refreshing provider metadata, action availability, billing context, and health signals.

### 8.1 Sync Modes

- Immediate on connect
- Manual refresh on demand
- Scheduled polling
- Event-driven sync from webhook

### 8.2 Sync Responsibilities

For each provider sync run:

1. validate current credential availability
2. fetch core metadata
3. refresh derived owner summary
4. fetch billing metadata if supported
5. fetch health metadata if supported
6. update connection status and sync state
7. emit alerts if conditions changed
8. update `lastSyncAt`

### 8.3 Sync State Meanings

- `NEVER_SYNCED`
- `PENDING`
- `SYNCED`
- `FAILED`
- `DISABLED`

### 8.4 Sync Failure Behavior

- keep last good metadata
- mark sync stale
- do not wipe existing owner-facing meaning
- raise alert only after threshold or critical provider types

## 9. Health Check Architecture

Health is a derived state, not a binary connection flag.

### 9.1 Health Inputs

- connection validity
- sync freshness
- provider-specific operational status
- billing/renewal risk
- edit-route completeness
- manual issues raised by developer/admin

### 9.2 Health Calculation Model

Recommended weighted rule system:

- connection invalid -> `DISCONNECTED`
- critical provider failure -> `ISSUE_DETECTED`
- stale sync or expiring renewal -> `ATTENTION_NEEDED`
- no reliable signal -> `UNKNOWN`
- all checks pass -> `HEALTHY`

### 9.3 Category-Specific Health Rules

- Hosting:
  - deployment failure, inaccessible project, stale deployment info
- Database:
  - inaccessible project, bad token, service warnings
- CMS:
  - inaccessible space, broken edit URL, missing route coverage
- Domain:
  - expiring renewal, DNS issue, zone access lost
- Analytics:
  - stale data, invalid property access
- Payments:
  - restricted account, wrong environment, revoked access
- Support:
  - disconnected workspace or stale inbox access
- Custom:
  - mostly manual/alert-driven

## 10. Reconnect Architecture

Reconnect should restore access without destroying the user's configured context.

### 10.1 Reconnect Rules

- preserve provider row
- preserve billing links, notes, owner description, and route mappings
- prompt only for credential refresh or account re-selection
- preserve last-known metadata until new sync completes

### 10.2 Reconnect UX Outputs

Display:

- what broke
- what is preserved
- what the reconnect action will do
- whether routes or billing remain usable during reconnect

### 10.3 Reconnect States

- reconnect available
- reconnect required
- reconnect in progress
- reconnect failed
- reconnect restored

## 11. Owner Display Architecture

Every provider detail and dashboard card should render a business-safe summary with optional technical depth beneath it.

### 11.1 Owner-Facing Required Display Fields

- provider name
- category label
- what this system does
- connection status
- health status
- key action buttons
- cost summary if known
- renewal timing if relevant
- related website

### 11.2 Technical Detail Section

Should be lower-emphasis and role-aware.

Possible fields:

- project identifier
- team identifier
- environment name
- region
- scope summary
- sync timestamp

## 12. Action Framework

Provider actions should be described generically and then mapped per provider.

### 12.1 Generic Action Types

- `open_dashboard`
- `open_billing`
- `open_support`
- `open_edit_root`
- `open_environment`
- `open_reports`
- `open_dns`
- `open_payment_settings`
- `open_project`
- `open_latest_deployment`
- `reconnect`
- `refresh_sync`

### 12.2 Action Definition Fields

- action key
- display label
- description
- required roles
- target URL or resolver
- fallback target
- visibility conditions
- enabled conditions

### 12.3 Action Resolution Logic

When rendering actions:

1. provider template defines possible actions
2. provider connection fills target URLs and metadata
3. permission layer filters by role
4. health/state layer disables actions if unavailable
5. fallback route chosen if deep destination missing

## 13. Intelligent Edit Routing Architecture

This is the most strategically important part of the provider framework.

RAEYL should intelligently route users to the correct destination based on:

- provider category
- provider template
- available edit routes
- website context
- user role
- current task intent

### 13.1 Routing Inputs

Inputs for route resolution:

- wallet id
- website id
- user role
- requested action intent
  - generic edit
  - edit homepage
  - edit blog
  - manage domain
  - review billing
- available `EditRoute` records
- connected provider actions
- route priority
- route health / enabled state

### 13.2 Routing Priority Model

For a given action request, resolve in this order:

1. exact page-specific `EditRoute`
2. exact intent-matched provider action
3. website primary edit route
4. provider root edit URL
5. provider dashboard URL
6. contextual warning state if no safe route exists

### 13.3 Intent Mapping

Examples:

- "Edit Website"
  - route to website primary edit route
  - if none exists, route to CMS root edit URL
  - if none exists, show configuration warning

- "Edit Homepage"
  - match `EditRoute` with content key `homepage`
  - fallback to CMS root

- "View Billing"
  - route to provider billing URL if provider-specific button
  - route to RAEYL billing page if top-level wallet action

- "Open Domain"
  - domain provider dashboard URL
  - fallback to manual record URL

### 13.4 Route Confidence Levels

Each route should have confidence:

- exact
- broad
- fallback
- unavailable

UI can use this to message users:

- "Opens your homepage editor"
- "Opens your content workspace"
- "Opens the provider dashboard"
- "No edit destination has been configured yet"

### 13.5 Role-Aware Routing

- owners see owner-safe actions only
- editors see content-focused actions
- developers may see richer admin routes
- viewers may see no edit routes

### 13.6 Route Suggestions

Provider adapters, especially CMS adapters, should suggest routes based on fetched metadata.

Examples:

- Builder.io space exposes models:
  - Page
  - Blog
  - Team
  - Global Settings

RAEYL can suggest:

- Edit homepage
- Edit blog
- Edit team
- Edit site settings

Suggestions should be reviewed by user before activation.

## 14. Billing Integration in Provider Architecture

Provider integrations should support three billing fidelity levels.

### Level 1: Manual Billing

- user enters estimate and renewal date
- works for every provider

### Level 2: Linked Billing

- user provides billing URL and plan label
- no API sync

### Level 3: Fetched Billing

- adapter retrieves plan, renewal, seat, or cost metadata

Provider UI should always explain whether billing is:

- manually entered
- linked only
- synced from provider

## 15. Security and Permission Model for Providers

### 15.1 Permission Rules

Owners:

- view provider summary
- open owner-safe actions
- view cost and renewal
- reconnect only if policy allows

Developers:

- create and configure connections
- manage credentials
- define routes
- reconnect

Billing managers:

- view provider cost data
- open billing actions

Editors:

- view content-related provider actions only

Support:

- view alerts and support actions

### 15.2 Secret Handling Rules

- secrets stored only in encrypted form
- never included in client payloads
- masked preview only
- all writes audited
- rotation audited separately

## 16. Logging and Audit for Integrations

Audit-worthy integration events:

- provider created
- provider connected
- OAuth authorized
- token stored
- token rotated
- reconnect started/completed/failed
- sync succeeded/failed
- billing metadata changed
- route suggested/accepted/changed
- provider archived

Structured logs should include:

- provider template
- provider connection id
- wallet id
- actor id
- connection method
- sync result
- error code if any

## 17. Recommended Service Architecture

Use:

- `provider-template-service`
- `provider-connection-service`
- `provider-secret-service`
- `provider-sync-service`
- `provider-health-service`
- `provider-action-service`
- `edit-routing-service`

Responsibilities:

- template service:
  - registry of adapters and template definitions
- connection service:
  - create/update/archive/reconnect provider rows
- secret service:
  - encrypt/store/rotate credentials
- sync service:
  - metadata and billing refresh
- health service:
  - derive health and create alerts
- action service:
  - produce owner-safe and role-aware actions
- edit routing service:
  - resolve exact destination for requested intent

## 18. Recommended Build Order

1. Generic provider template registry.
2. Provider connection CRUD and manual mode.
3. Secret storage and token validation.
4. Adapter base classes and category bases.
5. CMS, hosting, domain, and payments adapters first.
6. Sync and health rule engine.
7. Action resolution service.
8. Intelligent edit route resolver and suggestions.

## 19. Summary

The correct provider architecture for RAEYL is not a collection of hardcoded vendor pages. It is a layered integration framework:

- template definitions
- connected provider instances
- encrypted credentials
- sync and health logic
- action resolution
- intelligent edit routing

This allows RAEYL to support deep integrations where possible, manual ownership clarity where necessary, and graceful growth over time without rewriting the platform each time a new provider category is added.
