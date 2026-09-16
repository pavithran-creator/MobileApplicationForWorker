"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { request, setAuthToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await request<{ token?: string; access_token?: string; role: string; user_id: number; name: string; worker_id?: number; customer_id?: number }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });

      const token = res.token || res.access_token;
      if (token) setAuthToken(token);
      localStorage.setItem("ondemand_user", JSON.stringify({
        name: res.name,
        role: res.role,
        id: res.user_id,
        worker_id: res.worker_id,
        customer_id: res.customer_id,
        phone
      }));

      // Redirect by role
      if (res.role === "FED_ADMIN" || res.role === "COOP_ADMIN") {
        router.push("/admin");
      } else if (res.role === "WORKER") {
        router.push("/worker");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid phone or password");
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setError("");
    setLoading(true);

    try {
      const res = await request<{ token?: string; access_token?: string; role: string; user_id: number; name: string; worker_id?: number; customer_id?: number }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone: demoPhone, password: demoPass }),
      });

      const token = res.token || res.access_token;
      if (token) setAuthToken(token);
      localStorage.setItem("ondemand_user", JSON.stringify({
        name: res.name,
        role: res.role,
        id: res.user_id,
        worker_id: res.worker_id,
        customer_id: res.customer_id,
        phone: demoPhone
      }));

      if (res.role === "FED_ADMIN" || res.role === "COOP_ADMIN") {
        router.push("/admin");
      } else if (res.role === "WORKER") {
        router.push("/worker");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in with demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-md">
          &#9874;
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
          {t("auth.loginTitle", "Sign in to your account")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t("auth.loginSub", "Access your bookings, assignments, or administrative controls.")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t("auth.phone", "Registered Phone Number")}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t("auth.password", "Password")}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : t("auth.loginBtn", "Sign In")}
            </button>
          </form>

          {/* Quick 1-Click Persona Demo Sign In */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("auth.demoTitle", "1-Click Demo Personas")}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                {t("auth.instantAccess", "Instant Access")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginDemo("9000000011", "cust123")}
                className="p-2.5 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
              >
                <div className="font-bold text-slate-800">{t("auth.customer", "Customer")}</div>
                <div className="text-slate-500 text-[10px]">Meena Sundaram</div>
              </button>

              <button
                type="button"
                onClick={() => loginDemo("9010000001", "work123")}
                className="p-2.5 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
              >
                <div className="font-bold text-slate-800">{t("auth.worker", "Skilled Worker")}</div>
                <div className="text-slate-500 text-[10px]">Suresh (Electrician)</div>
              </button>

              <button
                type="button"
                onClick={() => loginDemo("9000000002", "admin123")}
                className="p-2.5 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
              >
                <div className="font-bold text-slate-800">{t("auth.societyAdmin", "Society Admin")}</div>
                <div className="text-slate-500 text-[10px]">Gandhipuram Coop</div>
              </button>

              <button
                type="button"
                onClick={() => loginDemo("9000000001", "admin123")}
                className="p-2.5 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
              >
                <div className="font-bold text-slate-800">{t("auth.fedAdmin", "Federation Admin")}</div>
                <div className="text-slate-500 text-[10px]">Director Arumugam</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            {t("auth.noAccount", "Don't have an account?")}{" "}
            <Link href="/register" className="font-semibold text-emerald-800 hover:underline">
              {t("auth.registerHere", "Register here")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
