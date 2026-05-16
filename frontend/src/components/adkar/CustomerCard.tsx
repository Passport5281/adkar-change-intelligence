"use client";

import type { CustomerInfo, CompanyInfo } from "@/types/adkar";

interface Props {
  customer: CustomerInfo;
  vendor: CompanyInfo;
}

export default function CustomerCard({ customer, vendor }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
      <div className="flex items-start gap-4">
        {/* Customer avatar */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-bold">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{customer.name}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {customer.industry}
            </span>
            {customer.size && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {customer.size}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{customer.description}</p>
          <a
            href={customer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            {customer.url}
          </a>
        </div>
      </div>

      {/* Engagement context strip */}
      <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-center gap-3">
        <div className="shrink-0 w-7 h-7 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 text-xs font-bold">
          {vendor.name.charAt(0)}
        </div>
        <p className="text-xs text-indigo-800">
          <span className="font-semibold">{customer.name}</span> is adopting{" "}
          <span className="font-semibold">{vendor.products.slice(0, 2).join(", ")}</span>{" "}
          from <span className="font-semibold">{vendor.name}</span>
        </p>
      </div>
    </div>
  );
}
