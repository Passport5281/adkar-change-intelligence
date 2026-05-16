"use client";

import { useEffect, useState } from "react";
import type { AdkarAnalysis, ImpactLevel, PersonaAdkar, EngagementEntry } from "@/types/adkar";
import type { VendorEntry } from "@/lib/adkar-store";
import { analyzeCompany, analyzeEngagement, generatePersona } from "@/lib/adkar-api";
import {
  getAllVendors, getVendorById, saveVendor, deleteVendor, clearAllVendors,
  saveEngagement, getEngagementById, deleteEngagement,
  getActiveVendorId, setActiveVendorId,
  getActiveEngagementId, setActiveEngagementId, clearActiveEngagement,
  addPersonaToVendor, updatePersonaInVendor,
  addPersonaToEngagement, updatePersonaInEngagement,
} from "@/lib/adkar-store";
import UrlInput from "@/components/adkar/UrlInput";
import CompanyCard from "@/components/adkar/CompanyCard";
import CustomerCard from "@/components/adkar/CustomerCard";
import OverallImpact from "@/components/adkar/OverallImpact";
import PersonaCard from "@/components/adkar/PersonaCard";
import AnalysisHistory from "@/components/adkar/AnalysisHistory";
import PersonaFormModal from "@/components/adkar/PersonaFormModal";
import { IMPACT_DOT } from "@/lib/adkar-helpers";

type ViewMode = "overall" | "by-persona";
type SortMode = "impact" | "department" | "default";

const IMPACT_ORDER: Record<ImpactLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// ─── Engagement URL input modal ───────────────────────────────────────────────

