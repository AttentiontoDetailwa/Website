/* The add-on offer on the thanks page.

   The booking is already in. This asks the one question that was taken off the
   form, at the moment it costs nothing to answer.

   The only hard part is knowing who is standing here. The quote form posts to
   Netlify and Netlify redirects, and nothing survives that trip - no query
   string, no referrer worth trusting. So quote-form's sibling script stashes
   the name and number in sessionStorage on submit and this reads them back.

   When the stash is there the form is two taps: pick, send. When it is not -
   somebody who bookmarked this page, or came back in a new tab - it asks for a
   phone number instead of guessing, because an add-on request Ava cannot match
   to a booking is worse than no add-on request. */
(function () {
  'use strict';

  var form = document.querySelector('form[data-addons]');
  if (!form) return;

  var booked = null;
  try { booked = JSON.parse(sessionStorage.getItem('atd-booked') || 'null'); } catch (e) {}

  var known = booked && (booked.phone || booked.email);

  if (known) {
    form.elements['name'].value = booked.name || '';
    form.elements['phone'].value = booked.phone || '';
    form.elements['email'].value = booked.email || '';
  } else {
    /* No stash: reveal the fallback field and make it required. It is hidden
       and non-required in the markup so that the common path never sees it. */
    var ask = form.querySelector('[data-addons-ask]');
    if (ask) {
      ask.hidden = false;
      var input = ask.querySelector('input');
      if (input) input.required = true;
    }
  }

  /* Nothing to send is not a submission. Without this the button posts an
     empty request every time somebody taps it out of curiosity. */
  form.addEventListener('submit', function (e) {
    var any = form.querySelectorAll('input[name="addons"]:checked').length;
    if (!any) {
      e.preventDefault();
      var note = form.querySelector('[data-addons-note]');
      if (note) note.hidden = false;
    }
  });
})();
