import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface RehearsalTrackerProps {
  mode: 'teravih' | 'tesbihat';
}

const TERAVIH_SURAS = [
  'Fîl (105)',
  'Kureyş (106)',
  'Mâûn (107)',
  'Kevser (108)',
  'Kâfirûn (109)',
  'Nasr (110)',
  'Tebbet (111)',
  'İhlâs (112)',
  'Felak (113)',
  'Nâs (114)',
  'Fîl (105)',
  'Kureyş (106)',
  'Mâûn (107)',
  'Kevser (108)',
  'Kâfirûn (109)',
  'Nasr (110)',
  'Tebbet (111)',
  'İhlâs (112)',
  'Felak (113)',
  'Nâs (114)',
];

export const RehearsalTracker: React.FC<RehearsalTrackerProps> = ({ mode }) => {
  const [rakat, setRakat] = useState(0);
  const [tesbihIndex, setTesbihIndex] = useState<0 | 1 | 2>(0);
  const [tesbihCount, setTesbihCount] = useState(0);

  if (mode === 'teravih') {
    const isRest = rakat > 0 && rakat % 4 === 0 && rakat <= 20;
    const isDone = rakat === 20;
    const nextSura = rakat < 20 ? TERAVIH_SURAS[rakat] : 'Tamamlandı (Vitre geçiş)';

    return (
      <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-semibold text-[#1F1C18] text-sm">
              Canlı teravih rekât ve zamm-ı sûre provası
            </h4>
            <p className="text-xs text-[#645C52]">
              Her rekâtı adım adım takip ederek selam ve 4 rekâtta bir dinlenme sırasını pekiştirin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRakat(0)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3 py-1.5 text-xs font-semibold text-[#645C52] hover:text-[#1F1C18] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Sıfırla
          </button>
        </div>

        <div className="mt-4 grid grid-cols-10 gap-1.5">
          {Array.from({ length: 20 }, (_, i) => {
            const num = i + 1;
            const active = num <= rakat;
            const selamPoint = num % 2 === 0;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setRakat(num)}
                className={`h-9 rounded-lg border text-xs font-mono-num font-semibold transition-colors ${
                  active
                    ? 'bg-[#064E3B] border-[#064E3B] text-white'
                    : selamPoint
                    ? 'bg-[#F3ECE0] border-[#D4CBB4] text-[#7A1830] hover:border-[#7A1830]'
                    : 'bg-white border-[#E5DEC9] text-[#4E473E] hover:border-[#064E3B]'
                }`}
                title={`${num}. rekât — ${TERAVIH_SURAS[i]}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5DEC9]">
          <div className="text-xs text-[#4E473E] space-y-1">
            <div>
              Mevcut durum:{' '}
              <strong className="font-mono-num text-[#1F1C18]">{rakat} / 20 rekât</strong>
              {rakat > 0 && rakat % 2 === 0 && !isDone && ' · Selam verildi'}
              {isRest && !isDone && ' · 4 rekât sonu dinlenme / salavat arası'}
              {isDone && ' · 20 rekât tamamlandı, 3 rekât vitre geçilebilir'}
            </div>
            <div>
              Sıradaki örnek sûre:{' '}
              <strong className="text-[#064E3B]">{nextSura}</strong>
            </div>
          </div>

          <button
            type="button"
            disabled={isDone}
            onClick={() => setRakat((r) => Math.min(20, r + 1))}
            className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            {isDone ? 'Tamamlandı' : `${rakat + 1}. rekâtı işaretle`}
          </button>
        </div>
      </div>
    );
  }

  const tesbihLabels = [
    { ar: 'سُبْحَانَ اللَّهِ', tr: 'Sübhânallah' },
    { ar: 'الْحَمْدُ لِلَّهِ', tr: 'Elhamdülillah' },
    { ar: 'اللَّهُ أَكْبَرُ', tr: 'Allahü ekber' },
  ];

  const handleTesbihStep = () => {
    if (tesbihCount < 32) {
      setTesbihCount((c) => c + 1);
    } else if (tesbihIndex < 2) {
      setTesbihIndex((idx) => (idx + 1) as 0 | 1 | 2);
      setTesbihCount(0);
    } else {
      setTesbihCount(33);
    }
  };

  const resetTesbih = () => {
    setTesbihIndex(0);
    setTesbihCount(0);
  };

  const finishedTesbihat = tesbihIndex === 2 && tesbihCount === 33;

  return (
    <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-[#1F1C18] text-sm">
            Namaz sonrası 33’lü tesbihat provası
          </h4>
          <p className="text-xs text-[#645C52]">
            Müezzinlik yönlendirmesi sırasında 33’lü zikir sırasını pratik edin.
          </p>
        </div>
        <button
          type="button"
          onClick={resetTesbih}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3 py-1.5 text-xs font-semibold text-[#645C52] hover:text-[#1F1C18] transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Sıfırla
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {tesbihLabels.map((item, idx) => {
          const isCurrent = idx === tesbihIndex && !finishedTesbihat;
          const isPast = idx < tesbihIndex || finishedTesbihat;
          return (
            <button
              key={item.tr}
              type="button"
              onClick={() => {
                setTesbihIndex(idx as 0 | 1 | 2);
                setTesbihCount(0);
              }}
              className={`rounded-lg border p-2.5 text-center transition-colors ${
                isCurrent
                  ? 'border-[#064E3B] bg-white text-[#064E3B]'
                  : isPast
                  ? 'border-[#B8D4C9] bg-[#EEF7F3] text-[#064E3B]'
                  : 'border-[#E5DEC9] bg-white text-[#645C52]'
              }`}
            >
              <div className="font-arabic text-lg leading-normal">{item.ar}</div>
              <div className="text-xs font-semibold mt-0.5">{item.tr}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-[#E5DEC9]">
        <div className="text-xs text-[#4E473E]">
          {finishedTesbihat ? (
            <strong className="text-[#064E3B]">
              99 tesbihat tamamlandı — Tehlil ve dua aşamasına geçilebilir.
            </strong>
          ) : (
            <span>
              Aktif zikir: <strong>{tesbihLabels[tesbihIndex].tr}</strong>{' '}
              <span className="font-mono-num">({tesbihCount} / 33)</span>
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={finishedTesbihat}
          onClick={handleTesbihStep}
          className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 font-mono-num"
        >
          {finishedTesbihat ? 'Tamamlandı' : `+1 (${tesbihCount + 1}/33)`}
        </button>
      </div>
    </div>
  );
};
