import { WalletRecord } from "@/lib/types";

export const wallet: WalletRecord = {
  id: "wal_evergreen",
  name: "Evergreen Dental Wallet",
  businessName: "Evergreen Dental Studio",
  websiteUrl: "https://evergreendental.com",
  timezone: "America/Chicago",
  planTier: "Growth",
  handoffStatus: "Owner invited",
  setupStatus: "92% complete",
  health: "attention",
  monthlyCost: 518,
  urgentAlerts: 2,
  ownerStatus: "Pending acceptance",
  primaryOwner: "Maya Bennett",
  primaryDeveloper: "Northline Studio",
  websites: [
    {
      id: "site_1",
      name: "Evergreen Dental",
      primaryDomain: "evergreendental.com",
      productionUrl: "https://evergreendental.com",
      stagingUrl: "https://staging.evergreendental.com",
      category: "Healthcare",
      framework: "Next.js + Supabase",
      launchDate: "2026-02-12",
      status: "Live",
      editRoutes: [
        {
          id: "edit_home",
          label: "Edit homepage",
          description: "Update hero content, featured services, and trust bar.",
          destinationUrl: "https://builder.io/content/homepage",
          providerName: "Builder.io",
          isPrimary: true
        },
        {
          id: "edit_blog",
          label: "Edit blog",
          description: "Manage articles, SEO fields, and publish schedule.",
          destinationUrl: "https://builder.io/content/blog",
          providerName: "Builder.io"
        },
        {
          id: "edit_forms",
          label: "Review lead forms",
          description: "See form routing and appointment request automation.",
          destinationUrl: "https://dashboard.formspree.io/forms",
          providerName: "Formspree"
        }
      ]
    }
  ],
  providers: [
    {
      id: "prov_vercel",
      name: "Vercel",
      category: "hosting",
      label: "Hosting",
      accountLabel: "Northline / Evergreen Production",
      status: "Connected",
      health: "healthy",
      dashboardUrl: "https://vercel.com/dashboard",
      billingUrl: "https://vercel.com/dashboard/billing",
      ownerDescription: "Publishes the live site and manages deployment uptime.",
      metadata: {
        Project: "evergreen-production",
        Region: "iad1",
        Runtime: "Next.js 15"
      },
      monthlyCost: 84,
      renewalDate: "2026-05-01"
    },
    {
      id: "prov_supabase",
      name: "Supabase",
      category: "database",
      label: "Database",
      accountLabel: "evergreen-prod",
      status: "Connected",
      health: "healthy",
      dashboardUrl: "https://supabase.com/dashboard",
      billingUrl: "https://supabase.com/dashboard/org/_/billing",
      ownerDescription: "Stores customer data, forms, file uploads, and auth records.",
      metadata: {
        Project: "evergreen-prod",
        Region: "us-east-1",
        Database: "PostgreSQL"
      },
      monthlyCost: 49,
      renewalDate: "2026-05-03"
    },
    {
      id: "prov_builder",
      name: "Builder.io",
      category: "cms",
      label: "Content editing",
      accountLabel: "Evergreen editorial space",
      status: "Connected",
      health: "attention",
      dashboardUrl: "https://builder.io/content",
      editUrl: "https://builder.io/content",
      billingUrl: "https://builder.io/account/billing",
      ownerDescription: "Where your team updates page content, blog posts, and promotional sections.",
      metadata: {
        Space: "Evergreen Content",
        Model: "Page + Blog + Global",
        Access: "Owner and marketing"
      },
      monthlyCost: 95,
      renewalDate: "2026-04-26"
    },
    {
      id: "prov_cloudflare",
      name: "Cloudflare",
      category: "domain",
      label: "Domain",
      accountLabel: "evergreendental.com",
      status: "Needs review",
      health: "issue",
      dashboardUrl: "https://dash.cloudflare.com",
      billingUrl: "https://dash.cloudflare.com/profile/billing",
      ownerDescription: "Manages the domain, DNS records, and domain-layer protection.",
      metadata: {
        Zone: "evergreendental.com",
        SSL: "Full strict",
        Registrar: "External"
      },
      monthlyCost: 28,
      renewalDate: "2026-04-20"
    },
    {
      id: "prov_stripe",
      name: "Stripe",
      category: "payments",
      label: "Payments",
      accountLabel: "Evergreen patient deposits",
      status: "Connected",
      health: "healthy",
      dashboardUrl: "https://dashboard.stripe.com",
      billingUrl: "https://dashboard.stripe.com/settings/billing",
      ownerDescription: "Processes website payment flows, invoices, and card activity.",
      metadata: {
        Mode: "Live",
        Statement: "EVERGREEN DENTAL",
        Settlement: "Daily"
      },
      monthlyCost: 112,
      renewalDate: "2026-05-12"
    },
    {
      id: "prov_formspree",
      name: "Formspree",
      category: "email_forms",
      label: "Forms",
      accountLabel: "evergreen inquiries",
      status: "Connected",
      health: "healthy",
      dashboardUrl: "https://formspree.io/forms",
      ownerDescription: "Routes website lead and contact form submissions.",
      metadata: {
        Inbox: "ops@evergreendental.com",
        SpamFilter: "Enabled",
        SLA: "Instant email delivery"
      },
      monthlyCost: 24,
      renewalDate: "2026-05-08"
    }
  ],
  alerts: [
    {
      id: "alert_1",
      severity: "critical",
      title: "Domain renewal due soon",
      message: "The primary domain renewal is due in 8 days.",
      recommendation: "Review the domain provider billing page and confirm auto-renew is active.",
      providerId: "prov_cloudflare",
      status: "open",
      createdAt: "2026-04-12T08:15:00.000Z"
    },
    {
      id: "alert_2",
      severity: "warning",
      title: "Owner handoff still pending",
      message: "Primary owner has not accepted the wallet invitation yet.",
      recommendation: "Resend the secure invite before launch billing starts.",
      status: "open",
      createdAt: "2026-04-11T16:40:00.000Z"
    },
    {
      id: "alert_3",
      severity: "info",
      title: "Edit route coverage incomplete",
      message: "No page-specific edit action has been configured for the testimonials page.",
      recommendation: "Add a content route so the owner can jump straight to the right CMS model.",
      providerId: "prov_builder",
      status: "dismissed",
      createdAt: "2026-04-10T13:00:00.000Z"
    }
  ],
  activity: [
    {
      id: "act_1",
      actor: "Northline Studio",
      action: "Connected provider",
      detail: "Builder.io space linked to website edit actions.",
      createdAt: "2026-04-12T07:55:00.000Z"
    },
    {
      id: "act_2",
      actor: "RAEYL System",
      action: "Generated alert",
      detail: "Domain renewal due soon for evergreendental.com.",
      createdAt: "2026-04-12T08:15:00.000Z"
    },
    {
      id: "act_3",
      actor: "Northline Studio",
      action: "Invited owner",
      detail: "Sent secure wallet handoff invite to maya@evergreendental.com.",
      createdAt: "2026-04-11T16:31:00.000Z"
    }
  ],
  members: [
    {
      id: "mem_1",
      name: "Maya Bennett",
      email: "maya@evergreendental.com",
      role: "wallet_owner",
      status: "pending"
    },
    {
      id: "mem_2",
      name: "Northline Studio",
      email: "ops@northline.studio",
      role: "developer",
      status: "active"
    },
    {
      id: "mem_3",
      name: "Sam Torres",
      email: "marketing@evergreendental.com",
      role: "editor",
      status: "active"
    },
    {
      id: "mem_4",
      name: "Tara Reeves",
      email: "finance@evergreendental.com",
      role: "billing_manager",
      status: "active"
    }
  ],
  billing: [
    {
      id: "bill_1",
      label: "RAEYL Growth plan",
      amount: 126,
      cadence: "monthly",
      nextRenewal: "2026-05-01",
      type: "raeyl",
      description: "Wallet subscription, support routing, audit trail, and ownership dashboard."
    },
    {
      id: "bill_2",
      label: "Vercel Pro",
      amount: 84,
      cadence: "monthly",
      nextRenewal: "2026-05-01",
      type: "provider",
      providerId: "prov_vercel",
      description: "Hosting and deployment runtime."
    },
    {
      id: "bill_3",
      label: "Supabase Pro",
      amount: 49,
      cadence: "monthly",
      nextRenewal: "2026-05-03",
      type: "provider",
      providerId: "prov_supabase",
      description: "Database, storage, and auth services."
    },
    {
      id: "bill_4",
      label: "Builder Space",
      amount: 95,
      cadence: "monthly",
      nextRenewal: "2026-04-26",
      type: "provider",
      providerId: "prov_builder",
      description: "Website content editing environment."
    },
    {
      id: "bill_5",
      label: "Domain + DNS",
      amount: 28,
      cadence: "annual",
      nextRenewal: "2026-04-20",
      type: "provider",
      providerId: "prov_cloudflare",
      description: "Domain and DNS management."
    }
  ],
  supportCases: [
    {
      id: "sup_1",
      subject: "Clarify handoff timing for ownership acceptance",
      priority: "normal",
      status: "open",
      createdAt: "2026-04-10T11:20:00.000Z"
    },
    {
      id: "sup_2",
      subject: "Update billing contact for domain renewal",
      priority: "high",
      status: "in_progress",
      relatedProvider: "Cloudflare",
      createdAt: "2026-04-12T08:30:00.000Z"
    }
  ],
  referrals: [
    {
      id: "ref_1",
      partnerName: "Northline Studio",
      walletName: "Evergreen Dental Wallet",
      commissionRate: 0.2,
      monthlyPayout: 25.2,
      status: "active"
    }
  ]
};
