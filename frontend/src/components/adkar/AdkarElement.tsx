"use client";

import { useState } from "react";
import type { AdkarKey, PersonaAdkar } from "@/types/adkar";
import { ADKAR_META } from "@/lib/adkar-helpers";

interface Props {
  adkarKey: AdkarKey;
  data: PersonaAdkar["adkar"][AdkarKey];
}

export default function AdkarElement({ adkarKey, data }: Props) {
  const [open, setOpen] = useState(false);
  const meta = ADKAR_META[adkarKey];

  // Safely extract common fields
  const element = data as unknown as Record<string, unknown>;
  const keyMessage = element.keyMessage as string;
  const actions = element.actions as string[];
  const timeline = element.timeline as string;

  // Type-specific extra fields
  const extras: { label: string; items: string[] }[] = [];

  if (adkarKey === "awareness") {
    const d = data as import("@/types/adkar").AdkarAwareness;
    extras.push(
      { label: "Current State", items: [d.currentState] },
      { label: "Target State", items: [d.targetState] },
      { label: "Channels", items: d.channels },
    );
  } else if (adkarKey === "desire") {
    const d = data as import("@/types/adkar").AdkarDesire;
    extras.push(
      { label: "Motivators", items: d.motivators },
      { label: "Likely Resistance", items: d.resistanceSources },
    );
  } else if (adkarKey === "knowledge") {
    const d = data as import("@/types/adkar").AdkarKnowledge;
    extras.push(
      { label: "Training Needs", items: d.trainingNeeds },
      { label: "Delivery Methods", items: d.deliveryMethods },
    );
  } else if (adkarKey === "ability") {
    const d = data as import("@/types/adkar").AdkarAbility;
    extras.push(
      { label: "Skill Gaps", items: d.skillGaps },
      { label: "Support Mechanisms", items: d.supportMechanisms },
    );
  } else if (adkarKey === "reinforcement") {
    const d = data as import("@/types/adkar").AdkarReinforcement;
    extras.push(
      { label: "Success Metrics", items: d.successMetrics },
      { label: "Recognition Mechanisms", items: d.recognitionMechanisms },
    );
  }

  return (
    <div className={`rounded-xl ring-1 ${meta.bg} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${meta.color} bg-white shadow-sm`}
        >
          {meta.letter}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
          <p className="text-xs text-slate-500 truncate">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{timeline}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-white/60 px-4 py-4 space-y-4 bg-white/50">
          {/* Key message */}
          <div className="rounded-lg bg-white px-3 py-2.5 ring-1 ring-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 mb-1">Key Message</p>
            <p className="text-sm text-slate-800 font-medium">&ldquo;{keyMessage}&rdquo;</p>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Actions</p>
            <ul className="space-y-1.5">
              {actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className={`shrink-0 mt-0.5 font-bold text-xs ${meta.color}`}>{i + 1}.</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Extra fields */}
          {extras.map(({ label, items }) =>
            items?.length ? (
              <div key={label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
