import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@ieee/supabase/server";
import { loginFor, safeReturnTo } from "@/lib/return-to";

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return url;
}

function backToLogin(
  request: NextRequest,
  error: string,
  returnTo: string | null,
) {
  const url = redirectTo(request, loginFor(returnTo));
  url.searchParams.set("error", error);
  if (returnTo) url.searchParams.set("next", returnTo);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim();
  const password = String(form?.get("password") ?? "");
  const returnTo = safeReturnTo(form?.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return backToLogin(request, "credentials", returnTo);

  const { data: isAdmin } = await supabase.rpc("ieee_shared_is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return backToLogin(request, "admin", returnTo);
  }

  return NextResponse.redirect(redirectTo(request, returnTo ?? "/admin"), 303);
}
