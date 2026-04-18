import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/access";
import { getFirstWalletIdForUser, getUserPreferences } from "@/lib/data/wallets";

export default async function AppPage() {
  const session = await requireSession();
  const preferences = await getUserPreferences(session.user.id);
  const walletId = await getFirstWalletIdForUser(session.user.id);

  if (preferences.defaultLandingPage === "notifications") {
    redirect("/app/notifications");
  }

  if (preferences.defaultLandingPage === "wallets") {
    redirect("/app/wallets");
  }

  if (walletId) {
    redirect(`/app/wallets/${walletId}`);
  }

  redirect("/app/wallets");
}
