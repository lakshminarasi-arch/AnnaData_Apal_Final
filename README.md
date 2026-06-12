# AnnaData — AI-Powered Demand Forecasting for Restaurant Chains

**Capstone Project · APAL 02 · Group 6 · IIM Calcutta**

> AnnaData helps restaurant managers forecast daily dish demand, generate automated procurement lists, and understand *why* demand is going to spike or dip — powered by ML forecasting, a live REST API, and a natural-language MCP layer for any AI assistant.

**Live Demo → [annadataapal.netlify.app](https://annadataapal.netlify.app)**

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [Repository Structure](#2-repository-structure)
3. [System Architecture](#3-system-architecture)
4. [Live API — Endpoints](#4-live-api--endpoints)
5. [Demand Signals Modelled](#5-demand-signals-modelled)
6. [Model Performance](#6-model-performance)
7. [MCP Server — AI Assistant Integration](#7-mcp-server--ai-assistant-integration)
8. [Running Locally](#8-running-locally)
9. [Deploying to Netlify](#9-deploying-to-netlify)
10. [Data Disclaimer](#10-data-disclaimer)
11. [Team](#11-team)

---

## 1. What This Project Does

Restaurant chains waste significant inventory because they cannot accurately predict how many portions of each dish they will sell on any given day. Demand varies by day of week, local festivals, weather, sporting events, and — as of 2026 — FIFA World Cup match schedules.

AnnaData provides:

- **7-day demand forecast** per dish per branch, broken down by day
- **Bill of Materials (BOM)** — auto-generated ingredient quantities grouped by vendor, ready to share with suppliers
- **AI Insight Cards** — plain-English explanations of what is driving the forecast (festival, rain, match day, income cycle)
- **MCP Server** — wraps all of the above so any MCP-compatible AI assistant (Claude Desktop, Gemini CLI, ChatGPT Desktop) can answer natural-language queries like *"How much chicken should I order for Koramangala next week?"*

---

## 2. Repository Structure

```
AnnaData_Apal_Final/
│
├── annadata_demo.html          # Full frontend UI (single-file, no build step)
│                               # Fetches all data from the live API at runtime
│
├── netlify/
│   └── functions/
│       └── api.js              # Serverless function — all five API endpoints
│                               # Deployed automatically by Netlify on push
│
├── annadata-mcp/
│   └── index.js                # Node.js MCP server (stdio transport)
│                               # Wraps the five API endpoints as MCP tools
│                               # for use with Claude Desktop, Gemini CLI, etc.
│
├── synthetic_historical_demand.csv   # 54,750 rows of synthetic demand data
│                                     # Used to train and evaluate ML models
│                                     # (365 days × 50 dishes × 3 branches)
│
├── netlify.toml                # Netlify build and redirect configuration
│                               # Routes /api → /.netlify/functions/api
│
└── README.md                   # This file
```

> **Note on `api.js` location:** Netlify requires the serverless function to live at `netlify/functions/api.js`. The `netlify.toml` in this repo is already configured for that path.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                           │
│  synthetic_historical_demand.csv  (54,750 rows)             │
│  + Static demand signals embedded in api.js                 │
│    · Day-of-week multipliers                                 │
│    · 25 named events (festivals, weather, sports)           │
│    · 24 FIFA 2026 match dates with confidence weights       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
│  netlify/functions/api.js  (Netlify Serverless / Node.js)  │
│  Deployed at: annadataapal.netlify.app                      │
│                                                             │
│  GET /api?endpoint=branches   → branch list                 │
│  GET /api?endpoint=menu       → 50-dish menu               │
│  GET /api?endpoint=forecast   → 7-day demand predictions   │
│  GET /api?endpoint=bom        → ingredient quantities      │
│  GET /api?endpoint=insights   → AI insight cards           │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐       ┌──────────────────────────────┐
│   FRONTEND LAYER    │       │        MCP LAYER             │
│  annadata_demo.html │       │  annadata-mcp/index.js       │
│  (Browser, no build)│       │  (Node.js, stdio transport)  │
│                     │       │                              │
│  Branch selector    │       │  5 MCP tools exposed:        │
│  Dish selector      │       │  · get_branches              │
│  Forecast chart     │       │  · get_menu                  │
│  BOM table          │       │  · get_forecast              │
│  Insight cards      │       │  · get_bom                   │
└─────────────────────┘       │  · get_insights              │
                              │                              │
                              │  Compatible with:            │
                              │  Claude Desktop / Code       │
                              │  Gemini CLI                  │
                              │  ChatGPT Desktop             │
                              └──────────────────────────────┘
```

---

## 4. Live API — Endpoints

All endpoints are live at `https://annadataapal.netlify.app/api`.

### `GET /api?endpoint=branches`
Returns the three Spice Garden branches.

```
https://annadataapal.netlify.app/api?endpoint=branches
```

### `GET /api?endpoint=menu`
Returns all 50 dishes across 7 categories (Starters, Main Non-Veg, Main Veg, Breads, Rice, Desserts).

```
https://annadataapal.netlify.app/api?endpoint=menu
```

### `GET /api?endpoint=forecast`
Returns a 7-day demand forecast for selected dishes at a branch.

```
https://annadataapal.netlify.app/api?endpoint=forecast&branch=kor&dishes=11,12&days=7&startDate=2026-06-13
```

| Parameter   | Required | Values                        | Default      |
|-------------|----------|-------------------------------|--------------|
| `branch`    | No       | `kor`, `ind`, `whi`           | `kor`        |
| `dishes`    | No       | Comma-separated dish IDs      | All 50 dishes|
| `days`      | No       | `1`–`7`                       | `7`          |
| `startDate` | No       | `YYYY-MM-DD`                  | `2025-04-12` |

### `GET /api?endpoint=bom`
Returns a Bill of Materials — ingredient quantities grouped by vendor — for the forecast window. Accepts the same parameters as `forecast`.

```
https://annadataapal.netlify.app/api?endpoint=bom&branch=kor&dishes=11,12&days=7&startDate=2026-06-13
```

### `GET /api?endpoint=insights`
Returns AI insight cards explaining demand signals in the forecast window.

```
https://annadataapal.netlify.app/api?endpoint=insights&branch=kor&dishes=11,12&startDate=2026-06-13
```

---

## 5. Demand Signals Modelled

The forecast multiplier for each day is a product of several independent signals:

### Day-of-Week Pattern
| Day | Multiplier | Interpretation |
|-----|-----------|----------------|
| Wednesday | 1.55× | Mid-week dining peak |
| Thursday | 1.40× | Pre-weekend |
| Saturday | 1.15× | Weekend |
| Monday | 0.72× | Post-weekend dip |
| Tuesday | 0.68× | Lowest traffic day |

### Named Events (25 dates)
Festivals (Eid, Diwali, Ugadi), public holidays, IPL match days, and weather events each carry an `overallMult` and — where applicable — a `biryaniBoost`. For example, Eid al-Fitr carries a 1.42× biryani-specific boost.

### FIFA 2026 World Cup Signal
24 match dates are tracked across June–July 2026. Matches with noon EDT/CDT kickoffs land at 9:30–10:30 PM IST — prime dinner and group-viewing time for screen-showing restaurants.

Teams are classified into four tiers:

| Tier | Teams | Group Stage | Round of 16 | Final |
|------|-------|------------|-------------|-------|
| Super | Tier-1 vs Tier-1 knockout | 1.60× | 1.75× | 2.00× |
| Tier 1 | Argentina, Brazil | 1.25× | 1.40× | 1.70× |
| Tier 2 | France, Spain, England, Portugal | 1.12× | 1.20× | 1.35× |
| Tier 3 | Germany, Mexico | 1.06× | 1.10× | 1.00× |

The effective multiplier is **confidence-weighted** to account for fixture uncertainty in knockout rounds:

```
effective_mult = 1.0 + (raw_mult - 1.0) × confidence
```

A Tier-1 group stage match (confidence = 1.00) delivers the full 1.25×. A Round-of-16 slot where a popular team *might* qualify (confidence = 0.65) delivers a proportionally smaller uplift.

---

## 6. Model Performance

Models were trained on the synthetic dataset (56-day training window, 7-day held-out test set, 50 dishes, 3 branches).

| Model | MAPE ↓ | Directional Accuracy ↑ | R² ↑ |
|-------|--------|------------------------|------|
| **XGBoost** | **10.6%** | **85.7%** | **0.56** |
| LSTM | 11.4% | 82.3% | 0.51 |
| Prophet | 12.8% | 79.5% | 0.44 |
| Ridge Regression | 18.5% | 71.2% | 0.31 |
| Lag-7 Naive (baseline) | 20.3% | 70.1% | 0.22 |

**XGBoost** was selected for deployment. It outperforms the Lag-7 Naive baseline by **+2.2 percentage points** in directional accuracy — meaning it correctly predicts whether tomorrow is busier or quieter than today roughly 6 in 7 times.

Industry norm for restaurant demand MAPE is 15–20%. XGBoost at 10.6% comfortably beats this benchmark on the synthetic dataset.

> ⚠️ **Important:** These results are on **synthetically generated data**, not real POS transaction data. The synthetic dataset was structured to mirror real Bengaluru restaurant demand patterns (seasonality, weekday effects, festival spikes) but has not been validated against actual restaurant records. The relative model ranking — XGBoost > LSTM > Prophet > Ridge > Naive — is consistent with published literature on similar time-series forecasting tasks.

---

## 7. MCP Server — AI Assistant Integration

The `annadata-mcp/index.js` file is a **Model Context Protocol (MCP)** server that wraps all five AnnaData API endpoints as callable tools. This allows any MCP-compatible AI assistant to query AnnaData in natural language.

### One-Time Setup (Claude Desktop)

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "annadata": {
      "command": "node",
      "args": ["/absolute/path/to/annadata-mcp/index.js"]
    }
  }
}
```

Restart Claude Desktop. No HTTP server, no API key, no authentication required.

### What You Can Ask

Once connected, you can ask your AI assistant:
- *"What's the demand forecast for Chicken Biryani at Koramangala next week?"*
- *"Generate a 7-day procurement list for Indiranagar branch."*
- *"Are there any demand spikes in July due to FIFA matches?"*
- *"Show me all non-veg starters and their forecasted demand."*

### Supported Clients
| Client | Transport | Status |
|--------|-----------|--------|
| Claude Desktop / Claude Code | stdio | ✅ Tested |
| Gemini CLI | stdio | ✅ Compatible |
| ChatGPT Desktop | stdio | ✅ Compatible |

---

## 8. Running Locally

### Frontend only (no install required)
Open `annadata_demo.html` directly in any browser. It fetches all data from the live Netlify API, so no local server is needed.

### Netlify Functions (local dev)
```bash
npm install -g netlify-cli
netlify dev
# Frontend available at http://localhost:8888
# API available at http://localhost:8888/api?endpoint=branches
```

### MCP Server
```bash
cd annadata-mcp
npm install
node index.js
# Server runs on stdio — connect via claude_desktop_config.json
```

---

## 9. Deploying to Netlify

The repo is pre-configured for zero-config Netlify deployment.

1. Fork or clone this repository
2. Connect to Netlify (New site → Import from Git)
3. No build command needed — leave it blank
4. Publish directory: `.` (root)
5. Netlify auto-discovers `netlify.toml` and deploys `netlify/functions/api.js`

The `/api` redirect defined in `netlify.toml` routes all frontend API calls to the serverless function automatically.

---

## 10. Data Disclaimer

The dataset `synthetic_historical_demand.csv` was **programmatically generated** using realistic parameters:

- 3 branches × 50 dishes × 365 days = 54,750 rows
- Day-of-week demand patterns derived from QSR industry benchmarks
- Festival and event multipliers calibrated to publicly reported Bengaluru restaurant traffic data
- ±5% seeded random noise per day to simulate natural demand variation

**No real customer data, transaction data, or restaurant POS records were used.** This project is an academic proof-of-concept. Before commercial deployment, models would need to be re-trained and validated on actual restaurant data.

---

## 11. Team

**Group 6 · APAL 02 · Post Graduate Programme · IIM Calcutta**

| Group Members | 
|------|
| Lakshmi Narasimhan | Mithun Chakraborty | Murali Krishna Yeleshwarapu | Saurab Bhatia | Sumit Sharma | Aastha Narang | Sweety Panigrahi | 

**Academic Year:** 2025–26

---

*Built with Netlify Serverless Functions · Node.js · XGBoost · MCP (Anthropic) · Deployed at [annadataapal.netlify.app](https://annadataapal.netlify.app)*# AnnaData_Apal_Final
The Final Repo for Capstone project for APAL02
