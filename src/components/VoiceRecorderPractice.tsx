import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2 } from 'lucide-react';

export const VoiceRecorderPractice: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'recording' | 'stopping'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const releaseMicrophone = () => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== 'inactive') recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
    releaseMicrophone();
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const startRecording = async () => {
    if (requestRef.current || mediaRecorderRef.current) return;
    setErrorMsg(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setErrorMsg('Bu tarayıcı ortamında mikrofon kaydı desteklenmiyor.');
      return;
    }

    const request = new AbortController();
    requestRef.current = request;
    setStatus('requesting');
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request.signal.aborted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        releaseMicrophone();
        setStatus('idle');
        if (chunks.length === 0) {
          setErrorMsg('Ses kaydı boş. Yeniden kayıt almayı deneyin.');
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0].type });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.onerror = () => {
        releaseMicrophone();
        setStatus('idle');
        setErrorMsg('Ses kaydı kesildi. Yeniden kayıt almayı deneyin.');
      };

      recorder.start();
      setSeconds(0);
      setStatus('recording');
      const startedAt = performance.now();
      timerRef.current = window.setInterval(() => {
        setSeconds(Math.floor((performance.now() - startedAt) / 1000));
      }, 1000);
    } catch {
      releaseMicrophone();
      stream?.getTracks().forEach((track) => track.stop());
      if (!request.signal.aborted) {
        setStatus('idle');
        setErrorMsg('Ses kaydı başlatılamadı. Mikrofonun bağlı olduğunu ve tarayıcı iznini kontrol edin.');
      }
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state !== 'recording') return;
    setStatus('stopping');
    recorder.stop();
    recorder.stream.getTracks().forEach((track) => track.stop());
  };

  const clearRecording = () => {
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
          {status !== 'recording' ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={status !== 'idle'}
              className="inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053D2E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] disabled:opacity-60"
            >
              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              {status === 'requesting' ? 'Mikrofon izni bekleniyor…' :
                status === 'stopping' ? 'Kayıt hazırlanıyor…' : 'Ses kaydı başlat'}
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
        <p role="alert" className="mt-3 text-xs text-[#7A1830] bg-[#FDF6F6] border border-[#E5C5C5] rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {audioUrl && status === 'idle' && (
        <div className="mt-3 pt-3 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <audio controls aria-label="Prova kaydınız" src={audioUrl} className="w-full h-9" />
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
