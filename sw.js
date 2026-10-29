// Service Worker para el Visor Virtual SCORM SENA
// Permite servir cursos SCORM descomprimidos en memoria sin requerir servidor backend ni almacenamiento.

const CACHE_NAME = 'scorm-virtual-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Tipos MIME comunes
function getMimeType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const mimeMap = {
        'html': 'text/html; charset=utf-8',
        'htm': 'text/html; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'json': 'application/json; charset=utf-8',
        'css': 'text/css; charset=utf-8',
        'xml': 'application/xml; charset=utf-8',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
        'eot': 'application/vnd.ms-fontobject'
    };
    return mimeMap[ext] || 'application/octet-stream';
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Solo interceptar peticiones destinadas a la zona virtual /scorm-virtual/
    if (url.pathname.includes('/scorm-virtual/')) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                
                // Normalizar URL eliminando query parameters para busqueda exacta
                let cleanUrl = url.origin + url.pathname;
                
                // Si la peticion termina en barra "/", buscar el index.html correspondiente
                if (cleanUrl.endsWith('/')) {
                    cleanUrl += 'index.html';
                }

                let response = await cache.match(cleanUrl);
                if (response) {
                    return response;
                }

                // Intentar busqueda alternativa si termina sin extension
                if (!cleanUrl.includes('.')) {
                    response = await cache.match(cleanUrl + '/index.html');
                    if (response) return response;
                }

                // Fallback para etiquetas de audio vacias o rutas no encontradas
                return new Response('/* Recurso no encontrado en paquete virtual */', {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
                });
            })()
        );
    }
});
