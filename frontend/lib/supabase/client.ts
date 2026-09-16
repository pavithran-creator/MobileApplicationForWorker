import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xzhvvudoebxnrjdbxjye.supabase.co";
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_UTtp4FPvZx3s9IAz3uVcXA_fX_XPK_B";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
