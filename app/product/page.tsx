import { MarketingPageTemplate } from "@/components/marketing/page-template";

export default function ProductPage() {
  return (
    <MarketingPageTemplate
      eyebrow="Product"
      title="The ownership layer for modern websites."
      description="RAEYL turns a finished website stack into a calm, trusted control center for the business owner after the build is complete."
      sections={[
        { title: "Ownership wallet", description: "Bring access, tools, billing visibility, and support context into one place." },
        { title: "Connected systems", description: "Document hosting, CMS, domains, analytics, payments, support tools, and more." },
        { title: "Edit routing", description: "Guide owners to the correct editing destination without making them guess." }
      ]}
    />
  );
}
