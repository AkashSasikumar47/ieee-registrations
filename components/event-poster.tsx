const POP = "oklch(from var(--from) 0.86 0.17 calc(h + 150))";
const SOFT = "color-mix(in oklch, var(--from), var(--background) 55%)";

const INK = "fill-foreground";
const PAPER = "fill-background";
const FROM = "fill-(--from)";
const PIP = "fill-(--pop)";
const LINE = "fill-none stroke-(--pop)";

function random(seed: string) {
  let state = 0;
  for (const char of seed)
    state = (Math.imul(state, 31) + char.charCodeAt(0)) >>> 0;
  return () => {
    state = (Math.imul(state ^ (state >>> 15), 2246822507) + 0x6d2b79f5) >>> 0;
    return (state >>> 8) / 16777216;
  };
}

const SCENES: ((seed: string) => React.ReactNode)[] = [
  () => (
    <>
      <circle cx="55" cy="58" r="34" className={PIP} />
      <circle cx="43" cy="50" r="4.5" className={INK} />
      <circle cx="67" cy="50" r="4.5" className={INK} />
      <path
        d="M38 66 Q55 84 72 66"
        strokeWidth="5"
        strokeLinecap="round"
        className="fill-none stroke-foreground"
      />
      <circle cx="35" cy="64" r="4" className={FROM} opacity="0.5" />
      <circle cx="75" cy="64" r="4" className={FROM} opacity="0.5" />
    </>
  ),
  () => (
    <>
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d="M50 62 L46 -20 L54 -20 Z"
          transform={`rotate(${index * 30} 50 62)`}
          className={PIP}
          opacity="0.85"
        />
      ))}
      <circle cx="50" cy="62" r="16" className={PAPER} />
      <circle cx="50" cy="62" r="9" className={PIP} />
    </>
  ),
  () => (
    <>
      {[30, 50, 70, 90, 110].map((y, index) => (
        <path
          key={y}
          d={`M-5 ${y} q 13 -12 26 0 t 26 0 t 26 0 t 26 0 t 26 0`}
          strokeWidth="5"
          strokeLinecap="round"
          className={index % 2 ? "fill-none stroke-background" : LINE}
        />
      ))}
    </>
  ),
  () => (
    <>
      <rect
        x="18"
        y="18"
        width="30"
        height="64"
        rx="15"
        transform="rotate(-18 33 50)"
        className={PIP}
      />
      <rect
        x="52"
        y="40"
        width="30"
        height="64"
        rx="15"
        transform="rotate(22 67 72)"
        className={PAPER}
      />
      <rect
        x="30"
        y="72"
        width="26"
        height="44"
        rx="13"
        transform="rotate(-50 43 94)"
        className={FROM}
        stroke="var(--background)"
        strokeWidth="3"
      />
    </>
  ),
  () => (
    <>
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 5 }, (_, column) =>
          (row + column) % 2 ? null : (
            <rect
              key={`${row}-${column}`}
              x={column * 22}
              y={row * 22}
              width="22"
              height="22"
              className={PIP}
              opacity="0.35"
            />
          ),
        ),
      )}
      <path
        d="M60 30 L66 48 L85 48 L70 59 L76 78 L60 66 L44 78 L50 59 L35 48 L54 48 Z"
        transform="rotate(12 60 54)"
        className={PAPER}
        stroke="var(--foreground)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </>
  ),
  () => (
    <g transform="translate(52 60)">
      {Array.from({ length: 6 }, (_, index) => (
        <rect
          key={index}
          x="-9"
          y="-44"
          width="18"
          height="44"
          rx="9"
          transform={`rotate(${index * 60})`}
          className={PIP}
        />
      ))}
      <circle r="12" className={PAPER} />
      <circle r="5" className={INK} />
    </g>
  ),
  (seed) => {
    const next = random(seed);
    return Array.from({ length: 34 }, (_, index) => {
      const x = next() * 100;
      const y = next() * 125;
      const kind = index % 3;
      const fill = [PIP, PAPER, INK][Math.floor(next() * 3)];
      return kind === 0 ? (
        <circle key={index} cx={x} cy={y} r={2 + next() * 3} className={fill} />
      ) : (
        <rect
          key={index}
          x={x}
          y={y}
          width={kind === 1 ? 9 : 4}
          height={kind === 1 ? 4 : 9}
          rx="1.5"
          transform={`rotate(${next() * 180} ${x} ${y})`}
          className={fill}
        />
      );
    });
  },
  () => (
    <>
      <path
        d="M20 70 C 10 30, 60 10, 80 40 C 100 70, 75 105, 50 100 C 25 96, 28 88, 20 70 Z"
        className={PIP}
      />
      <circle cx="45" cy="55" r="11" className={PAPER} />
      <circle cx="70" cy="58" r="8" className={PAPER} />
      <circle cx="48" cy="58" r="5" className={INK} />
      <circle cx="68" cy="61" r="4" className={INK} />
      <path
        d="M48 80 q 8 6 16 0"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="fill-none stroke-foreground"
      />
    </>
  ),
  () => (
    <g transform="translate(50 120)">
      {[70, 56, 42, 28].map((radius, index) => (
        <circle
          key={radius}
          r={radius}
          strokeWidth="11"
          className={
            [
              "fill-none stroke-(--pop)",
              "fill-none stroke-background",
              "fill-none stroke-foreground",
              "fill-none stroke-(--pop)",
            ][index]
          }
        />
      ))}
    </g>
  ),
  () => (
    <>
      <path
        d="M62 8 L28 70 L50 70 L38 118 L80 48 L56 48 Z"
        className={PIP}
        stroke="var(--foreground)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="26" r="3" className={PAPER} />
      <circle cx="84" cy="96" r="4" className={PAPER} />
      <circle cx="16" cy="104" r="2" className={PAPER} />
    </>
  ),
  () => (
    <>
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 4 }, (_, column) => (
          <circle
            key={`${row}-${column}`}
            cx={12 + column * 26 + (row % 2) * 13}
            cy={12 + row * 26}
            r="5"
            className={PIP}
            opacity="0.45"
          />
        )),
      )}
      <path
        d="M18 34 h64 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-34 l-16 14 v-14 h-14 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10 z"
        className={PAPER}
        stroke="var(--foreground)"
        strokeWidth="2.5"
      />
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontSize="34"
        fontWeight="900"
        className={INK}
      >
        !?
      </text>
    </>
  ),
  () => (
    <path
      d={`M52 62 ${Array.from({ length: 70 }, (_, index) => {
        const angle = index * 0.42;
        const radius = 2 + index * 0.75;
        return `L${(52 + Math.cos(angle) * radius).toFixed(1)} ${(62 + Math.sin(angle) * radius).toFixed(1)}`;
      }).join(" ")}`}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={LINE}
    />
  ),
];

