"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "../lib/i18n";
import { getAuthToken, clearAuthToken, request, getCurrentUser, setCurrentUser } from "../lib/api";
import { getStoredLocation, extractFastGps, LOCATION_UPDATED_EVENT, DEFAULT_LOCATION } from "../lib/locations";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLocName, setActiveLocName] = useState<string>(() => {
    const cached = getStoredLocation();
    return cached?.location?.name || DEFAULT_LOCATION.name;
  });
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    const handleLocUpdate = (e: any) => {
      if (e.detail?.location?.name) {
        setActiveLocName(e.detail.location.name);
      }
    };
    window.addEventListener(LOCATION_UPDATED_EVENT, handleLocUpdate);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, handleLocUpdate);
  }, []);

  const handleQuickGps = async () => {
    setDetectingGps(true);
    try {
      const res = await extractFastGps();
      setActiveLocName(res.location.name);
    } catch (err) {
      console.warn("GPS extraction error in navbar:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  useEffect(() => {
    const cached = getCurrentUser();
    if (cached) {
      setUser({ name: cached.name, role: cached.role });
    }
    const token = getAuthToken();
    if (token) {
      request<any>("/auth/me")
        .then((profile) => {
          setUser({ name: profile.name, role: profile.role });
          setCurrentUser({ name: profile.name, role: profile.role, id: profile.id });
        })
        .catch(() => {
          clearAuthToken();
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    router.push("/login");
  };

  // Restrict portal and console visibility strictly to the authenticated persona
  const role = user?.role;
  let navLinks: { href: string; label: string; badge?: string }[] = [];

  if (!user) {
    // Unauthenticated Guest: Browse services, book, or emergency dispatch
    navLinks = [
      { href: "/services", label: t("nav.services", "Services") },
      { href: "/book", label: t("nav.book", "Book Service") },
      { href: "/emergency", label: t("nav.emergency", "Emergency Dispatch"), badge: "24/7" },
    ];
  } else if (role === "CUSTOMER") {
    // Customer Portal: Book, emergency, personal bookings & invoice dashboard
    navLinks = [
      { href: "/services", label: t("nav.services", "Services") },
      { href: "/book", label: t("nav.book", "Book Service") },
      { href: "/emergency", label: t("nav.emergency", "Emergency Dispatch"), badge: "24/7" },
      { href: "/dashboard", label: t("nav.dashboard", "My Dashboard") },
    ];
  } else if (role === "WORKER") {
    // Worker Portal: Exclusively worker duties, schedules, and trade skills
    navLinks = [
      { href: "/worker", label: t("nav.worker", "Worker Portal") },
      { href: "/services", label: t("nav.services", "Trade Catalog") },
    ];
  } else if (role === "COOP_ADMIN" || role === "FED_ADMIN") {
    // Federation & Society Governance: Exclusively admin console & governance
    navLinks = [
      { href: "/admin", label: t("nav.admin", "Admin Console") },
      { href: "/services", label: t("nav.services", "Trade Catalog") },
    ];
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
                ⚙
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                  ON-DEMAND
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
                  {t("nav.cooperative", "Cooperative")}
                </span>
              </div>
            </Link>

            {/* Fast GPS Location Pill */}
            <button
              type="button"
              onClick={handleQuickGps}
              disabled={detectingGps}
              title="Fast GPS location - Click to refresh"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 hover:bg-emerald-950 border border-emerald-700/60 text-[11px] text-emerald-100 transition-all cursor-pointer shadow-2xs ml-1"
            >
              <span className={`w-2 h-2 rounded-full ${detectingGps ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
              <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-semibold max-w-[130px] truncate">
                {detectingGps ? "Extracting GPS..." : activeLocName}
              </span>
              <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1 py-0.2 rounded font-bold uppercase">
                GPS
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? "bg-emerald-800 text-white shadow-inner font-semibold"
                      : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Language Selector & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-emerald-800 border border-emerald-700 text-emerald-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium cursor-pointer"
                aria-label="Language Selector"
              >
                <option value="en">English (EN)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-emerald-300 font-medium">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-emerald-200 hover:text-white text-xs font-medium border border-emerald-700 transition-colors"
                >
                  {t("nav.logout", "Sign Out")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium border border-emerald-700 transition-colors"
                >
                  {t("nav.login", "Sign In")}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg bg-white text-emerald-900 hover:bg-slate-100 text-xs font-semibold shadow-sm transition-colors"
                >
                  {t("nav.register", "Register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-emerald-800 border border-emerald-700 text-white text-xs rounded px-2 py-1"
            >
              <option value="en">EN</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-800 bg-emerald-950 px-4 pt-2 pb-4 space-y-1">
          {/* Mobile GPS Location Button */}
          <button
            type="button"
            onClick={() => {
              handleQuickGps();
            }}
            disabled={detectingGps}
            className="w-full mb-2 flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-900 border border-emerald-700/80 text-xs text-emerald-100 font-medium"
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${detectingGps ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
              <span className="truncate">📍 {detectingGps ? "Extracting GPS..." : activeLocName}</span>
            </span>
            <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase text-emerald-200">
              Refresh GPS
            </span>
          </button>
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActive(item.href)
                  ? "bg-emerald-800 text-white"
                  : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-emerald-800 pt-3 mt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-emerald-300">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs bg-emerald-800 px-3 py-1.5 rounded text-white"
                >
                  {t("nav.logout", "Sign Out")}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-emerald-800 rounded text-sm text-white"
                >
                  {t("nav.login", "Sign In")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-white text-emerald-900 rounded text-sm font-semibold"
                >
                  {t("nav.register", "Register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
