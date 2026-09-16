"use client";

import React from "react";
import { useLang } from "../lib/i18n";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{t("footer.trusted_network", "Trusted Home Services Network")}</span>
        </div>
        <div className="flex gap-4">
          <span>{t("footer.fair_wages", "Fair Living Wages")}</span>
          <span>&bull;</span>
          <span>{t("footer.transparent_pricing", "Transparent Upfront Pricing")}</span>
          <span>&bull;</span>
          <span>{t("footer.secure_payments", "Secure Online & UPI Payments")}</span>
        </div>
      </div>
    </footer>
  );
}
