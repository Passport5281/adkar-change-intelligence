"use client";

import type { OverallImpact as OverallImpactType, PersonaAdkar } from "@/types/adkar";
import { IMPACT_COLORS, IMPACT_DOT } from "@/lib/adkar-helpers";

interface Props {
  impact: OverallImpactType;
  personas: PersonaAdkar[];
}

const LEVEL_ORDER = ["critical", "high", "medium", "low"] as const;

export default function OverallImpact({ impact, personas }: Props) {
  const byLevel = LEVEL_ORDER.map((level) => ({
    level,
    count: personas.filter((p) => p.impactLevel === level).length,
  })).filter((x) => x.count > 0);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-bold text-slate-900">Overall Change Impact</h3>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ${IMPACT_COLORS[impact.level]}`}>
                {impact.level.charAt(0).toUpperCase() + impact.level.slice(1)} Impact
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{impact.summary}</p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 shrink-0">
            <Stat label="Personas" value={impact.totalPersonasImpacted} />
            <Stat label="Duration" value={impact.estimatedChangeDuration} />
          </div>
        </div>

        {/* Persona breakdown bar */}
        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Personas by Impact Level
          </p>
          <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
            {byLevel.map(({ level, count }) => (
              <div
                key={level}
                className={`${IMPACT_DOT[level]} transition-all`}
                style={{ width: `${(count / personas.length) * 100}%` }}
                title={`${count} ${level}`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {byLevel.map(({ level, count }) => (
              <span key={level} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${IMPACT_DOT[level]}`} />
                {count} {level}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Risks + Approach + Complexity grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoList
          title="Key Change Risks"
          icon="⚠"
          items={impact.keyRisks}
          iconColor="text-orange-500"
        />
        <InfoList
          title="Recommended Approach"
          icon="✓"
          items={impact.recommendedApproach}
          iconColor="text-emerald-500"
        />
        <InfoList
          title="Complexity Drivers"
          icon="◈"
          items={impact.complexityDrivers}
          iconColor="text-violet-500"
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function InfoList({
  title, icon, items, iconColor,
}: {
  title: string; icon: string; items: string[]; iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`shrink-0 ${iconColor} font-bold text-base leading-none mt-0.5`}>{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
