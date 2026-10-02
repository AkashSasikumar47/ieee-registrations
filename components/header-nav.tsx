"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_LINKS } from "@/lib/site";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden md:contents">
      {SITE_LINKS.map((link) => {
        const current = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={`font-mono text-sm font-semibold tracking-wide uppercase transition-opacity hover:opacity-60 ${
              current ? "underline decoration-2 underline-offset-4" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
