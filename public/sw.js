importScripts("/assets/js/idb.min.js");
importScripts("/assets/js/db.js");
importScripts("/assets/js/Api.js");

var GOOGLE_FONT_URL = "https://fonts.gstatic.com";
var CACHE_STATIC_NAME = "pwanote-static_v0";
var CACHE_DYNAMIC_NAME = "pwanote-dynamic_v0";
var STATIC_ASSETS = [
  "/",
  "/index.html",
  "/add.html",
  // "/offline.html",
  "/sw.js",
  "/favicon.ico",
  "/assets/js/main.js",
  "/assets/js/Api.js",
  "/assets/js/helpers.js",
  "/assets/js/db.js",
  // "/assets/js/libs/fetch.js",
  // "/assets/js/libs/promise.js",
  "/assets/js/libs/material.min.js",
  "/assets/js/idb.min.js",
  "/assets/css/style.css",
  "/assets/css/libs/material.min.css",
  "/manifest.json",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
];
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log("[SW] Add all");
        cache.addAll(STATIC_ASSETS);
      })
      .catch(function (e) {
        console.log("[SW] Precaching Error !", e);
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      // return Promise.all(
      keyList.map(function (key) {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          return caches.delete(key);
        }
      });
      // );
    })
  );
  return self.clients.claim();
});

function isIncluded(string, array) {
  var path;
  if (string.indexOf(self.origin) === 0) {
    path = string.substring(self.origin.length);
  } else {
    // for CDNs
    path = string;
  }
  //return array.indexOf(path) > -1;
  return array.includes(path) > -1;
}

var isGoogleFont = function (request) {
  return request.url.indexOf(GOOGLE_FONT_URL) === 0;
};

var cacheGFonts = function (request) {
  return fetch(request).then(function (newRes) {
    caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
      cache.put(request, newRes);
    });
    return newRes.clone();
  });
};

self.addEventListener("fetch", (event) => {
  var request = event.request;
  // console.log(request);

  // cacheOnly for statics assets
  if (isIncluded(request.url, STATIC_ASSETS)) {
    // return event.respondWith(caches.match(request));
    return caches.match(request).catch(function (err) {
      console.log(err);
    });
  }
  // Runtime or Dynamic cache for google fonts
  if (isGoogleFont(request)) {
    caches.match(request).then(function (res) {
      return res || cacheGFonts(request);
    });
  }
});

self.addEventListener("sync", (event) => {
  console.log("ldkdkdfkiie");
  console.log(event.tag);
  if (event.tag === BACKGROUND_SAVE_LOCALDB) {
    db.gettallNote()
      .then((resDb) => {
        return resDb;
      })
      .then((res) => {
        res.map((value) => {
          if (value.sync === false) {
            delete value.sync;
            AddNoteApi(value);
          }
        });
      });
  }

  if (event.tag === UPDATE_DBAPI) {
    GetAllNotes()
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        result.map((res) => {
          var isId = db.getoneNote(res._id);
          if (!isId) {
            DeleteOneNote(res._id);
          }
        });
      });
  }
});
self.addEventListener("notificationclick", function (e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action === "close") {
    notification.close();
  } else {
    clients.openWindow("http://www.toplearn.com");
    notification.close();
  }
});

self.addEventListener("push", (event) => {
  let payload = JSON.parse(event.data.text());
  // let payload = "nodata-nodata";

  console.log(payload);
  const options = {
    // body: payload.split("-")[0],
    body: payload.body,
    icon: "assets/images/icons/icon-96x96.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    // actions: [
    //   {
    //     action: "explore",
    //     title: "Go to the site",
    //     icon: "images/checkmark.png",
    //   },
    //   {
    //     action: "close",
    //     title: "Close the notification",
    //     icon: "images/xmark.png",
    //   },
    // ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
