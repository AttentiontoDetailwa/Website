/* Count taps on the call button.

   This is the one conversion on the site that was invisible. A quote form
   submission lands on thanks.html and shows up as a pageview; a tap on a
   tel: link leaves the page for the dialer without ever asking the server
   for anything, so nothing recorded it and nobody could tell Ava how many
   calls her site produced.

   Delegated from the document rather than bound to each link, because the
   call button exists in four places — the header, the action rail, the
   contact card and the footer — and the rail is rebuilt on some pages.
   One listener covers every one of them and any added later.

   Capture phase on purpose. The click may navigate away, and gtag sends
   through sendBeacon where the browser supports it, so the event survives
   the page going away — but only if it was queued before navigation starts.

   Silent when gtag is absent, which is every local preview and every build
   made before the measurement ID was filled in. A script that throws in the
   console on a client's site is worse than one that does nothing. */
(function () {
  'use strict';

  document.addEventListener('click', function (event) {
    var el = event.target;
    if (!el || typeof el.closest !== 'function') return;

    var link = el.closest('a[href^="tel:"]');
    if (!link) return;

    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'call_click', {
      /* Where on the site the tap happened. This is the number that tells
         you whether the sticky rail earns its space or whether everyone
         calls from the contact page. */
      page_path: window.location.pathname,
      link_text: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    });
  }, true);
})();
