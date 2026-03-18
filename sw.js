const CACHE_NAME = 'styre-cache-v3'; // Podbita wersja wymusza twarde odświeżenie na urządzeniach!

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
                // Używamy catch, żeby pojedynczy błąd pliku (np. literówka w nazwie) 
                // nie zablokował instalacji całego Service Workera.
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
                        return caches.delete(cache); // Usuwa stare cache z wersji v1 i v2
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Ignoruj żądania inne niż GET (np. wysyłanie danych POST do Firebase) 
    // oraz zapytania spoza protokołu http/https (np. z wtyczek przeglądarki).
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    // Strategia "Network First" - zawsze stara się pobrać najnowszy plik z sieci.
    // Jeśli nie ma neta, bierze z cache. To eliminuje problem przestarzałego kodu.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Klonujemy odpowiedź, ponieważ strumień odpowiedzi może być użyty tylko raz.
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // Brak sieci lub błąd połączenia - wyciągamy z cache
                return caches.match(event.request);
            })
    );
});
