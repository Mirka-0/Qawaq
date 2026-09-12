// Service Worker for Qawaq Push Notifications
const CACHE_NAME = 'qawaq-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push events
self.addEventListener('push', (event) => {
  let data = {
    title: 'Qawaq // Alerta de Seguridad',
    body: 'Nueva incidencia detectada en obra.',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'qawaq-alert',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.svg',
    badge: data.badge || '/logo.svg',
    tag: data.tag || 'qawaq-push',
    data: data.data || {},
    vibrate: data.vibrate || [300, 100, 300, 100, 300],
    requireInteraction: true,
    actions: data.actions || [
      { action: 'view', title: 'Ver Incidencia' },
      { action: 'dismiss', title: 'Entendido' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click: focus or open app and dispatch navigation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickData = event.notification.data || {};
  const targetUrl = clickData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post a message
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: clickData,
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for messages from the client (e.g. for background notifications or scheduled alerts)
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'TRIGGER_NOTIFICATION') {
    const options = {
      body: payload.body,
      icon: payload.icon || '/logo.svg',
      badge: payload.badge || '/logo.svg',
      tag: payload.tag || `qawaq-${Date.now()}`,
      data: payload.data || {},
      vibrate: payload.vibrate || [200, 100, 200],
      requireInteraction: payload.requireInteraction ?? false,
      actions: payload.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }

  if (type === 'SCHEDULE_BACKGROUND_NOTIFICATION') {
    const delayMs = payload.delayMs || 5000;
    setTimeout(() => {
      const options = {
        body: payload.body,
        icon: payload.icon || '/logo.svg',
        badge: payload.badge || '/logo.svg',
        tag: payload.tag || `qawaq-bg-${Date.now()}`,
        data: payload.data || {},
        vibrate: payload.vibrate || [300, 150, 300],
        requireInteraction: true,
        actions: payload.actions || [
          { action: 'view', title: 'Abrir Qawaq' }
        ],
      };
      self.registration.showNotification(payload.title, options);
    }, delayMs);
  }
});
