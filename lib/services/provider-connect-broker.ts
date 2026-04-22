import {
  discoverProviderResources as discoverProviderResourcesFromOrchestrator,
  getProviderMagicConnectProfile as getProviderMagicConnectProfileFromOrchestrator
} from "@/lib/providers/orchestrator";

export type ProviderMagicConnectProfile = NonNullable<
  ReturnType<typeof getProviderMagicConnectProfileFromOrchestrator>
>;

export async function discoverProviderResources(input: {
  walletId: string;
  providerSlug: string;
  apiToken: string;
  externalTeamId?: string;
  externalProjectId?: string;
}) {
  return discoverProviderResourcesFromOrchestrator(input);
}

export function getProviderMagicConnectProfile(providerSlug?: string | null) {
  return getProviderMagicConnectProfileFromOrchestrator(providerSlug);
}
