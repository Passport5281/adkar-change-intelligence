export type ImpactLevel = "low" | "medium" | "high" | "critical";
export type ChangeType = "process" | "technology" | "behavior" | "culture" | "all";
export type AdkarKey = "awareness" | "desire" | "knowledge" | "ability" | "reinforcement";

export interface AdkarAwareness {
  currentState: string;
  targetState: string;
  keyMessage: string;
  actions: string[];
  channels: string[];
  timeline: string;
}

export interface AdkarDesire {
  motivators: string[];
  resistanceSources: string[];
  keyMessage: string;
  actions: string[];
  timeline: string;
}

export interface AdkarKnowledge {
  trainingNeeds: string[];
  keyMessage: string;
  actions: string[];
  deliveryMethods: string[];
  timeline: string;
}

export interface AdkarAbility {
  skillGaps: string[];
  keyMessage: string;
  actions: string[];
  supportMechanisms: string[];
  timeline: string;
}

export interface AdkarReinforcement {
  successMetrics: string[];
  keyMessage: string;
  actions: string[];
  recognitionMechanisms: string[];
  timeline: string;
}

export interface PersonaAdkar {
  id: string;
  persona: string;
  description: string;
  department: string;
  impactLevel: ImpactLevel;
  impactRationale: string;
  changeType: ChangeType;
  adkar: {
    awareness: AdkarAwareness;
    desire: AdkarDesire;
    knowledge: AdkarKnowledge;
    ability: AdkarAbility;
    reinforcement: AdkarReinforcement;
  };
}

export interface OverallImpact {
  level: ImpactLevel;
  summary: string;
  totalPersonasImpacted: number;
  keyRisks: string[];
  recommendedApproach: string[];
  estimatedChangeDuration: string;
  complexityDrivers: string[];
}

export interface CompanyInfo {
  name: string;
  url: string;
  products: string[];
  valueProposition: string;
  icp: string[];
  industry: string;
}

export interface AdkarAnalysis {
  company: CompanyInfo;
  overallImpact: OverallImpact;
  personas: PersonaAdkar[];
}

export interface CustomerInfo {
  name: string;
  url: string;
  industry: string;
  description: string;
  size: string;
}

export interface EngagementEntry {
  id: string;
  savedAt: string;
  customer: CustomerInfo;
  overallImpact: OverallImpact;
  personas: PersonaAdkar[];
}

export interface VendorEntry {
  id: string;
  savedAt: string;
  vendorAnalysis: AdkarAnalysis;
  engagements: EngagementEntry[];
}
