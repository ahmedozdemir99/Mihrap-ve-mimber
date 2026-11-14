import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

const API = '/api/notifications';
const SYNC_KEY = 'mihrap-reminder-endpoint';

function readSyncedEndpoint() {
  try {
    return localStorage.getItem(SYNC_KEY);
  } catch {
    return null;
  }
}

function rememberEndpoint(endpoint: string | null) {
  try {
    if (endpoint) localStorage.setItem(SYNC_KEY, endpoint);
    else localStorage.removeItem(SYNC_KEY);
  } catch {
    // Push can still work when the browser blocks local storage.
  }
}

function encodeKey(key: ArrayBuffer | null) {
  if (!key) throw new Error('Missing subscription key');
  return btoa(String.fromCharCode(...new Uint8Array(key))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeKey(key: string) {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(key.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

const serviceWorkerUrl = '/service-worker.js';
const timeoutMs = 15_000;
const pushTimeoutMs = 30_000;

function withinTimeout<T>(operation: Promise<T>, limit = timeoutMs): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Notification setup timed out')), limit);
    operation.then(resolve, reject).finally(() => window.clearTimeout(timer));
  });
}

async function fetchNotification(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(API + path, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function loadPushSetup() {
  const [registration, response] = await Promise.all([
    withinTimeout(navigator.serviceWorker.register(serviceWorkerUrl)),
    fetchNotification('/config', { cache: 'no-store' }),
  ]);
  if (!response.ok) throw new Error('Push has not been configured');
  const { publicKey } = await response.json();
  if (typeof publicKey !== 'string') throw new Error('Missing push key');
  const key = decodeKey(publicKey);
  if (key.length !== 65 || key[0] !== 4) throw new Error('Invalid push key');
  const activeRegistration = registration.active ? registration : await withinTimeout(navigator.serviceWorker.ready);
  return { registration: activeRegistration, publicKey: key };
}

async function saveSubscription(method: 'POST' | 'DELETE', subscription: PushSubscription) {
  const body = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: encodeKey(subscription.getKey('p256dh')),
      auth: encodeKey(subscription.getKey('auth')),
    },
  };
  const response = await fetchNotification('/subscription', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    if (error === 'invalid_subscription') throw new Error('Unsupported push subscription');
    throw new Error('Subscription update failed');
  }
}

export function ReminderSettings() {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const setup = useRef<ReturnType<typeof loadPushSetup> | null>(null);
  const readySetup = useRef<Awaited<ReturnType<typeof loadPushSetup>> | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supported) return;
    let active = true;
    const attempt = loadPushSetup();
    setup.current = attempt;
    void attempt.then(async (prepared) => {
      if (!active || setup.current !== attempt) return;
      readySetup.current = prepared;
      const current = await withinTimeout(prepared.registration.pushManager.getSubscription());
      if (!active || setup.current !== attempt) return;
      setSubscription(current);
      setEnabled(Boolean(current && current.endpoint === readSyncedEndpoint() && Notification.permission === 'granted'));
    }).catch(() => {
      if (setup.current === attempt) setup.current = null;
    });
    return () => { active = false; };
  }, [supported]);

  async function enable() {
    setBusy(true);
    setMessage('Bildirimler açılıyor…');
    const prepared = setup.current;
    let step: 'permission' | 'setup' | 'device' | 'server' = 'permission';
    try {
      const permission = Notification.permission === 'granted'
        ? 'granted' : await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage(permission === 'denied'
          ? 'Bildirim izni kapalı. Cihazınızın site veya uygulama ayarlarından izin verebilirsiniz.'
          : 'Bildirimleri açmak için izin verin.');
        return;
      }

      // Ignore any background check that started before this user action.
      setup.current = null;
      step = 'setup';
      const { registration, publicKey } = readySetup.current ??
        await (prepared ? prepared.catch(() => loadPushSetup()) : loadPushSetup());
      step = 'device';
      const manager = registration.pushManager;
      const subscribe = () => withinTimeout(manager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey }), pushTimeoutMs);
      let current: PushSubscription;
      try {
        current = await subscribe();
      } catch (error) {
        // Browsers report a subscription made with an old application key as InvalidStateError.
        if (!(error instanceof DOMException) || error.name !== 'InvalidStateError') throw error;
        const previous = await withinTimeout(manager.getSubscription());
        const previousKey = previous?.options?.applicationServerKey;
        if (!previous || !previousKey) throw error;
        const bytes = new Uint8Array(previousKey);
        if (bytes.length === publicKey.length && publicKey.every((byte, index) => byte === bytes[index])) throw error;
        await withinTimeout(previous.unsubscribe());
        setSubscription(null);
        current = await subscribe();
      }
      setSubscription(current);
      step = 'server';
      await saveSubscription('POST', current);
      rememberEndpoint(current.endpoint);
      setEnabled(true);
      setMessage('Bu cihazda bildirimler açıldı.');
    } catch (error) {
      if (step === 'setup') {
        readySetup.current = null;
        setMessage('Bildirim ayarları yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.');
      } else if (step === 'server' && error instanceof Error && error.message === 'Unsupported push subscription') {
        setMessage('Akademi bu tarayıcının bildirim kaydını kabul edemedi. Android’de Chrome ile deneyin.');
      } else if (step === 'server') {
        setMessage('Cihaz bağlandı fakat Akademi kaydı tamamlanamadı. Tekrar deneyin.');
      } else if (step === 'permission' || (error instanceof DOMException && error.name === 'NotAllowedError')) {
        setMessage('Cihaz bildirim izni vermedi. Tarayıcınızın bildirim ayarlarını kontrol edin.');
      } else {
        setMessage('Tarayıcınız bildirim servisine bağlanamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!subscription) return;
    setBusy(true);
    setMessage('Bildirimler kapatılıyor…');
    try {
      await withinTimeout(subscription.unsubscribe());
      rememberEndpoint(null);
      setSubscription(null);
      setEnabled(false);
      setMessage('Bu cihazda bildirimler kapatıldı.');
      await saveSubscription('DELETE', subscription).catch(() => undefined);
    } catch {
      setMessage('Bildirimler kapatılamadı. Yeniden deneyin.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#E5DEC9] bg-white p-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#064E3B]">
          <Bell size={16} aria-hidden="true" /> Ders bildirimleri
        </h2>
        <p className="mt-1 text-sm text-[#575047]">Her gün 08.00, 12.00 ve 20.00 · Türkiye saati</p>
        <p role="status" className="mt-1 text-xs text-[#575047]">
          {message || (!supported
            ? 'iPhone veya iPad’de Akademi’yi Ana Ekran’dan açın. Bildirimler için desteklenen bir tarayıcı gerekir.'
            : enabled ? 'Bu cihazda açık.' : '')}
        </p>
      </div>
      {supported && (
        <button type="button" onClick={enabled ? disable : enable} disabled={busy}
          className="min-h-11 rounded-lg border border-[#D4CBB4] px-3 text-sm font-semibold text-[#064E3B] hover:bg-[#F3EDE0] disabled:opacity-40">
          {enabled ? 'Bildirimleri kapat' : 'Bildirimleri aç'}
        </button>
      )}
    </aside>
  );
}
