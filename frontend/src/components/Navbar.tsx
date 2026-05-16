"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllVendors, getActiveVendorId, getVendorById } from "@/lib/adkar-store";

export default function Navbar() {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    const activeId = getActiveVendorId();
    const vendor = activeId ? getVendorById(activeId) : null;
    setCompanyName(vendor?.vendorAnalysis.company.name ?? null);
    setTotalSaved(getAllVendors().length);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center gap-4">
        {/* Brand */}
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">
            Vendor Enablement Engine
          </p>
          <p className="text-[11px] text-slate-400">ADKAR Change Intelligence</p>
        </div>

        {/* Active analysis pill */}
        {companyName && (
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {companyName}
            {totalSaved > 1 && (
              <span className="text-indigo-400">+{totalSaved - 1} more</span>
            )}
          </div>
        )}

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>
    </header>
  );
}