function EngagementModal({
  vendorName,
  onClose,
  onSubmit,
  loading,
  error,
}: {
  vendorName: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string;
}) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    onSubmit(normalized);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 animate-fade-in">
        <div className="rounded-t-2xl bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{vendorName}</p>
            <p className="text-base font-semibold text-slate-800">Add Customer Engagement</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-600">
              Enter the URL of the customer company. Claude will scrape their site and generate
              an ADKAR plan specific to their organisation adopting {vendorName}&apos;s product.
            </p>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. insperity.com or https://www.insperity.com"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
          <div className="rounded-b-2xl border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !url.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analysing…
                </>
              ) : "Generate Engagement Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [vendors, setVendors] = useState<VendorEntry[]>([]);
  const [activeVendorId, setActiveVendorIdState] = useState<string | null>(null);
  const [activeEngagementId, setActiveEngagementIdState] = useState<string | null>(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analyzerStep, setAnalyzerStep] = useState("");
  const [analyzerChars, setAnalyzerChars] = useState(0);
  const [analyzerError, setAnalyzerError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("overall");
  const [sortMode, setSortMode] = useState<SortMode>("impact");
  const [filterLevel, setFilterLevel] = useState<ImpactLevel | "">("");

  // Persona modal
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [personaToRefresh, setPersonaToRefresh] = useState<PersonaAdkar | null>(null);

  // Engagement modal
  const [engagementTargetVendorId, setEngagementTargetVendorId] = useState<string | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  useEffect(() => {
    setVendors(getAllVendors());
    setActiveVendorIdState(getActiveVendorId());
    setActiveEngagementIdState(getActiveEngagementId());
  }, []);

  // ── Derived active data ────────────────────────────────────────────────────

  const activeVendor = activeVendorId ? getVendorById(activeVendorId) : null;
  const activeEngagement: EngagementEntry | null =
    activeVendorId && activeEngagementId
      ? getEngagementById(activeVendorId, activeEngagementId)
      : null;

  const activePersonas: PersonaAdkar[] =
    activeEngagement?.personas ?? activeVendor?.vendorAnalysis.personas ?? [];
  const activeOverallImpact =
    activeEngagement?.overallImpact ?? activeVendor?.vendorAnalysis.overallImpact ?? null;

  const activeCompanyForPersonaModal = activeVendor?.vendorAnalysis.company ?? null;

  const sortedPersonas = [...activePersonas]
    .filter((p) => !filterLevel || p.impactLevel === filterLevel)
    .sort((a, b) => {
      if (sortMode === "impact") return IMPACT_ORDER[a.impactLevel] - IMPACT_ORDER[b.impactLevel];
      if (sortMode === "department") return a.department.localeCompare(b.department);
      return 0;
    });

  // ── Vendor analysis ────────────────────────────────────────────────────────

  async function handleAnalyzeVendor(url: string) {
    setAnalyzerLoading(true);
    setAnalyzerError("");
    setAnalyzerStep("");
    setAnalyzerChars(0);
    try {
      const result = await analyzeCompany(
        url,
        (msg) => setAnalyzerStep(msg),
        (chars) => setAnalyzerChars(chars),
      );
      const id = saveVendor(result);
      setVendors(getAllVendors());
      setActiveVendorIdState(id);
      setActiveEngagementIdState(null);
      setViewMode("overall");
      setFilterLevel("");
    } catch (err) {
      setAnalyzerError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzerLoading(false);
      setAnalyzerStep("");
      setAnalyzerChars(0);
    }
  }

  // ── Engagement analysis ────────────────────────────────────────────────────

  async function handleAnalyzeEngagement(customerUrl: string) {
    if (!engagementTargetVendorId) return;
    const vendor = getVendorById(engagementTargetVendorId);
    if (!vendor) return;

    setEngagementLoading(true);
    setEngagementError("");
    try {
      const result = await analyzeEngagement(vendor, customerUrl);
      const engId = saveEngagement(engagementTargetVendorId, result);
      setVendors(getAllVendors());
      setActiveVendorIdState(engagementTargetVendorId);
      setActiveVendorId(engagementTargetVendorId);
      setActiveEngagementIdState(engId);
      setActiveEngagementId(engId);
      setEngagementTargetVendorId(null);
      setViewMode("by-persona");
      setFilterLevel("");
    } catch (err) {
      setEngagementError(err instanceof Error ? err.message : "Engagement analysis failed.");
    } finally {
      setEngagementLoading(false);
    }
  }

  // ── History navigation ─────────────────────────────────────────────────────

  function handleSelectVendor(vendorId: string) {
    setActiveVendorId(vendorId);
    clearActiveEngagement();
    setActiveVendorIdState(vendorId);
    setActiveEngagementIdState(null);
    setViewMode("overall");
    setFilterLevel("");
  }

  function handleSelectEngagement(vendorId: string, engagementId: string) {
    setActiveVendorId(vendorId);
    setActiveEngagementId(engagementId);
    setActiveVendorIdState(vendorId);
    setActiveEngagementIdState(engagementId);
    setViewMode("by-persona");
    setFilterLevel("");
  }

  function handleDeleteVendor(vendorId: string) {
    deleteVendor(vendorId);
    const list = getAllVendors();
    setVendors(list);
    const newVendorId = getActiveVendorId();
    setActiveVendorIdState(newVendorId);
    setActiveEngagementIdState(getActiveEngagementId());
  }

  function handleDeleteEngagement(vendorId: string, engagementId: string) {
    deleteEngagement(vendorId, engagementId);
    setVendors(getAllVendors());
    const newEngId = getActiveEngagementId();
    setActiveEngagementIdState(newEngId);
  }

  function handleClearAll() {
    clearAllVendors();
    setVendors([]);
    setActiveVendorIdState(null);
    setActiveEngagementIdState(null);
  }

  // ── Persona add / refresh ──────────────────────────────────────────────────

  function handlePersonaAdded(persona: PersonaAdkar) {
    if (!activeVendorId) return;
    if (activeEngagementId) {
      addPersonaToEngagement(activeVendorId, activeEngagementId, persona);
    } else {
      addPersonaToVendor(activeVendorId, persona);
    }
    setVendors(getAllVendors());
    setViewMode("by-persona");
    setShowAddPersona(false);
  }

  function handlePersonaUpdated(persona: PersonaAdkar) {
    if (!activeVendorId) return;
    if (activeEngagementId) {
      updatePersonaInEngagement(activeVendorId, activeEngagementId, persona.id, persona);
    } else {
      updatePersonaInVendor(activeVendorId, persona.id, persona);
    }
    setVendors(getAllVendors());
    setPersonaToRefresh(null);
  }

  const hasVendors = vendors.length > 0;
  const hasActiveContent = !!activeVendor;
  const isEngagementView = !!activeEngagement;

  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-6">
      <div className={`flex gap-6 ${hasVendors ? "items-start" : "justify-center"}`}>

        {/* ── History sidebar ── */}
        {hasVendors && (
          <AnalysisHistory
            vendors={vendors}
            activeVendorId={activeVendorId}
            activeEngagementId={activeEngagementId}
            onSelectVendor={handleSelectVendor}
            onSelectEngagement={handleSelectEngagement}
            onDeleteVendor={handleDeleteVendor}
            onDeleteEngagement={handleDeleteEngagement}
            onClearAll={handleClearAll}
            onAddEngagement={(vendorId) => {
              setEngagementTargetVendorId(vendorId);
              setEngagementError("");
            }}
          />
        )}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Vendor URL input — always visible */}
          <UrlInput onAnalyze={handleAnalyzeVendor} loading={analyzerLoading} />

          {analyzerLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-16 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">{analyzerStep || "Starting…"}</p>
              {analyzerChars > 0
                ? <p className="text-xs text-slate-400">{analyzerChars.toLocaleString()} characters generated…</p>
                : <p className="text-xs text-slate-400">Scraping · Detecting products &amp; ICP · Building ADKAR plan</p>
              }
            </div>
          )}

          {analyzerError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <strong>Error:</strong> {analyzerError}
            </div>
          )}

          {/* Active content */}
          {hasActiveContent && !analyzerLoading && (
            <div className="space-y-5">

              {/* Context strip: vendor (compact when engagement active) */}
              {isEngagementView ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                    {activeVendor.vendorAnalysis.company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {activeVendor.vendorAnalysis.company.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {activeVendor.vendorAnalysis.company.products.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectVendor(activeVendorId!)}
                    className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700 transition-colors whitespace-nowrap"
                  >
                    View vendor →
                  </button>
                </div>
              ) : (
                <CompanyCard company={activeVendor.vendorAnalysis.company} />
              )}

              {/* Customer card (engagement mode) */}
              {isEngagementView && activeEngagement && (
                <CustomerCard
                  customer={activeEngagement.customer}
                  vendor={activeVendor.vendorAnalysis.company}
                />
              )}

              {/* Add engagement CTA (vendor mode, no engagements yet) */}
              {!isEngagementView && (
                <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-900">
                      Add a customer engagement
                    </p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                      Enter a customer&apos;s URL and Claude will generate personas specific to their org adopting {activeVendor.vendorAnalysis.company.name}&apos;s product.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEngagementTargetVendorId(activeVendorId!);
                      setEngagementError("");
                    }}
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                  >
                    + Add Customer
                  </button>
                </div>
              )}

              {/* View controls */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {(["overall", "by-persona"] as ViewMode[]).map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        viewMode === mode ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                      }`}>
                      {mode === "overall" ? "Overall Impact" : `By Persona (${activePersonas.length})`}
                    </button>
                  ))}
                </div>

                {viewMode === "by-persona" && (
                  <>
                    <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="impact">Sort by Impact</option>
                      <option value="department">Sort by Department</option>
                      <option value="default">Default Order</option>
                    </select>
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as ImpactLevel | "")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="">All Impact Levels</option>
                      {(["critical", "high", "medium", "low"] as ImpactLevel[]).map((l) => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                  </>
                )}

                <button onClick={() => setShowAddPersona(true)}
                  className="ml-auto flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Persona
                </button>
              </div>

              {/* Overall view */}
              {viewMode === "overall" && activeOverallImpact && (
                <OverallImpact impact={activeOverallImpact} personas={activePersonas} />
              )}

              {/* By persona view */}
              {viewMode === "by-persona" && (
                <div className="space-y-3">
                  {sortedPersonas.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
                      No personas match the selected filter.
                    </div>
                  ) : (
                    sortedPersonas.map((persona) => (
                      <PersonaCard key={persona.id} persona={persona}
                        onRefresh={(p) => setPersonaToRefresh(p)} />
                    ))
                  )}
                  <button onClick={() => setShowAddPersona(true)}
                    className="w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 py-4 text-sm text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add a persona you know from working with{" "}
                    {isEngagementView ? activeEngagement?.customer.name : "this company"}
                  </button>
                </div>
              )}

              {viewMode === "by-persona" && (
                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  {(["critical", "high", "medium", "low"] as ImpactLevel[]).map((l) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${IMPACT_DOT[l]}`} />
                      {l.charAt(0).toUpperCase() + l.slice(1)} impact
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!hasActiveContent && !analyzerLoading && !analyzerError && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-14 text-center">
              <p className="text-slate-400 text-sm">Enter your company&apos;s URL above to start.</p>
              <p className="text-slate-400 text-xs mt-1">
                Then add customer engagements to generate hyper-specific ADKAR plans.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Engagement modal */}
      {engagementTargetVendorId && (
        <EngagementModal
          vendorName={getVendorById(engagementTargetVendorId)?.vendorAnalysis.company.name ?? ""}
          onClose={() => setEngagementTargetVendorId(null)}
          onSubmit={handleAnalyzeEngagement}
          loading={engagementLoading}
          error={engagementError}
        />
      )}

      {/* Add persona modal */}
      {showAddPersona && activeCompanyForPersonaModal && (
        <PersonaFormModal
          company={activeCompanyForPersonaModal}
          existingPersonas={activePersonas}
          onClose={() => setShowAddPersona(false)}
          onDone={handlePersonaAdded}
        />
      )}

      {/* Refresh persona modal */}
      {personaToRefresh && activeCompanyForPersonaModal && (
        <PersonaFormModal
          company={activeCompanyForPersonaModal}
          existingPersonas={activePersonas}
          personaToRefresh={personaToRefresh}
          onClose={() => setPersonaToRefresh(null)}
          onDone={handlePersonaUpdated}
        />
      )}
    </main>
  );
}
