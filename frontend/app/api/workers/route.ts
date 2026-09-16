import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coopId = searchParams.get("cooperative_id");

    let workers = dbStore.users.filter(u => u.role === "WORKER");
    if (coopId) {
      const cid = parseInt(coopId, 10);
      workers = workers.filter(w => w.cooperative_id === cid);
    }

    const out = workers.map(w => ({
      id: w.worker_id || w.id,
      name: w.name,
      phone: w.phone,
      cooperative_name: w.cooperative || "Labour Cooperative",
      cooperative_id: w.cooperative_id || 1,
      verification_status: w.verification_status || "VERIFIED",
      is_available: w.is_available ?? true,
      avg_rating: w.avg_rating || 4.8,
      rating_count: w.rating_count || 10,
      experience_years: w.experience_years || 5.0,
      skills: w.skills || ["Electrical repair"],
      base_lat: 11.0168,
      base_lng: 76.9558,
      service_radius_km: 30.0,
    }));

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to list workers" }, { status: 500 });
  }
}
