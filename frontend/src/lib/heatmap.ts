import type { ImpactLevel } from "@/types";

export function getImpactLevel(score: number): ImpactLevel {
  if (score === 0) return "none";
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "critical";
}

export function impactLevelToColor(level: ImpactLevel): string {
  const map: Record<ImpactLevel, string> = {
    none: "bg-slate-100 text-slate-400",
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-200 text-orange-800",
    critical: "bg-red-300 text-red-900",
  };
  return map[level];
}

export function impactLevelToRing(level: ImpactLevel): string {
  const map: Record<ImpactLevel, string> = {
    none: "ring-slate-200",
    low: "ring-emerald-300",
    medium: "ring-yellow-300",
    high: "ring-orange-400",
    critical: "ring-red-500",
  };
  return map[level];
}

export function readinessBar(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-400";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-500";
}

export const STATUS_LABELS: Record<string, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export const STATUS_BADGE: Record<string, string> = {
  "not-started": "bg-slate-100 text-slate-500",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700",
};

export const PHASE_BADGE: Record<string, string> = {
  planning: "bg-violet-100 text-violet-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  "on-hold": "bg-slate-100 text-slate-500",
};
