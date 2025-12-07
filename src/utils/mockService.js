import { THEMES } from "./constants";

/** ===== 你的 mock（保底）===== */
const generateMockContent = (themeId, level) => {
  const t = THEMES.find(x => x.id === themeId);
  return {
    article: {
      titleEn: t?.labelEn || "Topic",
      titleZh: t?.labelZh || "主題",
      paragraphs: [
        `Mock article about ${t?.labelEn || "Topic"}.`,
        `AI is unavailable, so this is fallback content.`
      ],
      paragraphsZh: [
        `這是關於「${t?.labelZh || "主題"}」的模擬文章。`,
        `因為 AI 暫時無法使用，所以先顯示備援內容。`
      ]
    },
    vocabulary: [],
    quiz: [],
    meta: { provider: "mock", level }
  };
};

/** ===== 把任何 API 回傳整理成 components 會吃的格式 ===== */
function normalizeApiResponse(apiJson, themeId, level) {
  // 1) 先解包 {provider, data}
  const raw = apiJson?.data ?? apiJson ?? {};

  // 2) 文章：支援你可能遇到的各種欄位
  const titleEn =
    raw.article?.titleEn ||
    raw.titleEn ||
    THEMES.find(t => t.id === themeId)?.labelEn ||
    "Topic";

  const titleZh =
    raw.article?.titleZh ||
    raw.titleZh ||
    THEMES.find(t => t.id === themeId)?.labelZh ||
    "主題";

  // 可能是 article.paragraphs / articleEn / article.en 等
  const pEn =
    raw.article?.paragraphs ||
    (raw.articleEn ? raw.articleEn.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.en ? raw.article.en.split(/\n\s*\n/).filter(Boolean) : []);

  const pZh =
    raw.article?.paragraphsZh ||
    (raw.articleZh ? raw.articleZh.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.zh ? raw.article.zh.split(/\n\s*\n/).filter(Boolean) : []);

  // 3) 單字：支援 vocabulary / vocab；欄位支援 meaningZh / meaning / zh
  const vocabulary = (raw.vocabulary || raw.vocab || []).map(v => ({
    word: v.word || v.term || "",
    pos: v.pos || v.partOfSpeech || "",
    meaningZh: v.meaningZh || v.meaning || v.zh || "",
    exampleEn: v.exampleEn || v.example || "",
    exampleZh: v.exampleZh || v.example_zh || v.zhExample || ""
  })).filter(v => v.word);

  // 4) 題目：支援 quiz / questions；options 支援 string or object
  const quiz = (raw.quiz || raw.questions || []).map(q => {
    const opts =
      q.options ||
      q.choices ||
      [];

    const options = opts.map(o =>
      typeof o === "string" ? o : (o.textEn || o.text || "")
    );

    return {
      question: q.question || q.questionEn || "",
      questionZh: q.questionZh || q.question_zh || "",
      options,
      answer: (q.answer || q.correctAnswer || "A").toUpperCase(),
      explanationZh: q.explainZh || q.explanationZh || ""
    };
  }).filter(q => q.question || q.questionEn);

  return {
    article: {
      titleEn,
      titleZh,
      paragraphs: pEn,
      paragraphsZh: pZh
    },
    vocabulary,
    quiz,
    meta: raw.meta || apiJson.meta || { provider: apiJson.provider, level }
  };
}

/** ===== 主要給 page.js 用的 generateContent ===== */
export const generateContent = async (themeId, level) => {
  const themeData = THEMES.find(t => t.id === themeId);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        themeId,
        level,
        themeEn: themeData?.labelEn,
        themeZh: themeData?.labelZh
      })
    });

    if (!res.ok) throw new Error("API failed");
    const apiJson = await res.json();

    const normalized = normalizeApiResponse(apiJson, themeId, level);

    // 如果 normalize 後還是沒文章/題目，就回 mock
    if (!normalized.article?.paragraphs?.length || !normalized.quiz?.length) {
      return generateMockContent(themeId, level);
    }

    return normalized;
  } catch (e) {
    return generateMockContent(themeId, level);
  }
};

/** ===== 原本 getTreeLayout 保留 ===== */
export const getTreeLayout = (themes) => {
  const layout = [];
  let idx = 0;
  const rowSizes = [1, 2, 3, 4, 5, 4];
  for (const size of rowSizes) {
    layout.push(themes.slice(idx, idx + size));
    idx += size;
    if (idx >= themes.length) break;
  }
  return layout;
};
