import React, { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { AUDIO_ARCHIVE, MODULES } from '../data/academyData';
import type { AudioArchiveGroup } from '../types/academy';
import { AudioPlayerBox } from './AudioPlayerBox';
import { VoiceRecorderPractice } from './VoiceRecorderPractice';

interface AudioArchiveViewProps {
  onOpenLesson: (moduleIndex: number, cardIndex: number) => void;
}

const GROUPS: Array<'Tümü' | AudioArchiveGroup> = [
  'Tümü',
  'Ezanlar',
  'Kur’an tilavetleri',
  'Müezzinlik ve dualar',
];

export const AudioArchiveView: React.FC<AudioArchiveViewProps> = ({
  onOpenLesson,
}) => {
  const [filter, setFilter] = useState<'Tümü' | AudioArchiveGroup>('Tümü');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return AUDIO_ARCHIVE.filter((item) => {
      const groupMatch = filter === 'Tümü' || item.group === filter;
      const textMatch =
        !q ||
        item.title.toLocaleLowerCase('tr').includes(q) ||
        item.note.toLocaleLowerCase('tr').includes(q) ||
        item.group.toLocaleLowerCase('tr').includes(q);
      return groupMatch && textMatch;
    });
  }, [filter, query]);

  const handleOpenLesson = (moduleIdx?: number, findText?: string) => {
    if (typeof moduleIdx !== 'number') return;
    const mod = MODULES[moduleIdx];
    if (!mod) return;
    const idx = findText
      ? mod.cards.findIndex((c) =>
          c.t.toLocaleLowerCase('tr').includes(findText.toLocaleLowerCase('tr'))
        )
      : 0;
    onOpenLesson(moduleIdx, idx >= 0 ? idx : 0);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1C18]">
          Hazır Ses ve Kıraat Arşivi
        </h2>
        <p className="mt-1.5 text-sm text-[#575047] leading-relaxed">
          Beş vakit ezan makamları (Sabâ, Uşşak, Hicaz, Segâh, Rast), kamet, salâ, gülbank ve Kur’an duaları doğrudan oynatılabilir ses oynatıcılarıyla hazırdır.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[#E5DEC9] bg-[#F3EDE0]">
          {GROUPS.map((g) => {
            const active = filter === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#1F1C18] shadow-xs'
                    : 'text-[#575047] hover:text-[#1F1C18]'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 text-[#857A69] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kayıt veya makam ara..."
            aria-label="Ses arşivinde ara"
            className="w-full rounded-xl border border-[#D4CBB4] bg-white pl-9 pr-3 py-2 text-sm text-[#1F1C18] placeholder:text-[#8A7F6E] focus:outline-none focus:border-[#064E3B]"
          />
        </div>
      </div>

      {/* Voice self-practice */}
      <VoiceRecorderPractice />

      {/* Archive Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E5DEC9] bg-white p-8 text-center text-sm text-[#645C52]">
          Aramanızla eşleşen ses kaydı veya eğitim başlığı bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            if (item.kind === 'audio' && item.url) {
              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-[#064E3B]">
                      {item.group}
                    </span>
                    {typeof item.module === 'number' && (
                      <button
                        type="button"
                        onClick={() => handleOpenLesson(item.module, item.find)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A1830] hover:underline"
                      >
                        Dersi aç
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <AudioPlayerBox
                    title={item.title}
                    url={item.url}
                    fallback={item.fallback}
                    note={item.note}
                  />
                </div>
              );
            }

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="text-xs font-semibold text-[#7A1830] px-1">
                  {item.group}
                </div>
                <article className="rounded-xl border border-[#E5DEC9] bg-white p-4 flex flex-col justify-between gap-4 h-[calc(100%-1.35rem)]">
                  <div>
                    <h4 className="font-semibold text-[#1F1C18] text-[15px]">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#645C52] leading-relaxed">
                      {item.note}
                    </p>
                  </div>

                  <div>
                    {item.kind === 'link' && item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-[#FAF7F0] px-3.5 py-2 text-xs font-semibold text-[#7A1830] hover:bg-[#EFE9DA] transition-colors whitespace-nowrap shrink-0"
                      >
                        İlgili kaynağı aç
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenLesson(item.module, item.find)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-[#FAF7F0] px-3.5 py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#EFE9DA] transition-colors whitespace-nowrap shrink-0"
                      >
                        Eğitim kartelasını aç
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
