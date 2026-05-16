const express = require("express");
const router = express.Router();
const { scrapeCompany } = require("../services/scraper");
const { generateAdkarStream, generatePersonaAdkar, generateEngagementPersonas } = require("../services/claude");

function requireApiKey(req, res, next) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in backend/.env" });
  }
  next();
}

// Full company analysis — streams SSE so the UI shows real-time progress
router.post("/analyze", requireApiKey, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ type: "step", message: "Scraping website…" });

    let scraped;
    try {
      scraped = await scrapeCompany(url);
    } catch {
      scraped = { url, rawText: "", scrapeFailed: true };
    }

    if (scraped.scrapeFailed && !scraped.rawText) {
      send({ type: "error", message: "Could not retrieve content from that URL. Try the /about or /product page directly." });
      return res.end();
    }

    send({ type: "step", message: "Generating ADKAR plan…" });

    const result = await generateAdkarStream(scraped.url, scraped.rawText, (chars) => {
      send({ type: "progress", chars });
    });

    send({ type: "done", result: { ...result, company: { ...result.company, url: scraped.url } } });
  } catch (err) {
    send({ type: "error", message: err.message });
  }

  res.end();
});

// Add or refresh a single persona
router.post("/persona", requireApiKey, async (req, res) => {
  const { company, existingPersonas, newPersona, isRefresh } = req.body;

  if (!company || !newPersona?.role) {
    return res.status(400).json({ error: "company and newPersona.role are required" });
  }

  let persona;
  try {
    persona = await generatePersonaAdkar({
      company,
      existingPersonas: existingPersonas ?? [],
      newPersona,
      isRefresh: !!isRefresh,
    });
  } catch (err) {
    return res.status(500).json({ error: `Persona generation failed: ${err.message}` });
  }

  res.json(persona);
});

// Customer engagement analysis
router.post("/engagement", requireApiKey, async (req, res) => {
  const { vendor, customerUrl } = req.body;

  if (!vendor?.company || !customerUrl) {
    return res.status(400).json({ error: "vendor and customerUrl are required" });
  }

  let scraped;
  try {
    scraped = await scrapeCompany(customerUrl);
  } catch (err) {
    // Scrape totally failed (bad URL, DNS error, etc.) — use the URL alone as fallback
    scraped = { url: customerUrl, rawText: "", scrapeFailed: true };
  }

  let result;
  try {
    result = await generateEngagementPersonas({
      vendor,
      customerText: scraped.rawText,
      customerUrl: scraped.url,
    });
  } catch (err) {
    return res.status(500).json({ error: `Engagement analysis failed: ${err.message}` });
  }

  res.json({ ...result, customer: { ...result.customer, url: scraped.url } });
});

module.exports = router;
