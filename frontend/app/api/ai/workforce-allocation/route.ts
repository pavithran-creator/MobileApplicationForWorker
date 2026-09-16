import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBAllocation } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceIdStr = searchParams.get("service_id");
    const serviceId = serviceIdStr ? parseInt(serviceIdStr, 10) : null;
    const area = searchParams.get("area") || "Gandhipuram & Peelamedu";
    const days = parseInt(searchParams.get("days") || "7", 10);

    const histCount = dbStore.bookings.length;
    const expected = Math.round((histCount / 60.0) * days * 1.15);
    const level = expected < 15 ? "LOW" : (expected < 30 ? "MEDIUM" : "HIGH");
    const availableWorkers = dbStore.users.filter(u => u.role === "WORKER" && u.verification_status === "VERIFIED" && (u.is_available ?? true)).length;
    const shortage = Math.max(0, expected - availableWorkers);

    const svc = serviceId ? dbStore.services.find(s => s.id === serviceId) : null;
    const serviceName = svc ? svc.name : "Electrician / General Trades";

    let recommendation = "";
    let reason = "";

    if (shortage > 0) {
      const recCount = Math.min(shortage, 5);
      recommendation = `Predicted ${level} demand of ${expected} requests against ${availableWorkers} available local verified workers. Recommend temporarily mobilizing ${recCount} verified ${serviceName} workers from neighboring RS Puram / Singanallur societies to prevent fulfillment bottlenecks.`;
      reason = `Workforce deficit of ${shortage} verified workers during projected ${days}-day service surge.`;
    } else {
      recommendation = `Local workforce of ${availableWorkers} verified workers is sufficient to meet predicted demand of ${expected} requests. No cross-society reallocation needed.`;
      reason = "Available local cooperative workers comfortably exceed projected demand.";
    }

    const allocId = dbStore.allocations.length + 1;
    const allocRecord: DBAllocation = {
      id: allocId,
      service_id: serviceId,
      service_name: serviceName,
      area,
      expected_demand: expected,
      available_workers: availableWorkers,
      shortage,
      recommendation,
      reason,
      status: "PENDING",
      created_at: new Date().toISOString()
    };
    dbStore.allocations.push(allocRecord);

    return NextResponse.json({
      allocation_id: allocRecord.id,
      service_name: serviceName,
      area,
      expected_demand: expected,
      available_workers: availableWorkers,
      shortage,
      recommendation,
      reason,
      status: "PENDING",
      governance_rule: "Administrative approval strictly required. AI will never auto-assign or move workers without human consent."
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Workforce allocation query failed" }, { status: 500 });
  }
}
