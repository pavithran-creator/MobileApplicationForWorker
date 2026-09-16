import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(dbStore.cooperatives);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load cooperatives" }, { status: 500 });
  }
}
