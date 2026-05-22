importScripts('./ngsw-worker.js');

self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (!data?.notification?.title) return;

  const notification = data.notification;
  const options = {
    body: notification.body || '',
    icon: notification.icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
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
