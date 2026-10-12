import { Toaster } from "@ieee/ui/components/sonner";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster theme="light" position="bottom-center" />
    </>
  );
}
