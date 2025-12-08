// src/app/api/generate/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ 確保跑 Node（可用 env / SDK）

const BUILD_VERSION = "route-2025-12-08-v5-fixed";

// ---- fallback mock（你可自行換回你原本的 mock）----
function generateMockContent(themeEn, themeZh, level, reason = "unknown") {
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
        options: [
          "It is a mock passage.",
          "It is about animals.",
          "It is about sports.",
          "It is about history."
        ],
        answer: "A",
        explanationZh: "因為 AI 生成失敗，所以顯示備援內容。"
      }
    ],
    meta: { provider: "mock", reason, level, version: BUILD_VERSION }
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

  // ✅ A) request log：確認有 hit 到 API
  console.log("[/api/generate] request:", { themeId, level, themeEn, themeZh });

  const finalThemeEn = themeEn || "Topic";
  const finalThemeZh = themeZh || "主題";
  const finalLevel = level || "Easy";
  const prompt = buildPrompt(finalThemeEn, finalThemeZh, finalLevel);

  const googleKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // ✅ B) 沒 key 就 warn + 回 mock
  if (!googleKey && !openaiKey) {
    console.warn("[/api/generate] no API key, fallback to mock");
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "no_key"),
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

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        // ✅ JSON mode：大幅降低亂吐字/markdown機率
        generationConfig: { responseMimeType: "application/json" }
      });

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

    console.log("[/api/generate] provider:", provider);
    console.log("[/api/generate] rawText preview:", rawText.slice(0, 200));

    const parsed = safeJsonParse(rawText);

    // ✅ C) 放寬回退條件：只要文章段落有就先用 AI
    // (quiz/vocab 空就讓前端吃空陣列，不整包打回 mock)
    if (!parsed || !parsed.article?.paragraphs?.length) {
      console.warn("[/api/generate] bad AI output, fallback to mock");
      console.warn("[/api/generate] rawText:", rawText);
      const p = parsed.article?.paragraphs;
if (typeof p === "string") {
  parsed.article.paragraphs = p.split(/\n\s*\n/).filter(Boolean);
} else if (!Array.isArray(p)) {
  parsed.article.paragraphs = [];
}

// （可選）避免 paragraphsZh 不是陣列導致元件炸
if (!Array.isArray(parsed.article.paragraphsZh)) {
  parsed.article.paragraphsZh = [];
}

// 保險：缺的欄位補空陣列
parsed.vocabulary = Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [];
parsed.quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

parsed.meta = { provider, level: finalLevel, version: BUILD_VERSION };
return NextResponse.json(parsed, { status: 200 });
      return NextResponse.json(
        generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "bad_output"),
        { status: 200 }
      );
    }

    // 保險：缺的欄位補空陣列
    parsed.vocabulary = Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [];
    parsed.quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

    parsed.meta = { provider, level: finalLevel, version: BUILD_VERSION };
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    // ✅ D) catch error log：抓 import/SDK/key/網路等所有錯
    console.error("[/api/generate] AI error:", err);
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "exception"),
      { status: 200 }
    );
  }
}
