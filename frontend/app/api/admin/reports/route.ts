import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const statusCounts: Record<string, number> = {};
    for (const b of dbStore.bookings) {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    }

    const bookingsByStatus = Object.entries(statusCounts).map(([k, v]) => ({ [k]: v }));
    const successfulPayments = dbStore.payments.filter(p => p.status === "SUCCESS");
    const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const cooperatives = dbStore.cooperatives.map(c => {
      const workerCount = dbStore.users.filter(u => u.role === "WORKER" && u.cooperative_id === c.id).length;
      return {
        id: c.id,
        name: c.name,
        workers: workerCount
      };
    });

    return NextResponse.json({
      bookings_by_status: bookingsByStatus,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      cooperatives
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to generate admin reports" }, { status: 500 });
  }
}
