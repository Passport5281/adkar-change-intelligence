"use client";

import { useState } from "react";
import type { VendorEntry } from "@/lib/adkar-store";
import { IMPACT_COLORS, IMPACT_DOT } from "@/lib/adkar-helpers";

interface Props {
  vendors: VendorEntry[];
  activeVendorId: string | null;
  activeEngagementId: string | null;
  onSelectVendor: (vendorId: string) => void;
  onSelectEngagement: (vendorId: string, engagementId: string) => void;
  onDeleteVendor: (vendorId: string) => void;
  onDeleteEngagement: (vendorId: string, engagementId: string) => void;
  onClearAll: () => void;
  onAddEngagement: (vendorId: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnalysisHistory({
  vendors,
  activeVendorId,
  activeEngagementId,
  onSelectVendor,
  onSelectEngagement,
  onDeleteVendor,
  onDeleteEngagement,
  onClearAll,
  onAddEngagement,
}: Props) {
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(
    new Set(activeVendorId ? [activeVendorId] : [])
  );

  function toggleExpand(vendorId: string) {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      next.has(vendorId) ? next.delete(vendorId) : next.add(vendorId);
      return next;
    });
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Vendors ({vendors.length})
        </p>
        {vendors.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
        {vendors.map((vendor) => {
          const isActiveVendor = vendor.id === activeVendorId;
          const isExpanded = expandedVendors.has(vendor.id);
          const { company } = vendor.vendorAnalysis;

          return (
            <div key={vendor.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Vendor row */}
              <div className="flex items-center gap-2 px-3 py-2.5 group">
                {/* Expand/collapse */}
                <button
                  onClick={() => toggleExpand(vendor.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Vendor name — click selects it */}
                <button
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  onClick={() => {
                    onSelectVendor(vendor.id);
                    setExpandedVendors((prev) => new Set([...prev, vendor.id]));
                  }}
                >
                  <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                    isActiveVendor && !activeEngagementId
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate leading-tight ${
                      isActiveVendor && !activeEngagementId ? "text-indigo-700" : "text-slate-700"
                    }`}>
                      {company.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {vendor.engagements.length} engagement{vendor.engagements.length !== 1 ? "s" : ""}
                      {" · "}{timeAgo(vendor.savedAt)}
                    </p>
                  </div>
                </button>

                {/* Delete vendor */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteVendor(vendor.id); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-base leading-none"
                >
                  ×
                </button>
              </div>

              {/* Engagements */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 space-y-1">
                  {vendor.engagements.map((eng) => {
                    const isActiveEng = eng.id === activeEngagementId;
                    return (
                      <div key={eng.id} className="flex items-center gap-2 group/eng">
                        <button
                          onClick={() => onSelectEngagement(vendor.id, eng.id)}
                          className={`flex items-center gap-2 flex-1 min-w-0 rounded-lg px-2 py-1.5 text-left transition-colors ${
                            isActiveEng
                              ? "bg-indigo-50 ring-1 ring-indigo-200"
                              : "hover:bg-white"
                          }`}
                        >
                          <span className={`shrink-0 w-2 h-2 rounded-full ${IMPACT_DOT[eng.overallImpact.level]}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActiveEng ? "text-indigo-700" : "text-slate-600"}`}>
                              {eng.customer.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {eng.personas.length} personas · {timeAgo(eng.savedAt)}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => onDeleteEngagement(vendor.id, eng.id)}
                          className="shrink-0 opacity-0 group-hover/eng:opacity-100 text-slate-300 hover:text-red-400 transition-all text-sm leading-none"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {/* Add engagement */}
                  <button
                    onClick={() => onAddEngagement(vendor.id)}
                    className="w-full flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add customer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
