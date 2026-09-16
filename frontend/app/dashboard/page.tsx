"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, getAuthToken } from "../../lib/api";
import { BookingRecord, InvoiceRecord } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import InvoiceModal from "../../components/InvoiceModal";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { t } = useLang();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invoice & Payment Modal
  const [activeInvoice, setActiveInvoice] = useState<InvoiceRecord | null>(null);
  const [activeBookingForPay, setActiveBookingForPay] = useState<BookingRecord | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Rating Modal
  const [ratingBooking, setRatingBooking] = useState<BookingRecord | null>(null);
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const fetchBookings = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await request<BookingRecord[]>("/bookings");
      setBookings(data);
    } catch (err: any) {
      setErrorMsg("Failed to load bookings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Open Invoice or Payment
  const handleOpenPaymentOrInvoice = async (booking: BookingRecord) => {
    setActiveBookingForPay(booking);
    setPayError(null);

    try {
      const inv = await request<InvoiceRecord>(`/invoices/${booking.id}`);
      if (inv.payment_status === "PAID") {
        setActiveInvoice(inv);
        setShowPayModal(false);
      } else {
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        setUtrInput(`UTR-TNSC-${booking.id}-${randomSuffix}`);
        setActiveInvoice(inv);
        setShowPayModal(true);
      }
    } catch {
      // Unpaid preview
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      setUtrInput(`UTR-TNSC-${booking.id}-${randomSuffix}`);
      setActiveInvoice({
        invoice_no: `INV-TN-COOP-PREVIEW-${booking.id}`,
        booking_id: booking.id,
        date: booking.date,
        total: booking.total_amount,
        payment_status: "UNPAID",
        scheduled_date: booking.date,
        service_name: booking.service_name,
        customer_name: booking.customer_name,
        worker_name: booking.worker_name,
        items: [
          { label: t("dashboard.invoice_worker_wage", "Direct Worker Fair Wage (90%)"), amount: booking.service_amount },
          { label: t("dashboard.invoice_coop_fee", "Cooperative Welfare & Admin Surcharge (10%)"), amount: booking.coop_charge },
        ],
      });
      setShowPayModal(true);
    }
  };

  // Complete Unified Bank & UPI Payment
  const handleConfirmBankPayment = async () => {
    if (!activeBookingForPay) return;
    setPayLoading(true);
    setPayError(null);

    try {
      await request<any>("/payments", {
        method: "POST",
        body: JSON.stringify({
          booking_id: activeBookingForPay.id,
          succeed: true,
          method: "Tamil Nadu State Apex Cooperative Bank / UPI URL",
          transaction_ref: utrInput.trim() || `UTR-TNSC-${activeBookingForPay.id}-OK`,
        }),
      });

      // Refresh invoice & bookings list
      const updatedInv = await request<InvoiceRecord>(`/invoices/${activeBookingForPay.id}`);
      setShowPayModal(false);
      setActiveInvoice(updatedInv);
      fetchBookings();
    } catch (err: any) {
      setPayError("Payment verification failed: " + err.message);
    } finally {
      setPayLoading(false);
    }
  };

  // Advance Status (e.g. In Progress -> Completed)
  const handleUpdateStatus = async (bookingId: number, nextStatus: string) => {
    try {
      await request<any>(`/bookings/${bookingId}?status=${nextStatus}`, {
        method: "PATCH",
      });
      fetchBookings();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Submit Worker Rating
  const handleSubmitRating = async () => {
    if (!ratingBooking) return;
    setRatingLoading(true);

    try {
      await request<any>("/ratings", {
        method: "POST",
        body: JSON.stringify({
          booking_id: ratingBooking.id,
          worker_id: ratingBooking.worker_id,
          stars,
          feedback,
        }),
      });
      setRatingSuccess(true);
      setTimeout(() => {
        setRatingBooking(null);
        setRatingSuccess(false);
        setStars(5);
        setFeedback("");
      }, 1800);
    } catch (err: any) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  const paymentUpiUrl = activeBookingForPay
    ? `upi://pay?pa=tn.labourcoop@sbi&pn=LabourCooperativeFederation&am=${activeBookingForPay.total_amount}&tn=Booking_Ref_${activeBookingForPay.id}&cu=INR`
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              {t("doorstep.trust_2_title", "Fair Wage Pricing")}
            </span>
            <span className="text-xs text-slate-500">
              {t("doorstep.hero_badge", "Empowering 1000+ certified cooperative tradespersons")}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
            {t("dashboard.title", "My Service Bookings & Invoices")}
          </h1>
          <p className="text-slate-600 mt-1 max-w-2xl text-xs sm:text-sm">
            {t("dashboard.subtitle", "Track real-time service status, itemized transparent invoices, and submit worker reviews.")}
          </p>
        </div>
        <Link
          href="/book"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
        >
          + {t("nav.bookService", "Book a Trade Service")}
        </Link>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings List Section */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title={t("dashboard.empty_title", "No Active Bookings")}
          description={t("dashboard.empty_desc", "You haven't requested any cooperative trade services yet. Schedule certified tradespersons now.")}
          actionText={t("nav.bookService", "Book a Trade Service")}
          onAction={() => router.push("/book")}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-emerald-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-sm">
                    #{b.id}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{b.service_name}</h2>
                    <p className="text-xs text-slate-500">
                      {b.date} &bull; {b.start_time} ({b.duration_min} mins)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge type="booking" status={b.status} />
                  {b.is_emergency && <StatusBadge type="booking" status="EMERGENCY" />}
                </div>
              </div>

              {/* Booking Body Details */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {t("book.success_worker", "Assigned Tradesperson")}
                  </span>
                  <div className="font-semibold text-slate-900 mt-0.5">{b.worker_name}</div>
                  <div className="text-slate-500">{b.worker_phone}</div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {t("book.form_address", "Service Address")}
                  </span>
                  <div className="font-semibold text-slate-900 mt-0.5">{b.address}</div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    {t("book.pricing_title", "Tariff Breakdown")}
                  </span>
                  <div className="font-bold text-emerald-800 text-sm mt-0.5">₹{b.total_amount.toFixed(2)}</div>
                  <div className="text-slate-500 text-[11px]">
                    90% Worker (₹{b.service_amount.toFixed(2)}) &bull; 10% Coop (₹{b.coop_charge.toFixed(2)})
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                {b.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, "IN_PROGRESS")}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold text-xs transition-colors"
                  >
                    Start Service
                  </button>
                )}

                {b.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                  >
                    {t("dashboard.complete_service", "Complete Service")}
                  </button>
                )}

                {/* Statutory Invoice / Payment */}
                <button
                  onClick={() => handleOpenPaymentOrInvoice(b)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {t("dashboard.view_invoice", "View Invoice & Pay")}
                </button>

                {/* Rating Button */}
                {b.status === "COMPLETED" && (
                  <button
                    onClick={() => setRatingBooking(b)}
                    className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    ★ {t("dashboard.rate_service", "Rate Service")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNIFIED PAYMENT MODAL: Bank Details + Payment URL + UTR Entry */}
      {showPayModal && activeBookingForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center text-xl font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    Official Escrow Settlement
                  </h3>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Tamil Nadu Labour Cooperative Federation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {payError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {payError}
              </div>
            )}

            {/* Statutory Policy Notice (Single Way Payment Only) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🛡</span>
                <span>Statutory Cooperative Payment Rule: One Way Only</span>
              </div>
              <p className="text-[11px] text-amber-800">
                To guarantee 90% direct wage protection for tradespersons, settlement must be executed directly to the 
                Federation Escrow Bank Account via Bank Transfer or UPI Payment URL.
              </p>
            </div>

            {/* Service & Booking Details Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{activeBookingForPay.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Tradesperson:</span>
                <span className="font-bold text-slate-900">{activeBookingForPay.worker_name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-700">Total Settled Amount:</span>
                <span className="text-emerald-800 text-base">₹{activeBookingForPay.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Unified Method: Bank Account & Payment URL */}
            <div className="space-y-3">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Official Cooperative Bank &amp; UPI Details:
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="font-bold text-amber-300">TN Labour Coop Federation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Name:</span>
                  <span>TN State Apex Coop Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account No:</span>
                  <span className="font-bold text-emerald-400">921020045678912</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IFSC Code:</span>
                  <span className="font-bold text-emerald-400">TNSC0001001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI VPA:</span>
                  <span className="font-bold text-cyan-300">tn.labourcoop@sbi</span>
                </div>
              </div>

              {/* Direct UPI Payment URL Link */}
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={paymentUpiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>🔗</span>
                  <span>Open UPI / Payment URL</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(paymentUpiUrl);
                    alert("Payment URL copied to clipboard!");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Bank Transaction Reference (UTR) Entry */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Transaction Reference / UTR Number:
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. UTR-TNSC-984210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your bank transfer UTR or UPI transaction reference for instant statutory audit clearance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmBankPayment}
                disabled={payLoading || !utrInput.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
              >
                {payLoading ? "Verifying Transaction..." : "Verify & Issue Statutory Invoice"}
              </button>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTED STATUTORY COOPERATIVE INVOICE MODAL */}
      {activeInvoice && !showPayModal && (
        <InvoiceModal
          invoice={activeInvoice}
          onClose={() => {
            setActiveInvoice(null);
            setActiveBookingForPay(null);
          }}
        />
      )}

      {/* 1-5 Star Rating & Review Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  {t("dashboard.rate_modal_title", "Rate Worker & Cooperative Service")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("book.success_worker", "Technician")}: {ratingBooking.worker_name} &bull; {ratingBooking.service_name}
                </p>
              </div>
              <button
                onClick={() => setRatingBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {ratingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-3xl">✓</div>
                <div className="font-bold text-slate-900 text-sm">{t("common.success", "Operation completed successfully.")}</div>
                <div className="text-xs text-slate-500">
                  {t("book.rating", "Rating")} &bull; {t("status.verified", "Cooperative Verified")}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t("dashboard.rate_select_stars", "Select Star Rating")}
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStars(num)}
                        className={`text-3xl transition-transform hover:scale-110 ${
                          num <= stars ? "text-amber-400" : "text-slate-200"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-amber-700">
                    {stars === 5 ? "Exceptional Craftsmanship" : stars === 4 ? "Very Good" : stars === 3 ? "Satisfactory" : "Needs Improvement"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {t("dashboard.rate_feedback_label", "Your Review & Feedback")}
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t("dashboard.rate_feedback_placeholder", "Describe the quality of service, punctuality, and professionalism...")}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  onClick={handleSubmitRating}
                  disabled={ratingLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {ratingLoading ? t("dashboard.rate_submitting", "Submitting...") : t("dashboard.rate_submit", "Submit Review")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
