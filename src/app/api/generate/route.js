// src/app/api/generate/route.js
import { NextResponse } from "next/server";
import { THEMES } from "@/utils/constants";

export const runtime = "nodejs";

import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
          difficulty: "academic tone, complex sentences, higher-level vocabulary",
        };

  return `
Create a BILINGUAL reading lesson for ${levelSpec.audience} about:

Topic (EN): "${themeLabelEn}"
Topic (ZH): "${themeLabelZh}"

VERY IMPORTANT LANGUAGE RULE:
- All Chinese output MUST be Traditional Chinese (繁體中文).
- Use Taiwan wording and punctuation (台灣用語/書寫習慣).
- Do NOT use Simplified Chinese (简体中文) anywhere.

Requirements:
1. Write an English article of ${levelSpec.words} words.
2. Then provide a faithful Chinese translation of the article in Traditional Chinese.
3. Tone/Difficulty: ${levelSpec.difficulty}.
4. Provide ${levelSpec.vocabN} vocabulary items.
   Each line format:
   word|part of speech|Traditional Chinese meaning|English example sentence|Traditional Chinese example translation
5. Provide ${levelSpec.qN} multiple-choice questions.
   Each line format:
   questionEn|questionZh(Traditional Chinese)|optionA,optionB,optionC,optionD|correctAnswer(A/B/C/D)

IMPORTANT:
- You MUST include ALL sections: TITLE_EN, TITLE_ZH, ARTICLE_EN, ARTICLE_ZH, VOCABULARY, QUESTIONS.
- If any section is missing, your answer is invalid.
- Do NOT use markdown headings (#, ##). Use plain text labels exactly as shown.
- Do NOT add extra commentary before or after.

Reply in EXACTLY this structure:

TITLE_EN: <English title>
TITLE_ZH: <Traditional Chinese title>

ARTICLE_EN:
<English article text>

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


QUESTIONS:
1. questionEn|questionZh(Traditional Chinese)|A,B,C,D|X
2. ...
(Exactly ${levelSpec.qN} items)

Content guidance:
- Stay tightly related to the topic.
- Balanced, factual, age-appropriate.
- Examples should be real-world and natural.

Now generate.
`.trim();
}

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

  const articleEn = pickBlock("ARTICLE_EN") || pickBlock("ARTICLE") || "";
  const articleZh = pickBlock("ARTICLE_ZH") || "";

  let vocabBlock = "";
  const vocabMatch = safeText.match(/VOCABULARY:\s*([\s\S]*?)(?=\nQUESTIONS:|$)/i);
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
        meaningZh: meaningZh || "",
        exampleEn: exampleEn || "",
        exampleZh: exampleZh || "",
      };
    })
    .filter(Boolean);

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

export async function POST(req) {
  try {
    const { themeId, level } = await req.json();

    const themeData = THEMES.find((t) => t.id === themeId);
    const themeLabelEn = themeData?.labelEn || "Topic";
    const themeLabelZh = themeData?.labelZh || "主題";

    const prompt = buildPrompt(themeLabelEn, themeLabelZh, level);

    // Gemini first
    try {
      const aiText = await generateWithGemini(prompt);
      const parsed = parseAIResponse(aiText, themeLabelEn, themeLabelZh, level);
      return NextResponse.json({ provider: "gemini", data: parsed });
    } catch (e) {
      console.warn("[Gemini failed], fallback to OpenAI", e);
    }

    // OpenAI fallback
    const aiText = await generateWithOpenAI(prompt);
    const parsed = parseAIResponse(aiText, themeLabelEn, themeLabelZh, level);
    return NextResponse.json({ provider: "openai", data: parsed });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Generate failed" },
      { status: 500 }
    );
  }

  const hasArticle = articleEn.length > 50;        // 至少要有一些長度
  const hasVocab = vocabulary.length >= 5;
  const hasQuiz = quiz.length >= 5;

  if (!hasArticle || !hasVocab || !hasQuiz) {
    throw new Error(
      `AI response incomplete. hasArticle=${hasArticle} hasVocab=${hasVocab} hasQuiz=${hasQuiz}`
    );
  }
}
