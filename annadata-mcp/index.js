#!/usr/bin/env node
/**
 * AnnaData MCP Server
 *
 * Wraps the AnnaData demand-forecasting API as MCP tools so any
 * MCP-compatible AI client (Claude Code, Claude Desktop, Gemini CLI,
 * ChatGPT Desktop) can query Spice Garden restaurant demand data.
 *
 * Live API: https://annadataapal.netlify.app/api
 *
 * Tools exposed:
 *   get_branches  — list the 3 restaurant branches
 *   get_menu      — browse / filter the 50-dish menu
 *   get_forecast  — 1–7 day dish-level demand forecast
 *   get_bom       — vendor-grouped ingredient procurement list
 *   get_insights  — AI demand insight cards (festivals, trends, actions)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = "https://annadataapal.netlify.app/api";

const BRANCH_LABELS = {
  kor: "Koramangala",
  ind: "Indiranagar",
  whi: "Whitefield",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch from the AnnaData API with a query-param object. */
async function apiFetch(params) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const res = await fetch(`${API_BASE}?${qs}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`AnnaData API error ${res.status}: ${body}`);
  }
  return res.json();
}

/** Strip HTML tags from a string (insight cards contain some). */
function stripHtml(str) {
  return (str || "").replace(/<[^>]+>/g, "").trim();
}

/** Today's date as YYYY-MM-DD. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Horizontal divider. */
const HR = "─".repeat(48);

// ── Server ────────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "annadata",
  version: "1.0.0",
  description:
    "AnnaData – AI-driven dish-level demand forecasting for Spice Garden restaurants in Bengaluru. " +
    "Backed by 54,750 rows of synthetic POS data, 19 Indian event types, and an XGBoost model (10.6% MAPE).",
});

// ── Tool 1: get_branches ──────────────────────────────────────────────────────

server.tool(
  "get_branches",
  "List the 3 Spice Garden restaurant branches available for demand forecasting. " +
    "Returns branch IDs (kor / ind / whi) required by forecast, bom, and other tools.",
  {},
  async () => {
    const { branches } = await apiFetch({ endpoint: "branches" });

    const lines = [
      "Spice Garden — Restaurant Branches",
      HR,
      "",
    ];

    for (const b of branches) {
      lines.push(`${b.name}  [ID: ${b.id}]`);
      lines.push(`  Address : ${b.addr}`);
      lines.push(`  Covers  : ${b.covers}  |  Rating: ${b.rating}★  |  Since: ${b.since}`);
      lines.push("");
    }

    lines.push("Use the short IDs (kor / ind / whi) with forecast, bom, and other tools.");

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Tool 2: get_menu ──────────────────────────────────────────────────────────

server.tool(
  "get_menu",
  "Browse all 50 Spice Garden menu dishes with IDs, categories, veg/non-veg flags, and prices. " +
    "Dish ID numbers are required for get_forecast, get_bom, and get_insights.",
  {
    category: z
      .enum([
        "All",
        "Starters",
        "Main - Non Veg",
        "Main - Veg",
        "Breads",
        "Rice",
        "Desserts",
      ])
      .default("All")
      .describe(
        "Filter by menu category. Use 'All' to see every dish."
      ),
  },
  async ({ category }) => {
    const { menu } = await apiFetch({ endpoint: "menu" });
    const filtered =
      category === "All" ? menu : menu.filter((d) => d.cat === category);

    // Group by category
    const groups = {};
    for (const d of filtered) {
      if (!groups[d.cat]) groups[d.cat] = [];
      const vegTag = d.veg ? "Veg    " : "Non-veg";
      groups[d.cat].push(
        `  [${String(d.id).padStart(2, " ")}]  ${d.name.padEnd(24)}  ${vegTag}  ₹${d.price}`
      );
    }

    const lines = [
      `Spice Garden Menu  (${filtered.length} dishes)`,
      HR,
      "",
    ];

    for (const [cat, items] of Object.entries(groups)) {
      lines.push(cat + ":");
      lines.push(...items);
      lines.push("");
    }

    lines.push(
      "Pass dish ID numbers (e.g. '11,12,23') to get_forecast, get_bom, or get_insights."
    );

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Tool 3: get_forecast ─────────────────────────────────────────────────────

server.tool(
  "get_forecast",
  "Get 1–7 day dish-level demand forecast for a Spice Garden branch. " +
    "Returns daily predicted order quantities with festival / event context for each day. " +
    "Powered by XGBoost (MAPE 10.6 %).",
  {
    branch: z
      .enum(["kor", "ind", "whi"])
      .describe("Branch ID — kor=Koramangala, ind=Indiranagar, whi=Whitefield"),
    dishes: z
      .string()
      .describe(
        "Comma-separated dish IDs, e.g. '11,12,23'. Run get_menu first to look up IDs."
      ),
    days: z
      .number()
      .int()
      .min(1)
      .max(7)
      .default(7)
      .describe("Forecast horizon in days (1–7). Default: 7."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe(
        "Forecast start date in YYYY-MM-DD format. Omit to start from today."
      ),
  },
  async ({ branch, dishes, days, startDate }) => {
    const dateStr = startDate ?? today();

    const data = await apiFetch({
      endpoint: "forecast",
      branch,
      dishes,
      days,
      startDate: dateStr,
    });

    const branchLabel = BRANCH_LABELS[branch] ?? branch;
    const dishIds = dishes.split(",").map((s) => s.trim()).filter(Boolean);

    const lines = [
      `Demand Forecast — ${branchLabel}  |  ${days} day(s) from ${dateStr}`,
      HR,
    ];

    for (const rawId of dishIds) {
      // forecast keys are strings (JS object keys)
      const daily = data.forecast?.[rawId] ?? data.forecast?.[Number(rawId)];
      if (!daily) {
        lines.push(`\nDish #${rawId}: no forecast data returned`);
        continue;
      }

      const total = daily.reduce((s, x) => s + x, 0);
      const peakIdx = daily.indexOf(Math.max(...daily));
      const peakDate = data.dates?.[peakIdx] ?? `Day ${peakIdx + 1}`;

      lines.push(`\nDish #${rawId}:`);
      daily.forEach((qty, i) => {
        const date = data.dates?.[i] ?? `Day ${i + 1}`;
        const dow  = (data.daysOfWeek?.[i] ?? "").slice(0, 3);
        const evtStr  = data.eventLabels?.[i]  ? `  ⚡ ${data.eventLabels[i]}`  : '';
        const fifaStr = data.fifaLabels?.[i]   ? `  ⚽ ${data.fifaLabels[i]}`   : '';
        lines.push(`  ${date} (${dow}): ${qty} units${evtStr}${fifaStr}`);
      });
      lines.push(`  ── Total: ${total} units  |  Peak: ${peakDate} (${Math.max(...daily)} units)`);
    }

    // Summarise events in window
    const events = [...new Set((data.eventLabels ?? []).filter(Boolean))];
    if (events.length > 0) {
      lines.push("");
      lines.push(`⚡ Events in forecast window: ${events.join(", ")}`);
    }

    const fifaShown = [...new Set((data.fifaLabels ?? []).filter(Boolean))];
    if (fifaShown.length > 0) {
      if (events.length === 0) lines.push("");
      lines.push(`⚽ FIFA 2026 in window: ${fifaShown.join("  |  ")}`);
    }

    lines.push("");
    lines.push(`Generated at: ${data.generatedAt ?? "—"}`);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Tool 4: get_bom ───────────────────────────────────────────────────────────

