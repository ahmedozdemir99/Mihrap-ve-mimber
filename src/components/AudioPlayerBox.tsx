import React, { useRef, useState } from 'react';
import { ExternalLink, RotateCcw, Volume2 } from 'lucide-react';

interface AudioPlayerBoxProps {
  title: string;
  url: string;
  fallback?: string;
  note?: string;
}

export const AudioPlayerBox: React.FC<AudioPlayerBoxProps> = ({
  title,
  url,
  fallback,
  note,
}) => {
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    const current = audioRef.current;
    if (!current) return;
    document.querySelectorAll('audio').forEach((el) => {
      if (el !== current && !el.paused) {
        el.pause();
      }
    });
  };

  const handleRetry = () => {
    setError(false);
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    void audio.play().catch(() => setError(true));
  };

  return (
    <div className="rounded-xl border border-[#E5DEC9] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[#1F1C18] text-[15px] leading-snug">
            {title}
          </h4>
          {note && (
            <p className="mt-1 text-xs text-[#645C52] leading-relaxed">{note}</p>
          )}
        </div>
        <Volume2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-1" aria-hidden="true" />
      </div>

      <div className="mt-3">
        <audio
          hidden={error}
          ref={audioRef}
          aria-label={title}
          controls
          preload="none"
          src={url}
          onPlay={handlePlay}
          onError={() => setError(true)}
          className="w-full h-10"
        >
          Tarayıcınız ses oynatıcısını desteklemiyor.
        </audio>
        {error && (
          <div role="status" className="rounded-lg border border-[#E5C5C5] bg-[#FDF6F6] p-3 text-xs text-[#7A1830]">
            <p className="font-medium">
              Ses kaydı şu anda yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyebilir veya aşağıdaki kaynak sayfasından dinleyebilirsiniz.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 font-semibold text-[#7A1830] underline underline-offset-4 hover:opacity-80 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Tekrar dene
              </button>
            </div>
          </div>
        )}
      </div>

      {(fallback || url) && (
        <div className="mt-3 pt-2.5 border-t border-[#F0EAE0] flex items-center justify-between gap-2 flex-wrap">
          <a
            href={fallback || url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1830] hover:underline underline-offset-4"
          >
            <span>Kaynak sayfasını aç</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
};
