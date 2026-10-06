import Link from "next/link";
import { copyrightLine } from "@ieee/ui/layout/app-footer";
import { AdminLink } from "@/components/copyright-bar";
import { Reveal } from "@/components/motion/reveal";
import { INTRO } from "@/components/motion/timing";
import { DESCRIPTION, SITE_LINKS } from "@/lib/site";

export function HomeBar() {
  return (
    <Reveal
      trigger="mount"
      delay={INTRO.bar}
      y={10}
      className="grid gap-4 px-gutter pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-mono text-[0.7rem] leading-snug uppercase md:grid-cols-[1fr_2fr_1fr] md:items-end md:gap-6 md:pb-5 md:text-xs"
    >
      <div className="order-3 flex justify-between gap-4 md:order-1">
        <p>{copyrightLine()}</p>
        <AdminLink className="md:hidden" />
      </div>
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
      <AdminLink className="hidden justify-self-end md:order-3 md:block" />
    </Reveal>
  );
}
