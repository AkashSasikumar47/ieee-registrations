const MIX = "color-mix(in oklch, var(--from), var(--to))";
const LINE = "color-mix(in oklch, var(--to) 35%, transparent)";

const ART = [
  `radial-gradient(120% 80% at 15% 10%, var(--from) 0%, transparent 60%), radial-gradient(90% 70% at 90% 85%, ${MIX} 0%, transparent 65%), var(--to)`,
  `repeating-radial-gradient(circle at 100% 0%, var(--from) 0 12px, ${MIX} 12px 24px)`,
  `conic-gradient(from 200deg at 65% 35%, var(--from), ${MIX}, var(--to), var(--from))`,
  `repeating-linear-gradient(90deg, transparent 0 18px, ${LINE} 18px 19px), linear-gradient(200deg, var(--from), var(--to))`,
  `linear-gradient(${LINE} 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, ${LINE} 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(var(--from), ${MIX})`,
  `radial-gradient(circle, var(--from) 32%, transparent 34%) 0 0 / 14px 14px, linear-gradient(160deg, ${MIX}, var(--to))`,
  `linear-gradient(180deg, var(--from) 0 22%, color-mix(in oklch, var(--from), var(--to) 30%) 22% 44%, ${MIX} 44% 66%, color-mix(in oklch, var(--from), var(--to) 75%) 66% 88%, var(--to) 88%)`,
  `radial-gradient(70% 50% at 30% 30%, color-mix(in oklch, var(--from), var(--background) 30%) 0%, transparent 70%), linear-gradient(155deg, var(--from) 0 52%, var(--to) 52%)`,
  `radial-gradient(circle at 60% 38%, var(--from) 0 26%, transparent 27%), radial-gradient(circle at 60% 38%, transparent 0 34%, ${MIX} 34% 35%, transparent 36% 44%, ${MIX} 44% 45%, transparent 46%), var(--to)`,
  `repeating-radial-gradient(ellipse 140% 60% at 50% 120%, var(--from) 0 16px, ${MIX} 16px 32px)`,
  `radial-gradient(at 0% 0%, var(--from) 0%, transparent 60%), radial-gradient(at 100% 10%, ${MIX} 0%, transparent 55%), radial-gradient(at 10% 100%, ${MIX} 0%, transparent 55%), var(--to)`,
  `repeating-linear-gradient(45deg, var(--from) 0 14px, ${MIX} 14px 28px)`,
];

function pick(seed: string) {
  let hash = (2166136261 ^ 15782) >>> 0;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  hash = (hash ^ (hash >>> 15)) >>> 0;
  hash = Math.imul(hash, 2246822507) >>> 0;
  hash = (hash ^ (hash >>> 13)) >>> 0;
  return ART[hash % ART.length];
}

function light(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.36;
}

export function EventPoster({
  seed,
  name,
  label,
  accent = "",
  backdrop = "",
  className = "",
}: {
  seed: string;
  name: string;
  label: string;
  accent?: string;
  backdrop?: string;
  className?: string;
}) {
  const ink = !accent
    ? "text-foreground"
    : backdrop && light(backdrop)
      ? "text-foreground"
      : "text-background";
  const colours = accent
    ? {
        "--from": accent,
        "--to":
          backdrop || `color-mix(in oklch, ${accent}, var(--foreground) 55%)`,
      }
    : { "--from": "var(--foreground)", "--to": "var(--background)" };

  return (
    <div
      style={colours as React.CSSProperties}
      className={`flex size-full overflow-hidden ${accent ? "" : "border"} ${className}`}
    >
      <div
        className={`flex w-10 shrink-0 items-end justify-center bg-[var(--to)] pb-3 md:w-12 md:pb-4 ${ink}`}
      >
        <span className="font-display rotate-180 overflow-hidden text-[clamp(0.95rem,1.25vw,1.35rem)] leading-none font-black tracking-[-0.03em] whitespace-nowrap uppercase [writing-mode:vertical-rl]">
          {name}
        </span>
      </div>
      <div className="relative flex-1" style={{ background: pick(seed) }}>
        <span
          className={`absolute top-4 right-4 bg-[var(--to)] px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase md:top-5 md:right-5 ${ink}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
