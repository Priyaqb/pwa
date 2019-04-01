self.addEventListener('install', function(event) {
  event.waitUntil(
      caches.open('static-3')
      .then(function(cache) {
          cache.addAll([
              '/',
              '/index.html',
              '/src/js/app.js',
              '/src/css/app.css',
              '/src/images/todolist.png',
              'https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.1.1/es6-promise.min.js',
              'https://cdnjs.cloudflare.com/ajax/libs/fetch/3.0.0/fetch.min.js'
          ]);
      })
  )
})

self.addEventListener('activate', function(event) {
  return self.clients.claim();
})

self.addEventListener('fetch', function(event) {
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



