import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const list = dbStore.allocations.slice().reverse().slice(0, 20);
    const out = list.map(r => ({
      id: r.id,
      service_name: r.service_name,
      area: r.area,
      expected_demand: r.expected_demand,
      available_workers: r.available_workers,
      shortage: r.shortage,
      recommendation: r.recommendation,
      reason: r.reason,
      status: r.status,
      created_at: new Date(r.created_at).toISOString().replace("T", " ").substring(0, 16)
    }));

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load recommendations" }, { status: 500 });
  }
}
