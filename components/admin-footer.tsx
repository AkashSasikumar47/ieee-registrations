import { CopyrightBar } from "@/components/copyright-bar";

export function AdminFooter() {
  return (
    <footer className="mt-auto border-t px-site-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-site-5">
      <CopyrightBar />
    </footer>
  );
}
