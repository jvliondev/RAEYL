export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="max-w-3xl text-sm text-muted">{description}</p> : null}
    </div>
  );
}
