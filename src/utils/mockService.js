// src/utils/mockService.js
import { THEMES } from "./constants";

// 你的舊 mock 可以放這裡（先留簡版，不影響）
const generateMockContent = (themeId, level) => {
  const t = THEMES.find(x => x.id === themeId);
  return {
    article: {
      titleEn: t?.labelEn || "Topic",
      titleZh: t?.labelZh || "主題",
      paragraphs: [
        `Mock article for ${t?.labelEn}.`,
        `No AI key or API failed.`
      ]
    },
    vocabulary: [],
    quiz: [],
    meta: { provider: "mock", level }
  };
};

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
    const data = await res.json();

    // 如果資料缺欄位則 fallback
    if (!data?.article || !data?.vocabulary || !data?.quiz) {
      return generateMockContent(themeId, level);
    }
    return data;
  } catch (e) {
    return generateMockContent(themeId, level);
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
