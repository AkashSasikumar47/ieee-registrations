import type { Metadata } from "next";
import { AdminFooter } from "@/components/admin-footer";
import { AdminHeader } from "@/components/admin-header";
import { AdminIntro } from "@/components/admin-intro";
import { LoginForm } from "@/components/login-form";
import { Reveal } from "@/components/motion/reveal";
import { safeReturnTo } from "@/lib/return-to";

export const metadata: Metadata = {
  title: "Sign in | Registrations admin",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { error, next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader signedIn={false} />
      <main className="flex-1">
        <AdminIntro
          label="Admin"
          title="Sign in"
          lead="Admins only. Everyone else can head back to the events."
        />
        <div className="grid gap-6 px-site-4 py-10 md:grid-cols-4 md:gap-3 md:px-site-5 md:py-14">
          <p className="font-mono text-xs uppercase">Account</p>
          <Reveal trigger="mount" delay={0.2} y={16} className="md:col-span-2">
            <LoginForm
              error={typeof error === "string" ? error : undefined}
              next={safeReturnTo(next)}
            />
          </Reveal>
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}
