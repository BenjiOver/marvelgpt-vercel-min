// api/marvelgpt.js — Minimal Vercel serverless function using Responses API + built-in web_search
// Requires: OPENAI_API_KEY set in Vercel Project → Settings → Environment Variables
import OpenAI from "openai";

export default async function handler(req, res) {
  // Basic CORS so you can call this from WordPress or anywhere
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

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: question,
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
