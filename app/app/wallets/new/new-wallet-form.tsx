"use client";

import { useActionState, useMemo, useState } from "react";

import { createWallet } from "@/lib/actions/wallets";
import { WALLET_TEMPLATES, getWalletTemplateBySlug } from "@/lib/data/wallet-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { getProviderOptionsByCategory } from "@/lib/services/setup-orchestrator";

type WizardState = {
  walletTemplate: string;
  setupIntent: string;
  businessName: string;
  name: string;
  businessCategory: string;
  ownerContactName: string;
  ownerEmail: string;
  websiteName: string;
  websiteUrl: string;
  timezone: string;
  websiteDescription: string;
  updateCadence: string;
  domainProviderSlug: string;
  hostingProviderSlug: string;
  cmsProviderSlug: string;
  databaseProviderSlug: string;
  paymentsProviderSlug: string;
  analyticsProviderSlug: string;
  authProviderSlug: string;
  schedulingProviderSlug: string;
  supportProviderSlug: string;
  emailProviderSlug: string;
  planTier: string;
  setupNotes: string;
  notes: string;
};

const STEPS = [
  { key: "intent", label: "Goal" },
  { key: "business", label: "Business" },
  { key: "site", label: "Website" },
  { key: "stack", label: "Stack" },
  { key: "finish", label: "Finish" }
] as const;

