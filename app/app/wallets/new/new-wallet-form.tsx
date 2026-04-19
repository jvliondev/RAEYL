"use client";

import { useActionState } from "react";

import { createWallet } from "@/lib/actions/wallets";
import { WALLET_TEMPLATES, getWalletTemplateBySlug } from "@/lib/data/wallet-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export function NewWalletForm() {
  const [error, action] = useActionState(createWallet, null);
  const defaultTemplate = getWalletTemplateBySlug("service-business");

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet template</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Website type"
              className="md:col-span-2"
              hint="This shapes the recommended setup guidance, owner language, and tool priorities."
            >
              <Select name="walletTemplate" defaultValue={defaultTemplate.slug}>
                {WALLET_TEMPLATES.map((template) => (
                  <option key={template.slug} value={template.slug}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
              <div className="font-medium text-foreground">{defaultTemplate.label}</div>
              <p className="mt-1">{defaultTemplate.description}</p>
              <p className="mt-3">{defaultTemplate.developerSummary}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Business name"
              className="md:col-span-2"
              hint="The client's business, for example Evergreen Dental Studio."
            >
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
          <CardTitle>Plan and setup intent</CardTitle>
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
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
            <div className="font-medium text-foreground">What happens next</div>
            <ul className="mt-2 space-y-1">
              <li>RAEYL will recommend the most useful tools for this website type.</li>
              <li>Setup guidance will point to the next best handoff step.</li>
              <li>The owner experience will use clearer, more relevant language.</li>
            </ul>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <SubmitButton className="w-full" pendingLabel="Creating wallet...">
            Create wallet and continue
          </SubmitButton>
        </CardContent>
      </Card>
    </form>
  );
}
