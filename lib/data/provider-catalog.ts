/**
 * Provider template catalog — pre-defined templates for common tools.
 * Used to pre-fill the "Connect a tool" form and power the catalog picker.
 */

export type ProviderTemplate = {
  slug: string;
  displayName: string;
  category:
    | "HOSTING"
    | "DATABASE"
    | "CMS"
    | "DOMAIN"
    | "EMAIL_FORMS"
    | "ANALYTICS"
    | "PAYMENTS"
    | "SCHEDULING"
    | "AUTOMATION"
    | "SUPPORT"
    | "STORAGE"
    | "AUTH_IDENTITY"
    | "CUSTOM";
  defaultDescription: string;
  defaultOwnerLabel: string;
  defaultConnectionMethod: "OAUTH" | "API_TOKEN" | "MANUAL" | "SECURE_LINK";
  dashboardUrlPattern?: string;
  billingUrlPattern?: string;
  supportUrl?: string;
  docsUrl?: string;
};

export const PROVIDER_CATALOG: ProviderTemplate[] = [
  // HOSTING
  {
    slug: "vercel",
    displayName: "Vercel",
    category: "HOSTING",
    defaultDescription:
      "Vercel hosts and deploys your website. When your developer pushes code changes, Vercel builds and publishes the updated site automatically.",
    defaultOwnerLabel: "Website hosting",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://vercel.com/dashboard",
    billingUrlPattern: "https://vercel.com/account/billing",
    supportUrl: "https://vercel.com/support"
  },
  {
    slug: "netlify",
    displayName: "Netlify",
    category: "HOSTING",
    defaultDescription:
      "Netlify hosts and deploys your website. It handles the live site, form submissions, and automatic rebuilds when content changes.",
    defaultOwnerLabel: "Website hosting",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://app.netlify.com",
    billingUrlPattern: "https://app.netlify.com/teams/billing",
    supportUrl: "https://answers.netlify.com"
  },
  {
    slug: "cloudflare-pages",
    displayName: "Cloudflare Pages",
    category: "HOSTING",
    defaultDescription:
      "Cloudflare Pages hosts your website with global distribution for fast load times worldwide.",
    defaultOwnerLabel: "Website hosting",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://dash.cloudflare.com",
    billingUrlPattern: "https://dash.cloudflare.com/billing",
    supportUrl: "https://support.cloudflare.com"
  },

  // DATABASE
  {
    slug: "supabase",
    displayName: "Supabase",
    category: "DATABASE",
    defaultDescription:
      "Supabase stores your website's data — things like form submissions, user accounts, or dynamic content.",
    defaultOwnerLabel: "Database and storage",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://supabase.com/dashboard",
    billingUrlPattern: "https://supabase.com/dashboard/org/billing",
    supportUrl: "https://supabase.com/support"
  },
  {
    slug: "neon",
    displayName: "Neon",
    category: "DATABASE",
    defaultDescription:
      "Neon is the serverless database that stores your website's structured data and content.",
    defaultOwnerLabel: "Database",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://console.neon.tech",
    billingUrlPattern: "https://console.neon.tech/app/billing",
    supportUrl: "https://neon.tech/docs/introduction/support"
  },
  {
    slug: "planetscale",
    displayName: "PlanetScale",
    category: "DATABASE",
    defaultDescription:
      "PlanetScale is a scalable MySQL database that powers the dynamic parts of your website.",
    defaultOwnerLabel: "Database",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://app.planetscale.com",
    billingUrlPattern: "https://app.planetscale.com/billing"
  },

  // CMS
  {
    slug: "sanity",
    displayName: "Sanity",
    category: "CMS",
    defaultDescription:
      "Sanity is your website's content editor. Log in to add blog posts, update text and images, or manage any content on the site.",
    defaultOwnerLabel: "Content editor",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://sanity.io/manage",
    billingUrlPattern: "https://sanity.io/manage/personal/billing",
    supportUrl: "https://slack.sanity.io"
  },
  {
    slug: "contentful",
    displayName: "Contentful",
    category: "CMS",
    defaultDescription:
      "Contentful is where you manage and update the content on your website — text, images, and structured data.",
    defaultOwnerLabel: "Content editor",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://app.contentful.com",
    billingUrlPattern: "https://app.contentful.com/account/billing",
    supportUrl: "https://support.contentful.com"
  },
  {
    slug: "webflow",
    displayName: "Webflow",
    category: "CMS",
    defaultDescription:
      "Webflow is the design and content platform your website is built on. Use it to update text, images, and page layouts.",
    defaultOwnerLabel: "Website editor",
    defaultConnectionMethod: "OAUTH",
    dashboardUrlPattern: "https://webflow.com/dashboard",
    billingUrlPattern: "https://webflow.com/dashboard/billing",
    supportUrl: "https://university.webflow.com/support"
  },

  // DOMAIN
  {
    slug: "godaddy",
    displayName: "GoDaddy",
    category: "DOMAIN",
    defaultDescription:
      "GoDaddy manages your domain name — the web address people type to find your website. You'll need to renew it annually.",
    defaultOwnerLabel: "Domain name",
    defaultConnectionMethod: "MANUAL",
    dashboardUrlPattern: "https://dcc.godaddy.com/manage/dns",
    billingUrlPattern: "https://account.godaddy.com/billing",
    supportUrl: "https://support.godaddy.com"
  },
  {
    slug: "cloudflare-dns",
    displayName: "Cloudflare DNS",
    category: "DOMAIN",
    defaultDescription:
      "Cloudflare manages your domain's DNS settings — how your domain name connects to your website hosting.",
    defaultOwnerLabel: "DNS and domain protection",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://dash.cloudflare.com",
    billingUrlPattern: "https://dash.cloudflare.com/billing",
    supportUrl: "https://support.cloudflare.com"
  },
  {
    slug: "namecheap",
    displayName: "Namecheap",
    category: "DOMAIN",
    defaultDescription:
      "Namecheap is where your domain name is registered. Annual renewal keeps your web address active.",
    defaultOwnerLabel: "Domain name",
    defaultConnectionMethod: "MANUAL",
    dashboardUrlPattern: "https://ap.www.namecheap.com/domains/list",
    billingUrlPattern: "https://ap.www.namecheap.com/billing",
    supportUrl: "https://support.namecheap.com"
  },

  // PAYMENTS
  {
    slug: "stripe",
    displayName: "Stripe",
    category: "PAYMENTS",
    defaultDescription:
      "Stripe processes payments on your website. You can view transactions, issue refunds, and manage your payout schedule from the dashboard.",
    defaultOwnerLabel: "Payment processing",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://dashboard.stripe.com",
    billingUrlPattern: "https://dashboard.stripe.com/settings/billing/portal",
    supportUrl: "https://support.stripe.com"
  },

  // ANALYTICS
  {
    slug: "google-analytics",
    displayName: "Google Analytics",
    category: "ANALYTICS",
    defaultDescription:
      "Google Analytics shows you who visits your website, where they come from, and what they look at.",
    defaultOwnerLabel: "Website analytics",
    defaultConnectionMethod: "MANUAL",
    dashboardUrlPattern: "https://analytics.google.com",
    supportUrl: "https://support.google.com/analytics"
  },
  {
    slug: "plausible",
    displayName: "Plausible",
    category: "ANALYTICS",
    defaultDescription:
      "Plausible gives you a simple, privacy-friendly view of your website traffic and visitor behavior.",
    defaultOwnerLabel: "Website analytics",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://plausible.io",
    billingUrlPattern: "https://plausible.io/billing",
    supportUrl: "https://plausible.io/contact"
  },

  // EMAIL / FORMS
  {
    slug: "resend",
    displayName: "Resend",
    category: "EMAIL_FORMS",
    defaultDescription:
      "Resend sends transactional emails from your website — things like contact form confirmations, booking receipts, and notifications.",
    defaultOwnerLabel: "Email delivery",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://resend.com/overview",
    billingUrlPattern: "https://resend.com/billing",
    supportUrl: "https://resend.com/support"
  },

  // SCHEDULING
  {
    slug: "cal-com",
    displayName: "Cal.com",
    category: "SCHEDULING",
    defaultDescription:
      "Cal.com handles online booking for your business. Clients can schedule appointments directly from your website.",
    defaultOwnerLabel: "Online booking",
    defaultConnectionMethod: "OAUTH",
    dashboardUrlPattern: "https://app.cal.com",
    billingUrlPattern: "https://app.cal.com/billing",
    supportUrl: "https://cal.com/support"
  },
  {
    slug: "calendly",
    displayName: "Calendly",
    category: "SCHEDULING",
    defaultDescription:
      "Calendly lets clients book time with you directly. It syncs with your calendar and sends automatic confirmations.",
    defaultOwnerLabel: "Appointment booking",
    defaultConnectionMethod: "OAUTH",
    dashboardUrlPattern: "https://calendly.com/app/dashboard",
    billingUrlPattern: "https://calendly.com/app/account/billing",
    supportUrl: "https://help.calendly.com"
  },

  // STORAGE
  {
    slug: "cloudinary",
    displayName: "Cloudinary",
    category: "STORAGE",
    defaultDescription:
      "Cloudinary stores and optimizes the images and media files used across your website.",
    defaultOwnerLabel: "Image and media storage",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://console.cloudinary.com",
    billingUrlPattern: "https://console.cloudinary.com/billing",
    supportUrl: "https://support.cloudinary.com"
  },

  // AUTH
  {
    slug: "clerk",
    displayName: "Clerk",
    category: "AUTH_IDENTITY",
    defaultDescription:
      "Clerk manages user accounts and login for your website. It handles sign-up, sign-in, and user profiles.",
    defaultOwnerLabel: "User authentication",
    defaultConnectionMethod: "API_TOKEN",
    dashboardUrlPattern: "https://dashboard.clerk.com",
    billingUrlPattern: "https://dashboard.clerk.com/billing",
    supportUrl: "https://clerk.com/support"
  }
];

export function getCatalogByCategory() {
  const grouped: Record<string, ProviderTemplate[]> = {};
  for (const template of PROVIDER_CATALOG) {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  }
  return grouped;
}

export function getTemplateBySlug(slug: string): ProviderTemplate | undefined {
  return PROVIDER_CATALOG.find((t) => t.slug === slug);
}

export const CATEGORY_LABELS: Record<string, string> = {
  HOSTING: "Hosting",
  DATABASE: "Database",
  CMS: "CMS / Content editing",
  DOMAIN: "Domain",
  EMAIL_FORMS: "Email & forms",
  ANALYTICS: "Analytics",
  PAYMENTS: "Payments",
  SCHEDULING: "Scheduling",
  AUTOMATION: "Automation",
  SUPPORT: "Support",
  STORAGE: "Storage & media",
  AUTH_IDENTITY: "Auth & identity",
  CUSTOM: "Custom"
};
