// src/utils/constants.js
export const METALLIC_STYLES = {
  red: {
    bg: 'bg-gradient-to-br from-red-700 via-red-500 to-red-950',
    glow: 'shadow-[0_0_20px_rgba(220,38,38,0.6),inset_0_0_20px_rgba(0,0,0,0.5)]',
    textColor: 'text-red-100',
    ring: 'ring-red-400/40',
    snowflakeColor: 'text-red-900/40',
    snowflakeHighlight: 'text-red-100/20'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-700 via-green-500 to-green-950',
    glow: 'shadow-[0_0_20px_rgba(22,163,74,0.6),inset_0_0_20px_rgba(0,0,0,0.5)]',
    textColor: 'text-green-100',
    ring: 'ring-green-400/40',
    snowflakeColor: 'text-green-900/40',
    snowflakeHighlight: 'text-green-100/20'
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-500 via-yellow-300 to-yellow-800',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6),inset_0_0_20px_rgba(0,0,0,0.5)]',
    textColor: 'text-yellow-100',
    ring: 'ring-yellow-400/40',
    snowflakeColor: 'text-yellow-900/40',
    snowflakeHighlight: 'text-yellow-100/30'
  },
  silver: {
    bg: 'bg-gradient-to-br from-slate-400 via-slate-200 to-slate-700',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.6),inset_0_0_20px_rgba(0,0,0,0.5)]',
    textColor: 'text-slate-100',
    ring: 'ring-slate-300/40',
    snowflakeColor: 'text-slate-900/40',
    snowflakeHighlight: 'text-slate-100/30'
  },
  white: {
    bg: 'bg-gradient-to-br from-gray-200 via-white to-gray-500',
    glow: 'shadow-[0_0_20px_rgba(255,255,255,0.5),inset_0_0_20px_rgba(0,0,0,0.3)]',
    textColor: 'text-white',
    ring: 'ring-white/40',
    snowflakeColor: 'text-gray-500/40',
    snowflakeHighlight: 'text-white/50'
  }
};

export const THEMES = [
  { id: 'gender', labelEn: 'Gender Equality', labelZh: '性別平等', style: 'red' },
  { id: 'rights', labelEn: 'Human Rights', labelZh: '人權', style: 'silver' },
  { id: 'env', labelEn: 'Environment', labelZh: '環境', style: 'green' },
  { id: 'ocean', labelEn: 'Global Ocean', labelZh: '海洋', style: 'white' },
  { id: 'morality', labelEn: 'Morality', labelZh: '品德', style: 'gold' },
  { id: 'life', labelEn: 'Life', labelZh: '生命', style: 'red' },
  { id: 'law', labelEn: 'Rule of Law', labelZh: '法治', style: 'silver' },
  { id: 'tech', labelEn: 'Technology', labelZh: '科技', style: 'white' },
  { id: 'info', labelEn: 'Information', labelZh: '資訊', style: 'green' },
  { id: 'energy', labelEn: 'Energy', labelZh: '能源', style: 'gold' },
  { id: 'security', labelEn: 'Security', labelZh: '安全', style: 'silver' },
  { id: 'disaster', labelEn: 'Disaster Prevention', labelZh: '防災', style: 'red' },
  { id: 'family', labelEn: 'Family Education', labelZh: '家庭教育', style: 'gold' },
  { id: 'career', labelEn: 'Career Planning', labelZh: '生涯規劃', style: 'white' },
  { id: 'culture', labelEn: 'Multiculturalism', labelZh: '多元文化', style: 'red' },
  { id: 'literacy', labelEn: 'Reading Literacy', labelZh: '閱讀素養', style: 'green' },
  { id: 'outdoor', labelEn: 'Outdoor Education', labelZh: '戶外教育', style: 'gold' },
  { id: 'intl', labelEn: 'Intl. Education', labelZh: '國際教育', style: 'silver' },
  { id: 'indigenous', labelEn: 'Indigenous Education', labelZh: '原住民族教育', style: 'green' },
];
