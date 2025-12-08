import { THEMES } from "./constants";

/** ===== mock（保底）===== */
const generateMockContent = (themeId, level, reason = "unknown") => {
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
    meta: { provider: "mock", reason, level }
  };
};

/** ===== 把 API 回傳整理成 components 會吃的格式 ===== */
function normalizeApiResponse(apiJson, themeId, level) {
  // 1) 解包 {provider, data}
  const raw = apiJson?.data ?? apiJson ?? {};
  const theme = THEMES.find(t => t.id === themeId);

  // 2) 標題補強
  const titleEn =
    raw.article?.titleEn ||
    raw.article?.title ||
    raw.titleEn ||
    raw.title ||
    theme?.labelEn ||
    "Topic";

  const titleZh =
    raw.article?.titleZh ||
    raw.article?.title_zh ||
    raw.titleZh ||
    raw.title_zh ||
    theme?.labelZh ||
    "主題";

  // 3) 段落補強 + 強制 array
  let pEn =
    raw.article?.paragraphs ||
    raw.paragraphs ||
    (raw.articleEn ? raw.articleEn.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.en ? raw.article.en.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.content ? raw.article.content.split(/\n\s*\n/).filter(Boolean) : []);

  if (typeof pEn === "string") {
    pEn = pEn.split(/\n\s*\n/).filter(Boolean);
  }
  if (!Array.isArray(pEn)) pEn = [];

  let pZh =
    raw.article?.paragraphsZh ||
    raw.paragraphsZh ||
    (raw.articleZh ? raw.articleZh.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.zh ? raw.article.zh.split(/\n\s*\n/).filter(Boolean) : []) ||
    (raw.article?.contentZh ? raw.article.contentZh.split(/\n\s*\n/).filter(Boolean) : []);

  if (typeof pZh === "string") {
    pZh = pZh.split(/\n\s*\n/).filter(Boolean);
  }
  if (!Array.isArray(pZh)) pZh = [];

  // 4) 單字：支援 vocabulary / vocab；欄位支援 meaningZh / meaning / zh
  const vocabulary = (raw.vocabulary || raw.vocab || []).map(v => ({
    word: v.word || v.term || "",
    pos: v.pos || v.partOfSpeech || "",
    meaningZh: v.meaningZh || v.meaning || v.zh || "",
    exampleEn: v.exampleEn || v.example || "",
    exampleZh: v.exampleZh || v.example_zh || v.zhExample || ""
  })).filter(v => v.word);

  // 5) 題目：支援 quiz / questions；options 支援 string or object
  const quiz = (raw.quiz || raw.questions || []).map(q => {
    const opts = q.options || q.choices || [];
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
    console.log("[mockService] calling /api/generate", {
      themeId,
      level,
      themeEn: themeData?.labelEn,
      themeZh: themeData?.labelZh
    });

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
      const errText = await res.text();
      console.warn("[mockService] API not ok:", res.status, errText);
      return generateMockContent(themeId, level, `api_${res.status}`);
    }

    const apiJson = await res.json();
    const normalized = normalizeApiResponse(apiJson, themeId, level);

    // ✅ fallback 條件放寬：只要文章有段落就用 AI
    if (!normalized.article?.paragraphs?.length) {
      console.warn("[mockService] normalized has no paragraphs, fallback to mock", apiJson);
      return generateMockContent(themeId, level, "no_paragraphs");
    }

    // quiz / vocabulary 沒有就給空，不整包打回 mock
    normalized.vocabulary = normalized.vocabulary || [];
    normalized.quiz = normalized.quiz || [];
    normalized.meta = normalized.meta || { provider: apiJson.provider, level };

    return normalized;
  } catch (e) {
    console.error("[mockService] fetch /api/generate error:", e);
    return generateMockContent(themeId, level, "exception");
  }
};

/** ===== getTreeLayout 保留 ===== */
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