const WHOLE = new Set([0, 3, 5, 7, 9, 10, 11]);

function pick(seed: string) {
  let hash = (2166136261 ^ 15782) >>> 0;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  hash = (hash ^ (hash >>> 15)) >>> 0;
  hash = Math.imul(hash, 2246822507) >>> 0;
  hash = (hash ^ (hash >>> 13)) >>> 0;
  return hash % SCENES.length;
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
  const scene = pick(seed);
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
        "--pop": POP,
      }
    : {
        "--from": "var(--muted)",
        "--to": "var(--background)",
        "--pop": "var(--foreground)",
      };

  return (
    <div
      style={colours as React.CSSProperties}
      className={`flex size-full overflow-hidden ${accent ? "" : "border"} ${className}`}
    >
      <div
        className={`flex w-10 shrink-0 items-end justify-center bg-(--to) pb-3 md:w-12 md:pb-4 ${ink}`}
      >
        <span className="font-display rotate-180 overflow-hidden text-[clamp(0.95rem,1.25vw,1.35rem)] leading-none font-black tracking-[-0.03em] whitespace-nowrap uppercase [writing-mode:vertical-rl]">
          {name}
        </span>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          background: `radial-gradient(90% 60% at 80% 0%, ${SOFT}, transparent 70%), linear-gradient(170deg, var(--from) 0%, var(--from) 45%, var(--to) 100%)`,
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 125"
          preserveAspectRatio={
            WHOLE.has(scene) ? "xMidYMid meet" : "xMidYMid slice"
          }
          className="absolute inset-0 size-full"
        >
          {SCENES[scene]?.(seed)}
        </svg>
        <span className="absolute top-4 right-4 rotate-3 rounded-full bg-background px-2 py-0.5 font-mono text-[0.6rem] tracking-wide text-foreground uppercase shadow-sm md:top-5 md:right-5">
          {label}
        </span>
      </div>
    </div>
  );
}
