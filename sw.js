// ASC北大阪 アマゾン発送状況 — ホーム画面アプリ用（Service Worker）
// ・アプリ本体（このサイトのファイル）は「まずネットから最新を取り、つながらないときだけ保存分」を使う
// ・React / Firebase の読み込みファイル（バージョン固定）は保存分を使って起動を速くする
// ・Firestore の通信（データ）には一切さわらない
const CACHE = "asc-kitaosaka-v1";
const LIBS = ["https://unpkg.com/", "https://www.gstatic.com/firebasejs/"];

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = req.url;
  if (LIBS.some(p => url.startsWith(p))) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  if (new URL(url).origin === self.location.origin) {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./"))));
  }
});
