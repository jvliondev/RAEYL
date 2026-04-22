import { AppShell } from "@/components/app/app-shell";
import { NewWalletForm } from "./new-wallet-form";

export default function NewWalletPage() {
  return (
    <AppShell
      title="Create client wallet"
      description="Start a new wallet in your workspace and let RAEYL build the ownership rail around it."
    >
      <NewWalletForm />
    </AppShell>
  );
}
