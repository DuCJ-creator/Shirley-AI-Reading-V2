// src/app/api/generate/route.js
import { NextResponse } from "next/server";
import { THEMES } from "@/utils/constants";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const runtime = "nodejs";

/**
 * ✅ 關鍵：同時支援兩種 Gemini key 命名
 * 你 Vercel 若設 GOOGLE_API_KEY 也能跑
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

/** ===== Prompt ===== */
function buildPrompt(themeLabelEn, themeLabelZh, level) {
  const levelSpec =
    level === "Easy"
      ? {
          words: "150-200",
          vocabN: 5,
          qN: 5,
          audience: "middle school students",
          difficulty: "simple, clear sentences",
        }
      : level === "Medium"
      ? {
          words: "250-300",
          vocabN: 5,
          qN: 5,
          audience: "high school students",
          difficulty: "some advanced vocabulary and compound sentences",
        }
      : {
          words: "350-400",
          vocabN: 5,
          qN: 5,
          audience: "college students",
          difficulty:
            "academic tone, complex sentences, higher-level vocabulary",
        };

  return `
Create a BILINGUAL reading lesson for ${levelSpec.audience} about:

Topic (EN): "${themeLabelEn}"
Topic (ZH): "${themeLabelZh}"

VERY IMPORTANT LANGUAGE RULE:
- All Chinese output MUST be Traditional Chinese (繁體中文).
- Use Taiwan wording and punctuation (台灣用語/書寫習慣).
- Do NOT use Simplified Chinese (简体中文) anywhere.

You MUST include ALL sections below. If any section is missing, your answer is invalid.
Do NOT use markdown headings (#, ##). Use plain text labels exactly as shown.
Do NOT add extra commentary before or after.

Reply in EXACTLY this structure:

TITLE_EN: <English title>
TITLE_ZH: <Traditional Chinese title>

ARTICLE_EN:
<English article text, ${levelSpec.words} words, ${levelSpec.difficulty}>

ARTICLE_ZH:
<Traditional Chinese translation text>

VOCABULARY:
1. word|pos.|meaningZh(Traditional Chinese)|exampleEn|exampleZh(Traditional Chinese)
2. ...
(Exactly ${levelSpec.vocabN} items)

QUESTIONS:
1. questionEn|questionZh(Traditional Chinese)|A,B,C,D|X
2. ...
(Exactly ${levelSpec.qN} items)

Now generate.
`.trim();
}

/** ===== Parser ===== */
function parseAIResponse(text, themeEn, themeZh, level) {
  const safeText = (text || "").trim();

  const pickBlock = (label) => {
    const regex = new RegExp(
      `${label}\\s*:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+\\s*:|\\nVOCABULARY:|\\nQUESTIONS:|$)`,
      "i"
    );
    const m = safeText.match(regex);
    return m ? m[1].trim() : "";
  };

  const titleEn = pickBlock("TITLE_EN") || themeEn;
  const titleZh = pickBlock("TITLE_ZH") || themeZh;

  const articleEn =
    pickBlock("ARTICLE_EN") || pickBlock("ARTICLE") || "";
  const articleZh = pickBlock("ARTICLE_ZH") || "";

  // VOCABULARY block
  let vocabBlock = "";
  const vocabMatch = safeText.match(
    /VOCABULARY:\s*([\s\S]*?)(?=\nQUESTIONS:|$)/i
  );
  if (vocabMatch) vocabBlock = vocabMatch[1].trim();

  const vocabulary = vocabBlock
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const line = l.replace(/^\d+\.\s*/, "");
      const parts = line.split("|").map((p) => p.trim());
      const [word, pos, meaningZh, exampleEn, exampleZh] = parts;
      if (!word) return null;
      return {
        word,
        pos: pos || "",
        meaningZh: meaningZh || "（待補中文）",
        exampleEn: exampleEn || "",
        exampleZh: exampleZh || "（待補中文）",
      };
    })
    .filter(Boolean);

  // QUESTIONS block
  let qBlock = "";
  const qMatch = safeText.match(/QUESTIONS:\s*([\s\S]*)$/i);
  if (qMatch) qBlock = qMatch[1].trim();

  const quiz = qBlock
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const line = l.replace(/^\d+\.\s*/, "");
      const parts = line.split("|").map((p) => p.trim());

      let questionEn = "",
        questionZh = "",
        optionsStr = "",
        answer = "";

      if (parts.length >= 4) {
        [questionEn, questionZh, optionsStr, answer] = parts;
      } else if (parts.length === 3) {
        [questionEn, optionsStr, answer] = parts;
      } else {
        return null;
      }

      const opts = (optionsStr || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      const options = ["A", "B", "C", "D"].map((k, i) => ({
        key: k,
        textEn: opts[i] || "",
        textZh: "",
      }));

      const normalizedAnswer = (answer || "").trim().toUpperCase();

      return {
        questionEn,
        questionZh,
        options,
        answer: ["A", "B", "C", "D"].includes(normalizedAnswer)
          ? normalizedAnswer
          : "A",
        explainEn: "",
        explainZh: "",
      };
    })
    .filter(Boolean);

  return {
    themeId: themeEn,
    level,
    titleEn,
    titleZh,
    articleEn,
    articleZh,
    article: { en: articleEn, zh: articleZh },
    vocabulary,
    vocab: vocabulary,
    quiz,
    questions: quiz,
    raw: safeText,
  };
}

