import { getTemplateBySlug } from "@/lib/data/provider-catalog";
import { CustomProviderAdapter } from "@/lib/providers/adapters/custom";
import { SupabaseProviderAdapter } from "@/lib/providers/adapters/supabase";
import { VercelProviderAdapter } from "@/lib/providers/adapters/vercel";
import type { ConnectProviderAdapter } from "@/lib/providers/contracts";

const ADAPTERS: ConnectProviderAdapter[] = [
  new VercelProviderAdapter(),
  new SupabaseProviderAdapter()
];

const FALLBACK_ADAPTER = new CustomProviderAdapter();

function normalizeSlug(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, "-") ?? "";
}

export function getProviderAdapter(providerSlugOrName?: string | null): ConnectProviderAdapter {
  const normalized = normalizeSlug(providerSlugOrName);
  const direct = ADAPTERS.find((adapter) => adapter.getProviderDefinition().slug === normalized);

  if (direct) {
    return direct;
  }

  const template = normalized ? getTemplateBySlug(normalized) : undefined;
  if (template) {
    const templateMatch = ADAPTERS.find((adapter) => adapter.getProviderDefinition().slug === template.slug);
    if (templateMatch) {
      return templateMatch;
    }
  }

  return FALLBACK_ADAPTER;
}

export function listProviderAdapters() {
  return [...ADAPTERS, FALLBACK_ADAPTER];
}
