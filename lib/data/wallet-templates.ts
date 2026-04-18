export type WalletTemplate = {
  slug: string;
  label: string;
  description: string;
  ownerSummary: string;
  developerSummary: string;
  recommendedCategories: Array<
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
    | "CUSTOM"
  >;
  recommendedProviderSlugs: string[];
  editRoutingAdvice: string;
};

export const WALLET_TEMPLATES: WalletTemplate[] = [
  {
    slug: "service-business",
    label: "Service business site",
    description: "Great for dentists, agencies, law firms, consultants, and local service brands.",
    ownerSummary: "Clear website ownership, scheduling, leads, and support in one simple place.",
    developerSummary: "Focus on hosting, CMS, domain, forms, analytics, and a clean owner handoff.",
    recommendedCategories: ["HOSTING", "CMS", "DOMAIN", "EMAIL_FORMS", "ANALYTICS", "SUPPORT"],
    recommendedProviderSlugs: ["vercel", "sanity", "cloudflare-dns", "resend", "google-analytics"],
    editRoutingAdvice: "Set one primary edit path for homepage updates and optional links for services, team, and blog."
  },
  {
    slug: "brochure-site",
    label: "Brochure site",
    description: "For lean marketing sites where trust, access, and simple edits matter most.",
    ownerSummary: "A lightweight control center for a website with only a few important systems.",
    developerSummary: "Keep the wallet minimal: hosting, domain, analytics, and one clear edit route.",
    recommendedCategories: ["HOSTING", "CMS", "DOMAIN", "ANALYTICS"],
    recommendedProviderSlugs: ["vercel", "webflow", "cloudflare-dns", "google-analytics"],
    editRoutingAdvice: "Use one main edit action and keep secondary routes to a minimum."
  },
  {
    slug: "content-site",
    label: "Content site",
    description: "For blogs, magazines, resource hubs, and teams publishing regularly.",
    ownerSummary: "Content, publishing, analytics, and access all stay understandable for non-technical teams.",
    developerSummary: "Prioritize CMS clarity, role management, analytics, and multiple edit routes.",
    recommendedCategories: ["HOSTING", "CMS", "DOMAIN", "ANALYTICS", "STORAGE", "SUPPORT"],
    recommendedProviderSlugs: ["vercel", "sanity", "cloudflare-dns", "google-analytics", "cloudinary"],
    editRoutingAdvice: "Create separate edit routes for homepage, blog, authors, and media."
  },
  {
    slug: "ecommerce",
    label: "Ecommerce site",
    description: "For stores that need product, payment, content, and fulfillment visibility.",
    ownerSummary: "See which systems power your storefront, payments, and key customer flows.",
    developerSummary: "Payments, CMS, hosting, domain, analytics, and support need to be especially clear.",
    recommendedCategories: ["HOSTING", "CMS", "DOMAIN", "PAYMENTS", "ANALYTICS", "SUPPORT", "AUTOMATION"],
    recommendedProviderSlugs: ["vercel", "sanity", "cloudflare-dns", "stripe", "google-analytics"],
    editRoutingAdvice: "Provide distinct edit routes for homepage, products, collections, and promos."
  },
  {
    slug: "web-app",
    label: "Web app",
    description: "For SaaS apps and member experiences with auth, database, billing, and support.",
    ownerSummary: "A control layer for a more technical product stack without forcing technical language on the owner.",
    developerSummary: "Auth, database, hosting, billing, support, and health checks should all be explicit.",
    recommendedCategories: ["HOSTING", "DATABASE", "AUTH_IDENTITY", "PAYMENTS", "SUPPORT", "ANALYTICS"],
    recommendedProviderSlugs: ["vercel", "supabase", "clerk", "stripe", "plausible"],
    editRoutingAdvice: "Make the primary action operational, not content-only. Link to the admin or CMS that matters most."
  }
];

export function getWalletTemplateBySlug(slug?: string | null) {
  if (!slug) {
    return WALLET_TEMPLATES[0];
  }

  return WALLET_TEMPLATES.find((template) => template.slug === slug) ?? WALLET_TEMPLATES[0];
}
