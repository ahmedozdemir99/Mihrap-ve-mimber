import { buildPushPayload } from '@block65/webcrypto-web-push';

const reminders = {
  5: { title: 'Derse başlama zamanı', body: 'Ezber Rotası’nda kaldığınız yerden 5–10 dakika çalışın.' },
  9: { title: 'Gün ortası tekrarı', body: 'Sabah çalıştığınız sûreyi veya duayı metni gizleyerek bir kez okuyun.' },
  17: { title: 'Günün dersini tamamlayın', body: 'Son bir tekrar yapın, bitirdiğiniz dersi işaretleyin ve yarın devam edeceğiniz yeri belirleyin.' },
};

const allowedHosts = new Set(['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com']);
const base64url = /^[A-Za-z0-9_-]+$/;

function validSubscription(value) {
  if (!value || typeof value.endpoint !== 'string' || value.endpoint.length > 2048) return false;
  try {
    const url = new URL(value.endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || url.pathname === '/') return false;
    if (!allowedHosts.has(url.hostname) && !url.hostname.endsWith('.notify.windows.com') &&
        !url.hostname.endsWith('.push.apple.com') && !url.hostname.endsWith('.push.services.mozilla.com')) return false;
  } catch {
    return false;
  }
  const { p256dh, auth } = value.keys ?? {};
  return typeof p256dh === 'string' && p256dh.length === 87 && p256dh.startsWith('B') && base64url.test(p256dh) &&
    typeof auth === 'string' && auth.length === 22 && base64url.test(auth);
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function send(row, message, env) {
  const endpoint = row.endpoint;
  const payload = await buildPushPayload({
    data: message,
    options: { ttl: 3600, urgency: 'normal', topic: 'mihrap-ders' },
  }, { endpoint, expirationTime: null, keys: { p256dh: row.p256dh, auth: row.auth } }, {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  });
  const response = await fetch(endpoint, { ...payload, redirect: 'error', signal: AbortSignal.timeout(8000) });
  await response.body?.cancel();
  return response.status;
}

async function deliverSlot(env, scheduledTime) {
  const date = new Date(scheduledTime);
  const reminder = reminders[date.getUTCHours()];
  if (!reminder) return;
  const slot = date.toISOString().slice(0, 13);
  const now = Date.now();
  const db = env.REMINDER_DB;
  // Claim up to forty subscriptions atomically. Later ticks finish the queue and retry transient errors.
  const { results } = await db.prepare(`
    UPDATE subscriptions
    SET claimed_at = ?, attempts = CASE WHEN last_slot = ? THEN attempts + 1 ELSE 1 END, last_slot = ?
    WHERE id IN (
      SELECT id FROM subscriptions
      WHERE (last_slot < ? OR (last_slot = ? AND attempts BETWEEN 1 AND 2))
        AND claimed_at < ?
      ORDER BY last_slot, claimed_at, id LIMIT 40
    )
    RETURNING id, endpoint, p256dh, auth
  `).bind(now, slot, slot, slot, slot, now - 9 * 60_000).all();

  const outcomes = await Promise.allSettled(results.map(async (row) => ({
    row, status: await send(row, { ...reminder, tag: `mihrap-${slot}` }, env),
  })));
  const updates = [];
  for (const outcome of outcomes) {
    if (outcome.status === 'rejected') continue;
    const { row, status } = outcome.value;
    if (status === 404 || status === 410) {
      updates.push(db.prepare('DELETE FROM subscriptions WHERE id = ? AND claimed_at = ?').bind(row.id, now));
    } else if ((status >= 200 && status < 300) || (status >= 400 && status < 500 && status !== 429)) {
      updates.push(db.prepare('UPDATE subscriptions SET attempts = 0 WHERE id = ? AND claimed_at = ?').bind(row.id, now));
    }
  }
  if (updates.length) await db.batch(updates);
}

function configured(env) {
  return env.REMINDER_DB && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    if (!configured(env)) {
      return json({ configured: false }, 503);
    }
    if (path === '/api/notifications/config' && request.method === 'GET') {
      return json({ configured: true, publicKey: env.VAPID_PUBLIC_KEY });
    }
    if (path !== '/api/notifications/subscription' || !['POST', 'DELETE'].includes(request.method)) {
      return json({ error: 'not_found' }, 404);
    }
    if (request.headers.get('Origin') !== url.origin ||
        !request.headers.get('Content-Type')?.startsWith('application/json')) {
      return json({ error: 'invalid_origin' }, 403);
    }
    if (Number(request.headers.get('Content-Length')) > 4096) return json({ error: 'too_large' }, 413);

    let subscription;
    try {
      const body = await request.text();
      if (body.length > 4096) return json({ error: 'too_large' }, 413);
      subscription = JSON.parse(body);
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }
    if (!validSubscription(subscription)) return json({ error: 'invalid_subscription' }, 400);
    const { endpoint, keys: { p256dh, auth } } = subscription;
    if (request.method === 'DELETE') {
      await env.REMINDER_DB.prepare('DELETE FROM subscriptions WHERE endpoint = ? AND p256dh = ? AND auth = ?')
        .bind(endpoint, p256dh, auth).run();
    } else {
      await env.REMINDER_DB.prepare(`
        INSERT INTO subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth
        WHERE subscriptions.auth = excluded.auth
      `).bind(endpoint, p256dh, auth).run();
    }
    return json({ ok: true });
  },
  async scheduled(controller, env) {
    if (!configured(env)) throw new Error('Reminder bindings are missing');
    await deliverSlot(env, controller.scheduledTime);
  },
};
