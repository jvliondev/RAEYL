import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function ContactPage() {
  return (
    <MarketingPageTemplate
      eyebrow="Contact"
      title="Talk with RAEYL."
      description="Reach out for product questions, agency conversations, partner interest, or platform setup guidance."
      sections={[
        { title: "General questions", description: "Ask about product fit, owner experience, and workflow design." },
        { title: "Agency partnerships", description: "Discuss referral structure, handoff quality, and implementation patterns." },
        { title: "Platform support", description: "Review setup guidance, billing, and account questions." }
      ]}
    />
  );
}
