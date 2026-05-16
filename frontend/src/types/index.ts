export interface Department {
  id: string;
  name: string;
  region: string;
  headcount: number;
}

export interface Initiative {
  id: string;
  name: string;
  phase: "planning" | "in-progress" | "completed" | "on-hold";
  owner: string;
  deadline: string;
  description: string;
  category: "Technology" | "Process" | "People" | "Compliance";
}

export type CellStatus = "not-started" | "in-progress" | "completed" | "blocked";

export interface HeatmapCell {
  departmentId: string;
  initiativeId: string;
  impactScore: number;
  readinessScore: number;
  status: CellStatus;
  notes: string;
  lastUpdated: string;
}

export interface HeatmapData {
  departments: Department[];
  initiatives: Initiative[];
  cells: HeatmapCell[];
}

export interface Summary {
  total: number;
  byStatus: Record<CellStatus, number>;
  avgImpact: number;
  avgReadiness: number;
  criticalCells: number;
  blockedCells: number;
}

export type ImpactLevel = "none" | "low" | "medium" | "high" | "critical";

export interface ActiveCell {
  cell: HeatmapCell;
  department: Department;
  initiative: Initiative;
  x: number;
  y: number;
}

export interface Filters {
  status: string;
  category: string;
  region: string;
}
