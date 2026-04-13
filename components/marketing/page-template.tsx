import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/header";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function MarketingPageTemplate({
  eyebrow,
  title,
  description,
  sections
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: { title: string; description: string }[];
}) {
  return (
    <>
      <MarketingHeader />
      <main>
        <section className="py-20">
          <div className="page-shell max-w-4xl space-y-4">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-3xl text-lg text-muted">{description}</p>
          </div>
        </section>
        <section className="pb-16">
          <div className="page-shell grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <Card key={section.title}>
                <CardContent className="space-y-3">
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
