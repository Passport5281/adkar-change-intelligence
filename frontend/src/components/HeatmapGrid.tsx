"use client";

import { useState } from "react";
import type { HeatmapData, HeatmapCell, ActiveCell } from "@/types";
import {
  getImpactLevel,
  impactLevelToColor,
  impactLevelToRing,
  readinessBar,
  STATUS_BADGE,
  PHASE_BADGE,
} from "@/lib/heatmap";
import CellTooltip from "./CellTooltip";
import EditModal from "./EditModal";

interface Props {
  data: HeatmapData;
  onCellUpdated: (updated: HeatmapCell) => void;
}

function statusDot(status: string): string {
  const map: Record<string, string> = {
    "not-started": "bg-slate-400",
    "in-progress": "bg-blue-500",
    completed: "bg-emerald-500",
    blocked: "bg-red-500",
  };
  return map[status] ?? "bg-slate-300";
}

export default function HeatmapGrid({ data, onCellUpdated }: Props) {
  const { departments, initiatives, cells } = data;
  const [active, setActive] = useState<ActiveCell | null>(null);
  const [editing, setEditing] = useState<ActiveCell | null>(null);

  const cellMap = new Map<string, HeatmapCell>();
  cells.forEach((c) => cellMap.set(`${c.departmentId}::${c.initiativeId}`, c));

  function handleCellClick(
    e: React.MouseEvent,
    cell: HeatmapCell,
    deptIdx: number,
    initIdx: number
  ) {
    const dept = departments[deptIdx];
    const init = initiatives[initIdx];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setActive({ cell, department: dept, initiative: init, x: rect.left, y: rect.bottom + 4 });
  }

  return (
    <>
      {/* Scrollable grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              {/* Top-left corner */}
              <th className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 px-4 py-3 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Dept / Initiative
                </span>
              </th>
              {initiatives.map((init) => (
                <th
                  key={init.id}
                  className="border-b border-r border-slate-200 px-3 py-3 text-left min-w-[130px]"
                >
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{init.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PHASE_BADGE[init.phase]}`}>
                      {init.phase}
                    </span>
                    <span className="text-[10px] text-slate-400">{init.category}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, deptIdx) => (
              <tr key={dept.id} className="group hover:bg-slate-50/60 transition-colors">
                {/* Row header */}
                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/60 border-b border-r border-slate-200 px-4 py-3 transition-colors">
                  <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{dept.name}</p>
                  <p className="text-xs text-slate-400">{dept.region}</p>
                  {dept.headcount > 0 && (
                    <p className="text-xs text-slate-400">{dept.headcount} staff</p>
                  )}
                </td>

                {/* Cells */}
                {initiatives.map((init, initIdx) => {
                  const cell = cellMap.get(`${dept.id}::${init.id}`);
                  if (!cell) {
                    return (
                      <td key={init.id} className="border-b border-r border-slate-100 p-2">
                        <div className="flex items-center justify-center h-14 rounded-lg bg-slate-50 text-slate-300 text-xs">
                          —
                        </div>
                      </td>
                    );
                  }

                  const level = getImpactLevel(cell.impactScore);
                  const colorClass = impactLevelToColor(level);
                  const ringClass = impactLevelToRing(level);
                  const isActive =
                    active?.cell.departmentId === cell.departmentId &&
                    active?.cell.initiativeId === cell.initiativeId;

                  return (
                    <td key={init.id} className="border-b border-r border-slate-100 p-2">
                      <button
                        onClick={(e) => handleCellClick(e, cell, deptIdx, initIdx)}
                        className={`
                          group/cell relative w-full h-14 rounded-lg px-2 py-1.5 text-left
                          ring-1 transition-all duration-150
                          hover:ring-2 hover:shadow-md hover:scale-[1.03]
                          focus:outline-none focus:ring-2 focus:ring-indigo-400
                          ${colorClass} ${ringClass}
                          ${isActive ? "ring-2 shadow-lg scale-[1.03]" : ""}
                        `}
                      >
                        {/* Impact score */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold leading-none">{cell.impactScore}</span>
                          <span className={`w-2 h-2 rounded-full ${statusDot(cell.status)}`} />
                        </div>

                        {/* Readiness mini-bar */}
                        <div className="mt-1.5 h-1 w-full rounded-full bg-black/10">
                          <div
                            className={`h-1 rounded-full ${readinessBar(cell.readinessScore)}`}
                            style={{ width: `${cell.readinessScore}%` }}
                          />
                        </div>

                        {/* Readiness label */}
                        <p className="mt-0.5 text-[10px] opacity-70 leading-none">
                          {cell.readinessScore}% ready
                        </p>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {active && !editing && (
        <CellTooltip
          active={active}
          onClose={() => setActive(null)}
          onEdit={(a) => {
            setEditing(a);
            setActive(null);
          }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditModal
          active={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            onCellUpdated(updated);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
