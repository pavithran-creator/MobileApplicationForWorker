import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xzhvvudoebxnrjdbxjye.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const isDemoKey = anonKey.includes("demo-anon-key") || serviceKey.includes("demo-service-role-key");

  // Attempt live REST call directly to Supabase PostgREST
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/services?select=id,name,base_price&limit=3`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        status: "CONNECTED",
        connected: true,
        project_url: supabaseUrl,
        message: "Successfully connected to live Supabase PostgreSQL database!",
        sample_data: data,
      });
    }

    const errText = await res.text();
    let errJson: any = null;
    try {
      errJson = JSON.parse(errText);
    } catch {}

    return NextResponse.json({
      status: "KEY_REQUIRED",
      connected: false,
      project_url: supabaseUrl,
      is_demo_key: isDemoKey,
      http_status: res.status,
      error: errJson?.message || errText || "Invalid API key",
      hint: "Your project URL is correct, but your anon/public API key in frontend/.env.local is still the demo placeholder. Please paste your real anon key from the Supabase dashboard.",
      dashboard_link: `https://supabase.com/dashboard/project/xzhvvudoebxnrjdbxjye/settings/api`,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "NETWORK_ERROR",
      connected: false,
      project_url: supabaseUrl,
      error: err?.message || "Failed to reach Supabase endpoint",
    }, { status: 500 });
  }
}
