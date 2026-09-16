import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBBooking } from "@/lib/supabase/store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eid = parseInt(params.id, 10);
    const body = await req.json();
    const { worker_id, address = "Gandhipuram, Coimbatore" } = body;

    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === worker_id || u.id === worker_id));
    if (!worker) {
      return NextResponse.json({ detail: "Worker unavailable or not verified" }, { status: 400 });
    }

    const defaultService = dbStore.services[0];
    const basePrice = defaultService.base_price;
    const workerWage = defaultService.worker_earning;
    const coopFee = defaultService.coop_charge;

    const todayStr = new Date().toISOString().split("T")[0];
    const nowHours = new Date().getHours().toString().padStart(2, "0");
    const nowMins = new Date().getMinutes().toString().padStart(2, "0");
    const nowTime = `${nowHours}:${nowMins}`;

    const newBookingId = ++dbStore.bookingCounter;
    const booking: DBBooking = {
      id: newBookingId,
      customer_id: 1,
      worker_id: worker.worker_id || worker.id,
      service_id: defaultService.id,
      scheduled_date: todayStr,
      start_time: nowTime,
      duration_min: 60,
      lat: 11.0168,
      lng: 76.9558,
      address,
      description: "[EMERGENCY ON-DEMAND DISPATCH]",
      is_emergency: true,
      status: "WORKER_ACCEPTED",
      service_amount: workerWage,
      coop_charge: coopFee,
      total_amount: basePrice,
      created_at: new Date().toISOString()
    };
    dbStore.bookings.push(booking);

    // Notify worker
    dbStore.notifications.push({
      id: dbStore.notifications.length + 1,
      user_id: worker.id,
      title: "URGENT: Emergency On-Demand Dispatch",
      body: `Emergency booking #${booking.id} dispatched to your location: ${address}. Proceed immediately.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      status: "DISPATCHED",
      emergency_id: eid,
      booking_id: booking.id,
      worker_name: worker.name,
      worker_phone: worker.phone,
      cooperative: worker.cooperative,
      eta_minutes: 25,
      message: `Worker ${worker.name} successfully dispatched for emergency service.`
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Emergency dispatch failed" }, { status: 500 });
  }
}
