import type { AdkarAnalysis, PersonaAdkar, CompanyInfo } from "@/types/adkar";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export function analyzeCompany(url: string): Promise<AdkarAnalysis> {
  return post<AdkarAnalysis>("/adkar/analyze", { url });
}

export function analyzeEngagement(
  vendor: { vendorAnalysis: AdkarAnalysis },
  customerUrl: string
): Promise<{ customer: import("@/types/adkar").CustomerInfo; overallImpact: import("@/types/adkar").OverallImpact; personas: PersonaAdkar[] }> {
  return post("/adkar/engagement", { vendor: vendor.vendorAnalysis, customerUrl });
}

export function generatePersona(
  company: CompanyInfo,
  existingPersonas: PersonaAdkar[],
  newPersona: { role: string; department: string; context: string },
  isRefresh = false
): Promise<PersonaAdkar> {
  return post<PersonaAdkar>("/adkar/persona", {
    company,
    existingPersonas,
    newPersona,
    isRefresh,
  });
}
