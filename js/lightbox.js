/* Photo lightbox — click any content photo to open it full size.

   Nothing is wired up in the markup: this walks <main> on load and promotes
   every real photo to a button. Excluded on purpose:
     · anything inside .hero — the home page showcase is a composed layout
     · aria-hidden images — the gallery banner collage repeats photos that
       already appear (and open) further down the page
   With JS off the page is unchanged, which is the same deal form-steps.js
   makes with the quote form. */
(function () {
  var photos = [].slice.call(document.querySelectorAll('#main img')).filter(function (img) {
    return !img.closest('.hero') &&
           !img.closest('[aria-hidden="true"]') &&
           img.getAttribute('aria-hidden') !== 'true';
  });
  if (!photos.length) return;

  var index = 0;

  /* --- Caption ----------------------------------------------------------- */
  /* The visible figcaption if the photo has one ("Before — mats & pedals"),
     otherwise the alt text, which is written as a description on this site. */
  function tidy(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function captionFor(img) {
    var fig = img.closest('figure');
    var cap = fig && fig.querySelector('figcaption');
    if (!cap) return img.getAttribute('alt') || '';

    /* The before/after cards stack a heading over a vehicle name with no
       punctuation between them, so run them together with a dash rather
       than letting "…door panel Chrysler 300" out the door. */
    var parts = [].slice.call(cap.children).map(function (child) {
      return tidy(child.textContent);
    }).filter(Boolean);

    var text = parts.length > 1 ? parts.join(' — ') : tidy(cap.textContent);
    return text || img.getAttribute('alt') || '';
  }

  /* --- Overlay ----------------------------------------------------------- */
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.innerHTML =
    '<div class="lightbox__backdrop" data-close></div>' +
    '<div class="lightbox__dialog" role="dialog" aria-modal="true" aria-label="Photo viewer">' +
      '<button class="lightbox__close" type="button" data-close aria-label="Close photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' +
      '</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>' +
      '</button>' +
      '<p class="lightbox__count" aria-live="polite"></p>' +
    '</div>';
  document.body.appendChild(box);

  var dialog  = box.querySelector('.lightbox__dialog');
  var full    = box.querySelector('.lightbox__img');
  var caption = box.querySelector('.lightbox__caption');
  var count   = box.querySelector('.lightbox__count');
  var prevBtn = box.querySelector('.lightbox__nav--prev');
  var nextBtn = box.querySelector('.lightbox__nav--next');
  var closeBtn = box.querySelector('.lightbox__close');

  var single = photos.length < 2;
  prevBtn.hidden = single;
  nextBtn.hidden = single;
  count.hidden = single;

  /* --- Show / move / close ------------------------------------------------ */
  function show(i) {
    index = (i + photos.length) % photos.length;
    var img = photos[index];
    var text = captionFor(img);

    full.src = img.currentSrc || img.src;
    full.alt = img.getAttribute('alt') || '';
    caption.textContent = text;
    caption.hidden = !text;
    count.textContent = (index + 1) + ' of ' + photos.length;
  }

  function open(i) {
    show(i);
    box.hidden = false;
    document.documentElement.classList.add('has-lightbox');
    closeBtn.focus();
  }

  /* Focus lands on the photo you were last looking at, not the one you
     opened — after arrowing through the set, that's where the page is. */
  function close() {
    box.hidden = true;
    document.documentElement.classList.remove('has-lightbox');
    full.removeAttribute('src');
    photos[index].focus();
  }

  /* --- Triggers ----------------------------------------------------------- */
  photos.forEach(function (img, i) {
    img.classList.add('is-viewable');
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.setAttribute('title', 'View photo');

    img.addEventListener('click', function () { open(i); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        open(i);
      }
    });
  });

  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });

  box.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;

    if (e.key === 'Escape')     { close(); return; }
    if (single) return;
    if (e.key === 'ArrowLeft')  { show(index - 1); return; }
    if (e.key === 'ArrowRight') { show(index + 1); }
  });

  /* Keep Tab inside the overlay while it's open. */
  dialog.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    var stops = [].slice.call(dialog.querySelectorAll('button')).filter(function (b) {
      return !b.hidden;
    });
    var first = stops[0];
    var last = stops[stops.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
