// Define a strict type so TypeScript helps us catch errors later
type Locale = 'en' | 'vi';

// This dynamically imports the JSON file only when needed (great for performance)
const dictionaries = {
  en: () => import('../content/dictionaries/en.json').then((module) => module.default),
  vi: () => import('../content/dictionaries/vi.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  // If somehow a weird language is passed, fallback to English
  const loadDict = dictionaries[locale] || dictionaries.en;
  return loadDict();
};