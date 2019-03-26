self.addEventListener('install', function(event) {
  console.log('[Service worker] Installing Service Worker..', event);
  event.waitUntil(
      caches.open('static')
      .then(function(cache) {
          console.log('[Service Worker] Precaching App Shell');
          cache.addAll([
              'index.html',
              'src/js/app.js',
              'src/css/app.css',
              'src/images/todolist.png',
              'https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.1.1/es6-promise.min.js',
              'https://cdnjs.cloudflare.com/ajax/libs/fetch/3.0.0/fetch.min.js'
          ]);
      })
  )
})

self.addEventListener('activate', function(event) {
  console.log('[Service worker] Activating Service Worker..', event);
  return self.clients.claim();
})

self.addEventListener('fetch', function(event) {
	console.log('[Service worker] Fetch event..', event);
  event.respondWith(
      caches.match(event.request)
      .then(function(response) {
          if (response) {
              return response;
          } else {
              return fetch(event.request);
          }
      })
  );
})
