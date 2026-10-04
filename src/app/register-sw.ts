/**
 * Registro del service worker (PWA) y solicitud de almacenamiento persistente.
 * Se ejecuta una sola vez al cargar la app.
 */
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

// Reduce el riesgo de que el navegador descarte los datos (IndexedDB) por
// presión de espacio. Es una petición: el navegador puede rechazarla.
if (typeof navigator.storage?.persist === 'function') {
  void navigator.storage.persist().catch(() => undefined);
}
