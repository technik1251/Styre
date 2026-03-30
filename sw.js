const CACHE_NAME = 'styre-cache-v5'; // Wymuszenie twardego resetu (v5)

const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './icon-512.png',
    './manifest.json',
    './db.js',
    './app.js',
    './taxi_logic.js',
    './taxi_modals.js',
    './taxi_views.js',
    './home_logic.js',
    './home_modals.js',
    './home_views.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(URLS_TO_CACHE).catch(err => console.log('Błąd cache.addAll:', err));
            })
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
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

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
