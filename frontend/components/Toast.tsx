"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  let bg = "bg-emerald-800 text-white border-emerald-900";
  let icon = "✓";

  if (type === "error") {
    bg = "bg-red-700 text-white border-red-800";
    icon = "✕";
  } else if (type === "warning") {
    bg = "bg-amber-600 text-white border-amber-700";
    icon = "⚠";
  } else if (type === "info") {
    bg = "bg-blue-700 text-white border-blue-800";
    icon = "ℹ";
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-elevated border text-xs font-medium ${bg}`}>
        <span className="font-bold select-none text-sm">{icon}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-3 hover:opacity-80 text-xs font-bold focus:outline-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
