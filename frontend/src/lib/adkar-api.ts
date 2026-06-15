import type { AdkarAnalysis, PersonaAdkar, CompanyInfo } from "@/types/adkar";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Backend returned an unexpected response (${res.status}). Make sure the backend is running on port 4000.`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export async function analyzeCompany(
  url: string,
  onStep: (msg: string) => void,
  onProgress: (chars: number) => void
): Promise<AdkarAnalysis> {
  const res = await fetch(`${BASE}/adkar/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.body) throw new Error("No response stream from server.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      const event = JSON.parse(part.slice(6)) as {
        type: "step" | "progress" | "done" | "error";
        message?: string;
        chars?: number;
        result?: AdkarAnalysis;
      };

      if (event.type === "step" && event.message) onStep(event.message);
      if (event.type === "progress" && event.chars) onProgress(event.chars);
      if (event.type === "error") throw new Error(event.message ?? "Analysis failed.");
      if (event.type === "done" && event.result) return event.result;
    }
  }

  throw new Error("Stream ended without a result.");
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
