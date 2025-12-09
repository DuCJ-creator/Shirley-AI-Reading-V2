import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BUILD_VERSION = "route-2025-12-08-v8-strip-shuffle";

// ---- fallback mock ----
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
    vocabulary: [],
    quiz: [
      {
        questionEn: "What is this passage about?",
        questionZh: "這篇文章主要在談什麼？",
        optionsEn: [
          "It is about an example topic.",
          "It is about something unrelated.",
          "It is a math question.",
          "It is a story about animals."
        ],
        optionsZh: [
          "它在談一個例子主題。",
          "它在談無關的事。",
          "這是一個數學題。",
          "這是一個動物故事。"
        ],
        answer: "A",
        explanationZh: "這是模擬題目的解釋。"
      }
    ],
    meta: { provider: "mock", reason, level, version: BUILD_VERSION }
  };
}

// ---- prompt ----
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
  ],
  "quiz": [
    {
      "questionEn": "English question",
      "questionZh": "繁體中文題目",
      "optionsEn": ["English option A", "English option B", "English option C", "English option D"],
      "optionsZh": ["中文選項A", "中文選項B", "中文選項C", "中文選項D"],
      "answer": "A/B/C/D",
      "explanationZh": "繁體中文解釋"
    }
  ]
}

Important:
- Provide exactly 5 vocabulary items and 5 quiz questions.
- paragraphsEn must be English only. paragraphsZh must be Traditional Chinese only.
- answer MUST be a single letter: A, B, C, or D.
- options must be full sentences.
- The correct answer must NOT always be A. Vary the position of the correct option.
`;
}

// ---- 防呆 JSON 解析 ----
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

// ✅ 工具：把段落統一成 array
function toArray(x) {
  if (Array.isArray(x)) return x;
  if (typeof x === "string") {
    return x.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// ✅ 工具：剝掉 options 開頭的 ABCD（連續剝）
function stripLeadingLabels(text) {
  let t = String(text || "").trim();
  const re = /^[\s]*[ABCD][\.\)\:：]\s+/i;
  while (re.test(t)) t = t.replace(re, "");
  return t;
}

// ✅ 洗牌（英文/中文一起洗）並同步更新答案
function shuffleWithAnswer(optionsEn = [], optionsZh = [], answerLetter = "A") {
  const abc = ["A", "B", "C", "D"];

  const ansIdx = abc.indexOf(String(answerLetter).toUpperCase());
  const correctIdx = ansIdx >= 0 ? ansIdx : 0;

  const pairs = optionsEn.map((en, i) => ({
    en,
    zh: optionsZh[i] ?? "",
    isCorrect: i === correctIdx
  }));

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const newOptionsEn = pairs.map(p => p.en);
  const newOptionsZh = pairs.map(p => p.zh);

  const newCorrectIdx = pairs.findIndex(p => p.isCorrect);
  const newAnswerLetter = abc[newCorrectIdx] || "A";

  return { newOptionsEn, newOptionsZh, newAnswerLetter };
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { level, themeEn, themeZh } = body;

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

    if (!parsed?.article || !parsed?.vocabulary || !parsed?.quiz) {
      console.warn("[/api/generate] bad AI output, fallback. rawText:", rawText);
      return NextResponse.json(
        generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "bad_output"),
        { status: 200 }
      );
    }

    parsed.article.paragraphsEn = toArray(
      parsed.article.paragraphsEn ?? parsed.article.paragraphs
    );
    parsed.article.paragraphsZh = toArray(parsed.article.paragraphsZh);

    if (Array.isArray(parsed.quiz)) {
      parsed.quiz = parsed.quiz.map(q => {
        let optionsEn = Array.isArray(q.optionsEn)
          ? q.optionsEn
          : (Array.isArray(q.options) ? q.options : []);

        let optionsZh = Array.isArray(q.optionsZh) ? q.optionsZh : [];

        optionsEn = optionsEn.map(stripLeadingLabels);
        optionsZh = optionsZh.map(stripLeadingLabels);

        let ansRaw = q.answer ?? q.correctAnswer ?? "A";
        let ansLetter = String(ansRaw).trim().toUpperCase();
        if (!["A", "B", "C", "D"].includes(ansLetter)) ansLetter = "A";

        // ✅ 只有剛好 4 個選項才洗牌（避免答案亂掉）
        let finalOptionsEn = optionsEn;
        let finalOptionsZh = optionsZh;
        let finalAnswer = ansLetter;

        if (optionsEn.length === 4) {
          const shuffled = shuffleWithAnswer(optionsEn, optionsZh, ansLetter);
          finalOptionsEn = shuffled.newOptionsEn;
          finalOptionsZh = shuffled.newOptionsZh;
          finalAnswer = shuffled.newAnswerLetter;
        }

        return {
          ...q,
          questionEn: q.questionEn || q.question || q.q || "",
          questionZh: q.questionZh || q.question_zh || "",
          optionsEn: finalOptionsEn,
          optionsZh: finalOptionsZh,
          answer: finalAnswer,
          explanationZh: q.explanationZh || q.explainZh || ""
        };
      });
    }

    // ✅ meta 用 merge，不蓋掉 AI 給的欄位
    parsed.meta = {
      ...(parsed.meta || {}),
      provider,
      level: finalLevel,
      version: BUILD_VERSION
    };

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("[/api/generate] exception:", err);
    return NextResponse.json(
      generateMockContent(finalThemeEn, finalThemeZh, finalLevel, "exception"),
      { status: 200 }
    );
  }
}
