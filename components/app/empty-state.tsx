import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction
}: {
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 py-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="max-w-xl text-sm text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyStateButton({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
}) {
  return <Button variant={variant}>{children}</Button>;
}
