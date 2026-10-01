import { AboutIeee } from "@ieee/ui/event/about-ieee";
import { footerLinks } from "@ieee/ui/content/footer-links";
import { SiteLinks } from "@ieee/ui/layout/site-links";

const LINKS = {
  title: "Registrations",
  links: [
    { label: "Events", href: "/#events" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Find my ticket", href: "/find" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export function SiteEnd() {
  return (
    <>
      <AboutIeee />
      <SiteLinks
        logo={{
          src: "/logos/ieee-srmist-logo.png",
          alt: "IEEE SRMIST",
          width: 40,
          height: 40,
        }}
        groups={footerLinks(LINKS)}
      />
    </>
  );
}
