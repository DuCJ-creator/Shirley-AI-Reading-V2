'use client';

export function speak(text, lang = "en-US") {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis) return;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1.0;

  // 停掉前一個，避免重疊
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
