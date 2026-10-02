import Link from "next/link";
import { copyrightLine } from "@ieee/ui/layout/app-footer";
import { Reveal } from "@/components/motion/reveal";
import { INTRO } from "@/components/motion/timing";
import { DESCRIPTION, SITE_LINKS } from "@/lib/site";

export function HomeBar() {
  return (
    <Reveal
      trigger="mount"
      delay={INTRO.bar}
      y={10}
      className="grid gap-4 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-mono text-[0.7rem] leading-snug uppercase md:grid-cols-[1fr_2fr_1fr] md:items-end md:gap-6 md:px-5 md:pb-5 md:text-xs"
    >
      <p className="order-3 md:order-1">{copyrightLine()}</p>
      <p className="order-1 max-w-xl text-balance md:order-2 md:mx-auto md:text-center">
        {DESCRIPTION}
      </p>
      <nav className="order-2 md:hidden">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 md:justify-end">
          {SITE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:opacity-60">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Reveal>
  );
}
