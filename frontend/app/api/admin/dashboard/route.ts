import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(req: NextRequest) {
  try {
    const workers = dbStore.users.filter(u => u.role === "WORKER");
    const totalWorkers = workers.length;
    const verifiedWorkers = workers.filter(w => w.verification_status === "VERIFIED").length;
    const pendingWorkers = workers.filter(w => w.verification_status !== "VERIFIED").length;
    const availableWorkers = workers.filter(w => (w.is_available ?? true) && w.verification_status === "VERIFIED").length;

    const activeStatuses = ["REQUESTED", "CONFIRMED", "WORKER_ACCEPTED", "IN_PROGRESS"];
    const activeBookings = dbStore.bookings.filter(b => activeStatuses.includes(b.status)).length;
    const completedBookings = dbStore.bookings.filter(b => b.status === "COMPLETED").length;
    const emergencyOpen = dbStore.bookings.filter(b => b.is_emergency && activeStatuses.includes(b.status)).length;

    const successfulPayments = dbStore.payments.filter(p => p.status === "SUCCESS");
    const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const ratings = dbStore.ratings;
    const avgRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length) : 4.8;

    return NextResponse.json({
      total_workers: totalWorkers,
      verified_workers: verifiedWorkers,
      pending_verification: pendingWorkers,
      available_workers: availableWorkers,
      active_bookings: activeBookings,
      completed_bookings: completedBookings,
      emergency_requests_open: emergencyOpen,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      avg_platform_rating: Math.round(avgRating * 10) / 10
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to load dashboard KPIs" }, { status: 500 });
  }
}
