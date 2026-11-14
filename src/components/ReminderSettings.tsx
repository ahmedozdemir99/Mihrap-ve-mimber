import { useEffect, useState } from 'react';
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

function decodeKey(key: string) {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(key.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function saveSubscription(method: 'POST' | 'DELETE', subscription: PushSubscription) {
  const response = await fetch(API + '/subscription', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error('Subscription update failed');
}

export function ReminderSettings() {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const [setup, setSetup] = useState<{ registration: ServiceWorkerRegistration; publicKey: string }>();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(supported);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supported) return;
    let active = true;
    async function load() {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        const current = await registration.pushManager.getSubscription();
        if (!active) return;
        setSubscription(current);
        setEnabled(Boolean(current && current.endpoint === readSyncedEndpoint() && Notification.permission === 'granted'));
        const response = await fetch(API + '/config');
        if (!response.ok) throw new Error('Push has not been configured');
        const { publicKey } = await response.json();
        if (typeof publicKey !== 'string') throw new Error('Missing push key');
        if (active) setSetup({ registration, publicKey });
      } catch {
        if (active) setMessage('Bildirim hizmetine şu anda ulaşılamıyor.');
      } finally {
        if (active) setBusy(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [supported]);

  async function enable() {
    if (!setup) return;
    setBusy(true);
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage(permission === 'denied'
          ? 'Bildirim izni kapalı. Cihazınızın site veya uygulama ayarlarından izin verebilirsiniz.'
          : 'Bildirimleri açmak için izin verin.');
        return;
      }

      const registration = setup.registration.active ? setup.registration : await navigator.serviceWorker.ready;
      const publicKey = decodeKey(setup.publicKey);
      let current = await registration.pushManager.getSubscription();
      const previousKey = current?.options.applicationServerKey;
      const previousBytes = previousKey ? new Uint8Array(previousKey) : null;
      if (current && previousBytes && (previousBytes.length !== publicKey.length ||
        !publicKey.every((byte, index) => byte === previousBytes[index]))) {
        await current.unsubscribe();
        current = null;
        setSubscription(null);
      }
      current ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey });
      setSubscription(current);
      await saveSubscription('POST', current);
      rememberEndpoint(current.endpoint);
      setEnabled(true);
      setMessage('Bu cihazda bildirimler açıldı.');
    } catch {
      setMessage('Bildirim kaydı tamamlanamadı. Yeniden deneyin.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!subscription) return;
    setBusy(true);
    setMessage('');
    try {
      await subscription.unsubscribe();
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
            : busy ? 'Bildirim ayarları kontrol ediliyor…' : enabled ? 'Bu cihazda açık.' : '')}
        </p>
      </div>
      {supported && (
        <button type="button" onClick={enabled ? disable : enable} disabled={busy || (!enabled && !setup)}
          className="min-h-11 rounded-lg border border-[#D4CBB4] px-3 text-sm font-semibold text-[#064E3B] hover:bg-[#F3EDE0] disabled:opacity-40">
          {enabled ? 'Bildirimleri kapat' : 'Bildirimleri aç'}
        </button>
      )}
    </aside>
  );
}
