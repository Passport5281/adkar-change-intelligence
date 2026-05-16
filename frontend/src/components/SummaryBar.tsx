"use client";

import type { Summary } from "@/types";

interface Props {
  summary: Summary;
}

export default function SummaryBar({ summary }: Props) {
  const stats = [
    { label: "Avg Impact", value: summary.avgImpact, suffix: "/100", color: "text-slate-800" },
    { label: "Avg Readiness", value: summary.avgReadiness, suffix: "%", color: "text-slate-800" },
    { label: "Critical Risk Cells", value: summary.criticalCells, suffix: "", color: "text-red-600" },
    { label: "Blocked", value: summary.blockedCells, suffix: "", color: "text-orange-600" },
    { label: "In Progress", value: summary.byStatus?.["in-progress"] ?? 0, suffix: "", color: "text-blue-600" },
    { label: "Completed", value: summary.byStatus?.["completed"] ?? 0, suffix: "", color: "text-emerald-600" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map(({ label, value, suffix, color }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs text-slate-500 mb-0.5">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {value}<span className="text-sm font-normal text-slate-400">{suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
