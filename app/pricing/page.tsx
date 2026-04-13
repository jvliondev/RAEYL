import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function PricingPage() {
  return (
    <MarketingPageTemplate
      eyebrow="Pricing"
      title="Simple plans for ownership clarity."
      description="Choose the RAEYL tier that fits the size of the website stack and the depth of owner support needed after handoff."
      sections={[
        { title: "Starter", description: "Core wallet, connected tools, editing paths, billing visibility, and access management." },
        { title: "Growth", description: "Expanded handoff, richer alerts, support workflows, and multi-user owner access." },
        { title: "Scale", description: "Advanced admin controls, partner workflows, and deeper operational visibility." }
      ]}
    />
  );
}
