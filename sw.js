const CACHE_NAME = 'styre-cache-v2';

const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/icon-512.png',
    '/manifest.json',
    '/db.js',
    '/app.js',
    '/taxi_logic.js',
    '/taxi_modals.js',
    '/taxi_views.js',
    '/home_logic.js',
    '/home_modals.js',
    '/home_views.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Strategia "Network First" - zawsze stara się pobrać najnowszy plik z sieci.
    // Jeśli nie ma neta, bierze z cache. To eliminuje problem przestarzałego kodu.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
