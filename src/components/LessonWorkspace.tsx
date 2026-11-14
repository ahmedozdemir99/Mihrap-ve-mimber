import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  NotebookPen,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { LessonCard, ModuleData } from '../types/academy';
import { AudioPlayerBox } from './AudioPlayerBox';
import { VoiceRecorderPractice } from './VoiceRecorderPractice';
import { RehearsalTracker } from './RehearsalTracker';

type StudyTab = 'anlatim' | 'arapca' | 'prova' | 'medya';
type ArabicSize = 'sm' | 'md' | 'lg';

interface LessonWorkspaceProps {
  moduleData: ModuleData;
  activeCardIndex: number;
  mobileView: 'list' | 'card';
  completed: Record<string, boolean>;
  practiceChecks: Record<string, boolean>;
  lessonNotes: Record<string, string>;
  onSelectCard: (index: number) => void;
  onBackToModules: () => void;
  onBackToList: () => void;
  onToggleComplete: (moduleIdx: number, cardIdx: number) => void;
  onTogglePracticeStep: (cardId: string, stepIndex: number) => void;
  onResetPracticeSteps: (cardId: string, stepCount: number) => void;
  onUpdateNote: (cardId: string, text: string) => void;
  onJumpToModule: (moduleIdx: number, cardIdx?: number) => void;
}

