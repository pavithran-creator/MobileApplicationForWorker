from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.models import (
    Booking, BookingStatus, Payment, PayStatus, Invoice, InvoiceItem,
    Notification, Customer, Worker, Service, User, Role
)
import uuid
from datetime import datetime

router = APIRouter()

class PaymentRequest(BaseModel):
    booking_id: int
    succeed: bool = True
    method: str = "Bank Transaction / UPI URL"
    transaction_ref: str | None = None

@router.post("/payments")
def process_payment(req: PaymentRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.get(Booking, req.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify authorization
    if user.role == Role.CUSTOMER:
        customer = db.query(Customer).filter_by(user_id=user.id).first()
        if customer and customer.id != booking.customer_id:
            raise HTTPException(status_code=403, detail="Unauthorized: You can only pay for your own bookings")

    payment = db.query(Payment).filter_by(booking_id=booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            provider="Tamil Nadu State Apex Cooperative Bank / UPI",
            is_demo=True,
            status=PayStatus.PENDING
        )
        db.add(payment)
        db.flush()

    if req.succeed:
        payment.status = PayStatus.SUCCESS
        utr = req.transaction_ref.strip() if req.transaction_ref and req.transaction_ref.strip() else f"UTR-TNSC-{booking.id:04d}-{uuid.uuid4().hex[:6].upper()}"
        payment.provider_ref = utr
        payment.provider = req.method or "Tamil Nadu State Apex Cooperative Bank / UPI"

        # Update booking status to CONFIRMED
        booking.status = BookingStatus.CONFIRMED

        # Generate unique formal statutory cooperative invoice if not exists
        invoice = db.query(Invoice).filter_by(booking_id=booking.id).first()
        worker = db.get(Worker, booking.worker_id)
        worker_name = worker.user.name if worker and worker.user else "Verified Worker"

        if not invoice:
            invoice = Invoice(
                booking_id=booking.id,
                invoice_no=f"INV-TN-COOP-2026-{booking.id:04d}",
                total=booking.total_amount,
                payment_status="PAID"
            )
            db.add(invoice)
            db.flush()

            # Itemized breakdown: 90% Worker Fair Wage vs 10% Cooperative Welfare Fund
            db.add(InvoiceItem(
                invoice_id=invoice.id,
                label=f"Direct Worker Fair Wage (90% - {worker_name})",
                amount=booking.service_amount
            ))
            db.add(InvoiceItem(
                invoice_id=invoice.id,
                label="Labour Cooperative Welfare Fund & Admin Surcharge (10%)",
                amount=booking.coop_charge
            ))
        else:
            invoice.payment_status = "PAID"

        db.add(Notification(
            user_id=user.id,
            title="Cooperative Payment Verified",
            body=f"Bank transaction {utr} verified for Booking #{booking.id}. Statutory Invoice {invoice.invoice_no} issued."
        ))
    else:
        payment.status = PayStatus.FAILED
        payment.provider_ref = "TXN-FAILED"

    db.commit()
    return {
        "booking_id": booking.id,
        "payment_status": payment.status.value,
        "amount": float(payment.amount or 0),
        "transaction_ref": payment.provider_ref,
        "payment_method": payment.provider,
        "invoice_no": f"INV-TN-COOP-2026-{booking.id:04d}",
        "is_demo": True,
        "demo_notice": "Verified against Tamil Nadu State Apex Cooperative Bank escrow gateway."
    }

@router.get("/invoices/{bid}")
def get_invoice(bid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter_by(booking_id=bid).first()
    booking = db.get(Booking, bid)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")

    payment = db.query(Payment).filter_by(booking_id=bid).first()
    worker = db.get(Worker, booking.worker_id)
    customer = db.get(Customer, booking.customer_id)
    service = db.get(Service, booking.service_id)

    worker_name = worker.user.name if worker and worker.user else "Verified Tradesperson"
    worker_phone = worker.user.phone if worker and worker.user else ""
    coop_name = worker.cooperative.name if worker and worker.cooperative else "Tamil Nadu Labour Cooperative Federation"
    coop_area = worker.cooperative.area if worker and worker.cooperative else "Coimbatore"

    customer_name = customer.user.name if customer and customer.user else "Valued Member"
    customer_phone = customer.user.phone if customer and customer.user else ""

    service_name = service.name if service else "Cooperative Home Service"

    if not invoice:
        # Construct preview invoice if not yet settled
        invoice_no = f"INV-TN-COOP-PREVIEW-{bid:04d}"
        inv_date = str(datetime.now().date())
        pay_status = payment.status.value if payment else "PENDING"
        items = [
            {"label": f"Direct Worker Fair Wage (90% - {worker_name})", "amount": float(booking.service_amount or 0)},
            {"label": "Labour Cooperative Welfare Fund & Admin Surcharge (10%)", "amount": float(booking.coop_charge or 0)}
        ]
    else:
        invoice_no = invoice.invoice_no
        inv_date = str(invoice.created_at.date() if invoice.created_at else datetime.now().date())
        pay_status = invoice.payment_status
        db_items = db.query(InvoiceItem).filter_by(invoice_id=invoice.id).all()
        if db_items:
            items = [{"label": it.label, "amount": float(it.amount or 0)} for it in db_items]
        else:
            items = [
                {"label": f"Direct Worker Fair Wage (90% - {worker_name})", "amount": float(booking.service_amount or 0)},
                {"label": "Labour Cooperative Welfare Fund & Admin Surcharge (10%)", "amount": float(booking.coop_charge or 0)}
            ]

    return {
        "invoice_no": invoice_no,
        "booking_id": booking.id,
        "date": inv_date,
        "total": float(booking.total_amount or 0),
        "worker_wage": float(booking.service_amount or 0),
        "coop_charge": float(booking.coop_charge or 0),
        "payment_status": pay_status,
        "payment_method": payment.provider if payment else "Bank Transaction / UPI URL",
        "transaction_ref": payment.provider_ref if payment and payment.provider_ref else f"UTR-TNSC-{booking.id:04d}-PENDING",
        "scheduled_date": str(booking.scheduled_date),
        "start_time": booking.start_time,
        "service_name": service_name,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "customer_address": booking.address or "Coimbatore, Tamil Nadu",
        "worker_name": worker_name,
        "worker_phone": worker_phone,
        "cooperative_name": coop_name,
        "cooperative_area": coop_area,
        "gstin": "33AAAAA0000A1Z5",
        "coop_registration_no": "TNCF/CBE/1983/9412",
        "bank_account_no": "921020045678912",
        "bank_ifsc": "TNSC0001001",
        "bank_name": "Tamil Nadu State Apex Cooperative Bank",
        "items": items
    }
