import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check-in | IEEE SRMIST",
  description: "Scan IEEE SRMIST event tickets at the door.",
  manifest: "/scan.webmanifest",
  robots: { index: false },
  appleWebApp: {
    capable: true,
    title: "Check-in",
    statusBarStyle: "default",
  },
};

export default function ScanLayout({ children }: LayoutProps<"/scan">) {
  return children;
}
