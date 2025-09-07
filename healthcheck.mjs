// healthcheck.mjs
import fetch from "node-fetch";
import "dotenv/config";

async function testProvider(name, url, key, body, headers = {}) {
  if (!key && !url.includes("generativelanguage.googleapis.com")) {
    return { name, status: "NO_KEY", response: "Missing key" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
        ...headers,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { name, status: res.status, response: JSON.stringify(data).slice(0, 250) };
  } catch (err) {
    return { name, status: "FAILED", response: err.message };
  }
}

async function run() {
  const tests = [
    {
      name: "OpenAI",
      url: "https://api.openai.com/v1/responses",
      key: process.env.OPENAI_API_KEY,
      body: { model: "gpt-5", input: "ping" },
    },
    {
      name: "Anthropic",
      url: "https://api.anthropic.com/v1/messages",
      key: process.env.ANTHROPIC_API_KEY,
      headers: { "anthropic-version": "2023-06-01" },
      body: {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }],
      },
    },
    {
      name: "Gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      key: "",
      body: { contents: [{ parts: [{ text: "ping" }] }] },
    },
    {
      name: "DeepSeek",
      url: "https://api.deepseek.com/chat/completions",
      key: process.env.DEEPSEEK_API_KEY,
      body: { model: "deepseek-chat", messages: [{ role: "user", content: "ping" }] },
    },
    {
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      body: { model: "openai/gpt-4o-mini", messages: [{ role: "user", content: "ping" }] },
    },
    {
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      body: { model: "llama-3.1-70b-versatile", messages: [{ role: "user", content: "ping" }] },
    },
    {
      name: "Morph",
      url: "https://api.morphllm.com/v1/chat/completions",
      key: process.env.MORPH_API_KEY,
      body: { model: "morph-v3-large", messages: [{ role: "user", content: "ping" }] },
    },
  ];

  for (const t of tests) {
    const result = await testProvider(t.name, t.url, t.key, t.body, t.headers);
    console.log("\n=== " + result.name + " ===");
    console.log("Status:", result.status);
    console.log("Response:", result.response);
  }
}

run();