const ARABIC_SIZE_CLASS: Record<ArabicSize, string> = {
  sm: 'text-2xl sm:text-3xl leading-[2.1]',
  md: 'text-3xl sm:text-4xl leading-[2.2]',
  lg: 'text-4xl sm:text-[44px] leading-[2.25]',
};

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({
  moduleData,
  activeCardIndex,
  mobileView,
  completed,
  practiceChecks,
  lessonNotes,
  onSelectCard,
  onBackToModules,
  onBackToList,
  onToggleComplete,
  onTogglePracticeStep,
  onResetPracticeSteps,
  onUpdateNote,
  onJumpToModule,
}) => {
  const [tab, setTab] = useState<StudyTab>('anlatim');
  const [arabicSize, setArabicSize] = useState<ArabicSize>('md');
  const [hideTranslit, setHideTranslit] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const card: LessonCard = moduleData.cards[activeCardIndex] || moduleData.cards[0];
  const hasMedia = Boolean(card.media && card.media.length > 0);
  const effectiveTab: StudyTab = tab === 'medya' && !hasMedia ? 'anlatim' : tab;

  const isDone = (cIdx: number) => Boolean(completed[`${moduleData.index}:${cIdx}`]);
  const completedCount = moduleData.cards.filter((_, i) => isDone(i)).length;
  const modulePercent = Math.round((completedCount / moduleData.cards.length) * 100);

  const practiceSteps = useMemo(() => {
    const lines = (card.body || moduleData.intro)
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length >= 2) return lines;
    return [
      card.body || moduleData.intro,
      'Metni sesli ve acele etmeden tekrar et.',
      'Uygulama sırasını kendi cümlelerinle özetle.',
    ];
  }, [card.body, moduleData.intro]);

  const checkedStepCount = practiceSteps.filter((_, i) =>
    Boolean(practiceChecks[`${card.id}:${i}`])
  ).length;

  const handleCopyArabic = async () => {
    if (!card.ar) return;
    const text = card.tr ? `${card.ar}\n\n${card.tr}` : card.ar;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(card.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard blocked in restricted context; fail silently
    }
  };

  const cleanTitle = (t: string) => t.replace(/^\d+\s*[·.\-]\s*/, '');

  const directMedia = (card.media || []).filter(
    (m) => !m.link && /^https:\/\//i.test(m.url)
  );
  const linkMedia = (card.media || []).filter(
    (m) => m.link && /^https:\/\//i.test(m.url)
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={mobileView === 'card' ? onBackToList : onBackToModules}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7A1830] hover:text-[#581022] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1830]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="lg:hidden">
            {mobileView === 'card' ? 'Ders listesine dön' : 'Tüm modüller'}
          </span>
          <span className="hidden lg:inline">Tüm modüllere dön</span>
        </button>

        <div className="text-xs text-[#645C52] font-mono-num">
          {moduleData.index + 1}. Modül · {completedCount}/{moduleData.cards.length} ders tamamlandı (%{modulePercent})
        </div>
      </div>

      {/* Module Banner + Flow Timeline */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#7A1830]">
              Modül 0{moduleData.index + 1} · Hanefî Uygulama Rehberi
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#1F1C18] tracking-tight">
              {moduleData.title}
            </h2>
            <p className="mt-1.5 text-sm text-[#575047] leading-relaxed">
              {moduleData.intro}
            </p>
          </div>
          <div className="w-full md:w-56 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#645C52] mb-1.5">
              <span>Modül ilerlemesi</span>
              <span className="font-mono-num font-semibold text-[#064E3B]">%{modulePercent}</span>
            </div>
            <div className="h-2 rounded-full bg-[#EFE9DA] overflow-hidden">
              <div
                className="h-full bg-[#064E3B] transition-all duration-300"
                style={{ width: `${modulePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Workflow sequence */}
        <div className="mt-5 pt-4 border-t border-[#EFE9DA]">
          <div className="text-xs font-semibold text-[#645C52] mb-2.5">
            İbadet ve görev akışı
          </div>
          <ol className="flex flex-wrap items-center gap-y-2 gap-x-1.5 text-xs">
            {moduleData.flow.map((step, idx) => (
              <li key={step} className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] px-2.5 py-1 text-[#1F1C18] font-medium">
                  <span className="font-mono-num text-[#7A1830] font-semibold">
                    {idx + 1}.
                  </span>
                  {step}
                </span>
                {idx < moduleData.flow.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#A59A88]" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Lesson List */}
        <aside
          className={`lg:col-span-4 space-y-2 ${
            mobileView === 'card' ? 'hidden lg:block' : 'block'
          }`}
          aria-label="Modül ders listesi"
        >
          <div className="text-xs font-semibold text-[#645C52] px-1 pb-1">
            Ders kartelaları ({moduleData.cards.length})
          </div>
          <div className="space-y-2">
            {moduleData.cards.map((item, idx) => {
              const selected = idx === activeCardIndex;
              const finished = isDone(idx);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectCard(idx);
                    setTab('anlatim');
                  }}
                  className={`w-full text-left rounded-xl border p-3.5 flex items-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] ${
                    selected
                      ? 'bg-white border-[#7A1830] ring-1 ring-[#7A1830]/20'
                      : 'bg-white/80 border-[#E5DEC9] hover:border-[#C5B99E] hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg grid place-items-center text-xs font-mono-num font-semibold shrink-0 ${
                      selected
                        ? 'bg-[#7A1830] text-white'
                        : finished
                        ? 'bg-[#064E3B] text-white'
                        : 'bg-[#FAF7F0] text-[#4E473E] border border-[#E5DEC9]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[#1F1C18] truncate">
                      {cleanTitle(item.t)}
                    </span>
                    <span className="block text-xs text-[#645C52] truncate mt-0.5">
                      {item.kind}
                      {item.ar ? ' · Arapça metin' : ''}
                      {lessonNotes[item.id]?.trim() ? ' · Not var' : ''}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      finished ? 'text-[#064E3B]' : 'text-[#9B9080]'
                    }`}
                    aria-label={finished ? 'Tamamlandı' : 'Bekliyor'}
                  >
                    {finished ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Active Lesson Card */}
        <section
          className={`lg:col-span-8 space-y-4 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
          aria-label="Aktif ders içeriği"
        >
          {/* Tabs */}
          <div
            className="inline-flex flex-wrap sm:flex-nowrap w-full rounded-xl border border-[#E5DEC9] bg-[#F3EDE0] p-1 gap-1"
            role="tablist"
          >
            {(
              [
                { id: 'anlatim', label: 'Anlatım' },
                { id: 'arapca', label: 'Arapça & Okunuş' },
                { id: 'prova', label: `Uygulama (${checkedStepCount}/${practiceSteps.length})` },
                ...(hasMedia ? [{ id: 'medya', label: 'Ses / Kaynak' }] : []),
              ] as { id: StudyTab; label: string }[]
            ).map((t) => {
              const active = effectiveTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#064E3B] ${
                    active
                      ? 'bg-white text-[#1F1C18] shadow-xs'
                      : 'text-[#575047] hover:text-[#1F1C18]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Lesson Card */}
          <article className="rounded-2xl border border-[#E5DEC9] bg-white overflow-hidden">
            <header className="border-b border-[#EFE9DA] bg-[#FAF7F0] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[#645C52]">
                  <span className="font-mono-num">
                    Ders {activeCardIndex + 1} / {moduleData.cards.length}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span>{card.kind}</span>
                </div>
                <h3 className="mt-0.5 text-xl sm:text-2xl font-bold text-[#1F1C18]">
                  {cleanTitle(card.t)}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onToggleComplete(moduleData.index, activeCardIndex)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] ${
                  isDone(activeCardIndex)
                    ? 'bg-[#064E3B] text-white hover:bg-[#053D2E]'
                    : 'border border-[#D4CBB4] bg-white text-[#1F1C18] hover:border-[#064E3B]'
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                {isDone(activeCardIndex) ? 'Tamamlandı' : 'Tamamlandı işaretle'}
              </button>
            </header>

            <div className="p-5 sm:p-6 space-y-5">
              {/* TAB 1: ANLATIM */}
              {effectiveTab === 'anlatim' && (
                <div className="space-y-5">
                  <div className="text-[15px] leading-relaxed text-[#2D2924] whitespace-pre-line max-w-[70ch]">
                    {card.body}
                  </div>

                  {card.ar && (
                    <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DEC9]">
                        <span className="text-xs font-semibold text-[#645C52]">
                          Arapça metin ve okunuş
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setHideTranslit((v) => !v)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-2.5 py-1 text-xs font-medium text-[#4E473E] hover:text-[#1F1C18] whitespace-nowrap shrink-0"
                          >
                            {hideTranslit ? (
                              <>
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                Okunuşu göster
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                                Okunuşu gizle
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyArabic}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-2.5 py-1 text-xs font-medium text-[#4E473E] hover:text-[#1F1C18] whitespace-nowrap shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            {copiedId === card.id ? 'Kopyalandı' : 'Kopyala'}
                          </button>
                        </div>
                      </div>

                      <div
                        dir="rtl"
                        lang="ar"
                        className={`font-arabic text-center text-[#1B2420] whitespace-pre-line py-2 ${ARABIC_SIZE_CLASS[arabicSize]}`}
                      >
                        {card.ar}
                      </div>

                      {card.tr && !hideTranslit && (
                        <div className="rounded-lg border border-[#CFE0D8] bg-[#EEF6F2] px-4 py-3 text-sm font-medium text-[#064E3B] whitespace-pre-line leading-relaxed">
                          {card.tr}
                        </div>
                      )}
                    </div>
                  )}

                  {card.tip && (
                    <div className="rounded-xl border border-[#E5DEC9] bg-[#FBF6EA] p-4 text-sm text-[#4A3E2A] leading-relaxed">
                      <span className="font-semibold text-[#7A1830]">Fıkhî / Uygulama Notu: </span>
                      {card.tip}
                    </div>
                  )}

                  {directMedia.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="text-xs font-semibold text-[#064E3B]">
                        Hazır Ses Kaydı ({directMedia.length})
                      </div>
                      <div className="space-y-3">
                        {directMedia.map((track) => (
                          <AudioPlayerBox
                            key={track.url}
                            title={track.name}
                            url={track.url}
                            fallback={track.fallback}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {card.url && (
                    <div className="pt-2 border-t border-[#EFE9DA] flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs text-[#645C52]">
                        Bu dersin dayandığı doğrulanmış kaynak:
                      </span>
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1830] hover:underline underline-offset-4"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        Resmî Kaynağı İncele
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ARAPÇA & OKUNUŞ */}
              {effectiveTab === 'arapca' && (
                <div className="space-y-4">
                  {card.ar ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-[#E5DEC9] bg-[#FAF7F0] p-1">
                          {(
                            [
                              { id: 'sm', label: 'Normal' },
                              { id: 'md', label: 'Büyük' },
                              { id: 'lg', label: 'Çok Büyük' },
                            ] as { id: ArabicSize; label: string }[]
                          ).map((sz) => (
                            <button
                              key={sz.id}
                              type="button"
                              onClick={() => setArabicSize(sz.id)}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                                arabicSize === sz.id
                                  ? 'bg-white text-[#1F1C18] shadow-xs'
                                  : 'text-[#645C52] hover:text-[#1F1C18]'
                              }`}
                            >
                              {sz.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setHideTranslit((v) => !v)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3 py-1.5 text-xs font-semibold text-[#4E473E] hover:text-[#1F1C18] whitespace-nowrap shrink-0"
                          >
                            {hideTranslit ? (
                              <>
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                Okunuşu göster
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                                Ezber modu (gizle)
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyArabic}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3 py-1.5 text-xs font-semibold text-[#4E473E] hover:text-[#1F1C18] whitespace-nowrap shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            {copiedId === card.id ? 'Kopyalandı' : 'Kopyala'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-5 sm:p-6">
                        <div
                          dir="rtl"
                          lang="ar"
                          className={`font-arabic text-center text-[#1B2420] whitespace-pre-line ${ARABIC_SIZE_CLASS[arabicSize]}`}
                        >
                          {card.ar}
                        </div>
                      </div>

                      {card.tr && !hideTranslit && (
                        <div className="rounded-xl border border-[#CFE0D8] bg-[#EEF6F2] p-4 text-sm sm:text-[15px] font-medium text-[#064E3B] whitespace-pre-line leading-relaxed">
                          {card.tr}
                        </div>
                      )}

                      <p className="text-xs text-[#645C52] leading-relaxed">
                        Türkçe harfler Arapça mahreçlerin tam karşılığını vermez; doğru telaffuz ve tecvid için harekeli Arapça metni ehil bir hocaya dinleterek çalışın.
                      </p>

                      <VoiceRecorderPractice key={card.id} />
                    </>
                  ) : (
                    <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-5 space-y-3">
                      <p className="text-sm text-[#4E473E] leading-relaxed">
                        Bu dersin kendine özgü Arapça metni bulunmuyor. Ezan, kamet ve sabah ezanı eklemelerinin tam harekeli metinleri için 6. modüle geçebilirsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={() => onJumpToModule(5, 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0"
                      >
                        Ezan ve Kamet Metinlerine Git
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: UYGULAMA / PROVA */}
              {effectiveTab === 'prova' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[#645C52]">
                      Her adımı çalıştıktan sonra işaretleyin. İlerleme cihazınızda otomatik saklanır.
                    </p>
                    {checkedStepCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onResetPracticeSteps(card.id, practiceSteps.length)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1830] hover:underline whitespace-nowrap shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" aria-hidden="true" />
                        İşaretleri temizle
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {practiceSteps.map((stepText, idx) => {
                      const checked = Boolean(practiceChecks[`${card.id}:${idx}`]);
                      return (
                        <label
                          key={`${card.id}-step-${idx}`}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                            checked
                              ? 'border-[#B8D4C9] bg-[#EEF7F3]'
                              : 'border-[#E5DEC9] bg-white hover:bg-[#FAF7F0]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onTogglePracticeStep(card.id, idx)}
                            className="mt-0.5 w-4 h-4 accent-[#064E3B] rounded shrink-0"
                          />
                          <span
                            className={`text-sm leading-relaxed ${
                              checked ? 'text-[#064E3B] font-medium' : 'text-[#2D2924]'
                            }`}
                          >
                            {stepText}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] px-4 py-2.5 text-xs">
                    <span className="text-[#645C52]">Prova tamamlama durumu</span>
                    <strong className="font-mono-num text-[#064E3B]">
                      {checkedStepCount} / {practiceSteps.length} adım
                    </strong>
                  </div>

                  {/* Interactive Rehearsal Simulators */}
                  {moduleData.index === 3 && <RehearsalTracker mode="teravih" />}
                  {moduleData.index === 0 && <RehearsalTracker mode="tesbihat" />}
                  {moduleData.index === 5 && <VoiceRecorderPractice key={card.id} />}
                </div>
              )}

              {/* TAB 4: VIDEO / SES */}
              {effectiveTab === 'medya' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#645C52] leading-relaxed">
                    Doğrulanmış ses kayıtları çevrimiçi olarak haricî sunuculardan çalınır. Oynatma sağlanamazsa kaydın bulunduğu orijinal sayfayı açabilirsiniz.
                  </p>

                  {directMedia.map((track) => (
                    <AudioPlayerBox
                      key={track.url}
                      title={track.name}
                      url={track.url}
                      fallback={track.fallback}
                    />
                  ))}

                  {linkMedia.map((track) => (
                    <a
                      key={track.url}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-[#E5DEC9] bg-white p-4 text-sm font-semibold text-[#7A1830] hover:border-[#7A1830] transition-colors"
                    >
                      <span>{track.name}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
              {/* Personal Lesson Notes */}
              <div className="pt-4 border-t border-[#EFE9DA] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`note-${card.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F1C18]"
                  >
                    <NotebookPen className="w-3.5 h-3.5 text-[#064E3B]" aria-hidden="true" />
                    Kişisel Ders Notum
                  </label>
                  <div className="flex items-center gap-3 text-xs text-[#645C52]">
                    <span className="font-mono-num">
                      {(lessonNotes[card.id] || '').trim()
                        ? `${(lessonNotes[card.id] || '').length} karakter · Tarayıcıda kayıtlı`
                        : 'Cihazınızda yerel olarak saklanır'}
                    </span>
                    {(lessonNotes[card.id] || '').length > 0 && (
                      <button
                        type="button"
                        onClick={() => onUpdateNote(card.id, '')}
                        className="inline-flex items-center gap-1 font-semibold text-[#7A1830] hover:underline whitespace-nowrap shrink-0"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                        Temizle
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  id={`note-${card.id}`}
                  rows={3}
                  value={lessonNotes[card.id] || ''}
                  onChange={(e) => onUpdateNote(card.id, e.target.value)}
                  placeholder="Bu ders için makam, durak, mahreç veya cami uygulamasına dair kendi notlarınızı buraya yazabilirsiniz..."
                  className="w-full rounded-xl border border-[#D4CBB4] bg-[#FAF7F0] px-3.5 py-2.5 text-sm text-[#1F1C18] placeholder:text-[#8A7F6E] focus:bg-white focus:outline-none focus:border-[#064E3B] resize-y"
                />
              </div>
            </div>

            {/* Card Footer Navigation */}
            <footer className="border-t border-[#EFE9DA] bg-[#FAF7F0] px-5 py-3.5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeCardIndex === 0}
                onClick={() => {
                  onSelectCard(activeCardIndex - 1);
                  setTab('anlatim');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3.5 py-2 text-xs font-semibold text-[#1F1C18] hover:bg-[#F3EDE0] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Önceki
              </button>

              <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                {moduleData.cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectCard(idx);
                      setTab('anlatim');
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeCardIndex
                        ? 'w-5 bg-[#7A1830]'
                        : isDone(idx)
                        ? 'w-2 bg-[#064E3B]'
                        : 'w-2 bg-[#D4CBB4]'
                    }`}
                    title={cleanTitle(c.t)}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={activeCardIndex === moduleData.cards.length - 1}
                onClick={() => {
                  onSelectCard(activeCardIndex + 1);
                  setTab('anlatim');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
              >
                Sonraki
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </footer>
          </article>
        </section>
      </div>
    </div>
  );
};
