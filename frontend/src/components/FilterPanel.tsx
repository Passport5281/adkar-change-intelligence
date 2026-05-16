"use client";

import type { Filters } from "@/types";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const SELECT_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:border-slate-300 transition-colors";

export default function FilterPanel({ filters, onChange }: Props) {
  const set = (key: keyof Filters, val: string) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-slate-500">Filter by:</span>

      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">All Statuses</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="blocked">Blocked</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => set("category", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">All Categories</option>
        <option value="Technology">Technology</option>
        <option value="Process">Process</option>
        <option value="People">People</option>
        <option value="Compliance">Compliance</option>
      </select>

      <select
        value={filters.region}
        onChange={(e) => set("region", e.target.value)}
        className={SELECT_CLASS}
      >
        <option value="">All Regions</option>
        <option value="North America">North America</option>
        <option value="Europe">Europe</option>
        <option value="Asia Pacific">Asia Pacific</option>
        <option value="Global">Global</option>
      </select>

      {(filters.status || filters.category || filters.region) && (
        <button
          onClick={() => onChange({ status: "", category: "", region: "" })}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
