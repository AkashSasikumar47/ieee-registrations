import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Registrations | IEEE SRMIST",
  description:
    "Every IEEE SRMIST event in one place. Register in a minute and get your ticket instantly.",
  applicationName: "IEEE SRMIST Registrations",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.className} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
