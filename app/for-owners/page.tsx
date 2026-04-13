import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function ForOwnersPage() {
  return (
    <MarketingPageTemplate
      eyebrow="For Owners"
      title="Know what powers your website and what to do next."
      description="RAEYL gives non-technical owners a simple place to review website health, costs, access, and editing paths without technical guesswork."
      sections={[
        { title: "Simple control center", description: "See what matters first: health, tools, cost, and next actions." },
        { title: "Clear editing paths", description: "Open the right content tool without guessing where changes live." },
        { title: "Ownership confidence", description: "Know who has access, what systems are connected, and what needs review." }
      ]}
    />
  );
}
