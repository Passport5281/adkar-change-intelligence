# Vendor Enablement Engine

> AI-powered change management intelligence for B2B sales professionals.

Paste a vendor URL and a customer URL — the engine scrapes both companies, then uses Claude to generate a full **ADKAR change management plan** tailored to that specific customer's organisation: their industry, size, structure, and how they'll actually adopt the vendor's product.

---

## What it does

**Vendor analysis** — Enter any software vendor's URL. Claude detects their products, ICP, and generates ADKAR personas covering every role that will be impacted by adoption.

**Customer engagement layer** — Enter a prospect's URL alongside the vendor. Claude re-analyses the customer's specific context and generates hyper-specific personas for *that* org, not generic archetypes.

**Custom personas** — Know someone at the company the AI didn't cover? Add them with role, department, and context. Claude drafts their full ADKAR plan.

**Persona refresh** — Got new intel from a discovery call? Feed it back in and Claude updates that persona's plan without touching the others.

**Multi-vendor history** — All analyses persist locally. A two-level sidebar lets you switch between vendors and their customer engagements instantly.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Anthropic Claude (claude-opus-4-7) with prompt caching |
| Scraping | Axios + Cheerio |
| Persistence | Browser localStorage |

---

## Screenshots

> Coming soon

---

## Running locally

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone and install

```bash
git clone https://github.com/Passport5281/vendor-enablement-engine.git
cd vendor-enablement-engine

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Start both servers

```bash
# Terminal 1 — API server (port 4000)
cd backend && npm start

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How it works

1. **Scraping** — Cheerio fetches the company homepage and `/about` page, strips HTML, and returns clean text.
2. **Vendor analysis** — Claude receives the raw text and returns a structured JSON payload: company profile, ICP segments, products, and per-persona ADKAR plans.
3. **Engagement analysis** — Both the vendor analysis and the customer's scraped text are sent together. Claude generates customer-specific personas grounded in that org's actual context.
4. **Prompt caching** — System prompts use `cache_control: ephemeral` to reduce latency and API cost on repeated calls.

---

## Project structure

```
├── backend/
│   └── src/
│       ├── index.js              # Express entry point
│       ├── routes/adkar.js       # API routes
│       └── services/
│           ├── claude.js         # Anthropic SDK calls
│           └── scraper.js        # Cheerio web scraper
└── frontend/
    └── src/
        ├── app/page.tsx          # Main page (vendor + engagement views)
        ├── components/adkar/     # UI components
        ├── lib/
        │   ├── adkar-api.ts      # API client
        │   ├── adkar-store.ts    # localStorage persistence
        │   └── adkar-helpers.ts  # Color maps, ADKAR metadata
        └── types/adkar.ts        # TypeScript interfaces
```

---

## API

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/adkar/analyze` | `{ url }` | Full vendor ADKAR analysis |
| POST | `/api/adkar/engagement` | `{ vendor, customerUrl }` | Customer-specific engagement plan |
| POST | `/api/adkar/persona` | `{ company, existingPersonas, newPersona, isRefresh }` | Add or refresh a single persona |
