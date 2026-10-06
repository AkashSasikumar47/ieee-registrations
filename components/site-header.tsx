import Image from "next/image";
import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";

export function SiteHeader({ sticky = true }: { sticky?: boolean }) {
  return (
    <header
      className={`z-30 flex items-center justify-between gap-6 bg-background px-gutter pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5 md:grid md:grid-cols-[1.4fr_repeat(5,1fr)_auto] ${
        sticky ? "sticky top-0 border-b" : ""
      }`}
    >
      <Link
        href="/"
        className="font-mono text-sm font-semibold tracking-wide uppercase"
      >
        IEEE SRMIST
      </Link>
      <HeaderNav />
      <a
        href="https://ieeesrmist.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="IEEE SRMIST"
        className="justify-self-end"
      >
        <Image
          src="/logos/ieee-srmist-logo.png"
          alt="IEEE SRMIST"
          width={32}
          height={32}
          preload
        />
      </a>
    </header>
  );
}
