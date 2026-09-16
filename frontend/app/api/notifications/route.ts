import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const notes = dbStore.notifications.slice().reverse().slice(0, 30);
    const out = notes.map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      is_read: n.is_read,
      date: new Date(n.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }));

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load notifications" }, { status: 500 });
  }
}
