"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/admin/events/${id}`;
  const tabs = [
    { label: "Overview", href: base },
    { label: "Registrations", href: `${base}/registrations` },
    { label: "Check-in", href: `${base}/check-in` },
    { label: "Settings", href: `${base}/settings` },
  ];

  return (
    <nav
      aria-label="Event"
      className="flex gap-1 overflow-x-auto border-b px-gutter"
    >
      {tabs.map((tab) => {
        const current = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-3 font-mono text-xs font-semibold tracking-wide uppercase transition-colors first:pl-0 ${
              current
                ? "border-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
