self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let message;
  try {
    message = event.data?.json();
  } catch {
    // Use the generic reminder if the payload cannot be read.
  }
  event.waitUntil(self.registration.showNotification(
    message?.title || 'Mihrap ve Minber Akademisi',
    {
      body: message?.body || 'Ezber Rotası’nda kaldığınız yerden devam edin.',
      icon: '/icon-192.png',
      tag: message?.tag || 'mihrap-ders',
      data: { url: '/?ders=ezber' },
    },
  ));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = new URL('/?ders=ezber', self.location.origin).href;
    for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
      if (client.url === target) return client.focus();
    }
    return self.clients.openWindow(target);
  })());
});
