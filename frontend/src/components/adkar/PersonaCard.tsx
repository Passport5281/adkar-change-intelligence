"use client";

import { useState } from "react";
import type { PersonaAdkar } from "@/types/adkar";
import { IMPACT_COLORS, IMPACT_BORDER, ADKAR_ORDER } from "@/lib/adkar-helpers";
import AdkarElement from "./AdkarElement";

interface Props {
  persona: PersonaAdkar;
  defaultExpanded?: boolean;
  onRefresh?: (persona: PersonaAdkar) => void;
  onDelete?: (persona: PersonaAdkar) => void;
  onExport?: (persona: PersonaAdkar) => void;
  isCustom?: boolean;
}

const CHANGE_TYPE_BADGE: Record<string, string> = {
  process: "bg-amber-50 text-amber-700",
  technology: "bg-blue-50 text-blue-700",
  behavior: "bg-violet-50 text-violet-700",
  culture: "bg-rose-50 text-rose-700",
  all: "bg-slate-100 text-slate-600",
};

export default function PersonaCard({
  persona,
  defaultExpanded = false,
  onRefresh,
  onDelete,
  onExport,
  isCustom = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`rounded-2xl border ${IMPACT_BORDER[persona.impactLevel]} bg-white shadow-sm overflow-hidden`}>
      {/* Card header */}
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Expand toggle — the main click area */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-start gap-4 flex-1 min-w-0 text-left"
        >
          <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-base">
            {persona.persona.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-900">{persona.persona}</p>
              <span className="text-xs text-slate-400">{persona.department}</span>
              {isCustom && (
                <span className="rounded-full bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[10px] font-medium">
                  Custom
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{persona.description}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${IMPACT_COLORS[persona.impactLevel]}`}>
                {persona.impactLevel.charAt(0).toUpperCase() + persona.impactLevel.slice(1)} Impact
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CHANGE_TYPE_BADGE[persona.changeType]}`}>
                {persona.changeType}
              </span>
            </div>
          </div>
        </button>

        {/* Actions + chevron */}
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {/* ADKAR mini-strip */}
          <div className="hidden sm:flex items-center gap-1">
            {ADKAR_ORDER.map((key) => (
              <span
                key={key}
                className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold bg-slate-100 text-slate-500"
                title={key}
              >
                {key.charAt(0).toUpperCase()}
              </span>
            ))}
          </div>

          {/* Export button */}
          {onExport && (
            <button
              onClick={(e) => { e.stopPropagation(); onExport(persona); }}
              title="Download ADKAR plan as PDF"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
          )}

          {/* Refresh/Update button */}
          {onRefresh && (
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(persona); }}
              title="Update this persona's ADKAR plan with new context"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Update
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(persona); }}
              title="Delete this persona"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          )}

          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1"
          >
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded ADKAR content */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Why this impact level: </span>
            {persona.impactRationale}
          </div>
          <div className="space-y-2">
            {ADKAR_ORDER.map((key) => (
              <AdkarElement key={key} adkarKey={key} data={persona.adkar[key]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