function isComplete(parsed) {
  const hasArticle = (parsed.articleEn || "").length > 80;
  const hasVocab =
    Array.isArray(parsed.vocabulary) &&
    parsed.vocabulary.length >= 5;
  const hasQuiz =
    Array.isArray(parsed.quiz) && parsed.quiz.length >= 5;
  return hasArticle && hasVocab && hasQuiz;
}

/** ===== Providers ===== */
async function generateWithGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithOpenAI(prompt) {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content:
          "You are a bilingual education expert. All Chinese output must be Traditional Chinese (繁體中文, Taiwan usage). Always respond in the exact format requested.",
      },
      { role: "user", content: prompt },
    ],
  });
  return resp.choices?.[0]?.message?.content || "";
}

/** ===== Mock fallback ===== */
function generateMock(themeEn, themeZh, level) {
  return {
    themeId: themeEn,
    level,
    titleEn: themeEn,
    titleZh: themeZh,
    articleEn: "Mock article (AI unavailable).",
    articleZh: "模擬文章（AI 暫時無法使用）。",
    article: {
      en: "Mock article (AI unavailable).",
      zh: "模擬文章（AI 暫時無法使用）。",
    },
    vocabulary: [],
    vocab: [],
    quiz: [],
    questions: [],
  };
}

/** ===== Route ===== */
export async function POST(req) {
  const { themeId, level } = await req.json();

  const themeData = THEMES.find((t) => t.id === themeId);
  const themeEn = themeData?.labelEn || "Topic";
  const themeZh = themeData?.labelZh || "主題";

  const prompt = buildPrompt(themeEn, themeZh, level);

  // 1) Gemini first
  if (genAI) {
    try {
      const aiText = await generateWithGemini(prompt);
      const parsed = parseAIResponse(aiText, themeEn, themeZh, level);

      if (isComplete(parsed)) {
        console.log("[generate]", {
          provider: "gemini",
          articleLen: parsed.articleEn.length,
          vocabLen: parsed.vocabulary.length,
          quizLen: parsed.quiz.length,
        });
        return NextResponse.json({ provider: "gemini", data: parsed });
      }

      console.warn("[Gemini incomplete] fallback to OpenAI");
    } catch (e) {
      console.warn("[Gemini failed] fallback to OpenAI", e);
    }
  } else {
    console.warn("[Gemini skipped] No GEMINI/GOOGLE key");
  }

  // 2) OpenAI fallback
  if (openai) {
    try {
      const aiText = await generateWithOpenAI(prompt);
      const parsed = parseAIResponse(aiText, themeEn, themeZh, level);

      if (isComplete(parsed)) {
        console.log("[generate]", {
          provider: "openai",
          articleLen: parsed.articleEn.length,
          vocabLen: parsed.vocabulary.length,
          quizLen: parsed.quiz.length,
        });
        return NextResponse.json({ provider: "openai", data: parsed });
      }

      console.warn("[OpenAI incomplete] fallback mock");
    } catch (e) {
      console.warn("[OpenAI failed] fallback mock", e);
    }
  } else {
    console.warn("[OpenAI skipped] No OPENAI key");
  }

  // 3) mock fallback (still 200)
  console.log("[generate]", { provider: "mock" });
  return NextResponse.json({
    provider: "mock",
    data: generateMock(themeEn, themeZh, level),
  });
}
