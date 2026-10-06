import { Reveal } from "@/components/motion/reveal";
import { RiseText } from "@/components/motion/rise-text";

export function PageIntro({
  label,
  title,
  lead,
}: {
  label: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="flex flex-col gap-6 border-b px-gutter pt-12 pb-10 md:pt-20 md:pb-14">
      <Reveal
        as="p"
        trigger="mount"
        y={8}
        className="font-mono text-xs tracking-wide uppercase"
      >
        [ {label} ]
      </Reveal>
      <RiseText
        as="h1"
        text={title}
        trigger="mount"
        delay={0.1}
        className="font-display max-w-6xl text-[clamp(2.75rem,8vw,7.5rem)] leading-[0.85] font-black tracking-[-0.05em] text-balance uppercase"
      />
      {lead ? (
        <Reveal
          as="p"
          trigger="mount"
          delay={0.3}
          className="max-w-xl font-mono text-xs leading-relaxed text-muted-foreground uppercase md:text-sm"
        >
          {lead}
        </Reveal>
      ) : null}
    </div>
  );
}
