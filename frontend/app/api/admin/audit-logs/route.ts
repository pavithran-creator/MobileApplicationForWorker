import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = dbStore.auditLogs.slice().reverse().slice(0, limit);
    const out = logs.map(l => ({
      id: l.id,
      actor_id: l.actor_id,
      actor_name: l.actor_name,
      action: l.action,
      target: l.target,
      meta: l.meta,
      timestamp: new Date(l.timestamp).toISOString().replace("T", " ").substring(0, 19)
    }));

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load audit logs" }, { status: 500 });
  }
}
