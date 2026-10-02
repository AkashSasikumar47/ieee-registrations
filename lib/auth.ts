import { createClient } from "@ieee/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.rpc("ieee_shared_is_admin");
  return admin ? user : null;
}

export async function getAdminClient() {
  const supabase = await createClient();
  return (await getAdmin(supabase)) ? supabase : null;
}
