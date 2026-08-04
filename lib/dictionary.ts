// Define a strict type so TypeScript helps us catch errors later
type Locale = 'en' | 'vi';

export interface Dictionary {
  home: {
    title: string;
    subtitle: string;
  };
  nav: {
    logo: string;
    learn: string;
    algorithms: string;
    trainer?: string;
    timer?: string;
    admin?: string;
  };
  footer: {
    rights: string;
  };
  learn: {
    title: string;
    description: string;
  };
  algorithms: {
    title: string;
    description: string;
  };
  dashboard: {
    welcome: string;
    subtitle: string;
    lessons: string;
    completed: string;
    reviews: string;
    total: string;
    algorithms: string;
    learned: string;
    solves: string;
    current_session: string;
    timer_stats: string;
    best_single: string;
    ao5: string;
    ao12: string;
    mean: string;
    learning_progress: string;
    lessons_completed: string;
    total_reviews: string;
    algorithms_learned: string;
    timer_sessions: string;
    quick_actions: string;
    learn: string;
    trainer: string;
    timer: string;
    current_streak: string;
    longest_streak: string;
    days: string;
    achievements: string;
    points: string;
    unlocked: string;
    total_points: string;
  };
  [key: string]: unknown;
}

// This dynamically imports the JSON file only when needed (great for performance)
const dictionaries = {
  en: () => import('../content/dictionaries/en.json').then((module) => module.default),
  vi: () => import('../content/dictionaries/vi.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // If somehow a weird language is passed, fallback to English
  const loadDict = dictionaries[locale] || dictionaries.en;
  return loadDict();
};