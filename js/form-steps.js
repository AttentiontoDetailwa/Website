/* Multi-step quote form.

   Progressive enhancement: the markup is one continuous form with three
   groups, and it submits fine with this file absent. Everything below only
   runs once the script does — the stepper and the Back/Next bar start hidden
   and are revealed here, so a JS failure degrades to the long form rather
   than to a form with two thirds of its fields missing.

   Each step validates before it will advance. Baymard's finding is that
   errors surfaced at the point of entry cost far fewer abandonments than a
   wall of them at submit, so a field that has already failed re-checks on
   input and clears itself the moment it's satisfied. */
(function () {
  // Hooked by attribute, not id: on the one-page Starter build #quote is the
  // section the nav anchors to, so the form can't own that id.
  var form = document.querySelector('form[data-steps]');
  if (!form) return;

  var groups  = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var stepper = document.getElementById('stepper');
  var nav     = document.getElementById('step-nav');
  var back    = document.getElementById('step-back');
  var next    = document.getElementById('step-next');
  var status  = document.getElementById('step-status');
  var foot    = form.querySelector('.form-foot');
  if (!groups.length || !stepper || !nav || !back || !next || !foot) return;

  var items = Array.prototype.slice.call(stepper.querySelectorAll('.stepper__item'));
  var LABELS = ['Your details', 'The vehicle', 'Scheduling & notes'];
  var current = 1;
  var furthest = 1;

  /* The submit lived in .form-foot, a separate block below the Back button, so
     the last step showed two disconnected buttons in two rows. Move it into the
     nav: every step then has one button row, and the last step swaps Next for
     the real submit. The reassurance line stays in the foot underneath. */
  var submitBtn = foot.querySelector('button');
  if (submitBtn) nav.appendChild(submitBtn);

  stepper.hidden = false;
  nav.hidden = false;

  /* ---- validation ------------------------------------------------------ */

  function controlsIn(step) {
    var g = groups[step - 1];
    return Array.prototype.slice.call(g.querySelectorAll('input, select, textarea'));
  }

  // The field wrapper an error message belongs to. Radio groups live in a
  // fieldset, everything else in a .field.
  function holderFor(control) {
    return control.closest('fieldset') || control.closest('.field');
  }

  function messageFor(control) {
    if (control.type === 'radio') return 'Pick one so I can price it.';
    if (control.tagName === 'SELECT') return 'Choose a city.';
    if (control.type === 'date') return 'Give me a preferred date.';
    if (control.type === 'time') return 'Give me a preferred time.';
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

  // A radio group is satisfied if any member is checked; the browser reports
  // every unchecked member as invalid, so check the group once via its name.
  function groupChecked(control) {
    return !!form.querySelector('input[name="' + control.name + '"]:checked');
  }

  function validate(step) {
    var seen = {};
    var firstBad = null;

    controlsIn(step).forEach(function (control) {
      if (control.type === 'radio') {
        if (seen[control.name]) return;
        seen[control.name] = true;
        var members = form.querySelectorAll('input[name="' + control.name + '"]');
        var isRequired = false;
        Array.prototype.forEach.call(members, function (m) { if (m.required) isRequired = true; });
        if (isRequired && !groupChecked(control)) {
          showError(control, messageFor(control));
          if (!firstBad) firstBad = control;
        } else {
          clearError(control);
        }
        return;
      }

      // checkValidity covers required-but-empty and malformed email alike
      if (!control.checkValidity()) {
        showError(control, messageFor(control));
        if (!firstBad) firstBad = control;
      } else {
        clearError(control);
      }
    });

    return firstBad;
  }

  /* ---- moving between steps -------------------------------------------- */

  function render(announce) {
    groups.forEach(function (g, i) { g.hidden = (i + 1) !== current; });

    items.forEach(function (item, i) {
      var n = i + 1;
      item.classList.toggle('is-current', n === current);
      item.classList.toggle('is-done', n < current);
      // Only steps already reached are navigable
      item.classList.toggle('is-available', n <= furthest);
      if (n === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });

    back.hidden = current === 1;
    var last = current === groups.length;
    next.hidden = last;
    // The submit sits in the nav row now, so it needs hiding directly —
    // hiding .form-foot no longer covers it.
    if (submitBtn) submitBtn.hidden = !last;
    foot.hidden = !last;
    if (!last) next.textContent = 'Next: ' + LABELS[current].toLowerCase();

    if (announce && status) {
      status.textContent = 'Step ' + current + ' of ' + groups.length + ' — ' + LABELS[current - 1];
    }
  }

  function goTo(step, focusHeading) {
    current = step;
    if (step > furthest) furthest = step;
    render(true);

    // Keep the top of the form in view; a step change that leaves the reader
    // mid-page reads as the page having jumped.
    var top = form.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: top, behavior: 'smooth' });

    if (focusHeading) {
      var heading = groups[step - 1].querySelector('.form-group__title');
      if (heading) heading.focus();
    }
  }

  next.addEventListener('click', function () {
    var bad = validate(current);
    if (bad) {
      bad.focus();
      if (status) status.textContent = 'Some fields still need an answer.';
      return;
    }
    if (current < groups.length) goTo(current + 1, true);
  });

  back.addEventListener('click', function () {
    if (current > 1) goTo(current - 1, true);
  });

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = parseInt(item.getAttribute('data-goto'), 10);
      if (!target || target === current) return;
      // Forward jumps still have to pass the steps in between
      if (target > current) {
        for (var s = current; s < target; s++) {
          var bad = validate(s);
          if (bad) { goTo(s, false); bad.focus(); return; }
        }
      }
      if (target <= furthest) goTo(target, true);
    });
  });

  // Re-check a field that has already failed, so the error clears as soon as
  // it's fixed rather than at the next Next.
  form.addEventListener('input', function (e) {
    var control = e.target;
    if (!control.matches('input, select, textarea')) return;
    var holder = holderFor(control);
    if (!holder || !holder.classList.contains('field--invalid')) return;
    if (control.type === 'radio' ? groupChecked(control) : control.checkValidity()) {
      clearError(control);
    }
  });



  /* Until the Formspree endpoint is pasted in, a real submit would post to a
     dead URL and show an error page — bad in a demo. Intercept only in that
     case and show the success state instead. Once the ID is real, this does
     nothing and the form posts normally. */
  form.addEventListener('submit', function (e) {
    var bad = validate(current);
    if (bad) { e.preventDefault(); bad.focus(); if (status) status.textContent = 'Some fields still need an answer.'; return; }
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

  // Deep links to the form (the header CTA is #quote-form) should land on
  // step 1 rather than wherever the reader left off.
  render(false);
})();
