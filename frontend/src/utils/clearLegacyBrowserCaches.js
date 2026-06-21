export async function clearLegacyBrowserCaches() {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch {
      // Ignore browser-specific service worker failures.
    }
  }

  if ("caches" in window) {
    try {
      const cacheNames = await window.caches.keys();
      const legacyCaches = cacheNames.filter((name) =>
        /ghostel|workbox|precache|runtime/i.test(name),
      );
      await Promise.all(legacyCaches.map((name) => window.caches.delete(name)));
    } catch {
      // Ignore cache API failures in older mobile browsers.
    }
  }
}
