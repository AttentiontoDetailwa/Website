/* Keep the lead when the form is abandoned.

   The quote form is two steps: who you are, then the car and the appointment.
   Somebody who fills in a name and a number and then leaves has told Ava
   everything she actually needs to call them back — and until now that was
   thrown away the moment the tab closed.

   navigator.sendBeacon exists for exactly this. It queues a POST that the
   browser delivers during page teardown, so it survives the tab closing, the
   phone locking and the back button in a way a normal fetch does not.

   WHAT STOPS THIS BURYING HER. She is one person checking her phone between
   jobs, and an inbox full of half-leads is worse than no leads because the real
   ones get lost in them. Four rules:

     1. Nothing sends unless there is a name AND a phone or an email. Anything
        less is not a lead, it is noise with a name on it.
     2. Once per visit. A flag in sessionStorage, checked before every send.
     3. It posts to its own Netlify form, "quote-partial", so these land in a
        separate pile from real bookings rather than mixed in with them.
     4. On a phone, visibilitychange fires every time somebody glances at a
        text message. So a tab-away starts a 60 second clock and cancels it if
        they come back. Only pagehide - actually leaving - sends immediately.

   And it never fires after a real submit: the submit handler sets `done`, so a
   completed booking cannot also arrive as a fragment of itself. */
(function () {
  'use strict';

  var form = document.querySelector('form[data-quote]');
  if (!form || !navigator.sendBeacon) return;

  var KEY = 'atd-partial-sent';
  var done = false;
  var timer = null;

  function already() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
  }

  function value(name) {
    var el = form.elements[name];
    return el && el.value ? el.value.trim() : '';
  }

  function send() {
    if (done || already()) return;

    var name = value('name');
    var phone = value('phone');
    var email = value('email');

    /* The gate. A name on its own is not something she can act on. */
    if (!name || (!phone && !email)) return;

    var body = new URLSearchParams();
    body.set('form-name', 'quote-partial');
    body.set('name', name);
    body.set('phone', phone);
    body.set('email', email);
    /* Whatever else they got as far as, so a partial that is nearly a booking
       reads differently from one that is just a name. */
    ['vehicle', 'date', 'time', 'address', 'city', 'notes'].forEach(function (f) {
      var v = value(f);
      if (v) body.set(f, v);
    });
    body.set('reached', value('vehicle') ? 'step 2' : 'step 1');

    var ok = navigator.sendBeacon(
      window.location.pathname,
      new Blob([body.toString()], { type: 'application/x-www-form-urlencoded' })
    );
    if (ok) remember();
  }

  /* A real submit wins. Set before the POST leaves so there is no window in
     which both fire. Also stash who they are for the add-on offer on
     thanks.html, which otherwise has no idea who just booked - the form posts
     and Netlify redirects, and nothing survives that trip. */
  form.addEventListener('submit', function () {
    done = true;
    if (timer) clearTimeout(timer);
    try {
      sessionStorage.setItem('atd-booked', JSON.stringify({
        name: value('name'), phone: value('phone'), email: value('email')
      }));
    } catch (e) {}
  });

  /* Leaving for real. */
  window.addEventListener('pagehide', send);

  /* Switched away. Sixty seconds of still being gone is somebody who left;
     eight seconds is somebody reading a text. */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      timer = setTimeout(send, 60000);
    } else if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });
})();
