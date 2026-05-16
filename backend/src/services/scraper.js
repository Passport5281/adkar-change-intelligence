const axios = require("axios");
const cheerio = require("cheerio");

const MAX_CHARS = 12000;

const REMOVE_TAGS = [
  "script", "style", "noscript", "header", "footer", "nav",
  "aside", "iframe", "svg", "img", "form", "button", "cookie",
];

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "max-age=0",
};

async function fetchPageText(url) {
  const res = await axios.get(url, {
    timeout: 20000,
    maxRedirects: 8,
    headers: BROWSER_HEADERS,
    validateStatus: (s) => s < 500,
  });

  // Non-OK but not server error — still try to parse whatever came back
  if (!res.data || typeof res.data !== "string") return "";

  const $ = cheerio.load(res.data);

  REMOVE_TAGS.forEach((tag) => $(tag).remove());
  $("[aria-hidden='true']").remove();
  $("[style*='display:none'], [style*='display: none']").remove();

  const priorities = [
    "main", "article", '[role="main"]', ".content", "#content",
    ".hero", ".homepage", "#main-content", ".site-content", "body",
  ];

  let text = "";
  for (const selector of priorities) {
    const el = $(selector).first();
    if (el.length) {
      text = el.text();
      if (text.trim().length > 300) break;
    }
  }

  if (!text.trim()) text = $("body").text();

  return text
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CHARS);
}

async function scrapeCompany(url) {
  const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  const base = parsed.origin;

  // Try the main page + several about-style paths in parallel
  const aboutPaths = ["/about", "/about-us", "/company", "/our-story", "/who-we-are"];
  const aboutAttempts = aboutPaths.map((p) =>
    fetchPageText(`${base}${p}`).catch(() => "")
  );

  const [homeResult, ...aboutResults] = await Promise.allSettled([
    fetchPageText(base),
    ...aboutAttempts,
  ]);

  const parts = [];

  if (homeResult.status === "fulfilled" && homeResult.value?.trim().length > 100) {
    parts.push(`[Homepage]\n${homeResult.value}`);
  }

  // Take the first about-style page that has real content
  for (const r of aboutResults) {
    if (r.status === "fulfilled" && r.value?.trim().length > 200) {
      parts.push(`[About page]\n${r.value}`);
      break;
    }
  }

  return {
    url: base,
    rawText: parts.join("\n\n---\n\n").slice(0, MAX_CHARS * 2),
    scrapeFailed: parts.length === 0,
  };
}

module.exports = { scrapeCompany };
