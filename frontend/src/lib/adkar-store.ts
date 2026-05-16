import type { AdkarAnalysis, PersonaAdkar, EngagementEntry, VendorEntry } from "@/types/adkar";

export type { VendorEntry, EngagementEntry };

const VENDORS_KEY = "vee_vendors_v2";
const ACTIVE_VENDOR_KEY = "vee_active_vendor_v2";
const ACTIVE_ENGAGEMENT_KEY = "vee_active_engagement_v2";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getVendors(): VendorEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(VENDORS_KEY);
  if (!raw) return migrateFromV1();
  try {
    return JSON.parse(raw) as VendorEntry[];
  } catch {
    return [];
  }
}

function setVendors(list: VendorEntry[]): void {
  localStorage.setItem(VENDORS_KEY, JSON.stringify(list));
}

function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** One-time migration: convert old vee_adkar_list entries into VendorEntry format */
function migrateFromV1(): VendorEntry[] {
  const raw = localStorage.getItem("vee_adkar_list");
  if (!raw) return [];
  try {
    const old = JSON.parse(raw) as Array<{ id: string; savedAt: string; analysis: AdkarAnalysis }>;
    const migrated: VendorEntry[] = old.map((e) => ({
      id: e.id,
      savedAt: e.savedAt,
      vendorAnalysis: e.analysis,
      engagements: [],
    }));
    setVendors(migrated);
    return migrated;
  } catch {
    return [];
  }
}

// ─── Vendor CRUD ──────────────────────────────────────────────────────────────

export function saveVendor(analysis: AdkarAnalysis): string {
  const vendors = getVendors();
  const existing = vendors.findIndex(
    (v) => v.vendorAnalysis.company.url === analysis.company.url
  );

  if (existing >= 0) {
    const id = vendors[existing].id;
    vendors[existing] = {
      ...vendors[existing],
      savedAt: new Date().toISOString(),
      vendorAnalysis: analysis,
    };
    setVendors(vendors);
    setActiveVendorId(id);
    clearActiveEngagement();
    return id;
  }

  const id = makeId();
  setVendors([{ id, savedAt: new Date().toISOString(), vendorAnalysis: analysis, engagements: [] }, ...vendors]);
  setActiveVendorId(id);
  clearActiveEngagement();
  return id;
}

export function getAllVendors(): VendorEntry[] {
  return getVendors();
}

export function getVendorById(id: string): VendorEntry | null {
  return getVendors().find((v) => v.id === id) ?? null;
}

export function deleteVendor(id: string): void {
  const vendors = getVendors().filter((v) => v.id !== id);
  setVendors(vendors);
  if (getActiveVendorId() === id) {
    setActiveVendorId(vendors[0]?.id ?? null);
    clearActiveEngagement();
  }
}

export function clearAllVendors(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VENDORS_KEY);
  localStorage.removeItem(ACTIVE_VENDOR_KEY);
  localStorage.removeItem(ACTIVE_ENGAGEMENT_KEY);
}

// ─── Vendor persona mutations ─────────────────────────────────────────────────

export function addPersonaToVendor(vendorId: string, persona: PersonaAdkar): void {
  const vendors = getVendors();
  const idx = vendors.findIndex((v) => v.id === vendorId);
  if (idx < 0) return;
  vendors[idx].vendorAnalysis.personas.push(persona);
  vendors[idx].vendorAnalysis.overallImpact.totalPersonasImpacted =
    vendors[idx].vendorAnalysis.personas.length;
  setVendors(vendors);
}

export function updatePersonaInVendor(vendorId: string, personaId: string, updated: PersonaAdkar): void {
  const vendors = getVendors();
  const vIdx = vendors.findIndex((v) => v.id === vendorId);
  if (vIdx < 0) return;
  const pIdx = vendors[vIdx].vendorAnalysis.personas.findIndex((p) => p.id === personaId);
  if (pIdx < 0) return;
  vendors[vIdx].vendorAnalysis.personas[pIdx] = updated;
  setVendors(vendors);
}

