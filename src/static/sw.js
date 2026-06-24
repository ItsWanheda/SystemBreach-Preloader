/**
 * Service Worker for System Breach Preloader
 * Handles offline caching of preloader assets
 */

const CACHE_NAME = 'preloader-v2.0.0';
const STATIC_CACHE = 'preloader-static-v2';
const DYNAMIC_CACHE = 'preloader-dynamic-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './main.js',
    './manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap'
];

// Install event - Precache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching static assets...');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets precached');
                // Cache external assets separately
                return caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                        return Promise.allSettled(
                            EXTERNAL_ASSETS.map(url =>
                                cache.add(url).catch(err => {
                                    console.warn('[SW] Failed to cache:', url, err);
                                })
                            )
                        );
                    });
            })
            .then(() => {
                console.log('[SW] All assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('preloader-') &&
                                name !== STATIC_CACHE &&
                                name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache - fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Cache dynamic assets
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, try to return a fallback
                        console.log('[SW] Network failed, no cache available');

                        // Return offline fallback for HTML requests
                        if (request.headers.get('Accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }

                        // Return null for other requests
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            caches.delete(STATIC_CACHE)
                .then(() => caches.delete(DYNAMIC_CACHE))
                .then(() => {
                    event.ports.postMessage({ success: true });
                });
            break;

        case 'GET_CACHE_STATUS':
            caches.keys().then((names) => {
                event.ports.postMessage({
                    caches: names,
                    timestamp: Date.now()
                });
            });
            break;

        default:
            console.log('[SW] Unknown message type:', type);
    }
});

// Background sync for analytics (future use)
self.addEventListener('sync', (event) => {
    if (event.tag === 'preloader-analytics') {
        console.log('[SW] Background sync triggered');
    }
});

// Push notifications (future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        console.log('[SW] Push received:', data);
    }
});