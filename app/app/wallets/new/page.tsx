import { AppShell } from "@/components/app/app-shell";
import { NewWalletForm } from "./new-wallet-form";

export default function NewWalletPage() {
  return (
    <AppShell
      title="Create wallet"
      description="Create the website ownership wallet your client will use after handoff."
    >
      <NewWalletForm />
    </AppShell>
  );
}
