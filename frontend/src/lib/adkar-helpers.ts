import type { ImpactLevel, AdkarKey } from "@/types/adkar";

export const IMPACT_COLORS: Record<ImpactLevel, string> = {
  low: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  medium: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  high: "bg-orange-100 text-orange-700 ring-orange-200",
  critical: "bg-red-100 text-red-700 ring-red-200",
};

export const IMPACT_DOT: Record<ImpactLevel, string> = {
  low: "bg-emerald-400",
  medium: "bg-yellow-400",
  high: "bg-orange-400",
  critical: "bg-red-500",
};

export const IMPACT_BORDER: Record<ImpactLevel, string> = {
  low: "border-emerald-200",
  medium: "border-yellow-200",
  high: "border-orange-200",
  critical: "border-red-200",
};

export const ADKAR_META: Record<AdkarKey, { label: string; letter: string; color: string; bg: string; description: string }> = {
  awareness: {
    label: "Awareness",
    letter: "A",
    color: "text-violet-700",
    bg: "bg-violet-50 ring-violet-200",
    description: "Understanding of the need for change",
  },
  desire: {
    label: "Desire",
    letter: "D",
    color: "text-blue-700",
    bg: "bg-blue-50 ring-blue-200",
    description: "Motivation to participate and support",
  },
  knowledge: {
    label: "Knowledge",
    letter: "K",
    color: "text-cyan-700",
    bg: "bg-cyan-50 ring-cyan-200",
    description: "Know-how to implement the change",
  },
  ability: {
    label: "Ability",
    letter: "A",
    color: "text-teal-700",
    bg: "bg-teal-50 ring-teal-200",
    description: "Practical skills to perform at the required level",
  },
  reinforcement: {
    label: "Reinforcement",
    letter: "R",
    color: "text-indigo-700",
    bg: "bg-indigo-50 ring-indigo-200",
    description: "Sustaining and embedding the change",
  },
};

export const ADKAR_ORDER: AdkarKey[] = [
  "awareness", "desire", "knowledge", "ability", "reinforcement",
];
