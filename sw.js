// Service Worker for SUNO Playlist Player PWA
const CACHE_NAME = 'suno-playlist-v3';
const OFFLINE_URL = '/';

// Files to cache on install
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/translations.js',
    '/favicon.png',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Outfit:wght@400;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    // API requests - Network First strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Static assets - Cache First strategy
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response before caching
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return offline page or a generic error
                        if (request.destination === 'document') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    // Future: implement background sync for playlist updates
});

// Push notifications for future enhancements
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    // Future: implement push notifications
});
