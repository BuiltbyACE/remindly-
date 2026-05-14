importScripts('./ngsw-worker.js');

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Remindly', body: '', actionUrl: '/', id: '' };

  const options = {
    body: data.body,
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    data: data.actionUrl,
    tag: data.id,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data ?? '/';
  event.waitUntil(clients.openWindow(urlToOpen));
});
