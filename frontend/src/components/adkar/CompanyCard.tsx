"use client";

import type { CompanyInfo } from "@/types/adkar";

interface Props {
  company: CompanyInfo;
}

export default function CompanyCard({ company }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
      <div className="flex items-start gap-4">
        {/* Logo placeholder */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold">
          {company.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {company.industry}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{company.valueProposition}</p>
          <a
            href={company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            {company.url}
          </a>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Products */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Products &amp; Services
          </p>
          <div className="flex flex-wrap gap-1.5">
            {company.products.map((p) => (
              <span
                key={p}
                className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-medium ring-1 ring-indigo-100"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ICP */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Ideal Customer Profile (ICP)
          </p>
          <ul className="space-y-1">
            {company.icp.map((segment) => (
              <li key={segment} className="flex items-start gap-1.5 text-xs text-slate-600">
                <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {segment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
