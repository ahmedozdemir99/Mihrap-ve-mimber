import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Headphones,
  Layers,
  Search,
  NotebookPen,
  X,
} from 'lucide-react';
import { MODULES } from './data/academyData';
import { evaluateBadges } from './data/badgesData';
import type { DailyActivityLog, ProgressBackup, QuizStats } from './types/academy';
import { LessonWorkspace } from './components/LessonWorkspace';
import { AudioArchiveView } from './components/AudioArchiveView';
import { QuizView } from './components/QuizView';
import { BackupView, SourcesView } from './components/SourcesAndBackupView';
import { toLocalDateKey, WeeklyProgressChart } from './components/WeeklyProgressChart';
import { MEMORIZATION_LESSON_IDS } from './data/memorization';
import { PRAYER_LESSONS } from './data/memorizationPrayers';
import { JOURNEY_FINAL_ID, JOURNEY_REVIEW_LESSONS, LEGACY_HATIM_ID, reviewCompletionId } from './data/memorizationJourney';
import { MemorizationView } from './components/MemorizationView';
import { BadgesSection } from './components/BadgesSection';

type AppView = 'home' | 'course' | 'audio' | 'quiz' | 'sources' | 'backup' | 'memorization';

const PROGRESS_STORAGE_KEY = 'mihrapPremiumProgressV1';
const PRACTICE_STORAGE_KEY = 'mihrapPremiumPracticeV1';
const ACTIVITY_STORAGE_KEY = 'mihrapPremiumActivityV1';
const QUIZ_STORAGE_KEY = 'mihrapPremiumQuizV1';
const NOTES_STORAGE_KEY = 'mihrapPremiumNotesV1';
const MEMORIZATION_STORAGE_KEY = 'mihrapMemorizationV1';
const EZBER_IDS = new Set([
  ...MEMORIZATION_LESSON_IDS,
  ...PRAYER_LESSONS.map((lesson) => lesson.id),
  JOURNEY_FINAL_ID,
  LEGACY_HATIM_ID,
  ...JOURNEY_REVIEW_LESSONS.map(reviewCompletionId),
]);

function validMemorizationIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && EZBER_IDS.has(id)))]
    : [];
}

const EMPTY_QUIZ_STATS: QuizStats = {
  bestOverallScore: 0,
  bestOverallTotal: 0,
  testsCompleted: 0,
  passedModules: [],
};

const ACCENT_STYLES = {
  emerald: {
    bar: 'bg-[#064E3B]',
    label: 'text-[#064E3B]',
  },
  burgundy: {
    bar: 'bg-[#7A1830]',
    label: 'text-[#7A1830]',
  },
  brass: {
    bar: 'bg-[#8C6520]',
    label: 'text-[#8C6520]',
  },
};

