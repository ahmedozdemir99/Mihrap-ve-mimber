import { ArrowRight, Check, Flag, LockKeyhole, Sparkles } from 'lucide-react';
import {
  firstIncompleteStage,
  JOURNEY_FINAL_ID,
  JOURNEY_REVIEW_LESSONS,
  JOURNEY_STAGES,
  journeyStageProgress,
} from '../data/memorizationJourney';

type Props = {
  completed: string[];
  reviewed: string[];
  titleFor: (id: string) => string;
  onOpenLesson: (id: string, practice?: boolean) => void;
  onFinish: () => void;
};

export function MemorizationJourney({ completed, reviewed, titleFor, onOpenLesson, onFinish }: Props) {
  const counts = journeyStageProgress(completed);
  const activeIndex = firstIncompleteStage(counts);
  const activeStage = JOURNEY_STAGES[activeIndex];
  const next = activeStage?.lessons.find((id) => !completed.includes(id));
  const finished = activeIndex === -1 && completed.includes(JOURNEY_FINAL_ID);
  const finalReady = JOURNEY_REVIEW_LESSONS.every((id) => reviewed.includes(id));

  return (
    <div className="space-y-4">
      {next ? (
        <section className="rounded-2xl border border-[#CCDDC6] bg-[#EEF7F3] p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#064E3B]">Bugünkü çalışma</h2>
            <p className="mt-1 text-sm text-[#34584C]">Günde 5–10 dakika, bir yeni ders veya bir tekrar yeter. Ara verdiğinde kaldığın yerden devam edebilirsin.</p>
            <p className="mt-3 font-semibold text-[#064E3B]">{titleFor(next)}</p>
          </div>
          <button type="button" onClick={() => onOpenLesson(next)}
            className="mt-4 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white sm:mt-0">
            Derse geç <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      ) : (
        <section className="rounded-2xl border border-[#DCC38F] bg-[#FFF8E8] p-5 sm:p-7">
          <Flag size={24} className="text-[#8C6520]" aria-hidden="true" />
          <h2 className="mt-2 text-3xl font-bold text-[#064E3B]">{finished ? 'Ezber rotasını tamamladın' : 'Final · Baştan sona bir tekrar'}</h2>
          {finished ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-[#4A3E2A]">
                Fâtiha ile başladın, hatim duasının son salavatına kadar adım adım ilerledin. Allah öğrendiklerinle amel etmeyi nasip etsin.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DCC38F] bg-white px-4 py-2 text-sm font-semibold text-[#73531B]">
                <Sparkles size={16} aria-hidden="true" /> Ezber Rotası Tamamlama Rozeti
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-[#4A3E2A]">
                Fâtiha’yı, iki kısa tesbihi ve hatim duasının kapanışını ezberden söyle. Her birini ayrı bir günde de tekrar edebilirsin.
              </p>
              <ul className="mt-4 grid gap-2">
                {JOURNEY_REVIEW_LESSONS.map((id) => (
                  <li key={id}>
                    <button type="button" onClick={() => onOpenLesson(id, true)}
                      className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#DCC38F] bg-white px-3 py-2 text-left text-sm font-semibold text-[#064E3B]">
                      {titleFor(id)}
                      {reviewed.includes(id) ? <Check size={16} aria-label="Tekrar edildi" /> : <ArrowRight size={16} aria-hidden="true" />}
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" disabled={!finalReady} onClick={onFinish}
                className="mt-4 min-h-11 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Rotayı tamamla
              </button>
            </>
          )}
        </section>
      )}

      <ol className="grid gap-2 sm:grid-cols-2">
        {JOURNEY_STAGES.map((stage, index) => {
          const done = counts[index] === stage.lessons.length;
          const locked = activeIndex >= 0 && index > activeIndex;
          const id = stage.lessons.find((lessonId) => !completed.includes(lessonId)) ?? stage.lessons[0];
          return (
            <li key={stage.title} className="rounded-xl border border-[#E5DEC9] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-[#1F1C18]">{index + 1}. {stage.title}</h3>
                {locked ? <LockKeyhole size={16} className="shrink-0 text-[#645C52]" aria-hidden="true" /> :
                  done && <Check size={18} className="shrink-0 text-[#064E3B]" aria-hidden="true" />}
              </div>
              <p className="mt-1 text-sm text-[#575047]">{stage.description}</p>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-[#575047]">
                <span>{counts[index]} / {stage.lessons.length} ders</span>
                {locked ? <span>Önceki etap tamamlanınca açılır</span> :
                  <button type="button" onClick={() => onOpenLesson(id)} className="min-h-9 text-[#064E3B] underline underline-offset-2">
                    {done ? 'Tekrar et' : 'Etaba devam et'}
                  </button>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
