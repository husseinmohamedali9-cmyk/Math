/* push-sw.js — معالج الإشعارات (Push). حطه جنب sw.js، وفي أول sw.js اكتب:  importScripts('./push-sw.js');  */
self.addEventListener('push', function (event) {
  var d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch (e) { d = { body: event.data ? event.data.text() : '' }; }

  var title = d.title || 'جديد على الموقع';
  var job = fetch('./manifest.json', { cache: 'force-cache' })
    .then(function (r) { return r.json(); })
    .catch(function () { return {}; })
    .then(function (m) {
      var icons = (m && m.icons) || [];
      var best = icons.slice().sort(function (a, b) {
        return parseInt((b.sizes || '0').split('x')[0], 10) - parseInt((a.sizes || '0').split('x')[0], 10);
      })[0];
      var icon = d.icon || (best && best.src) || undefined;
      return self.registration.showNotification(title, {
        body: d.body || '',
        icon: icon,
        badge: icon,
        dir: 'rtl',
        lang: 'ar',
        tag: d.tag || 'site-update',
        renotify: true,
        data: { url: d.url || './' }
      });
    });
  event.waitUntil(job);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
