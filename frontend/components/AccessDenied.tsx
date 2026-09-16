"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "../lib/i18n";
import { clearAuthToken } from "../lib/api";

interface AccessDeniedProps {
  requiredRoleName: string;
  allowedRoles: string[];
  currentUser: { name?: string; role?: string } | null;
}

export default function AccessDenied({
  requiredRoleName,
  allowedRoles,
  currentUser,
}: AccessDeniedProps) {
  const router = useRouter();
  const { t } = useLang();

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  const getMyPortalLink = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "WORKER") return "/worker";
    if (currentUser.role === "COOP_ADMIN" || currentUser.role === "FED_ADMIN") return "/admin";
    return "/dashboard";
  };

  const getMyPortalLabel = () => {
    if (!currentUser) return t("nav.login", "Sign In");
    if (currentUser.role === "WORKER") return t("nav.worker", "Worker Portal");
    if (currentUser.role === "COOP_ADMIN" || currentUser.role === "FED_ADMIN")
      return t("nav.admin", "Admin Console");
    return t("nav.dashboard", "My Dashboard");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center">
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
          {t("auth.access_denied_title", "Access Restricted")}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {t("auth.access_denied_desc", "You do not have permission to view this console. This area is reserved exclusively for {requiredRole}.").replace("{requiredRole}", requiredRoleName)}
        </p>

        {/* Current Identity pill */}
        {currentUser ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 text-xs text-left">
            <div className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-0.5">
              Current Session
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{currentUser.name || "Authenticated User"}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {currentUser.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-800">
            You are currently browsing as a guest. Please sign in with an authorized account.
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          <Link
            href={getMyPortalLink()}
            className="w-full block py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-colors shadow-sm text-center"
          >
            {t("auth.go_to_my_portal", "Go to My Portal")}: {getMyPortalLabel()} &rarr;
          </Link>

          <Link
            href="/services"
            className="w-full block py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors text-center"
          >
            {t("nav.trade_catalog", "Trade Catalog")}
          </Link>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-700 font-medium text-xs transition-colors"
            >
              {t("nav.logout", "Sign Out")} / Switch Persona
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
