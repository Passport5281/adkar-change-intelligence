const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior change management consultant with 20 years of experience applying the ADKAR framework (Awareness, Desire, Knowledge, Ability, Reinforcement) to enterprise software adoption programs.

Your task: Given scraped content from a B2B software vendor's website, analyse their product(s), identify their Ideal Customer Profile (ICP), then generate a comprehensive, persona-specific ADKAR change management plan for the buyer organisations that will adopt this product.

CRITICAL RULES:
- Detect ALL personas who will be meaningfully impacted — go beyond IT and Business users. Consider operations, finance, legal/compliance, HR, field workers, procurement, executives, data teams, customer-facing roles, etc.
- Tailor every ADKAR element specifically to that persona's day-to-day reality and concerns.
- Make actions concrete and actionable, not generic platitudes.
- Impact levels must be honest — not every persona is "critical".
- Return ONLY valid JSON. No markdown fences, no prose, no explanation outside the JSON.

Return this exact JSON schema:
{
  "company": {
    "name": "string",
    "url": "string",
    "products": ["string"],
    "valueProposition": "string (1 sentence)",
    "icp": ["string (describe each ICP segment)"],
    "industry": "string"
  },
  "overallImpact": {
    "level": "low|medium|high|critical",
    "summary": "string (2-3 sentences covering breadth and depth of change)",
    "totalPersonasImpacted": number,
    "keyRisks": ["string (top 4-5 change risks)"],
    "recommendedApproach": ["string (4-5 high-level recommendations)"],
    "estimatedChangeDuration": "string (e.g. '9-12 months')",
    "complexityDrivers": ["string (what makes this adoption complex)"]
  },
  "personas": [
    {
      "id": "string (kebab-case)",
      "persona": "string (specific role title)",
      "description": "string (who they are, what they do, why this product touches them)",
      "department": "string",
      "impactLevel": "low|medium|high|critical",
      "impactRationale": "string (why this level)",
      "changeType": "process|technology|behavior|culture|all",
      "adkar": {
        "awareness": {
          "currentState": "string (what they know/believe today)",
          "targetState": "string (what they need to understand)",
          "keyMessage": "string (the one message that will land for this persona)",
          "actions": ["string (3-4 specific, concrete actions)"],
          "channels": ["string (best channels to reach this persona)"],
          "timeline": "string (e.g. 'Weeks 1-4')"
        },
        "desire": {
          "motivators": ["string (what personally motivates this persona to adopt)"],
          "resistanceSources": ["string (likely reasons they will push back)"],
          "keyMessage": "string",
          "actions": ["string (3-4 specific actions to build desire)"],
          "timeline": "string"
        },
        "knowledge": {
          "trainingNeeds": ["string (specific things they must learn)"],
          "keyMessage": "string",
          "actions": ["string (3-4 specific training/enablement actions)"],
          "deliveryMethods": ["string (role-appropriate learning formats)"],
          "timeline": "string"
        },
        "ability": {
          "skillGaps": ["string (gaps between current skills and required skills)"],
          "keyMessage": "string",
          "actions": ["string (3-4 actions to build practical ability)"],
          "supportMechanisms": ["string (on-the-job support tools)"],
          "timeline": "string"
        },
        "reinforcement": {
          "successMetrics": ["string (measurable indicators of sustained adoption)"],
          "keyMessage": "string",
          "actions": ["string (3-4 reinforcement actions)"],
          "recognitionMechanisms": ["string (how to celebrate and embed the change)"],
          "timeline": "string"
        }
      }
    }
  ]
}`;

async function generateAdkar(companyUrl, rawText) {
  const userMessage = `Analyse the following content scraped from ${companyUrl} and generate the ADKAR change management plan.

--- SCRAPED CONTENT ---
${rawText}
--- END CONTENT ---`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "Response was cut off (too many personas or too much detail). Try a more focused URL."
    );
  }

  return parseJsonResponse(response.content[0].text);
}

const PERSONA_SYSTEM_PROMPT = `You are a senior change management consultant applying the ADKAR framework (Awareness, Desire, Knowledge, Ability, Reinforcement).

You will be given a company context and asked to generate a complete, tailored ADKAR change management plan for ONE specific persona within a buyer organisation adopting that company's product.

RULES:
- Use the company context and existing personas to make your plan specific and non-generic.
- Incorporate any additional context provided about the persona.
- Make actions concrete, timeline realistic.
- Return ONLY valid JSON matching the schema below. No markdown fences, no prose outside the JSON.

Return this exact schema for the single persona:
{
  "id": "string (kebab-case, unique)",
  "persona": "string (specific role title)",
  "description": "string (who they are, why this product touches them)",
  "department": "string",
  "impactLevel": "low|medium|high|critical",
  "impactRationale": "string",
  "changeType": "process|technology|behavior|culture|all",
  "adkar": {
    "awareness": {
      "currentState": "string",
      "targetState": "string",
      "keyMessage": "string",
      "actions": ["string (3-4 concrete actions)"],
      "channels": ["string"],
      "timeline": "string"
    },
    "desire": {
      "motivators": ["string"],
      "resistanceSources": ["string"],
      "keyMessage": "string",
      "actions": ["string (3-4 concrete actions)"],
      "timeline": "string"
    },
    "knowledge": {
      "trainingNeeds": ["string"],
      "keyMessage": "string",
      "actions": ["string (3-4 concrete actions)"],
      "deliveryMethods": ["string"],
      "timeline": "string"
    },
    "ability": {
      "skillGaps": ["string"],
      "keyMessage": "string",
      "actions": ["string (3-4 concrete actions)"],
      "supportMechanisms": ["string"],
      "timeline": "string"
    },
    "reinforcement": {
      "successMetrics": ["string"],
      "keyMessage": "string",
      "actions": ["string (3-4 concrete actions)"],
      "recognitionMechanisms": ["string"],
      "timeline": "string"
    }
  }
}`;

async function parseJsonResponse(text) {
  const clean = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(clean);
  } catch (parseErr) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Claude returned non-JSON content.");
    try {
      return JSON.parse(match[0]);
    } catch {
      throw new Error(`JSON parse failed: ${parseErr.message}`);
    }
  }
}

async function generatePersonaAdkar({ company, existingPersonas, newPersona, isRefresh = false }) {
  const action = isRefresh ? "UPDATE the ADKAR plan for an existing persona" : "generate a NEW persona ADKAR plan";

  const userMessage = `${action} for the following context.

