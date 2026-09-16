import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nid = parseInt(params.id, 10);
    const note = dbStore.notifications.find(n => n.id === nid);
    if (note) {
      note.is_read = true;
    }
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to mark notification as read" }, { status: 500 });
  }
}