server.tool(
  "get_bom",
  "Get the Bill of Materials — total ingredient quantities grouped by vendor — " +
    "for a set of dishes over a forecast period. Use for daily procurement planning.",
  {
    branch: z
      .enum(["kor", "ind", "whi"])
      .describe("Branch ID — kor=Koramangala, ind=Indiranagar, whi=Whitefield"),
    dishes: z
      .string()
      .describe("Comma-separated dish IDs, e.g. '11,12,23'."),
    days: z
      .number()
      .int()
      .min(1)
      .max(7)
      .default(7)
      .describe("Number of forecast days to cover in procurement. Default: 7."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe(
        "Procurement start date in YYYY-MM-DD format. Omit to start from today."
      ),
  },
  async ({ branch, dishes, days, startDate }) => {
    const dateStr = startDate ?? today();

    const data = await apiFetch({
      endpoint: "bom",
      branch,
      dishes,
      days,
      startDate: dateStr,
    });

    const branchLabel = BRANCH_LABELS[branch] ?? branch;
    const vendorMeta  = data.vendors ?? {};

    const lines = [
      `Bill of Materials — ${branchLabel}  |  ${days}-day plan from ${dateStr}`,
      HR,
    ];

    for (const [vendor, items] of Object.entries(data.bom ?? {})) {
      const meta  = vendorMeta[vendor] ?? {};
      const icon  = meta.icon ?? "📦";
      const cat   = meta.cat  ? `  (${meta.cat})` : "";
      lines.push(`\n${icon}  ${vendor}${cat}`);

      for (const [ingredient, details] of Object.entries(items)) {
        // qps values are in grams/mL; unit is kg/L — divide totalGrams by 1000
        const rawQty = details.totalGrams ?? 0;
        const qty    = `${(rawQty / 1000).toFixed(1)} ${details.unit}`;
        lines.push(`   ${ingredient.padEnd(28)}  ${qty}`);
      }
    }

    lines.push("");
    lines.push(`Generated at: ${data.generatedAt ?? "—"}`);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Tool 5: get_insights ──────────────────────────────────────────────────────

server.tool(
  "get_insights",
  "Get AI-generated demand insight cards for a set of dishes — " +
    "upcoming festival demand spikes, trend alerts, and kitchen action recommendations. " +
    "Note: insights are cross-branch and do not require a branch ID.",
  {
    dishes: z
      .string()
      .describe("Comma-separated dish IDs, e.g. '11,12,23'."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe(
        "Analysis start date in YYYY-MM-DD format. Omit to use today."
      ),
  },
  async ({ dishes, startDate }) => {
    const dateStr = startDate ?? today();

    const data = await apiFetch({
      endpoint: "insights",
      dishes,
      startDate: dateStr,
    });

    if (!data.insights || data.insights.length === 0) {
      return {
        content: [
          {
            type: "text",
            text:
              "No notable demand signals detected in the upcoming forecast window for these dishes.",
          },
        ],
      };
    }

    const lines = [
      `Demand Insights — from ${dateStr}  (${data.insights.length} cards)`,
      HR,
    ];

    for (const card of data.insights) {
      lines.push("");
      lines.push(`📊  ${stripHtml(card.title ?? card.type ?? "Insight")}`);

      if (card.subtitle) {
        lines.push(`    ${stripHtml(card.subtitle)}`);
      }
      if (card.message) {
        lines.push(`    ${stripHtml(card.message)}`);
      }

      if (Array.isArray(card.impacts) && card.impacts.length > 0) {
        for (const imp of card.impacts) {
          const arrow = imp.up ? "↑" : "↓";
          lines.push(`    ${arrow}  ${stripHtml(imp.label ?? "")}`);
        }
      }

      if (card.recc) {
        lines.push(`    💡 ${stripHtml(card.recc)}`);
      }
    }

    lines.push("");
    lines.push(`Generated at: ${data.generatedAt ?? "—"}`);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
