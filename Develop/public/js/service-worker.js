const { valueFromASTUntyped } = require("graphql");

const APP_PREFIX = 'my-site-cache-';  
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;

const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
  ];
//Store caches
  self.addEventListener("install", function(event){
      event.waitUntil(caches.open(CACHE_NAME.then(function(cache){
          console.log('cache installed:' +CACHE_NAME)
          return cache.addAll(FILES_TO_CACHE);
      })
      )
      );
  });
//Render cahes
  self.addEventListener("fetch", function(event) {

    if (event.request.url.includes("/api/")) {
        event.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(event.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
    
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(event.request);
              });
          }).catch(err => console.log(err))
        );
    
        return;
      }

//delete old caches
      self.addEventListener('activate', function (e) {
        e.waitUntil(
          caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
              return key.indexOf(APP_PREFIX);
            })
            // add current cache name to white list
            cacheKeeplist.push(CACHE_NAME);
      
            return Promise.all(keyList.map(function (key, i) {
              if (cacheKeeplist.indexOf(key) === -1) {
                console.log('deleting cache : ' + keyList[i] );
                return caches.delete(keyList[i]);
              }
            }));
          })
        );
      });
      
  })