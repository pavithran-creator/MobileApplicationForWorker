"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "../lib/i18n";
import { request } from "../lib/api";
import { ServiceItem } from "../types";

export default function HomePage() {
  const { t } = useLang();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<ServiceItem[]>("/catalog/services")
      .then((data) => setServices(data))
      .catch((err) => console.error("Error loading services:", err))
      .finally(() => setLoading(false));
  }, []);

  // ONLY our actual offered services with real category links and arrival targets
  const offeredServices = [
    {
      id: "emergency",
      titleKey: "doorstep.srv.emergency",
      defaultTitle: "24/7 Emergency",
      etaMinutes: 15,
      icon: (
        <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: "/emergency",
    },
    {
      id: "electrical",
      titleKey: "doorstep.srv.electrician",
      defaultTitle: "Electrician",
      etaMinutes: 30,
      icon: (
        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      href: "/book?service=1",
    },
    {
      id: "plumbing",
      titleKey: "doorstep.srv.plumber",
      defaultTitle: "Plumber",
      etaMinutes: 30,
      icon: (
        <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      href: "/book?service=3",
    },
    {
      id: "carpentry",
      titleKey: "doorstep.srv.carpenter",
      defaultTitle: "Carpenter",
      etaMinutes: 45,
      icon: (
        <svg className="w-7 h-7 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      href: "/book?service=5",
    },
    {
      id: "painting",
      titleKey: "doorstep.srv.painting",
      defaultTitle: "House Painting",
      icon: (
        <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      href: "/book?service=6",
    },
    {
      id: "driving",
      titleKey: "doorstep.srv.driver",
      defaultTitle: "Driver on Demand",
      etaMinutes: 45,
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      href: "/book?service=7",
    },
    {
      id: "cleaning",
      titleKey: "doorstep.srv.cleaning",
      defaultTitle: "Home Cleaning",
      etaMinutes: 45,
      icon: (
        <svg className="w-7 h-7 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      href: "/book?service=8",
    },
    {
      id: "caregiving",
      titleKey: "doorstep.srv.caregiving",
      defaultTitle: "Elderly Care",
      icon: (
        <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      href: "/book?service=10",
    },
  ];

  // Verified Trade Packages (Our actual services)
  const tradePackages = [
    {
      titleKey: "doorstep.pkg.wiring",
      defaultTitle: "Full House Wiring Inspection",
      isNew: true,
      price: "₹900",
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      href: "/book?service=2",
    },
    {
      titleKey: "doorstep.pkg.plumbing",
      defaultTitle: "Bathroom Plumbing Overhaul",
      isNew: false,
      price: "₹1200",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: "/book?service=4",
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#FAFAFA]">
      {/* Hero Section: Doorstep Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Heading + Service Grid Card */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("doorstep.headline", "Home services at your doorstep")}
            </h1>

            {/* White Service Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {offeredServices.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 group-hover:shadow-sm transition-all">
                      {item.icon}
                      {item.etaMinutes && (
                        <span className="absolute -bottom-2 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[9px] font-bold text-emerald-700 shadow-2xs whitespace-nowrap">
                          {item.etaMinutes} {t("doorstep.mins", "mins")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-800 mt-3 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                      {t(item.titleKey, item.defaultTitle)}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Verified Trade Overhauls */}
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  {t("doorstep.packages_title", "Comprehensive Home Maintenance Packages")}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {tradePackages.map((pkg, idx) => (
                    <Link
                      key={idx}
                      href={pkg.href}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 hover:border-emerald-300 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {pkg.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                            {t(pkg.titleKey, pkg.defaultTitle)}
                          </span>
                          {pkg.isNew && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-600 text-white text-[8px] font-extrabold uppercase shrink-0">
                              {t("doorstep.popular", "Popular")}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-emerald-800 mt-0.5 block">
                          {t("doorstep.starts_at", "Starts at")} {pkg.price}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4-Photo Collage of our Actual Services */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3.5">
              {/* Top Left: Electrical Service */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-slate-200 group">
                <img
                  src="/api/hero-images/electrical"
                  alt="Certified electrician repairing kitchen appliance"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-semibold">
                    {t("doorstep.tag_electrical", "Certified Electrical Repairs")}
                  </span>
                </div>
              </div>

              {/* Top Right: Plumbing Service */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-slate-200 group">
                <img
                  src="/api/hero-images/plumber"
                  alt="Professional plumber fixing water pipe"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-semibold">
                    {t("doorstep.tag_plumbing", "Expert Plumbing & Leak Fixes")}
                  </span>
                </div>
              </div>

              {/* Bottom Left: Carpentry Service */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-slate-200 group">
                <img
                  src="/api/hero-images/carpenter"
                  alt="Skilled carpenter finishing wooden furniture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-semibold">
                    {t("doorstep.tag_carpentry", "Woodwork & Furniture Repair")}
                  </span>
                </div>
              </div>

              {/* Bottom Right: Appliance Repair */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-slate-200 group">
                <img
                  src="/api/hero-images/appliance"
                  alt="AC technician servicing air conditioner"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-semibold">
                    {t("doorstep.tag_appliance", "Appliance & AC Maintenance")}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Popular Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              {t("doorstep.most_booked", "Most Booked Services")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t("doorstep.most_booked_sub", "Top rated certified trade services booked by households in your area")}
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            {t("doorstep.see_all", "See all services")} &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.slice(0, 4).map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {svc.name}
                  </h3>
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                    &#9733; 4.8
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {svc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {t("doorstep.starting_from", "Starting from")}
                  </div>
                  <div className="text-base font-extrabold text-slate-900 font-heading">
                    &#8377;{svc.base_price}
                  </div>
                </div>
                <Link
                  href={`/book?service=${svc.id}`}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {t("doorstep.book_btn", "Book")} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Quality Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            {t("doorstep.why_trust_title", "Why Millions Trust Our Doorstep Services")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-2 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                &#10003;
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t("doorstep.trust_1_title", "Verified Professionals")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("doorstep.trust_1_desc", "Aadhaar checked and certified trade professionals vetted for quality.")}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                &#8377;
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t("doorstep.trust_2_title", "Transparent Pricing")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("doorstep.trust_2_desc", "Upfront standard rates with zero hidden surge or extra charges.")}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                &#9874;
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t("doorstep.trust_3_title", "30-Day Service Guarantee")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("doorstep.trust_3_desc", "Free rework or dedicated assistance if you are not completely satisfied.")}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                &#9201;
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t("doorstep.trust_4_title", "On-Time Arrival")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("doorstep.trust_4_desc", "Quick arrival under 30 minutes for urgent needs and guaranteed slots.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fast Emergency Dispatch Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              24/7 Priority Emergency
            </div>
            <h2 className="text-2xl font-extrabold font-heading">
              {t("doorstep.urgent_title", "Have an urgent leak, short-circuit or lock issue?")}
            </h2>
            <p className="text-xs text-red-100 max-w-xl">
              {t("doorstep.urgent_sub", "Our priority dispatch connects you with the closest technician on-call for immediate assistance.")}
            </p>
          </div>
          <Link
            href="/emergency"
            className="px-6 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-sm transition-all shadow-md whitespace-nowrap self-start sm:self-auto"
          >
            {t("doorstep.urgent_btn", "Request Instant Dispatch")} &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
