"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@ieee/ui/components/button";

const LINKS = [
  { label: "Events", href: "/admin" },
  { label: "New event", href: "/admin/events/new" },
  { label: "Scanner", href: "/scan" },
  { label: "View site", href: "/" },
];

const LINK =
  "font-mono text-sm font-semibold tracking-wide uppercase transition-opacity hover:opacity-60";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex flex-wrap items-center gap-x-5 gap-y-1 md:contents"
    >
      {LINKS.map((link) => {
        const current = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={`${LINK} ${current ? "underline decoration-2 underline-offset-4" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
      <form action="/api/auth/logout" method="post" className="contents">
        <Button
          type="submit"
          variant="link"
          className={`h-auto justify-self-start p-0 text-foreground hover:no-underline ${LINK}`}
        >
          Sign out
        </Button>
      </form>
    </nav>
  );
}
