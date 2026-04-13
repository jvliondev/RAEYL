import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function SecurityPage() {
  return (
    <MarketingPageTemplate
      eyebrow="Security"
      title="Built for trust, permissions, and clean ownership."
      description="RAEYL protects sessions, credentials, invites, and ownership changes with a backend-first security model."
      sections={[
        { title: "Secure access", description: "Role-aware access and authenticated routes protect every wallet surface." },
        { title: "Encrypted credentials", description: "Provider secrets are stored separately and encrypted at rest." },
        { title: "Audit visibility", description: "Critical ownership, invite, and configuration actions are recorded for review." }
      ]}
    />
  );
}
