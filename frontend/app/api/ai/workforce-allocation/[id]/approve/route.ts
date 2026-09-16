import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aid = parseInt(params.id, 10);
    const alloc = dbStore.allocations.find(a => a.id === aid);
    if (!alloc) {
      return NextResponse.json({ detail: "Recommendation not found" }, { status: 404 });
    }

    alloc.status = "APPROVED";

    dbStore.auditLogs.push({
      id: dbStore.auditLogs.length + 1,
      actor_id: 1,
      actor_name: "Cooperative Administrator",
      action: "ai.allocation.approved",
      target: `allocation:${aid}`,
      meta: `Approved workforce allocation for ${alloc.service_name} (${alloc.area})`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      id: aid,
      status: "APPROVED",
      message: "Workforce allocation recommendation approved by cooperative admin"
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to approve allocation" }, { status: 500 });
  }
}
