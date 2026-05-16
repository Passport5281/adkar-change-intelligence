import type { AdkarAnalysis, PersonaAdkar, AdkarDesire, AdkarKnowledge, AdkarAbility } from "@/types/adkar";
import type { Department, Initiative, HeatmapCell, HeatmapData, Summary, CellStatus } from "@/types";

const IMPACT_SCORE: Record<string, number> = {
  critical: 92,
  high: 76,
  medium: 50,
  low: 24,
};

const ADKAR_INITIATIVES: Initiative[] = [
  {
    id: "awareness",
    name: "Awareness",
    phase: "in-progress",
    owner: "Change Team",
    deadline: "",
    description: "Build understanding of why this change is happening and what it means",
    category: "People",
  },
  {
    id: "desire",
    name: "Desire",
    phase: "in-progress",
    owner: "Change Team",
    deadline: "",
    description: "Create motivation to participate in and support the change",
    category: "People",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    phase: "planning",
    owner: "Enablement Team",
    deadline: "",
    description: "Provide the know-how to change — training, guides, and resources",
    category: "People",
  },
  {
    id: "ability",
    name: "Ability",
    phase: "planning",
    owner: "Enablement Team",
    deadline: "",
    description: "Develop practical skills and confidence to perform after go-live",
    category: "People",
  },
  {
    id: "reinforcement",
    name: "Reinforcement",
    phase: "planning",
    owner: "Leadership",
    deadline: "",
    description: "Sustain and embed the change — recognition, metrics, and follow-up",
    category: "People",
  },
];

function computeReadiness(persona: PersonaAdkar, adkarId: string): number {
  const impact = persona.impactLevel;

  // Higher impact = lower baseline readiness (more work needed)
  const base =
    impact === "critical" ? 18
    : impact === "high" ? 32
    : impact === "medium" ? 52
    : 68;

  let adj = 0;

  if (adkarId === "awareness") {
    // Awareness is the first step — always starting from scratch
    adj = -5;
  } else if (adkarId === "desire") {
    const d = persona.adkar.desire as AdkarDesire;
    const resistanceCount = d.resistanceSources?.length ?? 0;
    adj = -(resistanceCount * 7);
  } else if (adkarId === "knowledge") {
    const k = persona.adkar.knowledge as AdkarKnowledge;
    const trainingCount = k.trainingNeeds?.length ?? 0;
    adj = -(trainingCount * 5);
  } else if (adkarId === "ability") {
    const a = persona.adkar.ability as AdkarAbility;
    const gapCount = a.skillGaps?.length ?? 0;
    adj = -(gapCount * 7);
  } else if (adkarId === "reinforcement") {
    // Reinforcement always starts lowest — it comes last
    adj = -12;
  }

  return Math.max(8, Math.min(80, base + adj));
}

function statusFromImpact(level: string): CellStatus {
  if (level === "critical") return "not-started";
  if (level === "high") return "not-started";
  return "not-started";
}

export function adkarToHeatmap(analysis: AdkarAnalysis): HeatmapData {
  const departments: Department[] = analysis.personas.map((p) => ({
    id: p.id,
    name: p.persona,
    region: p.department,
    headcount: 0,
  }));

  const cells: HeatmapCell[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (const persona of analysis.personas) {
    for (const init of ADKAR_INITIATIVES) {
      cells.push({
        departmentId: persona.id,
        initiativeId: init.id,
        impactScore: IMPACT_SCORE[persona.impactLevel] ?? 50,
        readinessScore: computeReadiness(persona, init.id),
        status: statusFromImpact(persona.impactLevel),
        notes: persona.impactRationale,
        lastUpdated: today,
      });
    }
  }

  return { departments, initiatives: ADKAR_INITIATIVES, cells };
}

export function computeSummaryFromCells(cells: HeatmapCell[]): Summary {
  const total = cells.length;
  if (total === 0) {
    return {
      total: 0,
      byStatus: { "not-started": 0, "in-progress": 0, completed: 0, blocked: 0 },
      avgImpact: 0,
      avgReadiness: 0,
      criticalCells: 0,
      blockedCells: 0,
    };
  }

  const byStatus = cells.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<CellStatus, number>
  );

  const avgImpact = Math.round(cells.reduce((s, c) => s + c.impactScore, 0) / total);
  const avgReadiness = Math.round(cells.reduce((s, c) => s + c.readinessScore, 0) / total);
  const criticalCells = cells.filter((c) => c.impactScore >= 80 && c.readinessScore < 50).length;
  const blockedCells = cells.filter((c) => c.status === "blocked").length;

  return { total, byStatus, avgImpact, avgReadiness, criticalCells, blockedCells };
}
