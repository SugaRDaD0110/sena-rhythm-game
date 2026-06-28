const CACHE_NAME = "sena-rhythm-game-v1";

// sena_song.mp3 또는 이미지가 바뀌면 CACHE_NAME의 버전을 올려야 새 파일이 반영됩니다.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/images/start_screen.png",
  "./assets/images/result_clear.png",
  "./assets/images/result_miss.png",
  "./assets/images/gameplay_background.png",
  "./assets/images/icons/app-icon-192.png",
  "./assets/images/icons/app-icon-512.png",
  "./assets/images/icons/apple-touch-icon.png",
  "./assets/music/sena_song.mp3"
];

// 나중에 assets/images/ui/ 안의 PNG를 실제 코드에서 사용하면 여기에 추가하세요.
const OPTIONAL_UI_ASSETS = [
  // "./assets/images/ui/example.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => Promise.all(
        OPTIONAL_UI_ASSETS.map((url) => cache.add(url).catch(() => undefined))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  // 일부 브라우저는 음악 재생 때 Range 요청을 보냅니다. 이 요청은 네트워크에 맡겨 재생 안정성을 우선합니다.
  if (request.headers.has("range")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => cachedResponse || fetch(request))
      .catch(() => {
        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      })
  );
});
