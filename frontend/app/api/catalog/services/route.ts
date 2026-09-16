import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");

    let services = dbStore.services;
    if (categoryId) {
      const cid = parseInt(categoryId, 10);
      services = services.filter(s => s.category_id === cid);
    }

    return NextResponse.json(services);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load services" }, { status: 500 });
  }
}
