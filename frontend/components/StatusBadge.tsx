"use client";

import React from "react";
import { useLang } from "../lib/i18n";

export interface StatusBadgeProps {
  type?: "verification" | "certification" | "booking" | "payment" | "demo" | string;
  domain?: string;
  status: string;
  label?: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ type, domain, status, label: customLabel, size = "md" }: StatusBadgeProps) {
  const { t } = useLang();
  const effectiveType = type || domain || "verification";
  const norm = (status || "").toUpperCase();

  let bg = "bg-slate-100";
  let text = "text-slate-700";
  let border = "border-slate-200";
  let icon = "●";
  let label = customLabel || status;

  if (effectiveType === "verification") {
    switch (norm) {
      case "VERIFIED":
        bg = "bg-emerald-50";
        text = "text-emerald-800";
        border = "border-emerald-200";
        icon = "✓";
        label = customLabel || t("status.verified", "Cooperative Verified");
        break;
      case "UNDER_REVIEW":
        bg = "bg-amber-50";
        text = "text-amber-800";
        border = "border-amber-200";
        icon = "⏳";
        label = customLabel || t("status.under_review", "Under Review");
        break;
      case "PENDING":
        bg = "bg-yellow-50";
        text = "text-yellow-800";
        border = "border-yellow-200";
        icon = "⏱";
        label = customLabel || t("status.pending", "Verification Pending");
        break;
      case "REJECTED":
        bg = "bg-red-50";
        text = "text-red-800";
        border = "border-red-200";
        icon = "✕";
        label = customLabel || t("status.rejected", "Rejected");
        break;
      default:
        label = customLabel || status;
    }
  } else if (effectiveType === "certification") {
    switch (norm) {
      case "VERIFIED":
        bg = "bg-blue-50";
        text = "text-blue-800";
        border = "border-blue-200";
        icon = "🎓";
        label = customLabel || t("status.certified", "Certified Trade");
        break;
      case "PENDING":
        bg = "bg-amber-50";
        text = "text-amber-800";
        border = "border-amber-200";
        icon = "⏱";
        label = customLabel || t("status.cert_pending", "Cert Pending");
        break;
      default:
        bg = "bg-slate-50";
        text = "text-slate-600";
        border = "border-slate-200";
        icon = "ℹ";
        label = customLabel || t("status.uncertified", "Uncertified");
    }
  } else if (effectiveType === "booking") {
    switch (norm) {
      case "REQUESTED":
        bg = "bg-yellow-50";
        text = "text-yellow-800";
        border = "border-yellow-200";
        icon = "📩";
        label = customLabel || t("status.requested", "Requested");
        break;
      case "CONFIRMED":
        bg = "bg-blue-50";
        text = "text-blue-800";
        border = "border-blue-200";
        icon = "📅";
        label = customLabel || t("status.confirmed", "Confirmed");
        break;
      case "WORKER_ACCEPTED":
        bg = "bg-indigo-50";
        text = "text-indigo-800";
        border = "border-indigo-200";
        icon = "👍";
        label = customLabel || t("status.worker_accepted", "Worker Assigned");
        break;
      case "IN_PROGRESS":
        bg = "bg-purple-50";
        text = "text-purple-800";
        border = "border-purple-200";
        icon = "⚙";
        label = customLabel || t("status.in_progress", "In Progress");
        break;
      case "COMPLETED":
        bg = "bg-emerald-50";
        text = "text-emerald-800";
        border = "border-emerald-200";
        icon = "★";
        label = customLabel || t("status.completed", "Completed");
        break;
      case "CANCELLED":
      case "REJECTED":
        bg = "bg-slate-100";
        text = "text-slate-700";
        border = "border-slate-300";
        icon = "✕";
        label = customLabel || (norm === "CANCELLED" ? t("status.cancelled", "Cancelled") : t("status.rejected", "Declined"));
        break;
      default:
        label = customLabel || status;
    }
  } else if (effectiveType === "payment") {
    switch (norm) {
      case "SUCCESS":
      case "PAID":
        bg = "bg-emerald-50";
        text = "text-emerald-800";
        border = "border-emerald-200";
        icon = "💳";
        label = customLabel || t("status.paid", "Paid");
        break;
      case "PENDING":
        bg = "bg-yellow-50";
        text = "text-yellow-800";
        border = "border-yellow-200";
        icon = "⏱";
        label = customLabel || t("status.payment_due", "Payment Due");
        break;
      case "FAILED":
        bg = "bg-red-50";
        text = "text-red-800";
        border = "border-red-200";
        icon = "⚠";
        label = customLabel || t("status.payment_failed", "Payment Failed");
        break;
      default:
        label = customLabel || status;
    }
  } else if (effectiveType === "demo") {
    bg = "bg-amber-50";
    text = "text-amber-900";
    border = "border-amber-300";
    icon = "🧪";
    label = customLabel || t("status.demo", "Sandbox Demo");
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${text} ${border} ${padding}`}
    >
      <span className="text-[10px] select-none">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
