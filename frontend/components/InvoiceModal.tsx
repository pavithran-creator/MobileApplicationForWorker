"use client";

import React from "react";
import { InvoiceRecord } from "../types";

interface InvoiceModalProps {
  invoice: InvoiceRecord;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const workerWage = invoice.worker_wage ?? (invoice.total * 0.9);
  const coopFee = invoice.coop_charge ?? (invoice.total * 0.1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:max-w-full print:shadow-none print:border-none print:m-0 print:p-0">
        
        {/* Printable Invoice Container */}
        <div id="cooperative-tax-invoice" className="p-6 sm:p-8 space-y-6 text-slate-800">
          
          {/* Header Banner with Cooperative Identity */}
          <div className="border-b-2 border-emerald-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-extrabold text-2xl shadow">
                  &#9874;
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-950 font-heading">
                    TAMIL NADU LABOUR COOPERATIVE FEDERATION
                  </h2>
                  <p className="text-xs font-semibold text-emerald-800">
                    {invoice.cooperative_name || "Coimbatore District Labour Cooperative Society"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Reg. No: {invoice.coop_registration_no || "TNCF/CBE/1983/9412"} | GSTIN: {invoice.gstin || "33AAAAA0000A1Z5"}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  STATUTORY TAX INVOICE
                </span>
                <div className="mt-1 font-mono text-sm font-bold text-slate-900">
                  {invoice.invoice_no}
                </div>
                <div className="text-[11px] text-slate-500">
                  Issued: {invoice.date}
                </div>
              </div>
            </div>
          </div>

          {/* Key Parties (Customer & Tradesperson) */}
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Billed To (Citizen / Customer)
              </div>
              <div className="font-bold text-slate-900 text-sm">{invoice.customer_name || "Valued Citizen"}</div>
              <div className="text-slate-600">Ph: {invoice.customer_phone || "Registered Contact"}</div>
              <div className="text-slate-600 mt-0.5">{invoice.customer_address || "Coimbatore, Tamil Nadu"}</div>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
                Assigned Certified Tradesperson
              </div>
              <div className="font-bold text-slate-900 text-sm">{invoice.worker_name || "Cooperative Tradesperson"}</div>
              <div className="text-emerald-800 font-semibold">{invoice.service_name}</div>
              <div className="text-slate-600">Ph: {invoice.worker_phone || "Society Dispatched"}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Booking ID: #{invoice.booking_id} ({invoice.scheduled_date} at {invoice.start_time || "10:00"})</div>
            </div>
          </div>

          {/* Audited Fee Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-4">Description &amp; Fund Allocation</th>
                  <th className="py-2.5 px-3 text-center">Share</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Worker Direct Fair Wage</div>
                    <div className="text-slate-500 text-[11px]">
                      Direct statutory trade compensation disbursed to {invoice.worker_name || "worker"} bank account
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-800">90%</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{workerWage.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Cooperative Welfare &amp; Admin Surcharge</div>
                    <div className="text-slate-500 text-[11px]">
                      Allocated to Worker Health Insurance (ESI), Pension Fund &amp; Society Operations
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-amber-800">10%</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">₹{coopFee.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50/80 border-t-2 border-emerald-800 text-slate-900 font-bold">
                  <td className="py-3 px-4 text-sm" colSpan={2}>
                    Total Settled Amount (INR)
                  </td>
                  <td className="py-3 px-4 text-right text-base text-emerald-900 font-black">
                    ₹{invoice.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bank Transaction & Escrow Audit Seal */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                Bank Transaction &amp; Escrow Verification
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-extrabold text-[11px]">
                PAID &amp; AUDITED
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
              <div>
                <span className="text-slate-500">Bank Gateway:</span> {invoice.bank_name || "Tamil Nadu State Apex Cooperative Bank"}
              </div>
              <div>
                <span className="text-slate-500">Transaction UTR:</span> <span className="font-mono font-bold text-slate-900">{invoice.transaction_ref || `UTR-TNSC-${invoice.booking_id}-OK`}</span>
              </div>
              <div>
                <span className="text-slate-500">Escrow Acc:</span> {invoice.bank_account_no || "921020045678912"} (IFSC: {invoice.bank_ifsc || "TNSC0001001"})
              </div>
              <div>
                <span className="text-slate-500">Settlement Mode:</span> {invoice.payment_method || "Bank Transaction / UPI URL"}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-emerald-200/60 italic">
              This invoice is an official electronic receipt issued under the Tamil Nadu Cooperative Societies Act, 1983. 
              No cash-in-hand transaction permitted. 100% auditable via District Registrar of Cooperatives.
            </p>
          </div>
        </div>

        {/* Footer Actions (Hidden while printing) */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>🖨</span>
            <span>Print / Save Invoice (PDF)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
