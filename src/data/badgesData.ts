import { MODULES } from './academyData';
import type { QuizStats } from '../types/academy';

export type BadgeIconKey =
  | 'compass'
  | 'mic'
  | 'scroll'
  | 'book'
  | 'moon'
  | 'award'
  | 'check'
  | 'shield'
  | 'star';

export type BadgeEvaluationContext = {
  completed: Record<string, boolean>;
  practiceChecks: Record<string, boolean>;
  quizStats: QuizStats;
};

export type EvaluatedBadge = {
  id: string;
  title: string;
  category: 'Ders İlerlemesi' | 'Uygulama' | 'Bilgi Testi' | 'Üst Düzey';
  description: string;
  requirementLabel: string;
  icon: BadgeIconKey;
  earned: boolean;
  current: number;
  target: number;
  percent: number;
};

function moduleCompletedCount(
  completed: Record<string, boolean>,
  moduleIndex: number
): number {
  const mod = MODULES[moduleIndex];
  if (!mod) return 0;
  return mod.cards.filter((_, idx) => Boolean(completed[`${moduleIndex}:${idx}`])).length;
}

export function evaluateBadges(ctx: BadgeEvaluationContext): EvaluatedBadge[] {
  const totalLessons = MODULES.reduce((acc, m) => acc + m.cards.length, 0);
  const totalCompletedLessons = MODULES.reduce(
    (acc, m) => acc + moduleCompletedCount(ctx.completed, m.index),
    0
  );
  const totalPracticeChecked = Object.values(ctx.practiceChecks).filter(Boolean).length;

  const mod0Done = moduleCompletedCount(ctx.completed, 0);
  const mod0Total = MODULES[0].cards.length;

  const mod1Done = moduleCompletedCount(ctx.completed, 1);
  const mod1Total = MODULES[1].cards.length;

  const mod2Done = moduleCompletedCount(ctx.completed, 2);
  const mod3Done = moduleCompletedCount(ctx.completed, 3);
  const mod3Total = MODULES[3].cards.length;

  const mod4Done = moduleCompletedCount(ctx.completed, 4);
  const mod4Total = MODULES[4].cards.length;

  const mod5Done = moduleCompletedCount(ctx.completed, 5);
  const mod5Total = MODULES[5].cards.length;

  const bestQuizPct =
    ctx.quizStats.bestOverallTotal > 0
      ? Math.round((ctx.quizStats.bestOverallScore / ctx.quizStats.bestOverallTotal) * 100)
      : 0;

  const muezzinCandidateProgress = Math.max(
    Math.min(4, mod0Done) / 4,
    Math.min(3, mod5Done) / 3
  );
  const muezzinCandidateCurrent =
    mod0Done >= 4 ? 4 : mod5Done >= 3 ? 3 : mod0Done;
  const muezzinCandidateTarget = mod5Done > mod0Done && mod0Done < 4 ? 3 : 4;

  const imametDone = Math.min(15, mod2Done + mod3Done);
  const ramazanDone = mod3Done + mod4Done;
  const ramazanTarget = mod3Total + mod4Total;

  const raw: Array<Omit<EvaluatedBadge, 'percent'>> = [
    {
      id: 'ilk-adim',
      title: 'İlk Adım',
      category: 'Ders İlerlemesi',
      description: 'Cami görevleri eğitimindeki ilk ders kartelasını başarıyla tamamladınız.',
      requirementLabel: 'En az 1 ders tamamla',
      icon: 'compass',
      earned: totalCompletedLessons >= 1,
      current: Math.min(1, totalCompletedLessons),
      target: 1,
    },
    {
      id: 'muezzin-adayi',
      title: 'Müezzin Adayı',
      category: 'Ders İlerlemesi',
      description: 'Cuma müezzinliğinden 4 ders veya Ezan–Salâ modülünden 3 ders tamamladınız.',
      requirementLabel: 'Cuma Müezzin (4) veya Ezan–Salâ (3) dersi',
      icon: 'mic',
      earned: muezzinCandidateProgress >= 1,
      current: muezzinCandidateCurrent,
      target: muezzinCandidateTarget,
    },
    {
      id: 'ezan-kamet-ehli',
      title: 'Ezan ve Kamet Ehli',
      category: 'Ders İlerlemesi',
      description: 'Ezan, kamet ve salâ modülündeki tüm dersleri ve metinleri tamamladınız.',
      requirementLabel: `Ezan, kamet ve salâ (${mod5Total} ders)`,
      icon: 'star',
      earned: mod5Done >= mod5Total,
      current: mod5Done,
      target: mod5Total,
    },
    {
      id: 'cuma-muezzini',
      title: 'Cuma Müezzini',
      category: 'Ders İlerlemesi',
      description: 'Cuma salâsından tesbihata kadar tüm cuma müezzinliği akışını tamamladınız.',
      requirementLabel: `Cuma namazı müezzinliği (${mod0Total} ders)`,
      icon: 'shield',
      earned: mod0Done >= mod0Total,
      current: mod0Done,
      target: mod0Total,
    },
    {
      id: 'hutbe-ustasi',
      title: 'Hutbe Ustası',
      category: 'Ders İlerlemesi',
      description: 'Minber basamak dualarından ikinci hutbeye kadar hutbe eğitiminin tamamını bitirdiniz.',
      requirementLabel: `Cuma namazı hutbesi (${mod1Total} ders)`,
      icon: 'scroll',
      earned: mod1Done >= mod1Total,
      current: mod1Done,
      target: mod1Total,
    },
    {
      id: 'mihrap-imami',
      title: 'Mihrap İmamı',
      category: 'Ders İlerlemesi',
      description: 'Cuma ve Teravih imameti modüllerinden toplam en az 15 ders tamamladınız.',
      requirementLabel: 'İmamet modüllerinden 15 ders',
      icon: 'book',
      earned: mod2Done + mod3Done >= 15,
      current: imametDone,
      target: 15,
    },
    {
      id: 'ramazan-rehberi',
      title: 'Ramazan Rehberi',
      category: 'Ders İlerlemesi',
      description: '20 rekât teravih imameti ve teravih müezzinliği modüllerinin ikisini de tamamladınız.',
      requirementLabel: `Teravih imameti + müezzinliği (${ramazanTarget} ders)`,
      icon: 'moon',
      earned: ramazanDone >= ramazanTarget,
      current: ramazanDone,
      target: ramazanTarget,
    },
    {
      id: 'uygulama-disiplini',
      title: 'Uygulama Disiplini',
      category: 'Uygulama',
      description: 'Derslerin Uygulama sekmesinde en az 15 prova adımını tek tek çalışıp işaretlediniz.',
      requirementLabel: '15 uygulama adımı işaretle',
      icon: 'check',
      earned: totalPracticeChecked >= 15,
      current: Math.min(15, totalPracticeChecked),
      target: 15,
    },
    {
      id: 'bilgi-testi-ustunu',
      title: 'Fıkıh Bilgi Başarısı',
      category: 'Bilgi Testi',
      description: 'Tüm modülleri kapsayan Bilgi Testi’nde en az %75 başarı oranına ulaştınız.',
      requirementLabel: 'Genel Bilgi Testi’nde %75+ başarı',
      icon: 'award',
      earned: bestQuizPct >= 75,
      current: Math.min(75, bestQuizPct),
      target: 75,
    },
    {
      id: 'akademi-yetkinlik',
      title: 'Cami Görevleri Yetkinliği',
      category: 'Üst Düzey',
      description: 'Tüm modüllerdeki dersleri %100 tamamlayıp Bilgi Testi’nden geçer puan aldınız.',
      requirementLabel: `${totalLessons} ders + %75+ genel test`,
      icon: 'award',
      earned: totalCompletedLessons >= totalLessons && bestQuizPct >= 75,
      current: totalCompletedLessons + (bestQuizPct >= 75 ? 1 : 0),
      target: totalLessons + 1,
    },
  ];

  return raw.map((b) => ({
    ...b,
    percent: b.target > 0 ? Math.min(100, Math.round((b.current / b.target) * 100)) : 0,
  }));
}
