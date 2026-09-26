const CACHE = 'fitos-v1'
const STATIC = [
  '/',
  '/home',
  '/workout',
  '/exercises',
  '/programs',
  '/progress',
  '/coach',
  '/manifest.json',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Skip non-GET, cross-origin, and API requests
  if (request.method !== 'GET') return
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return

  // Network-first for navigation, cache-first for assets
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => { caches.open(CACHE).then(c => c.put(request, res.clone())); return res })
        .catch(() => caches.match('/home') ?? caches.match('/'))
    )
  } else {
    e.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request))
    )
  }
})
