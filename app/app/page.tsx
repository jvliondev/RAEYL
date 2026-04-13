import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/access";
import { getFirstWalletIdForUser } from "@/lib/data/wallets";

export default async function AppPage() {
  const session = await requireSession();
  const walletId = await getFirstWalletIdForUser(session.user.id);

  if (walletId) {
    redirect(`/app/wallets/${walletId}`);
  }

  redirect("/app/wallets");
}
