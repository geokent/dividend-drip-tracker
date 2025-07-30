const CACHE_NAME = 'divtrkr-v2'; // Updated version to force refresh
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Network first strategy for better reliability
self.addEventListener('fetch', (event) => {
  // Skip caching for API calls and dynamic content
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/') ||
      event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If fetch succeeds, clone and cache the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If fetch fails, try to serve from cache
        return caches.match(event.request);
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