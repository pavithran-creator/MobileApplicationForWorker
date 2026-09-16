import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";
import { workerFree } from "@/lib/supabase/matching";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bid = parseInt(params.id, 10);
    const booking = dbStore.bookings.find(b => b.id === bid);
    if (!booking) {
      return NextResponse.json({ detail: "Booking not found" }, { status: 404 });
    }

    const svc = dbStore.services.find(s => s.id === booking.service_id);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === booking.worker_id || u.id === booking.worker_id));
    const customer = dbStore.users.find(u => u.role === "CUSTOMER" && (u.customer_id === booking.customer_id || u.id === booking.customer_id));

    return NextResponse.json({
      id: booking.id,
      service_name: svc ? svc.name : "Cooperative Service",
      worker_name: worker ? worker.name : "Verified Worker",
      worker_phone: worker ? worker.phone : "",
      customer_name: customer ? customer.name : "Customer",
      date: booking.scheduled_date,
      start_time: booking.start_time,
      duration_min: booking.duration_min,
      status: booking.status,
      is_emergency: booking.is_emergency,
      total_amount: booking.total_amount,
      service_amount: booking.service_amount,
      coop_charge: booking.coop_charge,
      address: booking.address,
      description: booking.description
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to retrieve booking" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bid = parseInt(params.id, 10);
    const booking = dbStore.bookings.find(b => b.id === bid);
    if (!booking) {
      return NextResponse.json({ detail: "Booking not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    let nextStatus = searchParams.get("status");
    if (!nextStatus) {
      try {
        const body = await req.json();
        nextStatus = body.status;
      } catch {
        // no body provided
      }
    }

    if (!nextStatus) {
      return NextResponse.json({ detail: "status query param or body required" }, { status: 400 });
    }

    const allowed = ["REQUESTED", "CONFIRMED", "WORKER_ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json({ detail: `Invalid status. Must be one of: ${allowed.join(", ")}` }, { status: 400 });
    }

    // If confirming or accepting, ensure no double booking conflict
    if (nextStatus === "CONFIRMED" || nextStatus === "WORKER_ACCEPTED") {
      const isFree = workerFree(booking.worker_id, booking.scheduled_date, booking.start_time, booking.duration_min, booking.id);
      if (!isFree) {
        return NextResponse.json({
          detail: "Cannot confirm: worker has a conflicting booking in this time slot"
        }, { status: 409 });
      }
    }

    const previousStatus = booking.status;
    booking.status = nextStatus;

    // Track in audit / notifications if completed
    if (nextStatus === "COMPLETED") {
      dbStore.notifications.push({
        id: dbStore.notifications.length + 1,
        user_id: booking.customer_id,
        title: "Service Completed",
        body: `Booking #${booking.id} has been marked as completed. Please submit your feedback and rating.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      id: booking.id,
      status: booking.status,
      previous_status: previousStatus
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to update booking status" }, { status: 500 });
  }
}
