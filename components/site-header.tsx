import Image from "next/image";
import Link from "next/link";
import { Button } from "@ieee/ui/components/button";

const LINKS = [
  { label: "Events", href: "/#events" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/ieee-srmist-logo.png"
            alt=""
            width={32}
            height={32}
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">IEEE SRMIST</span>
            <span className="text-xs text-muted-foreground">Registrations</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="outline" asChild>
          <Link href="/find">Find my ticket</Link>
        </Button>
      </div>
    </header>
  );
}
