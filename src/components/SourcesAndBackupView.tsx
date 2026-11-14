import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  ExternalLink,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { MODULES, OFFICIAL_SOURCES } from '../data/academyData';
import type { DailyActivityLog, ProgressBackup, QuizStats } from '../types/academy';

export const SourcesView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1C18]">
          Güvenilir Resmî Kaynaklar
        </h2>
        <p className="mt-1.5 text-sm text-[#575047] leading-relaxed">
          Derslerde yer alan fıkhî hükümler, hutbe duaları ve ezan-kamet esasları Diyanet İşleri Başkanlığı ve Millî Eğitim Bakanlığı yayınları temel alınarak düzenlenmiştir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_SOURCES.map((source) => (
          <a
            key={source.key}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-[#E5DEC9] bg-white p-5 flex flex-col justify-between gap-4 hover:border-[#7A1830] transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-[#1F1C18] group-hover:text-[#7A1830] transition-colors">
                  {source.label}
                </h3>
                <ExternalLink
                  className="w-4 h-4 text-[#7A1830] shrink-0 mt-1"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#575047] leading-relaxed">
                {source.description}
              </p>
            </div>
            <div className="text-xs font-semibold text-[#7A1830] truncate">
              {source.url.replace(/^https?:\/\//, '')}
            </div>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-[#E5DEC9] bg-[#FBF6EA] p-4 text-xs sm:text-sm text-[#4A3E2A] leading-relaxed">
        Dış bağlantılar için internet erişimi gereklidir. Dinî metinlerin mahreç, tecvid ve mahallî uygulama esasları için görevli imam-hatibin ve ehil hocaların rehberliğini esas alınız.
      </div>
    </div>
  );
};

interface BackupViewProps {
  completed: Record<string, boolean>;
  practiceChecks: Record<string, boolean>;
  dailyActivity: DailyActivityLog;
  quizStats: QuizStats;
  lessonNotes: Record<string, string>;
  memorizationCompleted: string[];
  earnedBadgesCount: number;
  totalBadgesCount: number;
  onImportBackup: (data: ProgressBackup) => void;
  onResetAll: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  completed,
  practiceChecks,
  dailyActivity,
  quizStats,
  lessonNotes,
  memorizationCompleted,
  earnedBadgesCount,
  totalBadgesCount,
  onImportBackup,
  onResetAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const totalLessons = MODULES.reduce((acc, m) => acc + m.cards.length, 0);
  const completedLessons = MODULES.reduce(
    (total, module) => total + module.cards.filter((_, index) => completed[`${module.index}:${index}`]).length,
    0
  );
  const savedNotesCount = Object.values(lessonNotes).filter((t) => t.trim().length > 0).length;

  const handleExport = () => {
    const payload: ProgressBackup = {
      version: 6,
      exportedAt: new Date().toISOString(),
      completed,
      practiceChecks,
      dailyActivity,
      quizStats,
      notes: lessonNotes,
      memorizationCompleted,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mihrap_akademi_yedek.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    setStatusMessage({
      type: 'success',
      text: 'Yedek dosyası (mihrap_akademi_yedek.json) cihazınıza indirildi.',
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.completed ||
        typeof parsed.completed !== 'object' ||
        Array.isArray(parsed.completed)
      ) {
        throw new Error('Geçersiz yedek dosyası biçimi.');
      }

      const sanitizedCompleted = Object.fromEntries(
        Object.entries(parsed.completed).filter(
          ([k, v]) => /^\d+:\d+$/.test(k) && typeof v === 'boolean'
        )
      ) as Record<string, boolean>;

      const sanitizedChecks =
        parsed.practiceChecks &&
        typeof parsed.practiceChecks === 'object' &&
        !Array.isArray(parsed.practiceChecks)
          ? (Object.fromEntries(
              Object.entries(parsed.practiceChecks).filter(
                ([k, v]) => /^m\d+-c\d+:\d+$/.test(k) && typeof v === 'boolean'
              )
            ) as Record<string, boolean>)
          : {};

      const sanitizedActivity: DailyActivityLog = {};
      if (
        parsed.dailyActivity &&
        typeof parsed.dailyActivity === 'object' &&
        !Array.isArray(parsed.dailyActivity)
      ) {
        for (const [k, v] of Object.entries(parsed.dailyActivity)) {
          if (
            /^\d{4}-\d{2}-\d{2}$/.test(k) &&
            v &&
            typeof v === 'object' &&
            !Array.isArray(v)
          ) {
            const entry = v as Record<string, unknown>;
            sanitizedActivity[k] = {
              lessons: typeof entry.lessons === 'number' && entry.lessons >= 0 ? Math.floor(entry.lessons) : 0,
              steps: typeof entry.steps === 'number' && entry.steps >= 0 ? Math.floor(entry.steps) : 0,
              quizCorrect: typeof entry.quizCorrect === 'number' && entry.quizCorrect >= 0 ? Math.floor(entry.quizCorrect) : 0,
            };
          }
        }
      }

      let sanitizedQuizStats: QuizStats | undefined;
      if (
        parsed.quizStats &&
        typeof parsed.quizStats === 'object' &&
        !Array.isArray(parsed.quizStats)
      ) {
        const q = parsed.quizStats as Record<string, unknown>;
        sanitizedQuizStats = {
          bestOverallScore:
            typeof q.bestOverallScore === 'number' && q.bestOverallScore >= 0
              ? Math.floor(q.bestOverallScore)
              : 0,
          bestOverallTotal:
            typeof q.bestOverallTotal === 'number' && q.bestOverallTotal >= 0
              ? Math.floor(q.bestOverallTotal)
              : 0,
          testsCompleted:
            typeof q.testsCompleted === 'number' && q.testsCompleted >= 0
              ? Math.floor(q.testsCompleted)
              : 0,
          bestScores: q.bestScores && typeof q.bestScores === 'object'
            ? Object.fromEntries(Object.entries(q.bestScores).filter(
                ([id, score]) => /^(?:[1-9]|10)$/.test(id) && Number.isInteger(score) && Number(score) >= 0 && Number(score) <= 10
              ))
            : undefined,
          passedModules: Array.isArray(q.passedModules)
            ? q.passedModules.filter((x): x is number => typeof x === 'number' && x >= 0)
            : [],
        };
      }

      const sanitizedNotes: Record<string, string> = {};
      if (
        parsed.notes &&
        typeof parsed.notes === 'object' &&
        !Array.isArray(parsed.notes)
      ) {
        for (const [k, v] of Object.entries(parsed.notes)) {
          if (/^m\d+-c\d+$/.test(k) && typeof v === 'string' && v.trim().length > 0) {
            sanitizedNotes[k] = v;
          }
        }
      }

      onImportBackup({
        version: 6,
        completed: sanitizedCompleted,
        practiceChecks: parsed.practiceChecks === undefined ? undefined : sanitizedChecks,
        dailyActivity: parsed.dailyActivity === undefined ? undefined : sanitizedActivity,
        quizStats: sanitizedQuizStats,
        notes: parsed.notes === undefined ? undefined : sanitizedNotes,
        memorizationCompleted: Array.isArray(parsed.memorizationCompleted) ? parsed.memorizationCompleted : undefined,
      });

      setStatusMessage({
        type: 'success',
        text: 'İlerleme kayıtları başarıyla geri yüklendi.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? `Yedek yüklenemedi: ${err.message}`
            : 'Yedek dosyası okunamadı.',
      });
    } finally {
      input.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1C18]">
          İlerleme ve Yedekleme
        </h2>
        <p className="mt-1.5 text-sm text-[#575047] leading-relaxed">
          Ders, prova ve ezber ilerlemeniz tarayıcınızda saklanır. JSON yedeği alarak başka bir cihaza aktarabilirsiniz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-4">
          <div className="text-xs text-[#645C52]">Tamamlanan ders</div>
          <div className="mt-1 text-2xl font-bold text-[#064E3B] font-mono-num">
            {completedLessons} / {totalLessons}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-4">
          <div className="text-xs text-[#645C52]">Genel ilerleme</div>
          <div className="mt-1 text-2xl font-bold text-[#1F1C18] font-mono-num">
            %{Math.round((completedLessons / totalLessons) * 100)}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-4">
          <div className="text-xs text-[#645C52]">Kayıtlı ders notu</div>
          <div className="mt-1 text-2xl font-bold text-[#8C6520] font-mono-num">
            {savedNotesCount}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-4">
          <div className="text-xs text-[#645C52]">Kazanılan rozet</div>
          <div className="mt-1 text-2xl font-bold text-[#7A1830] font-mono-num">
            {earnedBadgesCount} / {totalBadgesCount}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-[#E5DEC9] bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Yedeği indir (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D4CBB4] bg-[#FAF7F0] px-4 py-2.5 text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DA] transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Yedek yükle
          </button>

          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5C5C5] bg-[#FDF6F6] px-4 py-2.5 text-xs font-semibold text-[#7A1830] hover:bg-[#F9E8E8] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            İlerlemeyi sıfırla
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          hidden
        />

        {statusMessage && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'border-[#B8D4C9] bg-[#EEF7F3] text-[#064E3B]'
                : 'border-[#E5C5C5] bg-[#FDF6F6] text-[#7A1830]'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {confirmingReset && (
          <div className="rounded-xl border border-[#E5C5C5] bg-[#FDF6F6] p-4 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-[#7A1830]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong>Tüm ilerleme kayıtları silinecek.</strong> Bu işlem geri alınamaz. Öncesinde yukarıdan JSON yedeği indirmeniz önerilir.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmingReset(false);
                  setStatusMessage({
                    type: 'success',
                    text: 'Ders, prova ve ezber ilerlemesi sıfırlandı.',
                  });
                }}
                className="rounded-lg bg-[#7A1830] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5E1224] transition-colors whitespace-nowrap shrink-0"
              >
                Evet, tümünü sıfırla
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg border border-[#D4CBB4] bg-white px-3.5 py-2 text-xs font-semibold text-[#1F1C18] hover:bg-[#FAF7F0] transition-colors whitespace-nowrap shrink-0"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
