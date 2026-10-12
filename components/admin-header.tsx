import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";

export function AdminHeader({ signedIn = true }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b bg-background px-gutter pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex items-center justify-between gap-6 md:contents">
        <Link
          href={signedIn ? "/admin" : "/"}
          className="font-mono text-sm font-semibold tracking-wide uppercase"
        >
          IEEE SRMIST <span className="text-primary">· Admin</span>
        </Link>
        <a
          href="https://ieeesrmist.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="IEEE SRMIST"
          className="md:order-last"
        >
          <Image
            src="/logos/ieee-srmist-logo.png"
            alt="IEEE SRMIST"
            width={32}
            height={32}
            preload
          />
        </a>
      </div>
      {signedIn && <AdminNav />}
    </header>
  );
}
