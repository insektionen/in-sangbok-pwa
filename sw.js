// Path to all static assests that will be stored in chache
const staticAssets = [
    './',
    './style.css',
    './app.js',
    './utils.js',
    './themes/in-sangbok-pwa.min.css',
    './themes/jquery-1.11.1.min.js',
    './themes/jquery.mobile-1.4.5.min.js',
    './themes/jquery.mobile.icons.min.css',
    './themes/jquery.mobile.structure-1.4.5.min.css'
];

// When installing the application it will cache the static assets.
self.addEventListener('install', async event => {
    const cache = await caches.open('sangbok-static');
    cache.addAll(staticAssets);
    console.log("install");
});

// When fetching it will either load from cache or newtork. If online it will load from online etc.
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === location.origin) {
        event.respondWith(cacheFirst(req));
    } else {
        event.respondWith(networkFirst(req));
    }

});

// When loading from cache it will check if it can load from network.
async function cacheFirst(req) {
    const cachedResponse = await caches.match(req);
    return cachedResponse || fetch(req);
}

// It will store xml in cache.
async function networkFirst(req) {
    const cache = await caches.open('sangbok-dynamic');

    try {
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
    } catch (error) {
        return await chaches.match(req);
    }
}