COMPANY: ${company.name}
PRODUCTS: ${company.products.join(", ")}
VALUE PROPOSITION: ${company.valueProposition}
ICP: ${company.icp.join("; ")}
INDUSTRY: ${company.industry}

EXISTING PERSONAS (for coherence, do not duplicate):
${existingPersonas.map((p, i) => `${i + 1}. ${p.persona} (${p.department})`).join("\n")}

${isRefresh ? "PERSONA TO UPDATE" : "NEW PERSONA TO PLAN FOR"}:
Role: ${newPersona.role}
Department: ${newPersona.department || "Not specified"}
${newPersona.context ? `Additional context from working with this company:\n${newPersona.context}` : ""}

Generate the complete ADKAR JSON for this single persona.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: PERSONA_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Response was cut off. Please try again.");
  }

  return parseJsonResponse(response.content[0].text);
}

const ENGAGEMENT_SYSTEM_PROMPT = `You are a senior change management consultant applying the ADKAR framework to real enterprise software adoption engagements.

You will receive two pieces of context:
1. A VENDOR whose product is being adopted
2. A CUSTOMER company who is adopting that product

Your task: Generate a hyper-specific, customer-tailored ADKAR change management plan. Personas must reflect the CUSTOMER's actual business — their industry, scale, org structure, and likely roles — NOT generic ICP descriptions.

RULES:
- Draw on what you know about the customer company (industry, scale, culture, typical org structure)
- Generate ALL personas who will be meaningfully impacted at that specific company
- Make ADKAR actions specific to this company's context
- Impact levels must reflect this company's actual exposure to the product
- Return ONLY valid JSON. No markdown fences, no prose outside the JSON.

Return this exact JSON schema:
{
  "customer": {
    "name": "string",
    "url": "string",
    "industry": "string",
    "description": "string (2 sentences: what they do and why this product is relevant to them)",
    "size": "string (e.g. '10,000+ employees', 'Mid-market ~500 employees')"
  },
  "overallImpact": {
    "level": "low|medium|high|critical",
    "summary": "string (2-3 sentences specific to this customer)",
    "totalPersonasImpacted": number,
    "keyRisks": ["string (4-5 risks specific to this customer)"],
    "recommendedApproach": ["string (4-5 recommendations)"],
    "estimatedChangeDuration": "string",
    "complexityDrivers": ["string"]
  },
  "personas": [
    {
      "id": "string (kebab-case)",
      "persona": "string (specific role title as it would exist at this company)",
      "description": "string (who they are at THIS company and why this product touches them)",
      "department": "string",
      "impactLevel": "low|medium|high|critical",
      "impactRationale": "string",
      "changeType": "process|technology|behavior|culture|all",
      "adkar": {
        "awareness": {
          "currentState": "string",
          "targetState": "string",
          "keyMessage": "string",
          "actions": ["string (3-4 concrete actions)"],
          "channels": ["string"],
          "timeline": "string"
        },
        "desire": {
          "motivators": ["string"],
          "resistanceSources": ["string"],
          "keyMessage": "string",
          "actions": ["string (3-4 concrete actions)"],
          "timeline": "string"
        },
        "knowledge": {
          "trainingNeeds": ["string"],
          "keyMessage": "string",
          "actions": ["string (3-4 concrete actions)"],
          "deliveryMethods": ["string"],
          "timeline": "string"
        },
        "ability": {
          "skillGaps": ["string"],
          "keyMessage": "string",
          "actions": ["string (3-4 concrete actions)"],
          "supportMechanisms": ["string"],
          "timeline": "string"
        },
        "reinforcement": {
          "successMetrics": ["string"],
          "keyMessage": "string",
          "actions": ["string (3-4 concrete actions)"],
          "recognitionMechanisms": ["string"],
          "timeline": "string"
        }
      }
    }
  ]
}`;

async function generateEngagementPersonas({ vendor, customerText, customerUrl }) {
  const customerContext = customerText?.trim()
    ? `CUSTOMER COMPANY (scraped from ${customerUrl}):\n--- BEGIN CUSTOMER CONTENT ---\n${customerText}\n--- END CUSTOMER CONTENT ---`
    : `CUSTOMER COMPANY URL: ${customerUrl}\n\nNote: The customer's website could not be scraped (likely bot protection). Use your training knowledge about this company — their industry, scale, typical org structure, and business model — to generate the personas.`;

  const userMessage = `Generate a customer-specific ADKAR change management plan for the following engagement.

VENDOR BEING ADOPTED:
Company: ${vendor.company.name}
Products: ${vendor.company.products.join(", ")}
Value Proposition: ${vendor.company.valueProposition}
ICP: ${vendor.company.icp.join("; ")}
Industry: ${vendor.company.industry}

${customerContext}

Generate personas that are specific to THIS customer adopting ${vendor.company.name}'s product. Use their actual business context, not generic descriptions.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: ENGAGEMENT_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("Response was cut off. Please try again.");
  }

  return parseJsonResponse(response.content[0].text);
}

module.exports = { generateAdkar, generatePersonaAdkar, generateEngagementPersonas };
