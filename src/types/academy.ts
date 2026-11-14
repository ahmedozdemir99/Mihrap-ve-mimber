export type MediaItem = {
  name: string;
  url: string;
  fallback?: string;
  link?: boolean;
};

export type LessonCard = {
  id: string;
  t: string;
  kind: string;
  body: string;
  tip?: string;
  ar?: string;
  tr?: string;
  url?: string;
  media?: MediaItem[];
};

export type ModuleData = {
  id: string;
  index: number;
  shortTitle: string;
  title: string;
  intro: string;
  accent: 'emerald' | 'burgundy' | 'brass';
  flow: string[];
  refs: string[];
  cards: LessonCard[];
};

export type AudioArchiveGroup = 'Ezanlar' | 'Kur’an tilavetleri' | 'Müezzinlik ve dualar';

export type AudioArchiveEntry = {
  id: string;
  group: AudioArchiveGroup;
  title: string;
  url?: string;
  fallback?: string;
  kind: 'audio' | 'link' | 'lesson';
  note: string;
  module?: number;
  find?: string;
};

export type QuizQuestion = {
  id: string;
  moduleIndex: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type OfficialSource = {
  key: string;
  label: string;
  description: string;
  url: string;
};

export type DailyActivityEntry = {
  lessons: number;
  steps: number;
  quizCorrect: number;
};

export type DailyActivityLog = Record<string, DailyActivityEntry>;

export type QuizStats = {
  bestOverallScore: number;
  bestOverallTotal: number;
  testsCompleted: number;
  passedModules: number[];
};

export type ProgressBackup = {
  version: number;
  exportedAt?: string;
  completed: Record<string, boolean>;
  practiceChecks?: Record<string, boolean>;
  dailyActivity?: DailyActivityLog;
  quizStats?: QuizStats;
  notes?: Record<string, string>;
};
