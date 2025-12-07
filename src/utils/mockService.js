// src/utils/mockService.js
import { THEMES } from "./constants";

/**
 * 這裡保留「萬一 API 掛掉」的後備 mock
 * 只要格式跟前端 components 要的一樣，就不會炸
 */
const generateMockContent = (themeId, level) => {
  const themeData = THEMES.find(t => t.id === themeId);
  const themeLabelEn = themeData?.labelEn || "Topic";
  const themeLabelZh = themeData?.labelZh || "主題";

  return {
    themeId,
    level,
    titleEn: themeLabelEn,
    titleZh: themeLabelZh,
    articleEn: "Mock article (AI unavailable).",
    articleZh: "模擬文章（AI 暫時無法使用）。",
    article: {
      en: "Mock article (AI unavailable).",
      zh: "模擬文章（AI 暫時無法使用）。"
    },
    vocabulary: [
      { word: themeLabelEn.toLowerCase(), pos: "noun", meaningZh: themeLabelZh, exampleEn: "", exampleZh: "" }
    ],
    vocab: [
      { word: themeLabelEn.toLowerCase(), pos: "noun", meaningZh: themeLabelZh, exampleEn: "", exampleZh: "" }
    ],
    quiz: [],
    questions: []
  };
};

/**
 * ✅ 正式的 generateContent
 * 只做一件事：打你部署在 Vercel 的 API
 */
export const generateContent = async (themeId, level) => {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId, level })
    });

    if (!res.ok) {
      console.warn("API failed, fallback to mock:", res.status);
      return generateMockContent(themeId, level);
    }

    const json = await res.json();
    // API 回的是 { provider, data }
    const data = json?.data;

    if (!data) {
      console.warn("API returned empty data, fallback to mock");
      return generateMockContent(themeId, level);
    }

    return data;
  } catch (err) {
    console.error("Fetch /api/generate error:", err);
    return generateMockContent(themeId, level);
  }
};

/**
 * 原本的 getTreeLayout 保留
 */
export const getTreeLayout = (themes) => {
  const layout = [];
  let currentIndex = 0;
  let rowSize = 1;

  while (currentIndex < themes.length) {
    const row = themes.slice(currentIndex, currentIndex + rowSize);
    layout.push(row);
    currentIndex += rowSize;
    rowSize++;
  }

  return layout;
};
