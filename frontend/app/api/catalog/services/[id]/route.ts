import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const service = dbStore.services.find(s => s.id === id);

    if (!service) {
      return NextResponse.json({ detail: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load service" }, { status: 500 });
  }
}
