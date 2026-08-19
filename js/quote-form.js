/* Quote form — validation and the demo submit state.

   The form is one page of fields with no stepper and no length switch: it
   submits fine with this file absent, and everything below only sharpens the
   errors. Baymard's finding is that errors surfaced at the point of entry cost
   far fewer abandonments than a wall of them at submit, so a field that has
   already failed re-checks on input and clears itself the moment it's
   satisfied. On submit every field is checked in one pass, so the reader sees
   every gap at once rather than one per attempt. */
(function () {
  // Hooked by attribute, not id: on the one-page Starter build #quote is the
  // section the nav anchors to, so the form can't own that id.
  var form = document.querySelector('form[data-quote]');
  if (!form) return;

  /* ---- phone / email --------------------------------------------------- */

  /* Either one satisfies the requirement, and checkValidity only ever speaks
     for a single field, so the two are checked together and the message hangs
     on the wrapper they share rather than on whichever one got blamed. */
  var contactWrap = form.querySelector('[data-contact-group]');
  var contactPair = contactWrap ? Array.prototype.slice.call(contactWrap.querySelectorAll('input')) : [];
  var CONTACT_ERR = 'err-contact';
  var CONTACT_MSG = 'Give me a phone number or an email so I can reach you.';

  function contactGiven() {
    var filled = false;
    contactPair.forEach(function (control) {
      if (control.value.trim() !== '') filled = true;
    });
    return filled;
  }

  function showContactError() {
    if (!contactWrap) return;
    contactWrap.classList.add('field--invalid');
    var err = contactWrap.querySelector('#' + CONTACT_ERR);
    if (!err) {
      err = document.createElement('span');
      err.className = 'field__error';
      err.id = CONTACT_ERR;
      contactWrap.appendChild(err);
    }
    err.textContent = CONTACT_MSG;
    contactPair.forEach(function (control) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', CONTACT_ERR);
    });
  }

  /* Strips only what showContactError set: a malformed email carries its own
     error and its own describedby, and clearing the pair must leave it be. */
  function clearContactError() {
    if (!contactWrap) return;
    contactWrap.classList.remove('field--invalid');
    var err = contactWrap.querySelector('#' + CONTACT_ERR);
    if (err) err.remove();
    contactPair.forEach(function (control) {
      if (control.getAttribute('aria-describedby') === CONTACT_ERR) {
        control.removeAttribute('aria-describedby');
        control.removeAttribute('aria-invalid');
      }
    });
  }

  /* ---- validation ------------------------------------------------------ */

  // The field wrapper an error message belongs to. Checkbox groups live in a
  // fieldset, everything else in a .field.
  function holderFor(control) {
    return control.closest('fieldset') || control.closest('.field');
  }

  function messageFor(control) {
    if (control.tagName === 'SELECT') return 'Choose a city.';
    if (control.type === 'date') return 'Give me a preferred date.';
    if (control.type === 'time') {
      // rangeUnderflow/Overflow fire on the 8am-6pm clamp, and "this one's
      // needed" would be a confusing thing to say to someone who typed 7am.
      if (control.validity.rangeUnderflow || control.validity.rangeOverflow) {
        return 'I work 8am to 6pm — pick a time in there and I\'ll make it fit.';
      }
      return 'Give me a preferred time.';
    }
    if (control.type === 'email') return 'That email address looks incomplete.';
    return 'This one\'s needed.';
  }

  function showError(control, message) {
    var holder = holderFor(control);
    if (!holder) return;
    holder.classList.add('field--invalid');
    var err = holder.querySelector('.field__error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field__error';
      err.id = 'err-' + (control.id || control.name);
      holder.appendChild(err);
    }
    err.textContent = message;
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', err.id);
  }

  function clearError(control) {
    var holder = holderFor(control);
    if (!holder) return;
    holder.classList.remove('field--invalid');
    var err = holder.querySelector('.field__error');
    if (err) err.remove();
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  }

  /* Runs every control rather than stopping at the first, so one pass surfaces
     every gap. Returns the first that failed, to focus. */
  function firstBad() {
    var first = null;

    Array.prototype.slice.call(form.querySelectorAll('input, select, textarea')).forEach(function (control) {
      if (control.type === 'hidden' || control.disabled) return;
      // The pair is judged together below, not one field at a time.
      if (contactWrap && contactWrap.contains(control)) return;

      // checkValidity covers required-but-empty and out-of-range alike
      if (!control.checkValidity()) {
        showError(control, messageFor(control));
        if (!first) first = control;
      } else {
        clearError(control);
      }
    });

    if (contactWrap) {
      // A malformed email still has to be caught even when a phone number
      // means the pair itself is satisfied.
      var emailField = contactWrap.querySelector('input[type="email"]');
      if (emailField && !emailField.checkValidity()) {
        showError(emailField, messageFor(emailField));
        if (!first) first = emailField;
      } else if (emailField) {
        clearError(emailField);
      }

      if (!contactGiven()) {
        showContactError();
        if (!first) first = contactPair[0];
      } else {
        clearContactError();
      }
    }

    return first;
  }

  // Re-check a field that has already failed, so the error clears as soon as
  // it's fixed rather than at the next submit.
  form.addEventListener('input', function (e) {
    var control = e.target;
    if (!control.matches('input, select, textarea')) return;

    // Either one is all it takes, so the pair clears on the first character
    // typed into either of them.
    if (contactWrap && contactWrap.contains(control) &&
        contactWrap.classList.contains('field--invalid') && contactGiven()) {
      clearContactError();
    }

    var holder = holderFor(control);
    if (!holder || !holder.classList.contains('field--invalid')) return;
    if (control.checkValidity()) clearError(control);
  });

  /* Until the Formspree endpoint is pasted in, a real submit would post to a
     dead URL and show an error page — bad in a demo. Intercept only in that
     case and show the success state instead. Once the ID is real, this does
     nothing and the form posts normally. */
  form.addEventListener('submit', function (e) {
    var bad = firstBad();
    if (bad) {
      e.preventDefault();
      bad.focus();
      return;
    }
    if ((form.getAttribute('action') || '').indexOf('REPLACE_WITH_FORM_ID') === -1) return;
    e.preventDefault();
    form.innerHTML =
      '<div class="form-sent">' +
        '<p class="form-sent__label">Request sent</p>' +
        '<h2>Thanks — I\'ll be in touch within 24 hours.</h2>' +
        '<p>You\'ll get a confirmation and a final price before I start. Nothing is due now.</p>' +
        '<p class="form-sent__note">[Demo mode — paste the Formspree endpoint into the form\'s ' +
        'action attribute and this posts for real.]</p>' +
      '</div>';
  });
})();
