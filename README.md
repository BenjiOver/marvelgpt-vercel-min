
# Minimal Vercel Function (Responses API + Web Search)

This is the smallest working setup to expose a single endpoint that calls the
**OpenAI Responses API** with the built-in **web_search** tool and returns
`{ text, citations }`.

## Files

- `api/marvelgpt.js` – Vercel serverless function
- `package.json` – Declares ESM and the OpenAI SDK dependency

## Deploy (Vercel)

1. Push these files to a GitHub repo (root must contain `api/` and `package.json`).
2. In Vercel → **New Project → Import Git Repository**.
3. Framework preset: **Other**. Leave build command blank.
4. Add env var: `OPENAI_API_KEY` (Project → Settings → Environment Variables).
5. Deploy.

## Test

**cURL**
```bash
curl -X POST https://<your-project>.vercel.app/api/marvelgpt   -H "Content-Type: application/json"   -d '{"question":"Latest MCU Thunderbolts release date with sources."}'
```

**From the browser (example)**
```js
const r = await fetch("https://<your-project>.vercel.app/api/marvelgpt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question: "What is the latest on Fantastic Four? Cite sources." })
});
const { text, citations } = await r.json();
```

That’s it. Your existing front end can POST to this endpoint and render `text` + `citations`.
