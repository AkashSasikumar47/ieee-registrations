const TONES = [
  "bg-foreground text-background",
  "bg-muted text-foreground bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[14px_14px]",
  "border bg-background text-foreground bg-[repeating-linear-gradient(135deg,var(--border)_0_1px,transparent_1px_12px)]",
];

export function posterName(name: string) {
  return name.replace(/^Sample:\s*/, "");
}

export function EventPoster({
  name,
  mode,
  tone = 0,
  className = "",
}: {
  name: string;
  mode: string;
  tone?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex size-full flex-col justify-between overflow-hidden p-3 md:p-4 ${TONES[tone % TONES.length]} ${className}`}
    >
      <span className="font-mono text-[0.65rem] tracking-wide uppercase opacity-70">
        {mode === "team" ? "Team" : "Solo"}
      </span>
      <span className="font-display text-[clamp(1rem,1.7vw,1.75rem)] leading-[0.9] font-black tracking-[-0.04em] text-balance uppercase">
        {posterName(name)}
      </span>
    </div>
  );
}
