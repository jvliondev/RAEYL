import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ActionCard({
  href,
  label,
  description
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:border-primary/30 hover:bg-white/[0.05]">
        <CardContent className="flex h-full items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <p className="text-sm text-muted">{description}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 text-muted" />
        </CardContent>
      </Card>
    </Link>
  );
}
