import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bid = parseInt(params.id, 10);
    const booking = dbStore.bookings.find(b => b.id === bid);
    if (!booking) {
      return NextResponse.json({ detail: "Booking record not found" }, { status: 404 });
    }

    const invoice = dbStore.invoices.find(i => i.booking_id === bid);
    const payment = dbStore.payments.find(p => p.booking_id === bid);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === booking.worker_id || u.id === booking.worker_id));
    const customer = dbStore.users.find(u => u.role === "CUSTOMER" && (u.customer_id === booking.customer_id || u.id === booking.customer_id));
    const service = dbStore.services.find(s => s.id === booking.service_id);

    const workerName = worker ? worker.name : "Verified Tradesperson";
    const workerPhone = worker ? worker.phone : "";
    const coopName = worker?.cooperative || "Gandhipuram Labour Cooperative Society";
    const coopArea = worker?.address || "Coimbatore";

    const customerName = customer ? customer.name : "Valued Member";
    const customerPhone = customer ? customer.phone : "";
    const serviceName = service ? service.name : "Cooperative Home Service";

    const invoiceNo = invoice ? invoice.invoice_no : `INV-TN-COOP-PREVIEW-${bid.toString().padStart(4, "0")}`;
    const invDate = invoice ? invoice.created_at.split("T")[0] : new Date().toISOString().split("T")[0];
    const payStatus = invoice ? invoice.payment_status : (payment ? payment.status : "UNPAID");

    const items = invoice && invoice.items ? invoice.items : [
      { label: `Direct Worker Fair Wage (90% - ${workerName})`, amount: booking.service_amount },
      { label: "Labour Cooperative Welfare Fund & Admin Surcharge (10%)", amount: booking.coop_charge }
    ];

    return NextResponse.json({
      invoice_no: invoiceNo,
      booking_id: booking.id,
      date: invDate,
      total: booking.total_amount,
      worker_wage: booking.service_amount,
      coop_charge: booking.coop_charge,
      payment_status: payStatus,
      payment_method: payment ? payment.provider : "Tamil Nadu State Apex Cooperative Bank / UPI",
      transaction_ref: payment ? payment.provider_ref : `UTR-TNSC-${booking.id.toString().padStart(4, "0")}-PENDING`,
      scheduled_date: booking.scheduled_date,
      start_time: booking.start_time,
      service_name: serviceName,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: booking.address || "Coimbatore, Tamil Nadu",
      worker_name: workerName,
      worker_phone: workerPhone,
      cooperative_name: coopName,
      cooperative_area: coopArea,
      gstin: "33AAAAA0000A1Z5",
      coop_registration_no: "TNCF/CBE/1983/9412",
      bank_account_no: "921020045678912",
      bank_ifsc: "TNSC0001001",
      bank_name: "Tamil Nadu State Apex Cooperative Bank",
      items
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to retrieve invoice" }, { status: 500 });
  }
}
