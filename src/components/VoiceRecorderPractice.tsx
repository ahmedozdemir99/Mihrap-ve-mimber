import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';

export const VoiceRecorderPractice: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Bu tarayıcı ortamında mikrofon kaydı desteklenmiyor.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMsg(
        'Mikrofon izni alınamadı veya cihazda mikrofon bulunamadı. Tarayıcı izinlerini kontrol edip tekrar deneyebilirsiniz.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setErrorMsg(null);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-[#E5DEC9] bg-[#FAF7F0] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[#1F1C18] text-sm">
            Sesli okuma ve nefes provası
          </h4>
          <p className="text-xs text-[#645C52] mt-0.5">
            Kendi okuyuşunuzu yalnızca bu cihazda geçici olarak kaydedip mahreç ve nefes dengenizi dinleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
            >
              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              Ses kaydı başlat
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7A1830] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5E1224] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1830]"
            >
              <Square className="w-3.5 h-3.5" aria-hidden="true" />
              Durdur ({formatTime(seconds)})
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="mt-3 text-xs text-[#7A1830] bg-[#FDF6F6] border border-[#E5C5C5] rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {audioUrl && !recording && (
        <div className="mt-3 pt-3 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <audio controls src={audioUrl} className="w-full h-9" />
          <button
            type="button"
            onClick={clearRecording}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D4CBB4] bg-white px-3 py-2 text-xs font-semibold text-[#645C52] hover:text-[#7A1830] transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Kaydı sil
          </button>
        </div>
      )}
    </div>
  );
};
