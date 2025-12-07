// src/app/api/generate/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ 確保跑 Node（可用 env / SDK）

const BUILD_VERSION = "route-2025-12-08-v5";

// ---- fallback mock（你可自行換回你原本的 mock）----
function generateMockContent(themeEn, themeZh, level) {
  return {
    article: {
      titleEn: themeEn,
      titleZh: themeZh,
      paragraphs: [
        `This is a mock article about ${themeEn}.`,
        `Because no API key is available or the AI response failed.`
      ]
    },
    vocabulary: [
      {
        word: "example",
        pos: "n.",
        meaningZh: "例子",
        exampleEn: "This is an example sentence.",
        exampleZh: "這是一個例句。"
      }
    ],
    quiz: [
      {
        question: "What is this passage about?",
        options: ["A", "B", "C", "D"],
        answer: "A"
      }
    ],
    meta: { provider: "mock", level, version: BUILD_VERSION }
  };
}

// ---- 讓模型固定吐 JSON（避免你沒有 parseAIResponse）----
function buildPrompt(themeEn, themeZh, level) {
  const spec =
    level === "Easy"
      ? "150-200 words, simple middle-school English"
      : level === "Medium"
      ? "250-300 words, intermediate high-school English"
      : "350-400 words, advanced academic English";

  return `
You are a bilingual (English + Traditional Chinese) reading material generator.

Topic: "${themeEn}" (繁體中文主題：${themeZh})
Difficulty: ${level}
Article requirement: ${spec}

Return ONLY valid JSON, no markdown, no extra text.

JSON schema:
{
  "article": {
    "titleEn": "...",
    "titleZh": "...(繁體中文)",
    "paragraphs": ["...", "...", "..."]
  },
  "vocabulary": [
    {
      "word": "string",
      "pos": "string",
      "meaningZh": "繁體中文解釋",
      "exampleEn": "English example",
      "exampleZh": "繁體中文例句"
    }
    // total 5 items
  ],
  "quiz": [
    {
      "question": "English question",
      "options": ["A", "B", "C", "D"],
      "answer": "A/B/C/D",
      "explanationZh": "繁體中文解釋"
    }
    // total 5 items
  ]
}

Important:
- meaningZh / exampleZh / explanationZh MUST be Traditional Chinese.
- quiz options must be full sentences, not single letters.
`;
}

// ---- 防呆 JSON 解析：抓出最像 JSON 的區塊 ----
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch (_) {
      return null;
    }
  }
}

export async function POST(req) {
  const { themeId, level, themeEn, themeZh } = await req.json();

  const finalThemeEn = themeEn || "Topic";
  const finalThemeZh = themeZh || "主題";
  const prompt = buildPrompt(finalThemeEn, finalThemeZh, level || "Easy");

  const googleKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!googleKey && !openaiKey) {
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, level),
      { status: 200 }
    );
  }

  try {
    let rawText = "";
    let provider = "";

    // ✅ Gemini 優先
    if (googleKey) {
      provider = "gemini";
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey);

      // gemini-1.5-flash / gemini-1.5-pro 都可
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    }
    // ✅ OpenAI 備用
    else {
      provider = "openai";
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: openaiKey });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Return ONLY JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      rawText = completion.choices?.[0]?.message?.content || "";
    }

    const parsed = safeJsonParse(rawText);

    if (!parsed || !parsed.article || !parsed.vocabulary || !parsed.quiz) {
      // AI 回得怪就 fallback
      return NextResponse.json(
        generateMockContent(finalThemeEn, finalThemeZh, level),
        { status: 200 }
      );
    }

    parsed.meta = { provider, level, version: BUILD_VERSION };
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, level),
      { status: 200 }
    );
  }
}
