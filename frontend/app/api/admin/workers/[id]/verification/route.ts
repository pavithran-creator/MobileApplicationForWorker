import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wid = parseInt(params.id, 10);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === wid || u.id === wid));
    if (!worker) {
      return NextResponse.json({ detail: "Worker not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, note = "" } = body;

    const allowed = ["VERIFIED", "REJECTED", "UNDER_REVIEW", "PENDING"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ detail: `Invalid verification status. Must be in ${allowed.join(", ")}` }, { status: 400 });
    }

    const oldStatus = worker.verification_status || "PENDING";
    worker.verification_status = status;

    // Record audit log
    dbStore.auditLogs.push({
      id: dbStore.auditLogs.length + 1,
      actor_id: 1,
      actor_name: "Cooperative Inspection Officer",
      action: "worker.verification.update",
      target: `worker:${wid}`,
      meta: `${oldStatus} -> ${status} (Note: ${note || "Verification decision"})`,
      timestamp: new Date().toISOString()
    });

    // Notify worker
    dbStore.notifications.push({
      id: dbStore.notifications.length + 1,
      user_id: worker.id,
      title: "Cooperative Verification Update",
      body: `Your cooperative credential verification status is now: ${status}.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      worker_id: wid,
      verification_status: status,
      previous_status: oldStatus
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to update worker verification" }, { status: 500 });
  }
}
