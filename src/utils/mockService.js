import { THEMES } from "./constants";

const generateMockContent = (themeId, level, reason = "unknown") => {
  const t = THEMES.find(x => x.id === themeId);
  return {
    article: {
      titleEn: t?.labelEn || "Topic",
      titleZh: t?.labelZh || "主題",
      paragraphsEn: [
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
    meta: { provider: "mock", reason, level }
  };
};

function normalizeApiResponse(apiJson, themeId, level) {
  const raw = apiJson?.data ?? apiJson ?? {};
  const theme = THEMES.find(t => t.id === themeId);

  const titleEn =
    raw.article?.titleEn || raw.article?.title || raw.titleEn || raw.title ||
    theme?.labelEn || "Topic";

  const titleZh =
    raw.article?.titleZh || raw.article?.title_zh || raw.titleZh || raw.title_zh ||
    theme?.labelZh || "主題";

  // ✅ 新欄位優先，其次舊欄位
  let pEn =
    raw.article?.paragraphsEn ||
    raw.article?.paragraphs ||
    raw.paragraphsEn ||
    raw.paragraphs ||
    (raw.articleEn ? raw.articleEn.split(/\n\s*\n/).filter(Boolean) : []) ||
    [];

  if (typeof pEn === "string") pEn = pEn.split(/\n\s*\n/).filter(Boolean);
  if (!Array.isArray(pEn)) pEn = [];

  let pZh =
    raw.article?.paragraphsZh ||
    raw.paragraphsZh ||
    (raw.articleZh ? raw.articleZh.split(/\n\s*\n/).filter(Boolean) : []) ||
    [];

  if (typeof pZh === "string") pZh = pZh.split(/\n\s*\n/).filter(Boolean);
  if (!Array.isArray(pZh)) pZh = [];

  const vocabulary = (raw.vocabulary || raw.vocab || []).map(v => ({
    word: v.word || v.term || "",
    pos: v.pos || v.partOfSpeech || "",
    meaningZh: v.meaningZh || v.meaning || v.zh || "",
    exampleEn: v.exampleEn || v.example || "",
    exampleZh: v.exampleZh || v.example_zh || v.zhExample || ""
  })).filter(v => v.word);

const quiz = (raw.quiz || raw.questions || []).map(q => {
  let optionsEn = q.optionsEn || q.options || q.choices || [];
  let optionsZh = q.optionsZh || [];

  if (typeof optionsEn === "string") optionsEn = [optionsEn];
  if (!Array.isArray(optionsEn)) optionsEn = [];

  if (typeof optionsZh === "string") optionsZh = [optionsZh];
  if (!Array.isArray(optionsZh)) optionsZh = [];

  let ans = String(q.answer || q.correctAnswer || "A").toUpperCase();
  if (!["A","B","C","D"].includes(ans)) ans = "A";

  return {
    questionEn: q.questionEn || q.question || q.q || "",
    questionZh: q.questionZh || q.question_zh || "",
    optionsEn,
    optionsZh,
    answer: ans,
    explanationZh: q.explanationZh || q.explainZh || ""
  };
}).filter(q => q.questionEn);

  return {
    article: {
      titleEn,
      titleZh,
      paragraphsEn: pEn,
      paragraphsZh: pZh
    },
    vocabulary,
    quiz,
    meta: raw.meta || apiJson.meta || { provider: apiJson.provider, level }
  };
}

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

    if (!res.ok) {
      return generateMockContent(themeId, level, `api_${res.status}`);
    }

    const apiJson = await res.json();
    const normalized = normalizeApiResponse(apiJson, themeId, level);

    if (!normalized.article?.paragraphsEn?.length) {
      return generateMockContent(themeId, level, "no_paragraphs");
    }

    normalized.vocabulary = normalized.vocabulary || [];
    normalized.quiz = normalized.quiz || [];
    return normalized;
  } catch (e) {
    return generateMockContent(themeId, level, "exception");
  }
};

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
