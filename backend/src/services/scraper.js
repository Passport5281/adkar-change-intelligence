const axios = require("axios");
const cheerio = require("cheerio");

const MAX_CHARS = 12000;

const REMOVE_TAGS = [
  "script", "style", "noscript", "header", "footer", "nav",
  "aside", "iframe", "svg", "img", "form", "button",
];

async function fetchPageText(url) {
  const res = await axios.get(url, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VendorEnablementBot/1.0; +https://vendorenabler.io)",
      Accept: "text/html,application/xhtml+xml",
    },
    validateStatus: (s) => s < 400,
  });

  const $ = cheerio.load(res.data);

  REMOVE_TAGS.forEach((tag) => $(tag).remove());
  $("[aria-hidden='true']").remove();

  // Prefer content-rich containers
  const priorities = [
    "main", "article", '[role="main"]', ".content", "#content",
    ".hero", ".homepage", "body",
  ];

  let text = "";
  for (const selector of priorities) {
    const el = $(selector).first();
    if (el.length) {
      text = el.text();
      if (text.trim().length > 500) break;
    }
  }

  if (!text.trim()) text = $("body").text();

  // Collapse whitespace
  text = text
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text.slice(0, MAX_CHARS);
}

async function scrapeCompany(url) {
  // Normalise URL
  const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  const base = parsed.origin;

  const [homeText, aboutText] = await Promise.allSettled([
    fetchPageText(base),
    fetchPageText(`${base}/about`).catch(() => fetchPageText(`${base}/about-us`)),
  ]);

  const parts = [];
  if (homeText.status === "fulfilled") parts.push(`[Homepage]\n${homeText.value}`);
  if (aboutText.status === "fulfilled" && aboutText.value?.trim()) {
    parts.push(`[About page]\n${aboutText.value}`);
  }

  if (!parts.length) throw new Error("Could not retrieve any content from the URL.");

  return {
    url: base,
    rawText: parts.join("\n\n---\n\n").slice(0, MAX_CHARS * 2),
  };
}

module.exports = { scrapeCompany };
