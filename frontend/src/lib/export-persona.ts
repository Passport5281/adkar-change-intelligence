import type { PersonaAdkar } from "@/types/adkar";

const ADKAR_LABELS: Record<string, { label: string; color: string }> = {
  awareness:     { label: "Awareness",     color: "#6366f1" },
  desire:        { label: "Desire",        color: "#8b5cf6" },
  knowledge:     { label: "Knowledge",     color: "#0ea5e9" },
  ability:       { label: "Ability",       color: "#10b981" },
  reinforcement: { label: "Reinforcement", color: "#f59e0b" },
};

const IMPACT_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

function section(title: string, color: string, items: string[][]): string {
  return `
    <div class="adkar-section" style="border-left: 4px solid ${color}; padding-left: 14px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.08em;">${title}</h3>
      ${items.map(([label, ...values]) => `
        <div style="margin-bottom: 8px;">
          <p style="margin: 0 0 3px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;">${label}</p>
          ${values.map((v) => `<p style="margin: 0 0 2px; font-size: 12px; color: #1e293b;">${v}</p>`).join("")}
        </div>
      `).join("")}
    </div>`;
}

function adkarBlock(key: string, data: Record<string, unknown>, color: string, label: string): string {
  const rows: string[][] = [];

  if (data.currentState) rows.push(["Current State", data.currentState as string]);
  if (data.targetState)  rows.push(["Target State",  data.targetState as string]);
  if (data.keyMessage)   rows.push(["Key Message",   data.keyMessage as string]);

  const listFields: [string, string][] = [
    ["actions", "Actions"],
    ["channels", "Channels"],
    ["motivators", "Motivators"],
    ["resistanceSources", "Resistance Sources"],
    ["trainingNeeds", "Training Needs"],
    ["deliveryMethods", "Delivery Methods"],
    ["skillGaps", "Skill Gaps"],
    ["supportMechanisms", "Support Mechanisms"],
    ["successMetrics", "Success Metrics"],
    ["recognitionMechanisms", "Recognition"],
  ];

  for (const [field, fieldLabel] of listFields) {
    const arr = data[field] as string[] | undefined;
    if (arr?.length) rows.push([fieldLabel, ...arr.map((s) => `• ${s}`)]);
  }

  if (data.timeline) rows.push(["Timeline", data.timeline as string]);

  return section(label, color, rows);
}

export function exportPersonaToPDF(
  persona: PersonaAdkar,
  vendorName: string,
  customerName?: string
): void {
  const impactColor = IMPACT_COLORS[persona.impactLevel] ?? "#64748b";
  const context = customerName ? `${customerName} adopting ${vendorName}` : vendorName;

  type AdkarKey = "awareness" | "desire" | "knowledge" | "ability" | "reinforcement";
  const adkarKeys: AdkarKey[] = ["awareness", "desire", "knowledge", "ability", "reinforcement"];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${persona.persona} — ADKAR Plan</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; margin: 0; padding: 32px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.5; }
    h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; color: #0f172a; }
    h2 { font-size: 14px; font-weight: 700; margin: 0 0 16px; color: #475569; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 24px; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .description { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #475569; }
    .rationale { font-size: 12px; color: #64748b; margin-bottom: 24px; }
    .print-btn { display: inline-block; margin-bottom: 24px; padding: 8px 18px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">⬇ Save as PDF</button>

  <div class="header">
    <h2>${context}</h2>
    <h1>${persona.persona}</h1>
    <div class="meta">
      <span class="badge" style="background:${impactColor}22; color:${impactColor};">${persona.impactLevel.charAt(0).toUpperCase() + persona.impactLevel.slice(1)} Impact</span>
      <span class="badge" style="background:#f1f5f9; color:#475569;">${persona.department}</span>
      <span class="badge" style="background:#f1f5f9; color:#475569;">${persona.changeType} change</span>
    </div>
    <div class="description">${persona.description}</div>
    <p class="rationale"><strong>Why this impact level:</strong> ${persona.impactRationale}</p>
  </div>

  ${adkarKeys.map((key) => {
    const { label, color } = ADKAR_LABELS[key];
    const phase = (persona.adkar as unknown as Record<string, unknown>)[key] as unknown as Record<string, unknown>;
    return adkarBlock(key, phase, color, label);
  }).join("")}

  <div class="footer">Generated by Vendor Enablement Engine · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
