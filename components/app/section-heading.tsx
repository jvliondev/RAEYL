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
      {eyebrow ? (
        <p className="app-eyebrow">{eyebrow}</p>
      ) : null}
      <h2 className="text-[19px] font-semibold tracking-tight text-white/88">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-[13px] leading-5 text-white/50">{description}</p>
      ) : null}
    </div>
  );
}
