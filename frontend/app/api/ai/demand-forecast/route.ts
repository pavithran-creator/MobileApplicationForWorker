import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceIdStr = searchParams.get("service_id");
    const serviceId = serviceIdStr ? parseInt(serviceIdStr, 10) : null;
    const area = searchParams.get("area") || "Coimbatore Zone";
    const days = parseInt(searchParams.get("days") || "7", 10);

    let bookings = dbStore.bookings;
    if (serviceId) {
      bookings = bookings.filter(b => b.service_id === serviceId);
    }

    const histCount = bookings.length;
    let expected = 0;
    let mode = "";

    if (histCount < 10) {
      expected = Math.max(6, Math.floor(histCount / 7) + 12);
      mode = "baseline/demo forecast due to insufficient historical data";
    } else {
      expected = Math.round((histCount / 60.0) * days * 1.15);
      mode = "model-based forecast (moving average x seasonality)";
    }

    const level = expected < 15 ? "LOW" : (expected < 30 ? "MEDIUM" : "HIGH");

    // Available verified workers
    const availableWorkers = dbStore.users.filter(u => u.role === "WORKER" && u.verification_status === "VERIFIED" && (u.is_available ?? true)).length;
    const shortage = Math.max(0, expected - availableWorkers);

    const svc = serviceId ? dbStore.services.find(s => s.id === serviceId) : null;
    const serviceName = svc ? svc.name : "All Trade Services";

    return NextResponse.json({
      service_id: serviceId,
      service_name: serviceName,
      area,
      period_days: days,
      historical_bookings_60d: histCount,
      expected_requests: expected,
      level,
      available_verified_workers: availableWorkers,
      shortage,
      mode,
      forecast_id: 101
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Demand forecast failed" }, { status: 500 });
  }
}
