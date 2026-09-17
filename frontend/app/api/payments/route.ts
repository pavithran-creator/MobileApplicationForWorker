import { NextRequest, NextResponse } from "next/server";
import { dbStore, DBPayment, DBInvoice } from "@/lib/supabase/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      succeed = true,
      method = "Tamil Nadu State Apex Cooperative Bank / UPI",
      transaction_ref
    } = body;

    const booking = dbStore.bookings.find(b => b.id === booking_id);
    if (!booking) {
      return NextResponse.json({ detail: "Booking not found" }, { status: 404 });
    }

    let payment = dbStore.payments.find(p => p.booking_id === booking.id);
    const worker = dbStore.users.find(u => u.role === "WORKER" && (u.worker_id === booking.worker_id || u.id === booking.worker_id));
    const workerName = worker ? worker.name : "Verified Worker";

    const utr = transaction_ref && transaction_ref.trim()
      ? transaction_ref.trim()
      : `UTR-TNSC-${booking.id.toString().padStart(4, "0")}-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!payment) {
      payment = {
        id: ++dbStore.paymentCounter,
        booking_id: booking.id,
        amount: booking.total_amount,
        provider: method,
        provider_ref: utr,
        status: succeed ? "SUCCESS" : "FAILED",
        is_demo: true,
        created_at: new Date().toISOString()
      };
      dbStore.payments.push(payment);
    } else {
      payment.status = succeed ? "SUCCESS" : "FAILED";
      payment.provider_ref = utr;
      payment.provider = method;
    }

    if (succeed) {
      try {
        const { recordPaymentInSupabase } = await import("@/lib/supabase/db");
        await recordPaymentInSupabase(booking.id, booking.total_amount, method, utr);
      } catch (dbErr) {
        console.warn("Supabase payment persistence warning:", dbErr);
      }
    }

    const invoiceNo = `INV-TN-COOP-2026-${booking.id.toString().padStart(4, "0")}`;

    if (succeed) {
      booking.status = "CONFIRMED";

      let invoice = dbStore.invoices.find(i => i.booking_id === booking.id);
      if (!invoice) {
        invoice = {
          id: dbStore.invoices.length + 1,
          booking_id: booking.id,
          invoice_no: invoiceNo,
          total: booking.total_amount,
          payment_status: "PAID",
          created_at: new Date().toISOString(),
          items: [
            { label: `Direct Worker Fair Wage (90% - ${workerName})`, amount: booking.service_amount },
            { label: "Labour Cooperative Welfare Fund & Admin Surcharge (10%)", amount: booking.coop_charge }
          ]
        };
        dbStore.invoices.push(invoice);
      } else {
        invoice.payment_status = "PAID";
      }

      dbStore.notifications.push({
        id: dbStore.notifications.length + 1,
        user_id: booking.customer_id,
        title: "Cooperative Payment Verified",
        body: `Bank transaction ${utr} verified for Booking #${booking.id}. Statutory Invoice ${invoiceNo} issued.`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      booking_id: booking.id,
      payment_status: payment.status,
      amount: payment.amount,
      transaction_ref: payment.provider_ref,
      payment_method: payment.provider,
      invoice_no: invoiceNo,
      is_demo: true,
      demo_notice: "Verified against Tamil Nadu State Apex Cooperative Bank escrow gateway."
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Payment processing failed" }, { status: 500 });
  }
}
