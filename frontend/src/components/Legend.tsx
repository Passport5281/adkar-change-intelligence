"use client";

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
      <span className="font-semibold text-slate-700 uppercase tracking-wide">Impact</span>
      {[
        { label: "Low (<30)", bg: "bg-emerald-100 ring-emerald-300" },
        { label: "Medium (30–59)", bg: "bg-yellow-100 ring-yellow-300" },
        { label: "High (60–79)", bg: "bg-orange-200 ring-orange-400" },
        { label: "Critical (≥80)", bg: "bg-red-300 ring-red-500" },
      ].map(({ label, bg }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`inline-block w-4 h-4 rounded ring-1 ${bg}`} />
          {label}
        </span>
      ))}
      <span className="ml-4 font-semibold text-slate-700 uppercase tracking-wide">Status</span>
      {[
        { label: "Not Started", dot: "bg-slate-400" },
        { label: "In Progress", dot: "bg-blue-500" },
        { label: "Completed", dot: "bg-emerald-500" },
        { label: "Blocked", dot: "bg-red-500" },
      ].map(({ label, dot }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
          {label}
        </span>
      ))}
    </div>
  );
}
