/* =====================================================================
   pwa.js - Progressive Web App setup
   Generates a manifest + service worker at runtime with graceful
   fallback for sandboxed previews / iframes / file:// protocol.
   ===================================================================== */

function initPWA() {
    try {
        const manifestObj = {
            "name": "HIM Media Crew Portal",
            "short_name": "HIM Media",
            "description": "Heartfelt International Ministries Media Department Portal",
            "start_url": window.location.href,
            "display": "standalone",
            "background_color": "#090d16",
            "theme_color": "#6366f1",
            "icons": [
                {
                    "src": "CTF (1).png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ]
        };
        const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(manifestBlob);
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = manifestURL;
        document.head.appendChild(manifestLink);

        // Guard rails to prevent errors inside sandboxed previews/iframes
        const isIframe = window.self !== window.top;
        const isSandboxedHost = window.location.hostname.includes('usercontent.goog') ||
            window.location.hostname.includes('webcontainer.io') ||
            window.location.protocol === 'file:';

        if ('serviceWorker' in navigator && !isIframe && !isSandboxedHost) {
            const swCode = `
                const CACHE_NAME = 'him-media-v2';
                self.addEventListener('install', (e) => self.skipWaiting());
                self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
                self.addEventListener('fetch', (e) => {
                    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
                });
            `;
            const swBlob = new Blob([swCode], { type: 'application/javascript' });
            const swURL = URL.createObjectURL(swBlob);
            navigator.serviceWorker.register(swURL).catch(e => console.warn(e));
        }
    } catch (e) {
        console.warn('PWA setup ignored:', e);
    }

    // PWA Installer Trigger
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.classList.remove('hidden');
    });

    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        });
    }
}
