import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function FaqPage() {
  return (
    <MarketingPageTemplate
      eyebrow="FAQ"
      title="Straight answers about how RAEYL works."
      description="RAEYL is not a website builder, hosting platform, or CMS replacement. It is the control layer that helps owners understand and operate the stack they already have."
      sections={[
        { title: "Does RAEYL replace my CMS?", description: "No. It stores the right pathways so owners can open the right content tool when they need to edit." },
        { title: "Can an agency stay involved after handoff?", description: "Yes. Developers can remain in the wallet with controlled collaborator access." },
        { title: "Does RAEYL manage provider billing?", description: "It summarizes website costs and links to the right billing pages without replacing provider billing systems." }
      ]}
    />
  );
}
