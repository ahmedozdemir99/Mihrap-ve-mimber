import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { KNOWLEDGE_TESTS } from '../data/knowledgeTests';

interface QuizViewProps {
  onQuizAnswer?: (isCorrect: boolean) => void;
  onQuizComplete?: (result: {
    testId: string;
    score: number;
    total: number;
  }) => void;
  bestScores: Record<string, number>;
}

export const QuizView: React.FC<QuizViewProps> = ({
  onQuizAnswer,
  onQuizComplete,
  bestScores,
}) => {
  const [selectedTest, setSelectedTest] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const test = KNOWLEDGE_TESTS[selectedTest];
  const { questions } = test;
  const completedCount = KNOWLEDGE_TESTS.filter(({ id }) => bestScores[id] !== undefined).length;

  const activeQuestion = questions[currentIndex];
  const score = questions.filter((q) => answers[q.id] === q.correctIndex).length;

  const resetQuiz = (index = selectedTest) => {
    setSelectedTest(index);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setFinished(false);
  };

  const handleChoose = (optIndex: number) => {
    if (selectedOption !== null || !activeQuestion) return;
    setSelectedOption(optIndex);
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIndex }));
    onQuizAnswer?.(optIndex === activeQuestion.correctIndex);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
      onQuizComplete?.({
        testId: test.id,
        score,
        total: questions.length,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1C18]">
            Bilgi Değerlendirme Testi
          </h2>
          <p className="mt-1 text-sm text-[#575047]">
            Namaz, Kur’an ve ibadetler üzerine 10 test. Her testte 10 soru ve açıklamalı cevaplar var.
          </p>
          <p className="mt-2 text-xs font-semibold text-[#064E3B]">{completedCount} / {KNOWLEDGE_TESTS.length} test tamamlandı</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Bilgi testleri">
        {KNOWLEDGE_TESTS.map((item, index) => (
          <button key={item.id} type="button" aria-pressed={index === selectedTest}
            onClick={() => { if (index !== selectedTest) resetQuiz(index); }}
            className="rounded-xl border border-[#D4CBB4] bg-white p-3 text-left text-sm text-[#1F1C18] hover:border-[#064E3B] aria-pressed:border-[#064E3B] aria-pressed:bg-[#EEF7F3]">
            <span className="block font-semibold">{item.id}. {item.title}</span>
            <span className="mt-1 block text-xs text-[#575047]">
              {bestScores[item.id] === undefined ? '10 soru' : `En iyi sonuç ${bestScores[item.id]}/10`}
            </span>
          </button>
        ))}
      </div>

      <a href={test.source} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold text-[#064E3B] underline underline-offset-2">
        Konunun kaynağını incele
      </a>

      {!finished && activeQuestion ? (
        <article className="rounded-2xl border border-[#E5DEC9] bg-white overflow-hidden max-w-3xl">
          <header className="border-b border-[#EFE9DA] bg-[#FAF7F0] px-5 py-3.5 flex items-center justify-between gap-4 text-xs text-[#645C52]">
            <span>{test.title}</span>
            <span className="font-mono-num font-semibold text-[#1F1C18]">
              Soru {currentIndex + 1} / {questions.length} · Doğru: {score}
            </span>
          </header>

          <div className="p-5 sm:p-6 space-y-5">
            <h3 className="text-lg sm:text-xl font-bold text-[#1F1C18] leading-snug">
              {activeQuestion.question}
            </h3>

            <div className="space-y-2.5">
              {activeQuestion.options.map((opt, idx) => {
                const isRevealed = selectedOption !== null;
                const isCorrect = idx === activeQuestion.correctIndex;
                const isChosen = idx === selectedOption;

                let stateClasses =
                  'border-[#E5DEC9] bg-white text-[#1F1C18] hover:border-[#064E3B] hover:bg-[#FAF7F0]';
                if (isRevealed) {
                  if (isCorrect) {
                    stateClasses = 'border-[#064E3B] bg-[#EEF7F3] text-[#064E3B] font-semibold';
                  } else if (isChosen) {
                    stateClasses = 'border-[#B91C1C] bg-[#FDF2F2] text-[#7A1830]';
                  } else {
                    stateClasses = 'border-[#EFE9DA] bg-[#FAF7F0] text-[#8A7F6E]';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isRevealed}
                    onClick={() => handleChoose(idx)}
                    className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm flex items-center justify-between gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] ${stateClasses}`}
                  >
                    <span>{opt}</span>
                    {isRevealed && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B] shrink-0">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Doğru
                      </span>
                    )}
                    {isRevealed && isChosen && !isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1830] shrink-0">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        Yanlış
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div role="status" className="rounded-xl border border-[#E5DEC9] bg-[#FBF6EA] p-4 text-sm text-[#3F3629] leading-relaxed">
                <strong className="text-[#1F1C18]">Açıklama: </strong>
                {activeQuestion.explanation}
              </div>
            )}
          </div>

          <footer className="border-t border-[#EFE9DA] bg-[#FAF7F0] px-5 py-3.5 flex items-center justify-between gap-3">
            <span className="text-xs text-[#645C52]">
              {selectedOption === null
                ? 'Devam etmek için bir seçenek işaretleyin.'
                : selectedOption === activeQuestion.correctIndex
                ? 'Doğru cevap seçildi.'
                : 'Doğru cevap yukarıda işaretlendi.'}
            </span>

            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
            >
              {currentIndex + 1 < questions.length ? 'Sonraki soru' : 'Sonucu gör'}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </footer>
        </article>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-[#E5DEC9] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#064E3B]">Test tamamlandı</div>
              <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-[#1F1C18] font-mono-num">
                {score} / {questions.length} doğru
              </h3>
              <p className="mt-1 text-sm text-[#575047]">
                Başarı oranı: <strong className="font-mono-num">%{Math.round((score / questions.length) * 100)}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => resetQuiz()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Testi tekrar çöz
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-base font-bold text-[#1F1C18]">Soru ve cevap özeti</h4>
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const ok = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#E5DEC9] bg-white p-4 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-[#1F1C18]">
                      <span className="font-mono-num text-[#645C52] mr-1.5">{idx + 1}.</span>
                      {q.question}
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                        ok ? 'text-[#064E3B]' : 'text-[#7A1830]'
                      }`}
                    >
                      {ok ? 'Doğru' : 'Yanlış'}
                    </span>
                  </div>
                  <div className="text-xs text-[#064E3B] font-medium">
                    Doğru cevap: {q.options[q.correctIndex]}
                  </div>
                  <p className="text-xs text-[#575047] leading-relaxed">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
