"use client";

import { useState } from "react";
import type { ActiveCell, CellStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/heatmap";
import { updateCell } from "@/lib/api";

interface Props {
  active: ActiveCell;
  onClose: () => void;
  onSaved: (updated: ActiveCell["cell"]) => void;
}

export default function EditModal({ active, onClose, onSaved }: Props) {
  const { cell, department, initiative } = active;
  const [impact, setImpact] = useState(cell.impactScore);
  const [readiness, setReadiness] = useState(cell.readinessScore);
  const [status, setStatus] = useState<CellStatus>(cell.status);
  const [notes, setNotes] = useState(cell.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const updated = await updateCell(cell.departmentId, cell.initiativeId, {
        impactScore: impact,
        readinessScore: readiness,
        status,
        notes,
      });
      onSaved(updated);
    } catch {
      setError("Failed to save. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 animate-fade-in">
        <div className="rounded-t-2xl bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{department.name} · {initiative.name}</p>
            <p className="text-base font-semibold text-slate-800">Edit Cell</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Impact Score: <span className="text-indigo-600">{impact}</span>
            </label>
            <input
              type="range" min={0} max={100} value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0 – Low</span><span>100 – Critical</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Readiness Score: <span className="text-indigo-600">{readiness}%</span>
            </label>
            <input
              type="range" min={0} max={100} value={readiness}
              onChange={(e) => setReadiness(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0 – Not ready</span><span>100 – Fully ready</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_LABELS) as CellStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                    status === s
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add context, blockers, or next steps..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-b-2xl border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
