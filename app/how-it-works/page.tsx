import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function HowItWorksPage() {
  return (
    <MarketingPageTemplate
      eyebrow="How It Works"
      title="From build to handoff to confident ownership."
      description="Developers create the wallet, connect the stack, define editing paths, and invite the owner into a premium control center."
      sections={[
        { title: "Build", description: "The website stays on the tools your team already chose." },
        { title: "Connect", description: "RAEYL documents the systems behind the site and the right actions for each one." },
        { title: "Handoff", description: "The owner receives one clear place to understand the website after launch." }
      ]}
    />
  );
}