export function NewWalletForm() {
  const [error, action] = useActionState(createWallet, null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardState>({
    walletTemplate: "service-business",
    setupIntent: "full-handoff",
    businessName: "",
    name: "",
    businessCategory: "",
    ownerContactName: "",
    ownerEmail: "",
    websiteName: "",
    websiteUrl: "",
    timezone: "",
    websiteDescription: "",
    updateCadence: "monthly",
    domainProviderSlug: "",
    hostingProviderSlug: "",
    cmsProviderSlug: "",
    databaseProviderSlug: "",
    paymentsProviderSlug: "",
    analyticsProviderSlug: "",
    authProviderSlug: "",
    schedulingProviderSlug: "",
    supportProviderSlug: "",
    emailProviderSlug: "",
    planTier: "Growth",
    setupNotes: "",
    notes: ""
  });

  const selectedTemplate = useMemo(
    () => getWalletTemplateBySlug(values.walletTemplate),
    [values.walletTemplate]
  );

  function updateField<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function canContinue() {
    switch (step) {
      case 0:
        return Boolean(values.walletTemplate && values.setupIntent);
      case 1:
        return Boolean(values.businessName.trim());
      case 2:
        return Boolean(values.websiteUrl.trim() || values.websiteName.trim() || values.ownerEmail.trim());
      case 3:
        return Boolean(values.hostingProviderSlug || values.domainProviderSlug || values.cmsProviderSlug);
      default:
        return true;
    }
  }

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet setup flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {STEPS.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    index === step
                      ? "bg-primary/15 text-primary"
                      : "border border-white/10 bg-white/[0.03] text-muted hover:text-foreground"
                  }`}
                >
                  {index + 1}. {item.label}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
              <div className="font-medium text-foreground">{selectedTemplate.label}</div>
              <p className="mt-1">{selectedTemplate.description}</p>
              <p className="mt-3">
                RAEYL will use your answers to recommend the right provider connections and bring you back into setup
                after each one.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className={step === 0 ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>What are you setting up?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Website type"
                className="md:col-span-2"
                hint="This shapes the setup path, owner language, and recommended systems."
              >
                <Select
                  name="walletTemplate"
                  value={values.walletTemplate}
                  onChange={(event) => updateField("walletTemplate", event.target.value)}
                >
                  {WALLET_TEMPLATES.map((template) => (
                    <option key={template.slug} value={template.slug}>
                      {template.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Primary goal"
                className="md:col-span-2"
                hint="Tell RAEYL what kind of outcome this wallet should optimize for."
              >
                <Select
                  name="setupIntent"
                  value={values.setupIntent}
                  onChange={(event) => updateField("setupIntent", event.target.value)}
                >
                  <option value="full-handoff">Prepare a clean handoff</option>
                  <option value="ongoing-management">Keep managing the site</option>
                  <option value="portfolio-ops">Organize a growing portfolio</option>
                  <option value="agency-ops">Standardize agency delivery</option>
                  <option value="owner-control">Give the owner simple control</option>
                </Select>
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className={step === 1 ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Who is this for?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Business name" className="md:col-span-2" hint="The client or business name.">
                <Input
                  name="businessName"
                  required
                  value={values.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  placeholder="Evergreen Dental Studio"
                />
              </FormField>
              <FormField label="Wallet name" hint="Optional internal label.">
                <Input
                  name="name"
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Evergreen Dental Wallet"
                />
              </FormField>
              <FormField label="Business category">
                <Input
                  name="businessCategory"
                  value={values.businessCategory}
                  onChange={(event) => updateField("businessCategory", event.target.value)}
                  placeholder="Healthcare"
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className={step === 2 ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>What should the owner recognize immediately?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Owner name">
                <Input
                  name="ownerContactName"
                  value={values.ownerContactName}
                  onChange={(event) => updateField("ownerContactName", event.target.value)}
                  placeholder="Maya Bennett"
                />
              </FormField>
              <FormField label="Owner email">
                <Input
                  name="ownerEmail"
                  type="email"
                  value={values.ownerEmail}
                  onChange={(event) => updateField("ownerEmail", event.target.value)}
                  placeholder="maya@business.com"
                />
              </FormField>
              <FormField label="Website name">
                <Input
                  name="websiteName"
                  value={values.websiteName}
                  onChange={(event) => updateField("websiteName", event.target.value)}
                  placeholder="Evergreen Dental"
                />
              </FormField>
              <FormField label="Website URL">
                <Input
                  name="websiteUrl"
                  value={values.websiteUrl}
                  onChange={(event) => updateField("websiteUrl", event.target.value)}
                  placeholder="https://evergreendental.com"
                />
              </FormField>
              <FormField label="Timezone">
                <Input
                  name="timezone"
                  value={values.timezone}
                  onChange={(event) => updateField("timezone", event.target.value)}
                  placeholder="America/Chicago"
                />
              </FormField>
              <FormField label="Update cadence">
                <Select
                  name="updateCadence"
                  value={values.updateCadence}
                  onChange={(event) => updateField("updateCadence", event.target.value)}
                >
                  <option value="rarely">Rarely</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </Select>
              </FormField>
              <FormField label="Website description" className="md:col-span-2">
                <Textarea
                  name="websiteDescription"
                  value={values.websiteDescription}
                  onChange={(event) => updateField("websiteDescription", event.target.value)}
                  placeholder="What the owner should understand first about the site."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className={step === 3 ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>What powers this website today?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Domain provider">
                <Select
                  name="domainProviderSlug"
                  value={values.domainProviderSlug}
                  onChange={(event) => updateField("domainProviderSlug", event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {getProviderOptionsByCategory("DOMAIN").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Hosting provider">
                <Select
                  name="hostingProviderSlug"
                  value={values.hostingProviderSlug}
                  onChange={(event) => updateField("hostingProviderSlug", event.target.value)}
                >
                  <option value="">Choose hosting</option>
                  {getProviderOptionsByCategory("HOSTING").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Content editor">
                <Select
                  name="cmsProviderSlug"
                  value={values.cmsProviderSlug}
                  onChange={(event) => updateField("cmsProviderSlug", event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {getProviderOptionsByCategory("CMS").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Database">
                <Select
                  name="databaseProviderSlug"
                  value={values.databaseProviderSlug}
                  onChange={(event) => updateField("databaseProviderSlug", event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {getProviderOptionsByCategory("DATABASE").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Payments">
                <Select
                  name="paymentsProviderSlug"
                  value={values.paymentsProviderSlug}
                  onChange={(event) => updateField("paymentsProviderSlug", event.target.value)}
                >
                  <option value="">Not used</option>
                  {getProviderOptionsByCategory("PAYMENTS").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Analytics">
                <Select
                  name="analyticsProviderSlug"
                  value={values.analyticsProviderSlug}
                  onChange={(event) => updateField("analyticsProviderSlug", event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {getProviderOptionsByCategory("ANALYTICS").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Sign-in / identity">
                <Select
                  name="authProviderSlug"
                  value={values.authProviderSlug}
                  onChange={(event) => updateField("authProviderSlug", event.target.value)}
                >
                  <option value="">Not used</option>
                  {getProviderOptionsByCategory("AUTH_IDENTITY").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Scheduling">
                <Select
                  name="schedulingProviderSlug"
                  value={values.schedulingProviderSlug}
                  onChange={(event) => updateField("schedulingProviderSlug", event.target.value)}
                >
                  <option value="">Not used</option>
                  {getProviderOptionsByCategory("SCHEDULING").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Support">
                <Select
                  name="supportProviderSlug"
                  value={values.supportProviderSlug}
                  onChange={(event) => updateField("supportProviderSlug", event.target.value)}
                >
                  <option value="">Not used</option>
                  {getProviderOptionsByCategory("SUPPORT").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Email and forms">
                <Select
                  name="emailProviderSlug"
                  value={values.emailProviderSlug}
                  onChange={(event) => updateField("emailProviderSlug", event.target.value)}
                >
                  <option value="">Not sure yet</option>
                  {getProviderOptionsByCategory("EMAIL_FORMS").map((provider) => (
                    <option key={provider.slug} value={provider.slug}>
                      {provider.displayName}
                    </option>
                  ))}
                </Select>
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className={step === 4 ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Finish and launch the wallet</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Plan tier">
                <Select
                  name="planTier"
                  value={values.planTier}
                  onChange={(event) => updateField("planTier", event.target.value)}
                >
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                </Select>
              </FormField>
              <FormField label="Setup notes">
                <Textarea
                  name="setupNotes"
                  rows={3}
                  value={values.setupNotes}
                  onChange={(event) => updateField("setupNotes", event.target.value)}
                  placeholder="Any useful notes about the stack or expectations."
                />
              </FormField>
              <FormField label="Internal notes" className="md:col-span-2">
                <Textarea
                  name="notes"
                  value={values.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Agency notes, billing guidance, or support expectations."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Setup autopilot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
            <div className="font-medium text-foreground">What happens next</div>
            <ul className="mt-2 space-y-1">
              <li>RAEYL creates the wallet with your chosen setup mode and website type.</li>
              <li>It converts your stack answers into connect-now steps inside the setup flow.</li>
              <li>Each connected provider can return you straight back into setup to continue.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
            <div className="font-medium text-foreground">Current step</div>
            <p className="mt-1">
              {STEPS[step].label} ({step + 1}/{STEPS.length})
            </p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}>
                Back
              </Button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => canContinue() && setStep((current) => current + 1)} disabled={!canContinue()}>
                Continue
              </Button>
            ) : (
              <SubmitButton className="w-full" pendingLabel="Creating wallet...">
                Create wallet and continue
              </SubmitButton>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
