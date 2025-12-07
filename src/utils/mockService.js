// src/utils/mockService.js
import { THEMES } from "./constants";

// 你的 mock 保留
const generateMockContent = (themeId, level) => {
  // ... 你原本 mock
  return {
    titleEn: "Mock Title",
    titleZh: "模擬標題",
    articleEn: "Mock article...",
    articleZh: "模擬文章...",
    vocabulary: [],
    quiz: [],
  };
};

// ✅ 只打 API
export const generateContent = async (themeId, level) => {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId, level }),
    });

    if (!res.ok) throw new Error(await res.text());

    const json = await res.json();
    return json.data;
  } catch (e) {
    console.error("generateContent failed, fallback mock", e);
    return generateMockContent(themeId, level);
  }
};

// getTreeLayout 原本怎麼寫就留著
export const getTreeLayout = (themes) => {
  const rows = [[], [], [], []];
  themes.forEach((t, i) => rows[i % rows.length].push(t));
  return rows;
};