// ─── Engagement CRUD ──────────────────────────────────────────────────────────

export function saveEngagement(
  vendorId: string,
  engagement: Omit<EngagementEntry, "id" | "savedAt">
): string {
  const vendors = getVendors();
  const idx = vendors.findIndex((v) => v.id === vendorId);
  if (idx < 0) throw new Error("Vendor not found");

  // Deduplicate by customer URL
  const existing = vendors[idx].engagements.findIndex(
    (e) => e.customer.url === engagement.customer.url
  );

  let engagementId: string;
  if (existing >= 0) {
    engagementId = vendors[idx].engagements[existing].id;
    vendors[idx].engagements[existing] = {
      ...engagement,
      id: engagementId,
      savedAt: new Date().toISOString(),
    };
  } else {
    engagementId = makeId();
    vendors[idx].engagements.unshift({
      ...engagement,
      id: engagementId,
      savedAt: new Date().toISOString(),
    });
  }

  setVendors(vendors);
  setActiveEngagementId(engagementId);
  return engagementId;
}

export function getEngagementById(vendorId: string, engagementId: string): EngagementEntry | null {
  return (
    getVendorById(vendorId)?.engagements.find((e) => e.id === engagementId) ?? null
  );
}

export function deleteEngagement(vendorId: string, engagementId: string): void {
  const vendors = getVendors();
  const idx = vendors.findIndex((v) => v.id === vendorId);
  if (idx < 0) return;
  vendors[idx].engagements = vendors[idx].engagements.filter((e) => e.id !== engagementId);
  setVendors(vendors);
  if (getActiveEngagementId() === engagementId) {
    const next = vendors[idx].engagements[0]?.id ?? null;
    setActiveEngagementId(next);
  }
}

export function addPersonaToEngagement(
  vendorId: string,
  engagementId: string,
  persona: PersonaAdkar
): void {
  const vendors = getVendors();
  const vIdx = vendors.findIndex((v) => v.id === vendorId);
  if (vIdx < 0) return;
  const eIdx = vendors[vIdx].engagements.findIndex((e) => e.id === engagementId);
  if (eIdx < 0) return;
  vendors[vIdx].engagements[eIdx].personas.push(persona);
  vendors[vIdx].engagements[eIdx].overallImpact.totalPersonasImpacted =
    vendors[vIdx].engagements[eIdx].personas.length;
  setVendors(vendors);
}

export function updatePersonaInEngagement(
  vendorId: string,
  engagementId: string,
  personaId: string,
  updated: PersonaAdkar
): void {
  const vendors = getVendors();
  const vIdx = vendors.findIndex((v) => v.id === vendorId);
  if (vIdx < 0) return;
  const eIdx = vendors[vIdx].engagements.findIndex((e) => e.id === engagementId);
  if (eIdx < 0) return;
  const pIdx = vendors[vIdx].engagements[eIdx].personas.findIndex((p) => p.id === personaId);
  if (pIdx < 0) return;
  vendors[vIdx].engagements[eIdx].personas[pIdx] = updated;
  setVendors(vendors);
}

// ─── Active selection ─────────────────────────────────────────────────────────

export function getActiveVendorId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_VENDOR_KEY);
}

export function setActiveVendorId(id: string | null): void {
  if (typeof window === "undefined") return;
  id ? localStorage.setItem(ACTIVE_VENDOR_KEY, id) : localStorage.removeItem(ACTIVE_VENDOR_KEY);
}

export function getActiveEngagementId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_ENGAGEMENT_KEY);
}

export function setActiveEngagementId(id: string | null): void {
  if (typeof window === "undefined") return;
  id
    ? localStorage.setItem(ACTIVE_ENGAGEMENT_KEY, id)
    : localStorage.removeItem(ACTIVE_ENGAGEMENT_KEY);
}

export function clearActiveEngagement(): void {
  setActiveEngagementId(null);
}
