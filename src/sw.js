importScripts('./ngsw-worker.js');

self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (!data?.notification?.title) return;

  const notification = data.notification;
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: notification.tag || 'remindly-' + Date.now(),
    data: notification.data || { url: '/' },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: notification.actions || [
      { action: 'open', title: 'Open Remindly' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'schedule-daily-digest') {
    const [hours, minutes] = (event.data.time || '08:00').split(':').map(Number);

    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const msUntilNext = target.getTime() - now.getTime();

    setTimeout(() => {
      self.registration.showNotification('Remindly Daily Digest', {
        body: 'Good morning — here is your daily schedule and briefings.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'daily-digest',
        data: { url: '/dashboard' },
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'View Schedule' },
        ],
      });
    }, msUntilNext);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.navigate(urlToOpen).then(() => client.focus());
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
