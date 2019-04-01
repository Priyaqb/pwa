
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');



var CACHE_STATIC_NAME = 'static-v31';
var CACHE_DYNAMIC_NAME = 'dynamic-v7';

var STATIC_FILES = [
    '/',
    '/index.html',
    '/src/js/idb.js',
    '/src/js/app.js',
    '/src/css/app.css',
    '/src/images/todolist.png',
    'https://cdnjs.cloudflare.com/ajax/libs/es6-promise/4.1.1/es6-promise.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fetch/3.0.0/fetch.min.js'
];

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
        .then(function (cache) {
          console.log('[Service Worker] Precaching App Shell');
          cache.addAll(STATIC_FILES);
        })
    )
  });

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});



function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
      console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

var url = 'https://todolist-4f5f3.firebaseio.com/list';
self.addEventListener('fetch', function(event) {

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then(function (res) {
                var clonedRes = res.clone();
                    
                    clonedRes.json()
                    
                    .then(function(data){
                        for (var key in data) {
                            writeData('lists',data[key]);
                        }
                    })
                return res;
            })
           
        );
      } else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
          caches.match(event.request)
        );
      } else {
        event.respondWith(
          caches.match(event.request)
            .then(function (response) {
              if (response) {
                return response;
              } else {
                return fetch(event.request)
                  .then(function (res) {
                    return caches.open(CACHE_DYNAMIC_NAME)
                    .then(function (cache) {
                        // trimCache(CACHE_DYNAMIC_NAME, 3);
                        cache.put(event.request.url, res.clone());
                        return res;
                    })
                  })
                  .catch(function (err) {
                    return caches.open(CACHE_STATIC_NAME)
                      .then(function (cache) {
                        if (event.request.headers.get('accept').includes('text/html')) {
                          return cache.match('/offline.html');
                        }
                      });
                  });
              }
            })
        );
      }
      

})


self.addEventListener('sync', function(event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-item') {
      console.log('[Service Worker] Syncing new Posts');
      event.waitUntil(
        readAllData('sync-lists')
          .then(function(data) {
            for (var dt of data) {
              fetch('https://todolist-4f5f3.firebaseio.com/list.json', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  id: dt.id,
                  desc: dt.desc,})
              })
                .then(function(res) {
                  console.log('Sent data', res);
                  if (res.ok) {
                    deleteItemFromData('sync-posts', dt.id); // Isn't working correctly!
                  }
                })
                .catch(function(err) {
                  console.log('Error while sending data', err);
                });
            }
  
          })
      );
    }
  });