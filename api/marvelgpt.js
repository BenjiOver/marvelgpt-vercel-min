// api/marvelgpt.js — Minimal Vercel serverless function using Responses API + built-in web_search
// Guardrail: force Marvel focus by appending "Marvel" if not present, plus a light system prompt
import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS so you can call from anywhere (WP, localhost, etc.)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: "Missing question" });

    // --- Phase 1 guardrail: keep everything Marvel-focused ---
    let safeQuestion = String(question || "");
    if (!/marvel/i.test(safeQuestion)) {
      safeQuestion = `${safeQuestion} Marvel`;
    }

    const system = [
      "You are MarvelGPT. Keep answers focused on Marvel (MCU, Marvel Comics, creators, casting, production).",
      "Prefer credible sources (marvel.com, marvel.fandom.com, marvelstudios.com, disneyplus.com, deadline.com, hollywoodreporter.com, variety.com, empireonline.com, ign.com).",
      "Always separate CONFIRMED info (cite official/high-reliability sources) from RUMORS.",
      "Prioritize news from the last 90 days and include dates when possible."
    ].join("\n");

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        { role: "system", content: system },
        { role: "user", content: safeQuestion }
      ],
      tools: [{ type: "web_search" }],
      tool_choice: "auto"
    });

    const text = response.output_text ?? "";
    const citations = [];
    for (const item of response.output ?? []) {
      if (item.type === "citation" && item.citation?.url) {
        citations.push({ url: item.citation.url, title: item.citation.title ?? "" });
      }
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ text, citations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
}
