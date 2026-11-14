import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Lock,
  Mic,
  Moon,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { BadgeIconKey, EvaluatedBadge } from '../data/badgesData';

interface BadgesSectionProps {
  badges: EvaluatedBadge[];
  compact?: boolean;
}

type BadgeFilter = 'all' | 'earned' | 'pending';

function renderBadgeIcon(icon: BadgeIconKey, className: string) {
  switch (icon) {
    case 'compass':
      return <Compass className={className} aria-hidden="true" />;
    case 'mic':
      return <Mic className={className} aria-hidden="true" />;
    case 'scroll':
      return <ScrollText className={className} aria-hidden="true" />;
    case 'book':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'moon':
      return <Moon className={className} aria-hidden="true" />;
    case 'check':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'star':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'award':
    default:
      return <Award className={className} aria-hidden="true" />;
  }
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  badges,
  compact = false,
}) => {
  const [filter, setFilter] = useState<BadgeFilter>('all');

  const earnedCount = useMemo(
    () => badges.filter((b) => b.earned).length,
    [badges]
  );

  const visibleBadges = useMemo(() => {
    if (filter === 'earned') return badges.filter((b) => b.earned);
    if (filter === 'pending') return badges.filter((b) => !b.earned);
    return badges;
  }, [badges, filter]);

  return (
    <section
      className="rounded-2xl border border-[#E5DEC9] bg-white p-5 sm:p-6 space-y-5"
      aria-labelledby="badges-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#7A1830]">
            Eğitim ve Başarı Unvanları · <span className="font-mono-num">{earnedCount} / {badges.length}</span> kazanıldı
          </div>
          <h2
            id="badges-heading"
            className="mt-0.5 text-xl sm:text-2xl font-bold text-[#1F1C18]"
          >
            Rozetler ve Kazanımlar
          </h2>
          {!compact && (
            <p className="mt-1 text-xs sm:text-sm text-[#575047]">
              Belirli ders sayılarını, modül serilerini veya Bilgi Testi başarı hedeflerini tamamladığınızda rozetler otomatik olarak açılır.
            </p>
          )}
        </div>

        <div
          className="inline-flex items-center gap-1 rounded-xl border border-[#E5DEC9] bg-[#F3EDE0] p-1 self-start sm:self-auto"
          role="group"
          aria-label="Rozet durumu filtresi"
        >
          {(
            [
              { id: 'all', label: `Tümü (${badges.length})` },
              { id: 'earned', label: `Kazanılan (${earnedCount})` },
              { id: 'pending', label: `Bekleyen (${badges.length - earnedCount})` },
            ] as { id: BadgeFilter; label: string }[]
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#1F1C18] shadow-xs'
                    : 'text-[#575047] hover:text-[#1F1C18]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleBadges.length === 0 ? (
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-6 text-center text-sm text-[#645C52]">
          {filter === 'earned'
            ? 'Henüz kazanılmış rozet bulunmuyor. İlk dersi tamamladığınızda “İlk Adım” rozetiniz açılır.'
            : 'Tebrikler, akademideki tüm rozetleri kazandınız.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleBadges.map((badge) => (
            <article
              key={badge.id}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-colors ${
                badge.earned
                  ? 'border-[#B8D4C9] bg-[#FAFDFB]'
                  : 'border-[#E5DEC9] bg-[#FAF7F0]/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 border ${
                    badge.earned
                      ? 'bg-[#064E3B] border-[#064E3B] text-[#F9E7B2]'
                      : 'bg-white border-[#E5DEC9] text-[#8A7F6E]'
                  }`}
                >
                  {renderBadgeIcon(badge.icon, 'w-5 h-5')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#645C52] truncate">{badge.category}</span>
                    {badge.earned ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#064E3B] whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Kazanıldı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-[#7A7164] whitespace-nowrap shrink-0">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        Kilitli
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 text-base font-bold text-[#1F1C18] leading-snug">
                    {badge.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#575047] leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#EFE9DA]">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#645C52] truncate">{badge.requirementLabel}</span>
                  <span
                    className={`font-mono-num font-semibold shrink-0 ${
                      badge.earned ? 'text-[#064E3B]' : 'text-[#4E473E]'
                    }`}
                  >
                    {badge.id === 'bilgi-testi-ustunu'
                      ? `%${badge.current} / %${badge.target}`
                      : `${badge.current} / ${badge.target}`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5DEC9] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      badge.earned ? 'bg-[#064E3B]' : 'bg-[#9F752A]'
                    }`}
                    style={{ width: `${badge.percent}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
