"use client";

import { useState } from "react";

interface Props {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

export default function UrlInput({ onAnalyze, loading }: Props) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    let parsed: URL;
    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setValidationError("Please enter a valid URL (e.g. https://salesforce.com)");
      return;
    }
    onAnalyze(parsed.href);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-5">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Analyse a Vendor&apos;s Change Impact
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Paste the URL of any B2B software company. Claude will detect their product, ICP, and generate a full ADKAR change management plan for every persona in the buyer organisation.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setValidationError(""); }}
            placeholder="https://salesforce.com"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analysing…
              </span>
            ) : (
              "Generate ADKAR Plan"
            )}
          </button>
        </form>

        {validationError && (
          <p className="mt-2 text-sm text-red-600 text-left">{validationError}</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Analysis takes ~30–60 seconds · Powered by Claude Opus
        </p>
      </div>
    </div>
  );
}
