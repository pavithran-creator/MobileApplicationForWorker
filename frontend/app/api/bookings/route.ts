import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBBooking } from "@/lib/supabase/store";
import { workerFree } from "@/lib/supabase/matching";

function getUserIdFromAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (token.startsWith("sb-token-")) {
    const parts = token.split("-");
    const uid = parseInt(parts[2], 10);
    return dbStore.users.find(u => u.id === uid) || null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = getUserIdFromAuth(req);
    let list = dbStore.bookings;

    if (currentUser) {
      if (currentUser.role === "CUSTOMER") {
        const cid = currentUser.customer_id || currentUser.id;
        list = list.filter(b => b.customer_id === cid);
      } else if (currentUser.role === "WORKER") {
        const wid = currentUser.worker_id || currentUser.id;
        list = list.filter(b => b.worker_id === wid);
      }
    }

    const out = list.slice().reverse().map(b => {
      const svc = dbStore.services.find(s => s.id === b.service_id);
      const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === b.worker_id || u.id === b.worker_id));
      const customer = dbStore.users.find(u => u.role === "CUSTOMER" && (u.customer_id === b.customer_id || u.id === b.customer_id));

      return {
        id: b.id,
        service_name: svc ? svc.name : `Service #${b.service_id}`,
        worker_id: b.worker_id,
        worker_name: worker ? worker.name : "Verified Worker",
        worker_phone: worker ? worker.phone : "",
        customer_id: b.customer_id,
        customer_name: customer ? customer.name : "Customer",
        date: b.scheduled_date,
        start_time: b.start_time,
        duration_min: b.duration_min,
        status: b.status,
        is_emergency: b.is_emergency,
        total_amount: b.total_amount,
        service_amount: b.service_amount,
        coop_charge: b.coop_charge,
        address: b.address
      };
    });

    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      worker_id,
      service_id,
      scheduled_date,
      start_time,
      duration_min = 60,
      lat = 11.0168,
      lng = 76.9558,
      address = "",
      description = "",
      is_emergency = false
    } = body;

    const currentUser = getUserIdFromAuth(req);
    const customer = currentUser?.role === "CUSTOMER" ? currentUser : (dbStore.users.find(u => u.role === "CUSTOMER") || dbStore.users[3]);

    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === worker_id || u.id === worker_id));
    if (!worker) {
      return NextResponse.json({ detail: "Requested worker not found or invalid" }, { status: 400 });
    }

    // STRICT: Double booking prevention & schedule conflict check
    const isFree = workerFree(worker.worker_id || worker.id, scheduled_date, start_time, duration_min);
    if (!isFree) {
      return NextResponse.json({
        detail: "Conflict: Worker is already booked for an overlapping time window. Please select another slot."
      }, { status: 409 });
    }

    const svc = dbStore.services.find(s => s.id === service_id);
    const basePrice = svc ? svc.base_price : 350;
    const workerWage = svc ? svc.worker_earning : Math.round(basePrice * 0.9);
    const coopFee = svc ? svc.coop_charge : (basePrice - workerWage);

    const newBookingId = ++dbStore.bookingCounter;
    const newBooking: DBBooking = {
      id: newBookingId,
      customer_id: customer.customer_id || customer.id,
      worker_id: worker.worker_id || worker.id,
      service_id,
      scheduled_date,
      start_time,
      duration_min,
      lat,
      lng,
      address: address || customer.address || "Coimbatore, Tamil Nadu",
      description,
      status: "REQUESTED",
      is_emergency,
      service_amount: workerWage,
      coop_charge: coopFee,
      total_amount: basePrice,
      created_at: new Date().toISOString()
    };

    dbStore.bookings.push(newBooking);

    // Add notification for worker
    dbStore.notifications.push({
      id: dbStore.notifications.length + 1,
      user_id: worker.id,
      title: "New Service Booking Request",
      body: `New booking #${newBooking.id} requested for ${newBooking.scheduled_date} at ${newBooking.start_time}.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      id: newBooking.id,
      status: newBooking.status,
      scheduled_date: newBooking.scheduled_date,
      start_time: newBooking.start_time,
      duration_min: newBooking.duration_min,
      total_amount: newBooking.total_amount,
      worker_name: worker.name,
      service_name: svc ? svc.name : "Cooperative Trade Service"
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to create booking" }, { status: 500 });
  }
}
