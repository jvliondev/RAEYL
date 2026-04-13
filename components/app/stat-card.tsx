import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  supporting,
  tone = "neutral",
  tag
}: {
  label: string;
  value: string;
  supporting: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  tag?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">{label}</div>
          <Badge variant={tone}>{tag ?? (tone === "neutral" ? "Overview" : "Live")}</Badge>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="text-sm text-muted">{supporting}</p>
      </CardContent>
    </Card>
  );
}
