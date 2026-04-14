"use client";

import { useActionState } from "react";

import { createWallet } from "@/lib/actions/wallets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function NewWalletForm() {
  const [error, action] = useActionState(createWallet, null);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label="Business name" className="md:col-span-2" hint="The client's business — e.g. Evergreen Dental Studio.">
              <Input name="businessName" required placeholder="Evergreen Dental Studio" />
            </FormField>
            <FormField label="Wallet name" hint="Internal label for this wallet. Leave blank to use business name.">
              <Input name="name" placeholder="Evergreen Dental Wallet" />
            </FormField>
            <FormField label="Business category">
              <Input name="businessCategory" placeholder="Healthcare" />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Owner and website</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label="Owner name">
              <Input name="ownerContactName" placeholder="Maya Bennett" />
            </FormField>
            <FormField label="Owner email">
              <Input name="ownerEmail" type="email" placeholder="maya@business.com" />
            </FormField>
            <FormField label="Website name">
              <Input name="websiteName" placeholder="Evergreen Dental" />
            </FormField>
            <FormField label="Website URL" hint="Include https:// or we'll add it for you.">
              <Input name="websiteUrl" placeholder="https://evergreendental.com" />
            </FormField>
            <FormField label="Timezone">
              <Input name="timezone" placeholder="America/Chicago" />
            </FormField>
            <FormField label="Website description" className="md:col-span-2">
              <Textarea
                name="websiteDescription"
                placeholder="What the owner should understand first about the site."
              />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Plan and notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Plan tier">
            <Select name="planTier" defaultValue="Growth">
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Scale">Scale</option>
            </Select>
          </FormField>
          <FormField label="Internal notes">
            <Textarea name="notes" placeholder="Agency notes, support expectations, or billing guidance." />
          </FormField>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <SubmitButton className="w-full" pendingLabel="Creating wallet...">
            Create wallet and continue
          </SubmitButton>
        </CardContent>
      </Card>
    </form>
  );
}
