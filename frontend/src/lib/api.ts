import type { HeatmapData, Summary, Filters, HeatmapCell } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchHeatmap(filters: Partial<Filters> = {}): Promise<HeatmapData> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.region) params.set("region", filters.region);
  const qs = params.toString();
  return get<HeatmapData>(`/heatmap${qs ? `?${qs}` : ""}`);
}

export async function fetchSummary(): Promise<Summary> {
  return get<Summary>("/summary");
}

export async function updateCell(
  departmentId: string,
  initiativeId: string,
  updates: Partial<Pick<HeatmapCell, "impactScore" | "readinessScore" | "status" | "notes">>
): Promise<HeatmapCell> {
  const res = await fetch(`${BASE}/heatmap/${departmentId}/${initiativeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json() as Promise<HeatmapCell>;
}
