const express = require("express");
const router = express.Router();
const { scrapeCompany } = require("../services/scraper");
const { generateAdkar, generatePersonaAdkar, generateEngagementPersonas } = require("../services/claude");

function requireApiKey(req, res, next) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in backend/.env" });
  }
  next();
}

// Full company analysis
router.post("/analyze", requireApiKey, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  let scraped;
  try {
    scraped = await scrapeCompany(url);
  } catch (err) {
    scraped = { url, rawText: "", scrapeFailed: true };
  }

  if (scraped.scrapeFailed && !scraped.rawText) {
    // For vendor analysis we need some signal — surface a helpful error
    return res.status(422).json({
      error: "Could not retrieve content from that URL. Try the /about or /product page directly, or check the URL is correct.",
    });
  }

  let analysis;
  try {
    analysis = await generateAdkar(scraped.url, scraped.rawText);
  } catch (err) {
    return res.status(500).json({ error: `AI analysis failed: ${err.message}` });
  }

  res.json({ ...analysis, company: { ...analysis.company, url: scraped.url } });
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
