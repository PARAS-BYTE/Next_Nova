const CACHE_NAME = 'learn-nova-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  // Specific API routes to cache for offline viewing
  '/api/courses',
  '/api/notes'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't strict cache URLs if they fail, just try
      return Promise.allSettled(
        OFFLINE_URLS.map(url => cache.add(url).catch(err => console.log('SW cache skip:', url)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy for APIs to ensure offline support holds stale data
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return networkResponse;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For general assets, Stale-While-Revalidate
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
