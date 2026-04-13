import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function ForDevelopersPage() {
  return (
    <MarketingPageTemplate
      eyebrow="For Developers"
      title="A better handoff layer for custom website work."
      description="RAEYL helps agencies and freelancers document the stack, shape the owner experience, and hand over websites professionally."
      sections={[
        { title: "Structured setup", description: "Move from wallet setup to provider connections to editing paths in a clean order." },
        { title: "Premium handoff", description: "Invite the owner into a clear management layer instead of a loose email thread." },
        { title: "Partner economics", description: "Keep referral attribution connected to the wallet lifecycle." }
      ]}
    />
  );
}
