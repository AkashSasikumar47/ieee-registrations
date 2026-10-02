import Link from "next/link";
import { copyrightLine } from "@ieee/ui/layout/app-footer";

export function CopyrightBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 font-mono text-xs uppercase ${className}`}
    >
      <p>{copyrightLine()}</p>
      <AdminLink />
    </div>
  );
}

export function AdminLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/admin"
      prefetch={false}
      className={`font-semibold tracking-wide hover:opacity-60 ${className}`}
    >
      Admin
    </Link>
  );
}
