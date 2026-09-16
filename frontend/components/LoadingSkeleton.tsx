"use client";

import React from "react";

interface SkeletonProps {
  rows?: number;
  count?: number;
  type?: "card" | "table" | "list";
}

export default function LoadingSkeleton({ rows, count, type = "card" }: SkeletonProps) {
  const numItems = rows ?? count ?? 3;

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: numItems }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded-full w-20"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="pt-3 flex gap-2">
              <div className="h-8 bg-slate-200 rounded flex-1"></div>
              <div className="h-8 bg-slate-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse space-y-4">
      {Array.from({ length: numItems }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
          <div className="space-y-1.5 w-1/3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
          <div className="h-6 bg-slate-200 rounded-full w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}
