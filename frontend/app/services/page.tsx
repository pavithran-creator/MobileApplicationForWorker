"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request } from "../../lib/api";
import { ServiceItem, ServiceCategory } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import {
  LocationItem,
  DEFAULT_LOCATION,
  getStoredLocation,
  extractFastGps,
  LOCATION_UPDATED_EVENT,
} from "../../lib/locations";

export default function ServicesPage() {
  const { t } = useLang();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fast GPS location state
  const [activeLocation, setActiveLocation] = useState<LocationItem>(() => {
    const cached = getStoredLocation();
    return cached?.location || DEFAULT_LOCATION;
  });
  const [activeAddress, setActiveAddress] = useState<string>(() => {
    const cached = getStoredLocation();
    return cached?.address || DEFAULT_LOCATION.name;
  });
  const [isGpsDetected, setIsGpsDetected] = useState<boolean>(() => !!getStoredLocation());
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    const handleLocUpdate = (e: any) => {
      if (e.detail?.location) {
        setActiveLocation(e.detail.location);
        setActiveAddress(e.detail.address);
        setIsGpsDetected(true);
      }
    };
    window.addEventListener(LOCATION_UPDATED_EVENT, handleLocUpdate);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, handleLocUpdate);
  }, []);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    try {
      const res = await extractFastGps();
      setActiveLocation(res.location);
      setActiveAddress(res.address);
      setIsGpsDetected(true);
    } catch (err) {
      console.warn("GPS extraction error in services:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  useEffect(() => {
    Promise.all([
      request<ServiceItem[]>("/catalog/services").catch(() => []),
      request<ServiceCategory[]>("/catalog/categories").catch(() => []),
    ])
      .then(([srvs, cats]) => {
        setServices(Array.isArray(srvs) ? srvs : []);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => {
        console.error("Error loading services:", err);
        setServices([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCat === "all" || s.category_id === selectedCat;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            {t("doorstep.trust_2_title", "Transparent Pricing")}
          </span>
          <span className="text-xs text-slate-500">
            {t("doorstep.trust_2_desc", "Upfront standard rates with zero hidden surge or extra charges.")}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
          {t("services.title", "Browse Verified Trade Services")}
        </h1>
        <p className="text-slate-600 mt-2 max-w-3xl">
          {t("services.subtitle", "Cooperative-verified tradespeople with transparent statutory pricing and 30-day work assurance.")}
        </p>
      </div>

      {/* Wage Transparency Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xl font-bold">
            ₹
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">
              {t("doorstep.trust_2_title", "Transparent Pricing")} &bull; {t("footer.fair_wages", "Fair Living Wages")}
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              {t("app.subtitle", "Cooperative-owned digital service marketplace providing verified household and community trade services with fair wages, worker welfare, and consumer trust.")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-200/80 text-emerald-900">
            {t("doorstep.trust_2_desc", "Zero surge charges")}
          </span>
        </div>
      </div>

      {/* Fast GPS Location & Nearby Hub Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Service Hub & Nearby Workers:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isGpsDetected ? "⚡ GPS Extracted" : "Cooperative Node"}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {activeAddress || activeLocation.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectGps}
          disabled={detectingGps}
          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          {detectingGps ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Extracting GPS...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {isGpsDetected ? "Refresh GPS" : "Extract My GPS"}
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCat === "all"
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("services.all", "All Services")} ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCat === cat.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder={t("services.search_placeholder", "Search by service title, work scope, or trade...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          title={t("services.no_results", "No services found matching your criteria")}
          description={t("common.empty", "No records found.")}
          actionText={t("services.clear_filters", "Clear filters")}
          onAction={() => {
            setSelectedCat("all");
            setSearch("");
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {service.name}
                  </h2>
                  {service.requires_certification ? (
                    <StatusBadge
                      type="certification"
                      status="VERIFIED"
                    />
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {t("status.certified", "Standard Trade")}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  {service.description}
                </p>

                {/* Pricing Breakdown Breakdown */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-2 mb-6 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>{t("payment.total", "Total Payable Amount")}:</span>
                    <span className="font-bold text-slate-900">₹{service.base_price}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-800 font-medium">
                    <span>&bull; {t("dashboard.invoice_worker_wage", "Direct Worker Fair Wage (90%)")}:</span>
                    <span>₹{service.worker_earning}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>&bull; {t("dashboard.invoice_coop_fee", "Cooperative Welfare & Ops Surcharge (10%)")}:</span>
                    <span>₹{service.coop_charge}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/book?service=${service.id}&lat=${activeLocation.lat}&lng=${activeLocation.lng}&address=${encodeURIComponent(activeAddress || activeLocation.name)}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  {t("services.book_now", "Book Service")} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