export default function App() {
  const [view, setView] = useState<AppView>(() =>
    new URLSearchParams(window.location.search).get('ders') === 'ezber' ? 'memorization' : 'home',
  );
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [mobileLessonView, setMobileLessonView] = useState<'list' | 'card'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [practiceChecks, setPracticeChecks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(PRACTICE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [dailyActivity, setDailyActivity] = useState<DailyActivityLog>(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [quizStats, setQuizStats] = useState<QuizStats>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (!raw) return EMPTY_QUIZ_STATS;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? { ...EMPTY_QUIZ_STATS, ...parsed }
        : EMPTY_QUIZ_STATS;
    } catch {
      return EMPTY_QUIZ_STATS;
    }
  });

  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [memorizationCompleted, setMemorizationCompleted] = useState<string[]>(() => {
    try {
      return validMemorizationIds(JSON.parse(localStorage.getItem(MEMORIZATION_STORAGE_KEY) ?? 'null'));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(MEMORIZATION_STORAGE_KEY, JSON.stringify(memorizationCompleted));
    } catch {
      // Storage unavailable
    }
  }, [memorizationCompleted]);

  const [unlockedToast, setUnlockedToast] = useState<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completed));
    } catch {
      // Storage unavailable
    }
  }, [completed]);

  useEffect(() => {
    try {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(practiceChecks));
    } catch {
      // Storage unavailable
    }
  }, [practiceChecks]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(dailyActivity));
    } catch {
      // Storage unavailable
    }
  }, [dailyActivity]);

  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizStats));
    } catch {
      // Storage unavailable
    }
  }, [quizStats]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(lessonNotes));
    } catch {
      // Storage unavailable
    }
  }, [lessonNotes]);

  const badges = useMemo(
    () => evaluateBadges({ completed, practiceChecks, quizStats }),
    [completed, practiceChecks, quizStats]
  );

  const earnedBadgesCount = useMemo(
    () => badges.filter((b) => b.earned).length,
    [badges]
  );

  const prevEarnedRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const currentEarned = new Set(badges.filter((b) => b.earned).map((b) => b.id));
    if (prevEarnedRef.current === null) {
      prevEarnedRef.current = currentEarned;
      return;
    }
    const newlyEarned = badges
      .filter((b) => b.earned && !prevEarnedRef.current?.has(b.id))
      .map((b) => b.title);
    prevEarnedRef.current = currentEarned;
    if (newlyEarned.length > 0) {
      setUnlockedToast(newlyEarned);
    }
  }, [badges]);

  const recordTodayActivity = (field: 'lessons' | 'steps' | 'quizCorrect', delta: number) => {
    const todayKey = toLocalDateKey();
    setDailyActivity((prev) => {
      const cur = prev[todayKey] ?? { lessons: 0, steps: 0, quizCorrect: 0 };
      const updatedVal = Math.max(0, cur[field] + delta);
      return {
        ...prev,
        [todayKey]: {
          ...cur,
          [field]: updatedVal,
        },
      };
    });
  };

  const totalLessons = useMemo(
    () => MODULES.reduce((acc, m) => acc + m.cards.length, 0),
    []
  );

  const completedLessonsCount = useMemo(
    () =>
      MODULES.reduce(
        (acc, m) =>
          acc + m.cards.filter((_, cIdx) => Boolean(completed[`${m.index}:${cIdx}`])).length,
        0
      ),
    [completed]
  );

  const overallPercent = Math.round((completedLessonsCount / totalLessons) * 100);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr');
    if (!q) return [];
    const matches: Array<{
      moduleIndex: number;
      cardIndex: number;
      moduleTitle: string;
      cardTitle: string;
      kind: string;
      snippet: string;
    }> = [];

    for (const m of MODULES) {
      m.cards.forEach((c, cIdx) => {
        const noteText = lessonNotes[c.id] || '';
        const hay = `${c.t} ${c.kind} ${c.body} ${c.tr || ''} ${c.ar || ''} ${noteText}`.toLocaleLowerCase('tr');
        if (hay.includes(q)) {
          matches.push({
            moduleIndex: m.index,
            cardIndex: cIdx,
            moduleTitle: m.title,
            cardTitle: c.t.replace(/^\d+\s*[·.\-]\s*/, ''),
            kind: c.kind,
            snippet: noteText.toLocaleLowerCase('tr').includes(q)
              ? `Notunuz: ${noteText.slice(0, 110)}`
              : c.body.split('\n')[0].slice(0, 120),
          });
        }
      });
    }
    return matches;
  }, [searchQuery, lessonNotes]);

  const navigateTo = (nextView: AppView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const openModule = (modIdx: number, cardIdx?: number) => {
    setActiveModuleIdx(modIdx);
    if (typeof cardIdx === 'number') {
      setActiveCardIdx(cardIdx);
      setMobileLessonView('card');
    } else {
      setActiveCardIdx(0);
      setMobileLessonView('list');
    }
    navigateTo('course');
  };

  const toggleLessonComplete = (modIdx: number, cardIdx: number) => {
    const k = `${modIdx}:${cardIdx}`;
    const nextVal = !completed[k];
    setCompleted((prev) => ({ ...prev, [k]: nextVal }));
    recordTodayActivity('lessons', nextVal ? 1 : -1);
  };

  const togglePracticeStep = (cardId: string, stepIdx: number) => {
    const k = `${cardId}:${stepIdx}`;
    const nextVal = !practiceChecks[k];
    setPracticeChecks((prev) => ({ ...prev, [k]: nextVal }));
    recordTodayActivity('steps', nextVal ? 1 : -1);
  };

  const resetPracticeSteps = (cardId: string, count: number) => {
    setPracticeChecks((prev) => {
      const next = { ...prev };
      for (let i = 0; i < count; i++) {
        delete next[`${cardId}:${i}`];
      }
      return next;
    });
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      recordTodayActivity('quizCorrect', 1);
    }
  };

  const handleQuizComplete = (result: { testId: string; score: number; total: number }) => {
    setQuizStats((previous) => {
      const bestScore = previous.bestScores?.[result.testId];
      const improvedOverall = previous.bestOverallTotal === 0 ||
        result.score / result.total >= previous.bestOverallScore / previous.bestOverallTotal;
      return {
        ...previous,
        testsCompleted: previous.testsCompleted + 1,
        bestOverallScore: improvedOverall ? result.score : previous.bestOverallScore,
        bestOverallTotal: improvedOverall ? result.total : previous.bestOverallTotal,
        bestScores: { ...previous.bestScores, [result.testId]: Math.max(bestScore ?? 0, result.score) },
      };
    });
  };

  const handleUpdateNote = (cardId: string, text: string) => {
    setLessonNotes((prev) => {
      if (!text) {
        const next = { ...prev };
        delete next[cardId];
        return next;
      }
      return { ...prev, [cardId]: text };
    });
  };

  const handleImportBackup = (data: ProgressBackup) => {
    setCompleted(data.completed);
    if (Array.isArray(data.memorizationCompleted)) {
      setMemorizationCompleted(validMemorizationIds(data.memorizationCompleted));
    }
    if (data.practiceChecks) {
      setPracticeChecks(data.practiceChecks);
    }
    if (data.dailyActivity) {
      setDailyActivity(data.dailyActivity);
    }
    if (data.quizStats) {
      setQuizStats(data.quizStats);
    }
    if (data.notes) {
      setLessonNotes(data.notes);
    }
  };

  const handleResetAll = () => {
    setCompleted({});
    setPracticeChecks({});
    setDailyActivity({});
    setQuizStats(EMPTY_QUIZ_STATS);
    setLessonNotes({});
    setMemorizationCompleted([]);
    setUnlockedToast([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1F1C18] pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E5DEC9] bg-[#FAF7F0]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 lg:gap-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#1F1C18] hover:text-[#064E3B] transition-colors min-w-0 text-left leading-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064E3B]"
          >
            Mihrap ve Minber Akademisi
          </button>

          {/* Zone 2: 4 Concise Nav Links */}
          <nav
            className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-[#575047]"
            aria-label="Ana menü"
          >
            {(
              [
                { id: 'home', label: 'Modüller' },
                { id: 'memorization', label: 'Ezber Dersleri' },
                { id: 'audio', label: 'Ses Arşivi' },
                { id: 'quiz', label: 'Bilgi Testi' },
                { id: 'sources', label: 'Kaynaklar' },
              ] as { id: AppView; label: string }[]
            ).map((navItem) => {
              const active =
                view === navItem.id || (navItem.id === 'home' && view === 'course');
              return (
                <button
                  key={navItem.id}
                  type="button"
                  onClick={() => navigateTo(navItem.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    active
                      ? 'text-[#1F1C18] font-semibold border-[#7A1830]'
                      : 'border-transparent hover:text-[#1F1C18] hover:border-[#D4CBB4]'
                  }`}
                >
                  {navItem.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('backup')}
              aria-current={view === 'backup' ? 'page' : undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
            >
              <span>Yedekleme</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">%{overallPercent}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {unlockedToast.length > 0 && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-[#B8D4C9] bg-[#EEF7F3] px-4 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-sm text-[#064E3B]">
              <Award className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Yeni rozet kazanıldı:</strong> {unlockedToast.join(', ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUnlockedToast([])}
              aria-label="Bildirimi kapat"
              className="p-1 text-[#064E3B] hover:opacity-75 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {view === 'home' && (
          <div className="space-y-8">
            {/* Editorial Overview Banner */}
            <section className="rounded-2xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="text-xs font-medium text-[#7A1830]">
                    Hanefî mezhebine göre cami görevleri ve ibadet eğitimi
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1F1C18] leading-[1.12] tracking-tight">
                    Cuma, teravih, hutbe ve müezzinlik eğitimi tek rehberde
                  </h1>
                  <p className="text-sm sm:text-base text-[#575047] leading-relaxed max-w-2xl">
                    Diyanet ve MEB kaynaklarına dayalı adım adım görev sıraları, harekeli Arapça metinler, uygulama provaları, makam ses arşivi ve açıklamalı değerlendirme testleri.
                  </p>
                </div>

                <div className="lg:col-span-4 rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-5 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-[#575047]">
                      Genel eğitim ilerlemesi
                    </span>
                    <span className="text-2xl font-bold text-[#064E3B] font-mono-num">
                      %{overallPercent}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E5DEC9] overflow-hidden">
                    <div
                      className="h-full bg-[#064E3B] transition-all duration-300"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#645C52] font-mono-num">
                    <span>{completedLessonsCount} / {totalLessons} ders tamamlandı</span>
                    <span>{earnedBadgesCount} / {badges.length} rozet</span>
                  </div>
                </div>
              </div>

              {/* Global Search */}
              <div className="mt-6 pt-6 border-t border-[#EFE9DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search
                    className="w-4 h-4 text-[#857A69] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ders, dua, kamet, hutbe, zamm-ı sûre veya makam ara..."
                    aria-label="Tüm modüllerde ders ara"
                    className="w-full rounded-xl border border-[#D4CBB4] bg-[#FAF7F0] pl-10 pr-9 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#8A7F6E] focus:bg-white focus:outline-none focus:border-[#064E3B]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Aramayı temizle"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#645C52] hover:text-[#1F1C18]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('memorization')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053D2E]"
                  >
                    <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
                    Ezber Dersleri
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('audio')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-[#FAF7F0] px-3.5 py-2 text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DA] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#064E3B]" aria-hidden="true" />
                    Ses Arşivi
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('quiz')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-[#FAF7F0] px-3.5 py-2 text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DA] transition-colors whitespace-nowrap shrink-0"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#7A1830]" aria-hidden="true" />
                    Bilgi Testi
                  </button>
                </div>
              </div>
            </section>

            {/* Instant Search Results OR Module Grid */}
            {searchQuery.trim() ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-[#1F1C18]">
                    Arama sonuçları{' '}
                    <span className="font-mono-num text-base font-normal text-[#645C52]">
                      ({searchResults.length})
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-[#7A1830] hover:underline"
                  >
                    Tüm modüllere dön
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="rounded-2xl border border-[#E5DEC9] bg-white p-8 text-center text-sm text-[#645C52]">
                    “{searchQuery}” için eşleşen bir ders kartelası bulunamadı.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((res) => (
                      <button
                        key={`${res.moduleIndex}-${res.cardIndex}`}
                        type="button"
                        onClick={() => openModule(res.moduleIndex, res.cardIndex)}
                        className="text-left rounded-xl border border-[#E5DEC9] bg-white p-4 hover:border-[#064E3B] transition-colors flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs text-[#7A1830] font-medium">
                            {res.moduleTitle} · {res.kind}
                          </div>
                          <h3 className="mt-1 text-base font-bold text-[#1F1C18]">
                            {res.cardTitle}
                          </h3>
                          <p className="mt-1 text-xs text-[#575047] line-clamp-2">
                            {res.snippet}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B]">
                          Dersi aç
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-2xl font-bold text-[#1F1C18]">
                    Eğitim Modülleri
                  </h2>
                  <span className="text-xs text-[#645C52] font-mono-num">
                    6 ana modül · {totalLessons} ders kartelası
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {MODULES.map((m) => {
                    const doneCount = m.cards.filter((_, cIdx) =>
                      Boolean(completed[`${m.index}:${cIdx}`])
                    ).length;
                    const pct = Math.round((doneCount / m.cards.length) * 100);
                    const accent = ACCENT_STYLES[m.accent];

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => openModule(m.index)}
                        className="group text-left rounded-2xl border border-[#E5DEC9] bg-white overflow-hidden hover:border-[#064E3B] transition-colors flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
                      >
                        <div>
                          <div className={`h-1.5 w-full ${accent.bar}`} />
                          <div className="p-5">
                            <div className="flex items-center justify-between gap-2 text-xs text-[#645C52]">
                              <span className={`font-semibold font-mono-num ${accent.label}`}>
                                Modül 0{m.index + 1}
                              </span>
                              <span className="font-mono-num">
                                {m.cards.length} ders · %{pct}
                              </span>
                            </div>

                            <h3 className="mt-2 text-xl font-bold text-[#1F1C18] group-hover:text-[#064E3B] transition-colors leading-snug">
                              {m.title}
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-[#575047] leading-relaxed">
                              {m.intro}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-2 space-y-3">
                          <div className="h-1.5 rounded-full bg-[#EFE9DA] overflow-hidden">
                            <div
                              className={`h-full ${accent.bar} transition-all duration-300`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-[#1F1C18]">
                            <span className="text-[#645C52] font-normal font-mono-num">
                              {doneCount}/{m.cards.length} tamamlandı
                            </span>
                            <span className="inline-flex items-center gap-1 text-[#064E3B]">
                              Çalışmaya başla
                              <ArrowRight
                                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* D3.js Weekly Training Progress Bar Chart & Badges */}
            {!searchQuery.trim() && (
              <>
                <WeeklyProgressChart
                  dailyActivity={dailyActivity}
                  totalCompletedLessons={completedLessonsCount}
                  totalLessons={totalLessons}
                />
                <BadgesSection badges={badges} />
              </>
            )}

            {/* Educational Notice */}
            <section className="rounded-xl border border-[#E5DEC9] bg-[#FBF6EA] p-4 text-xs sm:text-sm text-[#4A3E2A] leading-relaxed">
              Tüm ders metinleri, çalışma kartelaları ve uygulama provaları çevrimdışı olarak cihazınızda çalışır. Haricî ses kayıtları ve kaynak bağlantıları internet erişimi gerektirir; fıkhî ve mahallî cami uygulamaları için görevli imam-hatibin rehberliği esas alınmalıdır.
            </section>
          </div>
        )}

        {view === 'course' && (
          <LessonWorkspace
            moduleData={MODULES[activeModuleIdx]}
            activeCardIndex={activeCardIdx}
            mobileView={mobileLessonView}
            completed={completed}
            practiceChecks={practiceChecks}
            lessonNotes={lessonNotes}
            onSelectCard={(idx) => {
              setActiveCardIdx(idx);
              setMobileLessonView('card');
            }}
            onBackToModules={() => navigateTo('home')}
            onBackToList={() => setMobileLessonView('list')}
            onToggleComplete={toggleLessonComplete}
            onTogglePracticeStep={togglePracticeStep}
            onResetPracticeSteps={resetPracticeSteps}
            onUpdateNote={handleUpdateNote}
            onJumpToModule={(mIdx, cIdx) => openModule(mIdx, cIdx ?? 0)}
          />
        )}

        {view === 'memorization' && (
          <MemorizationView
            completed={memorizationCompleted}
            onToggleComplete={(id) => setMemorizationCompleted((previous) =>
              previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
            )}
          />
        )}

        {view === 'audio' && (
          <AudioArchiveView onOpenLesson={(mIdx, cIdx) => openModule(mIdx, cIdx)} />
        )}

        {view === 'quiz' && (
          <div className="space-y-8">
            <QuizView
              onQuizAnswer={handleQuizAnswer}
              onQuizComplete={handleQuizComplete}
              bestScores={quizStats.bestScores ?? {}}
            />
            <BadgesSection badges={badges} compact />
          </div>
        )}

        {view === 'sources' && <SourcesView />}

        {view === 'backup' && (
          <BackupView
            completed={completed}
            practiceChecks={practiceChecks}
            dailyActivity={dailyActivity}
            quizStats={quizStats}
            lessonNotes={lessonNotes}
            memorizationCompleted={memorizationCompleted}
            earnedBadgesCount={earnedBadgesCount}
            totalBadgesCount={badges.length}
            onImportBackup={handleImportBackup}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {/* Desktop Quiet Footer */}
      <footer className="hidden md:block border-t border-[#E5DEC9] bg-white/60 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#645C52]">
          <span>Mihrap ve Minber Akademisi · Hanefî Mezhebi Eğitim Rehberi</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('sources')}
              className="hover:text-[#1F1C18] underline underline-offset-4"
            >
              Resmî Kaynaklar
            </button>
            <button
              type="button"
              onClick={() => navigateTo('backup')}
              className="hover:text-[#1F1C18] underline underline-offset-4"
            >
              İlerleme Yedekleme
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Compact Bottom Bar (height ~58px, <10% mobile viewport) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#E5DEC9] bg-white/95 backdrop-blur-sm px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] grid grid-cols-6 gap-1"
        aria-label="Mobil alt menü"
      >
        {(
          [
            { id: 'home', label: 'Modüller', icon: Layers },
            { id: 'memorization', label: 'Ezber', icon: NotebookPen },
            { id: 'audio', label: 'Ses', icon: Headphones },
            { id: 'quiz', label: 'Test', icon: CheckCircle2 },
            { id: 'sources', label: 'Kaynak', icon: BookOpen },
            { id: 'backup', label: 'Yedek', icon: Download },
          ] as { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map((item) => {
          const Icon = item.icon;
          const active =
            view === item.id || (item.id === 'home' && view === 'course');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-11 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                active ? 'text-[#7A1830] bg-[#FAF7F0]' : 'text-[#575047]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
