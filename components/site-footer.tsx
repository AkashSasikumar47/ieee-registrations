import { externalLinkProps } from "@ieee/ui/lib/external-link";
import Link from "next/link";
import { footerLinks } from "@ieee/ui/content/footer-links";
import { CopyrightBar } from "@/components/copyright-bar";
import { Wordmark } from "@/components/wordmark";
import { FOOTER_LINKS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t px-site-4 pt-12 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-site-5 md:pt-16">
      <nav className="grid grid-cols-2 gap-x-5 gap-y-10 font-mono text-xs uppercase sm:grid-cols-3 md:grid-cols-4">
        {footerLinks(FOOTER_LINKS).map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <p className="text-muted-foreground">{group.title}</p>
            <ul className="flex flex-col gap-1.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className="hover:opacity-60">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      {...externalLinkProps(link.href)}
                      className="hover:opacity-60"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div aria-hidden="true" className="@container mt-14 md:mt-20">
        <Wordmark className="-ml-[0.06em] text-[length:calc(100cqw/9.62)]" />
      </div>
      <CopyrightBar className="mt-6" />
    </footer>
  );
}
