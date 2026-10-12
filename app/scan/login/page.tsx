import Image from "next/image";
import { AdminFooter } from "@/components/admin-footer";
import { LoginForm } from "@/components/login-form";
import { safeReturnTo } from "@/lib/return-to";

export default async function ScanLoginPage({
  searchParams,
}: PageProps<"/scan/login">) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col justify-center gap-10 px-gutter py-[max(2rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Image
              src="/logos/ieee-srmist-logo.png"
              alt="IEEE SRMIST"
              width={48}
              height={48}
              preload
            />
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-muted-foreground uppercase">
                IEEE SRMIST · Admins only
              </p>
              <h1 className="font-display text-5xl leading-none font-black tracking-[-0.05em] uppercase">
                Check-in
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in once with your admin account to scan tickets at the door.
            </p>
          </div>
          <LoginForm
            error={typeof error === "string" ? error : undefined}
            next={safeReturnTo(next) ?? "/scan"}
          />
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}
