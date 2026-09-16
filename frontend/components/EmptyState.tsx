"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: string;
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon = "📋"
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-2xl select-none">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-900 transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-900 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
