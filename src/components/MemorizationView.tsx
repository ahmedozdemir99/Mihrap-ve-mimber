import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Eye, EyeOff, ExternalLink, Search } from 'lucide-react';
import { MEMORIZATION_SURAHS } from '../data/memorization';
import { MemorizationJourney } from './MemorizationJourney';
import { ReminderSettings } from './ReminderSettings';
import { firstIncompleteStage, JOURNEY_FINAL_ID, JOURNEY_REVIEW_LESSONS, JOURNEY_STAGES, journeyStageProgress, reviewCompletionId } from '../data/memorizationJourney';
import { PRAYER_GROUPS, PRAYER_LESSONS } from '../data/memorizationPrayers';

type Props = {
  completed: string[];
  onToggleComplete: (id: string) => void;
};

const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#D4CBB4] px-3 py-2 text-sm font-semibold text-[#064E3B] hover:bg-[#F3EDE0] disabled:opacity-40';
const labelClass = 'block text-xs font-semibold text-[#575047]';
const selectClass = 'mt-1.5 block w-full rounded-lg border border-[#D4CBB4] bg-white px-3 py-2.5 text-sm text-[#1F1C18]';

type Category = 'surahs' | typeof PRAYER_GROUPS[number]['id'];

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{Mark}/gu, '').replace(/ı/g, 'i');
}

const studyIndex = [
  ...MEMORIZATION_SURAHS.flatMap((surah, index) => surah.lessons.map((lesson, part) => ({
    id: lesson.id,
    title: surah.name,
    detail: surah.lessons.length > 1 ? `${lesson.first}–${lesson.last}. âyetler` : 'Sûre',
    category: 'surahs' as const,
    index,
    part,
    searchable: normalizeSearch(`${surah.name} sûresi`),
  }))),
  ...PRAYER_GROUPS.flatMap((group) => PRAYER_LESSONS.filter((prayer) => prayer.group === group.id).map((prayer, index) => ({
    id: prayer.id,
    title: prayer.title,
    detail: group.label,
    category: group.id,
    index,
    part: 0,
    searchable: normalizeSearch(`${group.label} ${prayer.title} ${prayer.meaning} ${prayer.source}`),
  }))),
];

const studyById = new Map(studyIndex.map((entry) => [entry.id, entry]));
const titleFor = (id: string) => {
  const entry = studyById.get(id);
  if (!entry) return '';
  return entry.category === 'surahs' && entry.detail !== 'Sûre'
    ? `${entry.title} · ${entry.detail}` : entry.title;
};

type Panel = 'journey' | 'catalog' | 'lesson';

