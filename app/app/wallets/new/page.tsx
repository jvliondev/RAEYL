import { createWallet } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export default function NewWalletPage() {
  return (
    <AppShell
      title="Create wallet"
      description="Create the website ownership wallet your client will use after handoff."
    >
      <form action={createWallet} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Wallet name" hint="The internal name for this handoff wallet.">
                <Input name="name" required placeholder="Evergreen Dental Wallet" />
              </FormField>
              <FormField label="Wallet slug" hint="Used in the wallet URL.">
                <Input name="slug" required placeholder="evergreen-dental" />
              </FormField>
              <FormField label="Business name" className="md:col-span-2">
                <Input name="businessName" required placeholder="Evergreen Dental Studio" />
              </FormField>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Owner and website details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Owner contact name">
                <Input name="ownerContactName" placeholder="Maya Bennett" />
              </FormField>
              <FormField label="Owner email">
                <Input name="ownerEmail" type="email" placeholder="maya@business.com" />
              </FormField>
              <FormField label="Website name">
                <Input name="websiteName" placeholder="Evergreen Dental" />
              </FormField>
              <FormField label="Website URL">
                <Input name="websiteUrl" placeholder="https://evergreendental.com" />
              </FormField>
              <FormField label="Business category">
                <Input name="businessCategory" placeholder="Healthcare" />
              </FormField>
              <FormField label="Timezone">
                <Input name="timezone" placeholder="America/Chicago" />
              </FormField>
              <FormField label="Website description" className="md:col-span-2">
                <Textarea
                  name="websiteDescription"
                  placeholder="Describe the business, website purpose, and what the owner should understand first."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Plan and support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Plan tier">
              <Select name="planTier" defaultValue="Growth">
                <option>Starter</option>
                <option>Growth</option>
                <option>Scale</option>
              </Select>
            </FormField>
            <FormField label="Internal notes">
              <Textarea name="notes" placeholder="Agency notes, support expectations, or billing guidance." />
            </FormField>
            <SubmitButton className="w-full">Create wallet and continue</SubmitButton>
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}
