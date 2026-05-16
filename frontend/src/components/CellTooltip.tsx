"use client";

import { useEffect, useRef } from "react";
import type { ActiveCell } from "@/types";
import {
  STATUS_LABELS,
  STATUS_BADGE,
  PHASE_BADGE,
  readinessBar,
  getImpactLevel,
  impactLevelToColor,
} from "@/lib/heatmap";

interface Props {
  active: ActiveCell;
  onClose: () => void;
  onEdit: (cell: ActiveCell) => void;
}

export default function CellTooltip({ active, onClose, onEdit }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const { cell, department, initiative } = active;
  const level = getImpactLevel(cell.impactScore);
  const impactColor = impactLevelToColor(level);

  const viewport = typeof window !== "undefined"
    ? { w: window.innerWidth, h: window.innerHeight }
    : { w: 1200, h: 800 };

  const tooltipW = 320;
  const tooltipH = 380;
  let left = active.x + 12;
  let top = active.y + 12;
  if (left + tooltipW > viewport.w - 16) left = active.x - tooltipW - 12;
  if (top + tooltipH > viewport.h - 16) top = active.y - tooltipH - 12;

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left, top, width: tooltipW, zIndex: 50 }}
      className="animate-fade-in rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 rounded-t-xl bg-slate-50 px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-xs font-medium text-slate-500">{department.name}</p>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{initiative.name}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Impact Score</p>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${impactColor.split(" ")[1]}`}>
                {cell.impactScore}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${impactColor}`}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Readiness</p>
            <p className="text-xl font-bold text-slate-700">{cell.readinessScore}%</p>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
              <div
                className={`h-1.5 rounded-full ${readinessBar(cell.readinessScore)} transition-all`}
                style={{ width: `${cell.readinessScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status + Phase */}
        <div className="flex gap-2 flex-wrap">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[cell.status]}`}>
            {STATUS_LABELS[cell.status]}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_BADGE[initiative.phase]}`}>
            {initiative.phase}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
            {initiative.category}
          </span>
        </div>

        {/* Meta */}
        <div className="text-xs text-slate-500 space-y-0.5">
          <p><span className="font-medium text-slate-600">Owner:</span> {initiative.owner}</p>
          <p><span className="font-medium text-slate-600">Deadline:</span> {initiative.deadline}</p>
          <p><span className="font-medium text-slate-600">Region:</span> {department.region}</p>
          <p><span className="font-medium text-slate-600">Updated:</span> {cell.lastUpdated}</p>
        </div>

        {/* Notes */}
        {cell.notes && (
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
            {cell.notes}
          </div>
        )}

        {/* Edit */}
        <button
          onClick={() => onEdit(active)}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Edit Cell
        </button>
      </div>
    </div>
  );
}
