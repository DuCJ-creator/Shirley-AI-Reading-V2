// src/app/api/generate/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BUILD_VERSION = "route-2025-12-08-v6";

function generateMockContent(themeEn, themeZh, level, reason = "no_key") {
  return {
    article: {
      titleEn: themeEn,
      titleZh: themeZh,
      paragraphsEn: [
        `This is a mock article about ${themeEn}.`,
        `Because no API key is available or the AI response failed.`
      ],
      paragraphsZh: [
        `這是一篇關於「${themeZh}」的模擬文章。`,
        `因為目前沒有可用的 AI Key 或生成失敗。`
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
        questionEn: "What is this passage about?",
        questionZh: "這篇文章主要在談什麼？",
        optionsEn: ["A mock answer A.", "A mock answer B.", "A mock answer C.", "A mock answer D."],
        optionsZh: ["模擬選項A", "模擬選項B", "模擬選項C", "模擬選項D"],
        answer: "A",
        explanationZh: "這是模擬題目的解釋。"
      }
    ],
    meta: { provider: "mock", reason, level, version: BUILD_VERSION }
  };
}

// ✅ 你要的 schema：全英/全中兩套 + 答案 A/B/C/D
function buildPrompt(themeEn, themeZh, level) {
  const spec =
    level === "Easy"
      ? "150-200 words, simple middle-school English"
      : level === "Medium"
      ? "250-300 words, intermediate high-school English"
      : "350-400 words, advanced academic English";

  return `
You are a bilingual reading material generator.

Topic (EN): "${themeEn}"
Topic (ZH-TW): "${themeZh}"
Difficulty: ${level}
English article requirement: ${spec}

Return ONLY valid JSON, no markdown, no extra text.

JSON schema (ALL fields required):
{
  "article": {
    "titleEn": "...",
    "titleZh": "...(繁體中文)",
    "paragraphsEn": ["English paragraph 1", "English paragraph 2", "English paragraph 3"],
    "paragraphsZh": ["繁體中文段落1", "繁體中文段落2", "繁體中文段落3"]
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
      "questionEn": "English question",
      "questionZh": "繁體中文題目",
      "optionsEn": ["A English option", "B English option", "C English option", "D English option"],
      "optionsZh": ["A 中文選項", "B 中文選項", "C 中文選項", "D 中文選項"],
      "answer": "A/B/C/D",
      "explanationZh": "繁體中文解釋"
    }
    // total 5 items
  ]
}

Important:
- paragraphsEn must be English only. paragraphsZh must be Traditional Chinese only.
- quiz must include BOTH English and Chinese versions.
- answer MUST be a single letter: A, B, C, or D.
- options must be full sentences.
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
  const finalLevel = level || "Easy";
  const prompt = buildPrompt(finalThemeEn, finalThemeZh, finalLevel);

  const googleKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!googleKey && !openaiKey) {
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "no_key"),
      { status: 200 }
    );
  }

  try {
    let rawText = "";
    let provider = "";

    if (googleKey) {
      provider = "gemini";
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(googleKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    } else {
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

    // 基本結構檢查
    if (!parsed?.article || !parsed?.vocabulary || !parsed?.quiz) {
      console.warn("[/api/generate] bad AI output, fallback. rawText:", rawText);
      return NextResponse.json(
        generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "bad_output"),
        { status: 200 }
      );
    }

    // ✅ paragraphsEn / paragraphsZh 強制 array
    const toArray = (x) =>
      Array.isArray(x) ? x :
      typeof x === "string" ? x.split(/\n\s*\n/).filter(Boolean) :
      [];

    parsed.article.paragraphsEn = toArray(parsed.article.paragraphsEn ?? parsed.article.paragraphs);
    parsed.article.paragraphsZh = toArray(parsed.article.paragraphsZh);

    // ✅ 強制 quiz.answer = A/B/C/D（放 try 裡、return 前）
    if (Array.isArray(parsed.quiz)) {
      parsed.quiz = parsed.quiz.map(q => {
        let ans = String(q.answer || "A").trim().toUpperCase();
        if (!["A", "B", "C", "D"].includes(ans)) ans = "A";

        // 若 optionsEn/optionsZh 缺，補空陣列避免前端炸
        q.optionsEn = Array.isArray(q.optionsEn) ? q.optionsEn : (Array.isArray(q.options) ? q.options : []);
        q.optionsZh = Array.isArray(q.optionsZh) ? q.optionsZh : [];

        return { ...q, answer: ans };
      });
    }

    parsed.meta = { provider, level: finalLevel, version: BUILD_VERSION };

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("[/api/generate] exception:", err);
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "exception"),
      { status: 200 }
    );
  }
}
