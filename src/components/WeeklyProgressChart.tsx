import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DailyActivityLog } from '../types/academy';

type MetricFilter = 'all' | 'lessons' | 'steps' | 'quizCorrect';

interface WeeklyProgressChartProps {
  dailyActivity: DailyActivityLog;
  totalCompletedLessons: number;
  totalLessons: number;
}

type DayPoint = {
  iso: string;
  dayShort: string;
  dateLabel: string;
  lessons: number;
  steps: number;
  quizCorrect: number;
  total: number;
};

const TURKISH_WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const TURKISH_MONTHS = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  dailyActivity,
  totalCompletedLessons,
  totalLessons,
}) => {
  const [metric, setMetric] = useState<MetricFilter>('all');
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(640);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(280, Math.floor(el.clientWidth));
      setContainerWidth(next);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const daysData: DayPoint[] = useMemo(() => {
    const today = new Date();
    const result: DayPoint[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const iso = toLocalDateKey(d);
      const entry = dailyActivity[iso];
      const lessons = entry?.lessons ?? 0;
      const steps = entry?.steps ?? 0;
      const quizCorrect = entry?.quizCorrect ?? 0;
      result.push({
        iso,
        dayShort: offset === 0 ? 'Bugün' : TURKISH_WEEKDAYS[d.getDay()],
        dateLabel: `${d.getDate()} ${TURKISH_MONTHS[d.getMonth()]}`,
        lessons,
        steps,
        quizCorrect,
        total: lessons + steps + quizCorrect,
      });
    }
    return result;
  }, [dailyActivity]);

  const weeklyTotals = useMemo(() => {
    return daysData.reduce(
      (acc, d) => {
        acc.lessons += d.lessons;
        acc.steps += d.steps;
        acc.quizCorrect += d.quizCorrect;
        acc.total += d.total;
        if (d.total > 0) acc.activeDays += 1;
        return acc;
      },
      { lessons: 0, steps: 0, quizCorrect: 0, total: 0, activeDays: 0 }
    );
  }, [daysData]);

  const margin = { top: 18, right: 16, bottom: 42, left: 34 };
  const height = 240;
  const innerWidth = Math.max(200, containerWidth - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;

  const getValue = (d: DayPoint) => {
    if (metric === 'lessons') return d.lessons;
    if (metric === 'steps') return d.steps;
    if (metric === 'quizCorrect') return d.quizCorrect;
    return d.total;
  };

  const maxVal = useMemo(() => {
    const m = d3.max(daysData, (d) => getValue(d)) ?? 0;
    return Math.max(4, Math.ceil(m * 1.15));
  }, [daysData, metric]);

  const xScale = useMemo(
    () =>
      d3
        .scaleBand<string>()
        .domain(daysData.map((d) => d.iso))
        .range([0, innerWidth])
        .padding(0.36),
    [daysData, innerWidth]
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, maxVal]).nice(4).range([innerHeight, 0]),
    [maxVal, innerHeight]
  );

  const yTicks = useMemo(() => {
    return yScale.ticks(4).filter((v) => Number.isInteger(v));
  }, [yScale]);

  const hoveredDay = daysData.find((d) => d.iso === hoveredIso) ?? null;

  return (
    <section
      className="rounded-2xl border border-[#E5DEC9] bg-white p-5 sm:p-6 space-y-5"
      aria-labelledby="weekly-progress-heading"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#7A1830]">
            Son 7 Günlük Çalışma Özeti
          </div>
          <h2
            id="weekly-progress-heading"
            className="mt-0.5 text-xl sm:text-2xl font-bold text-[#1F1C18]"
          >
            Haftalık Eğitim İlerlemesi
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#575047]">
            Tamamlanan dersler, işaretlenen uygulama adımları ve Bilgi Testi doğru cevaplarının günlük dağılımı.
          </p>
        </div>

        {/* Metric Filter Buttons */}
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#E5DEC9] bg-[#F3EDE0] p-1 self-start lg:self-auto"
          role="group"
          aria-label="Grafik metrik filtresi"
        >
          {(
            [
              { id: 'all', label: 'Tümü' },
              { id: 'lessons', label: 'Dersler' },
              { id: 'steps', label: 'Uygulama' },
              { id: 'quizCorrect', label: 'Test' },
            ] as { id: MetricFilter; label: string }[]
          ).map((item) => {
            const active = metric === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMetric(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#1F1C18] shadow-xs'
                    : 'text-[#575047] hover:text-[#1F1C18]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] px-3.5 py-3">
          <div className="text-xs text-[#645C52]">7 günlük ders</div>
          <div className="mt-0.5 text-lg font-bold text-[#064E3B] font-mono-num">
            {weeklyTotals.lessons}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] px-3.5 py-3">
          <div className="text-xs text-[#645C52]">Uygulama adımı</div>
          <div className="mt-0.5 text-lg font-bold text-[#8C6520] font-mono-num">
            {weeklyTotals.steps}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] px-3.5 py-3">
          <div className="text-xs text-[#645C52]">Test doğrusu</div>
          <div className="mt-0.5 text-lg font-bold text-[#7A1830] font-mono-num">
            {weeklyTotals.quizCorrect}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] px-3.5 py-3">
          <div className="text-xs text-[#645C52]">Aktif gün / Toplam ders</div>
          <div className="mt-0.5 text-lg font-bold text-[#1F1C18] font-mono-num">
            {weeklyTotals.activeDays}/7 · {totalCompletedLessons}/{totalLessons}
          </div>
        </div>
      </div>

      {/* D3.js SVG Bar Chart */}
      <div ref={wrapperRef} className="relative w-full">
        <svg
          width={containerWidth}
          height={height}
          viewBox={`0 0 ${containerWidth} ${height}`}
          role="img"
          aria-label="Son 7 günlük eğitim ilerleme çubuğu grafiği"
          className="block w-full overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal grid lines & Y-axis labels */}
            {yTicks.map((tick) => {
              const y = yScale(tick);
              return (
                <g key={tick} transform={`translate(0, ${y})`}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={0}
                    y2={0}
                    stroke="#EFE9DA"
                    strokeDasharray={tick === 0 ? undefined : '3,3'}
                  />
                  <text
                    x={-8}
                    y={4}
                    textAnchor="end"
                    className="fill-[#645C52] text-[11px] font-mono-num"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {daysData.map((d) => {
              const bandX = xScale(d.iso) ?? 0;
              const bandW = Math.min(48, xScale.bandwidth());
              const x = bandX + (xScale.bandwidth() - bandW) / 2;
              const val = getValue(d);
              const isHovered = hoveredIso === d.iso;

              // Segments for stacked view or single view
              const segments =
                metric === 'all'
                  ? [
                      { key: 'lessons', count: d.lessons, color: '#064E3B' },
                      { key: 'steps', count: d.steps, color: '#9F752A' },
                      { key: 'quizCorrect', count: d.quizCorrect, color: '#7A1830' },
                    ]
                  : metric === 'lessons'
                  ? [{ key: 'lessons', count: d.lessons, color: '#064E3B' }]
                  : metric === 'steps'
                  ? [{ key: 'steps', count: d.steps, color: '#9F752A' }]
                  : [{ key: 'quizCorrect', count: d.quizCorrect, color: '#7A1830' }];

              let cumulative = 0;

              return (
                <g
                  key={d.iso}
                  onMouseEnter={() => setHoveredIso(d.iso)}
                  onMouseLeave={() => setHoveredIso(null)}
                  onFocus={() => setHoveredIso(d.iso)}
                  onBlur={() => setHoveredIso(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.dateLabel} (${d.dayShort}): ${val} etkinlik`}
                  className="cursor-pointer focus:outline-none"
                >
                  {/* Full column hover target */}
                  <rect
                    x={bandX}
                    y={0}
                    width={xScale.bandwidth()}
                    height={innerHeight}
                    rx={6}
                    fill={isHovered ? '#FAF7F0' : 'transparent'}
                  />

                  {/* Baseline stub when 0 so every day feels grounded */}
                  {val === 0 ? (
                    <rect
                      x={x}
                      y={innerHeight - 3}
                      width={bandW}
                      height={3}
                      rx={1.5}
                      fill="#E5DEC9"
                    />
                  ) : (
                    segments.map((seg) => {
                      if (seg.count <= 0) return null;
                      const yBottom = yScale(cumulative);
                      const yTop = yScale(cumulative + seg.count);
                      const segHeight = Math.max(2, yBottom - yTop);
                      cumulative += seg.count;
                      return (
                        <rect
                          key={seg.key}
                          x={x}
                          y={yTop}
                          width={bandW}
                          height={segHeight}
                          rx={3}
                          fill={seg.color}
                          opacity={hoveredIso && !isHovered ? 0.55 : 1}
                          className="transition-opacity duration-150"
                        />
                      );
                    })
                  )}

                  {/* Value label above bar if > 0 */}
                  {val > 0 && (
                    <text
                      x={x + bandW / 2}
                      y={yScale(val) - 6}
                      textAnchor="middle"
                      className="fill-[#1F1C18] text-[11px] font-semibold font-mono-num"
                    >
                      {val}
                    </text>
                  )}

                  {/* X-axis day & date labels */}
                  <text
                    x={bandX + xScale.bandwidth() / 2}
                    y={innerHeight + 17}
                    textAnchor="middle"
                    className={`text-[11px] font-semibold ${
                      d.dayShort === 'Bugün' ? 'fill-[#7A1830]' : 'fill-[#1F1C18]'
                    }`}
                  >
                    {d.dayShort}
                  </text>
                  <text
                    x={bandX + xScale.bandwidth() / 2}
                    y={innerHeight + 31}
                    textAnchor="middle"
                    className="fill-[#645C52] text-[10px] font-mono-num"
                  >
                    {d.dateLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend & Hover Detail Row */}
        <div className="mt-2 pt-3 border-t border-[#EFE9DA] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[#575047]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#064E3B]" aria-hidden="true" />
              Tamamlanan ders
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#9F752A]" aria-hidden="true" />
              Uygulama adımı
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#7A1830]" aria-hidden="true" />
              Test doğrusu
            </span>
          </div>

          <div className="text-[#1F1C18] font-mono-num">
            {hoveredDay ? (
              <span>
                <strong>{hoveredDay.dateLabel}:</strong> {hoveredDay.lessons} ders ·{' '}
                {hoveredDay.steps} adım · {hoveredDay.quizCorrect} test doğrusu
              </span>
            ) : weeklyTotals.total === 0 ? (
              <span className="text-[#645C52] font-sans">
                Ders tamamladıkça veya test çözdükçe haftalık grafik otomatik güncellenir.
              </span>
            ) : (
              <span className="text-[#645C52] font-sans">
                Ayrıntı görmek için gün çubuğunun üzerine gelin.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
