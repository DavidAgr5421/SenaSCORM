// Service Worker para el Visor Virtual SCORM SENA
// Permite servir cursos SCORM descomprimidos en memoria sin requerir servidor backend ni almacenamiento.

const CACHE_NAME = 'scorm-virtual-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

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
                if (response) return response;

                // 1. Intentar busqueda alternativa en minusculas
                response = await cache.match(cleanUrl.toLowerCase());
                if (response) return response;

                // 2. Intentar alternar extension .json / .JSON
                if (cleanUrl.endsWith('.JSON')) {
                    response = await cache.match(cleanUrl.slice(0, -5) + '.json');
                    if (response) return response;
                } else if (cleanUrl.endsWith('.json')) {
                    response = await cache.match(cleanUrl.slice(0, -5) + '.JSON');
                    if (response) return response;
                }

                // 3. Si termina sin extension, probar /index.html
                if (!cleanUrl.includes('.')) {
                    response = await cache.match(cleanUrl + '/index.html');
                    if (response) return response;
                }

                // 4. Buscar recorriendo todas las keys si hubo variacion de mayusculas en directorios
                const keys = await cache.keys();
                const cleanLower = cleanUrl.toLowerCase();
                const matchedKey = keys.find(k => k.url.toLowerCase() === cleanLower);
                if (matchedKey) {
                    response = await cache.match(matchedKey);
                    if (response) return response;
                }

                // Fallbacks seguros segun tipo de archivo para no romper parsers
                if (cleanLower.endsWith('.json')) {
                    return new Response('{}', {
                        status: 200,
                        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                    });
                }

                if (cleanLower.endsWith('.js')) {
                    return new Response('/* script no encontrado */', {
                        status: 200,
                        headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
                    });
                }

                return new Response('/* Recurso no encontrado en paquete virtual */', {
                    status: 200,
                    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
                });
            })()
        );
    }
});
