import { NextRequest, NextResponse } from "next/server";
import { matchWorkers } from "@/lib/supabase/matching";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceIdStr = searchParams.get("service_id");
    if (!serviceIdStr) {
      return NextResponse.json({ detail: "service_id is required" }, { status: 400 });
    }

    const serviceId = parseInt(serviceIdStr, 10);
    const lat = parseFloat(searchParams.get("lat") || "11.0168");
    const lng = parseFloat(searchParams.get("lng") || "76.9558");
    const scheduledDate = searchParams.get("scheduled_date") || undefined;
    const startTime = searchParams.get("start_time") || "10:00";
    const durationMin = parseInt(searchParams.get("duration_min") || "60", 10);

    const candidates = matchWorkers(serviceId, lat, lng, scheduledDate, startTime, durationMin);
    return NextResponse.json(candidates);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Matching query failed" }, { status: 500 });
  }
}
