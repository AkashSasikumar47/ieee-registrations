export function AdminIntro({
  label,
  title,
  lead,
  children,
}: {
  label: React.ReactNode;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b px-gutter py-5 md:flex-row md:items-end md:justify-between md:py-6">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="font-mono text-xs text-muted-foreground uppercase">
          {label}
        </div>
        <h1 className="font-display truncate text-2xl leading-none font-black tracking-[-0.03em] uppercase md:text-3xl">
          {title}
        </h1>
        {lead ? (
          <p className="font-mono text-xs text-muted-foreground uppercase">
            {lead}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