export function MemorizationView({ completed, onToggleComplete }: Props) {
  const [group, setGroup] = useState<Category>('surahs');
  const [surahIndex, setSurahIndex] = useState(0);
  const [part, setPart] = useState(0);
  const [prayerIndex, setPrayerIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [panel, setPanel] = useState<Panel>('journey');
  const [finalReview, setFinalReview] = useState(false);
  const fromJourney = panel === 'lesson';
  const [query, setQuery] = useState('');
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);

  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const findingLessons = terms.length > 0 || onlyUnfinished;
  const matches = findingLessons ? studyIndex.filter((entry) =>
    (!onlyUnfinished || !completed.includes(entry.id)) &&
    terms.every((term) => entry.searchable.includes(term))
  ) : [];

  const activeStage = firstIncompleteStage(journeyStageProgress(completed));
  const reviewed = JOURNEY_REVIEW_LESSONS.filter((lesson) => completed.includes(reviewCompletionId(lesson)));
  const completedLessonCount = studyIndex.filter((entry) => completed.includes(entry.id)).length;

  function openResult(entry: typeof studyIndex[number], practice = false) {
    setGroup(entry.category);
    if (entry.category === 'surahs') {
      setSurahIndex(entry.index);
      setPart(entry.part);
    } else {
      setPrayerIndex(entry.index);
    }
    setHidden(practice);
    setRevealed([]);
    requestAnimationFrame(() => document.getElementById('memorization-lesson-title')?.focus());
  }

  function openJourneyLesson(id: string, practice = false) {
    const entry = studyById.get(id);
    if (!entry) return;
    setFinalReview(practice);
    setPanel('lesson');
    openResult(entry, practice);
  }

  const surah = MEMORIZATION_SURAHS[surahIndex];
  const surahLesson = surah.lessons[part];
  const prayers = PRAYER_LESSONS.filter((prayer) => prayer.group === group);
  const prayer = prayers[prayerIndex];
  const isSurah = group === 'surahs';
  const id = isSurah ? surahLesson.id : prayer.id;
  const title = isSurah ? surah.name : prayer.title;
  const lines: { text: string; number?: number }[][] = isSurah
    ? surahLesson.lines
    : prayer.lines.map((text) => [{ text }]);
  const done = completed.includes(id);
  const lessonStageIndex = JOURNEY_STAGES.findIndex((stage) => stage.lessons.includes(id));
  const locked = activeStage >= 0 && lessonStageIndex > activeStage;
  const routeLessons = JOURNEY_STAGES[lessonStageIndex]?.lessons ?? [];
  const routeLessonIndex = routeLessons.indexOf(id);
  const canGoBack = fromJourney ? routeLessonIndex > 0
    : isSurah ? part > 0 || surahIndex > 0 : prayerIndex > 0;
  const canGoNext = fromJourney ? routeLessonIndex < routeLessons.length - 1
    : isSurah ? part < surah.lessons.length - 1 || surahIndex < MEMORIZATION_SURAHS.length - 1
    : prayerIndex < prayers.length - 1;

  function clearPractice() {
    setHidden(false);
    setRevealed([]);
  }

  function moveLesson(direction: -1 | 1) {
    if (fromJourney) {
      openJourneyLesson(routeLessons[routeLessonIndex + direction]);
      return;
    }
    if (!isSurah) {
      setPrayerIndex(prayerIndex + direction);
    } else {
      const nextPart = part + direction;
      if (nextPart >= 0 && nextPart < surah.lessons.length) {
        setPart(nextPart);
      } else {
        const nextSurah = surahIndex + direction;
        setSurahIndex(nextSurah);
        setPart(direction === 1 ? 0 : MEMORIZATION_SURAHS[nextSurah].lessons.length - 1);
      }
    }
    clearPractice();
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-2xl bg-[#064E3B] px-5 py-6 text-white sm:px-7">
        <div className="flex items-center gap-2">
          <BookOpen size={20} aria-hidden="true" />
          <h1 className="text-3xl font-bold sm:text-4xl">Ezber Dersleri</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#E3F2E9]">
          Bir ders seçin. Metni okuyun, gizleyip ezberden söyleyin, sonra satır satır kontrol edin.
        </p>
        <p className="mt-3 text-xs font-semibold text-[#F8E6B9]">
          {completedLessonCount} / {studyIndex.length} ders tamamlandı
        </p>
      </header>

      {panel === 'journey' && <ReminderSettings />}

      <nav aria-label="Ezber çalışma görünümü" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={panel !== 'catalog'} className={secondaryButton + ' aria-pressed:bg-[#EEF7F3]'}
          onClick={() => setPanel('journey')}>{fromJourney ? 'Rotaya dön' : 'Ezber rotası'}</button>
        <button type="button" aria-pressed={panel === 'catalog'}
          className={secondaryButton + ' aria-pressed:bg-[#EEF7F3]'} onClick={() => {
            setFinalReview(false);
            setPanel('catalog');
            clearPractice();
          }}>Ders arşivi</button>
      </nav>

      {panel === 'journey' && (
        <MemorizationJourney completed={completed} reviewed={reviewed} titleFor={titleFor}
          onOpenLesson={openJourneyLesson} onFinish={() => onToggleComplete(JOURNEY_FINAL_ID)} />
      )}

      {panel === 'catalog' && (
        <div className="grid gap-3 rounded-2xl border border-[#E5DEC9] bg-white p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className={`${labelClass} flex-1`}>
                Ezber derslerinde ara
                <span className="relative mt-1.5 block">
                  <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#645C52]" />
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                    className="block min-h-11 w-full rounded-lg border border-[#D4CBB4] px-3 py-2 pl-9 text-sm"
                    placeholder="Örn. hatim, tesbih, Kehf" />
                </span>
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm text-[#575047]">
                <input type="checkbox" checked={onlyUnfinished} onChange={(event) => setOnlyUnfinished(event.target.checked)}
                  className="size-4 accent-[#064E3B]" />
                Sadece tamamlanmamış dersler
              </label>
            </div>
            {findingLessons && (
              <div className="mt-3 border-t border-[#E5DEC9] pt-3">
                <p role="status" className="text-xs text-[#575047]">
                  {matches.length ? `${matches.length} ders bulundu.` : 'Bu arama ve filtreyle eşleşen ders bulunamadı.'}
                </p>
                {matches.length > 0 && (
                  <ul className="mt-2 max-h-52 overflow-auto rounded-lg border border-[#E5DEC9]">
                    {matches.map((entry) => (
                      <li key={entry.id} className="border-b border-[#E5DEC9] last:border-b-0">
                        <button type="button" aria-current={id === entry.id ? 'true' : undefined}
                          onClick={() => openResult(entry)}
                          className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-2.5 text-left text-sm hover:bg-[#FAF7F0] aria-current:bg-[#EEF7F3]">
                          <span className="font-semibold text-[#064E3B]">{entry.title}</span>
                          <span className="text-xs text-[#575047]">{entry.detail}{completed.includes(entry.id) && ' · Tamamlandı'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <label className={labelClass}>
            Kategori
            <select className={selectClass} value={group} onChange={(event) => {
              setGroup(event.target.value as typeof group);
              setPrayerIndex(0);
              clearPractice();
            }}>
              <option value="surahs">Sûreler</option>
              {PRAYER_GROUPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className={labelClass}>
            {isSurah ? 'Sûre' : 'Dua veya zikir'}
            <select className={selectClass} value={isSurah ? surahIndex : prayerIndex} onChange={(event) => {
              const index = Number(event.target.value);
              if (isSurah) {
                setSurahIndex(index);
                setPart(0);
              } else {
                setPrayerIndex(index);
              }
              clearPractice();
            }}>
              {isSurah ? MEMORIZATION_SURAHS.map((item, index) => (
                <option key={item.number} value={index}>{item.name} · {item.verseCount} âyet</option>
              )) : prayers.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
            </select>
          </label>
          {isSurah && surah.lessons.length > 1 && (
            <label className={labelClass}>
              Ders bölümü
              <select className={selectClass} value={part} onChange={(event) => {
                setPart(Number(event.target.value));
                clearPractice();
              }}>
                {surah.lessons.map((item, index) => (
                  <option key={item.id} value={index}>Bölüm {index + 1} · {item.first}–{item.last}. âyetler</option>
                ))}
              </select>
            </label>
          )}
        </div>

      )}

      {panel !== 'journey' && (
        <article className="rounded-2xl border border-[#E5DEC9] bg-white p-4 sm:p-6">
          {fromJourney && (
            <p className="mb-2 text-xs font-semibold text-[#7A1830]">
              {finalReview ? 'Final tekrarı' : JOURNEY_STAGES[lessonStageIndex]?.title}
            </p>
          )}
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="memorization-lesson-title" tabIndex={-1} className="scroll-mt-20 text-2xl font-bold text-[#1F1C18] sm:text-3xl">{title}</h2>
              {isSurah && (
                <p className="mt-1 text-sm text-[#575047]">
                  {surahLesson.first}–{surahLesson.last}. âyetler · {lines.length} çalışma satırı
                </p>
              )}
            </div>
            <button type="button" aria-pressed={hidden} className={secondaryButton} onClick={() => {
              setHidden(!hidden);
              setRevealed([]);
            }}>
              {hidden ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
              {hidden ? 'Metni göster' : 'Ezberden dene'}
            </button>
          </header>
          <ol className="mt-4 divide-y divide-[#E5DEC9] overflow-hidden rounded-xl border border-[#E5DEC9] bg-[#FAF7F0]">
            {lines.map((line, index) => {
              const isRevealed = !hidden || revealed.includes(index);
              return (
                <li key={index} className="px-3 py-2.5 sm:px-5">
                  {isRevealed ? (
                    <p lang="ar" dir="rtl" className="min-h-11 font-arabic text-[1.75rem] leading-[2] text-[#1F1C18] sm:text-[2rem]">
                      {line.map((verse, verseIndex) => (
                        <span key={verseIndex}>
                          {verse.text}
                          {verse.number !== undefined && <bdi className="ms-1 text-sm text-[#7A1830]">﴿{verse.number.toLocaleString('ar-EG')}﴾</bdi>}
                          {verseIndex < line.length - 1 && ' '}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <button type="button" className="flex min-h-11 w-full items-center gap-2 text-left text-sm font-semibold text-[#064E3B]" onClick={() => {
                      setRevealed((previous) => [...previous, index]);
                    }}>
                      <Eye size={16} aria-hidden="true" />
                      {index + 1}. satırı göster
                    </button>
                  )}
                </li>
              );
            })}
          </ol>

          {!isSurah && (
            <details className="mt-4 rounded-lg bg-[#FAF7F0] px-3 py-2 text-sm text-[#575047]" key={id}>
              <summary className="cursor-pointer font-semibold text-[#064E3B]">Türkçe anlamı</summary>
              <p className="mt-2 leading-relaxed">{prayer.meaning}</p>
            </details>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {finalReview ? (
              <button type="button" onClick={() => {
                const reviewId = reviewCompletionId(id);
                if (!completed.includes(reviewId)) onToggleComplete(reviewId);
                setPanel('journey');
              }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white">
                <Check size={16} aria-hidden="true" /> Final tekrarını işaretle
              </button>
            ) : (
              <div>
                <button type="button" aria-pressed={done} disabled={locked} onClick={() => {
                  onToggleComplete(id);
                  if (fromJourney && !done) setPanel('journey');
                }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#053D2E] disabled:opacity-50">
                  <Check size={16} aria-hidden="true" />
                  {done ? 'Tamamlandı' : 'Dersi tamamla'}
                </button>
                {locked && <p className="mt-1 text-xs text-[#575047]">İlerlemeye işlemek için “{JOURNEY_STAGES[lessonStageIndex].title}” etabını aç.</p>}
              </div>
            )}
            {!finalReview && <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!canGoBack} onClick={() => moveLesson(-1)} className={secondaryButton}>
                <ArrowLeft size={16} aria-hidden="true" /> Önceki
              </button>
              <button type="button" disabled={!canGoNext} onClick={() => moveLesson(1)} className={secondaryButton}>
                Sonraki <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#575047]">
            <a href={isSurah ? `https://quran.com/${surah.number}/${surahLesson.first}` : prayer.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#064E3B] underline underline-offset-2">
              {isSurah ? 'Âyeti aç ve dinle' : prayer.source} <ExternalLink size={12} aria-hidden="true" />
            </a>
            {(isSurah || group === 'quran' || group === 'prophets') && (
              <> · Arapça metin © 2007–2026 <a href="https://tanzil.net/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Tanzil Project</a> (CC BY 3.0)</>
            )}
          </p>
        </article>
      )}
    </section>
  );
}
