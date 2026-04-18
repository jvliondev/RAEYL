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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] border-dashed bg-white/[0.01] px-8 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent" />
      <div className="relative space-y-4">
        {/* Subtle icon mark */}
        <div className="mx-auto h-10 w-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <div className="h-4 w-4 rounded border border-white/[0.15] bg-white/[0.05]" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-white/80">{title}</h3>
          <p className="mx-auto max-w-sm text-[13px] leading-5 text-white/45">{description}</p>
        </div>
        {(primaryAction || secondaryAction) ? (
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyStateButton({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
}) {
  // Import avoided — callers should pass Button directly via primaryAction prop
  return <>{children}</>;
}
