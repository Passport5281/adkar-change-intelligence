"use client";

import { useState } from "react";
import type { PersonaAdkar, CompanyInfo } from "@/types/adkar";
import { generatePersona } from "@/lib/adkar-api";

interface Props {
  company: CompanyInfo;
  existingPersonas: PersonaAdkar[];
  /** When provided, the modal runs in "refresh" mode for that persona */
  personaToRefresh?: PersonaAdkar;
  onClose: () => void;
  onDone: (persona: PersonaAdkar) => void;
}

export default function PersonaFormModal({
  company,
  existingPersonas,
  personaToRefresh,
  onClose,
  onDone,
}: Props) {
  const isRefresh = !!personaToRefresh;

  const [role, setRole] = useState(personaToRefresh?.persona ?? "");
  const [department, setDepartment] = useState(personaToRefresh?.department ?? "");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await generatePersona(
        company,
        existingPersonas,
        { role: role.trim(), department: department.trim(), context: context.trim() },
        isRefresh
      );
      // Preserve the original ID when refreshing so the store can find it
      if (isRefresh && personaToRefresh) {
        result.id = personaToRefresh.id;
      }
      onDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 animate-fade-in">
        {/* Header */}
        <div className="rounded-t-2xl bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{company.name}</p>
            <p className="text-base font-semibold text-slate-800">
              {isRefresh ? "Update Persona" : "Add a Persona"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Role / Job Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Regional Sales Director, Plant Operations Manager"
                disabled={isRefresh || loading}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Department <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Sales, Finance, Operations"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {isRefresh ? "What new context do you have about this persona?" : "What do you know about this persona?"}
                <span className="text-slate-400 font-normal ml-1">(optional but improves accuracy)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                disabled={loading}
                placeholder={
                  isRefresh
                    ? "e.g. They've been through 2 training sessions, are now using the tool daily but still struggling with reporting. Manager is supportive but the team is understaffed..."
                    : "e.g. This person manages 40 reps, has used legacy CRM for 8 years, is data-driven but sceptical of new tools, reports to the CRO..."
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                The richer the context, the more specific the ADKAR plan Claude will generate.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-b-2xl border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !role.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRefresh ? "Updating…" : "Generating…"}
                </>
              ) : (
                isRefresh ? "Update ADKAR Plan" : "Generate ADKAR Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
