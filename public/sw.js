const CACHE_NAME = 'divtrkr-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'You have a new dividend payment!',
    icon: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png',
    badge: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DivTrkr', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});