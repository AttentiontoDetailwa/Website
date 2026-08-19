/* Scroll reveals, all pages.

   The hidden state is applied from here, never from the stylesheet on its own,
   so the page is fully readable if this file never runs or the reader has
   asked for reduced motion. Nothing here moves layout — only opacity and a
   14px rise — so a reveal can never shift what is already on screen.

   This checks positions on scroll rather than using IntersectionObserver. IO
   is the tidier tool, but it only fires while the page is actually being
   rendered, so a tab restored in the background can come back with content
   still hidden. A scroll handler cannot fail that way: if the reader can
   scroll to it, the check has run. It is rAF-throttled and unbinds itself
   once everything has been shown. */
(function () {
  'use strict';

  var root = document.documentElement;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Block-level things worth announcing as you come to them. Deliberately not
     every paragraph — reveal everything and it reads as a page that cannot
     keep still. */
  var SELECTOR = [
    '.section-head', '.split__copy', '.frame', '.stat-row',
    '.price-tabs', '.price-card', '.addon', '.gallery figure', '.ba-card',
    '.city-list', '.map-placeholder', '.review', '.google-bar', '.marquee',
    '.cta-band .shell', '.page-banner__spec', '.page-banner__steps',
    '.page-banner__sheet', '.page-banner__card', '.checklist', '.footer-col'
  ].join(',');

  var nodes = [].slice.call(document.querySelectorAll(SELECTOR));
  if (!nodes.length) return;

  root.classList.add('has-reveal');

  /* Anything on screen at load is shown at once and never watched — a fade
     running on content the reader is already looking at reads as the page
     being slow, not as motion design. */
  var pending = [];
  var fold = window.innerHeight + 40;

  nodes.forEach(function (el) {
    if (el.getBoundingClientRect().top < fold) {
      el.classList.add('is-shown');
    } else {
      el.setAttribute('data-reveal', '');
      pending.push(el);
    }
  });

  if (!pending.length) return;

  var queued = false;

  function show(el, order) {
    /* Peers in the same row come in one after another rather than together.
       Capped, so a long gallery never holds its last tile back. */
    if (order > 0) el.style.transitionDelay = Math.min(order, 4) * 70 + 'ms';
    /* data-reveal stays on the element. Removing it here would drop the rule
       carrying the transition at the same moment the element is meant to
       start transitioning, so it would snap from 0 to 1 instead of fading.
       .is-shown wins on specificity, which is all that is needed. */
    el.classList.add('is-shown');
  }

  function check() {
    queued = false;
    /* Fires a little before the element reaches the bottom edge, so it has
       finished arriving by the time it is properly in view. */
    var line = window.innerHeight * 0.88;
    var shownThisPass = 0;
    var still = [];

    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      var box = el.getBoundingClientRect();
      /* Below the line, or scrolled past the top — the second case matters
         when the browser restores a scroll position on reload. */
      if (box.top < line || box.bottom < 0) {
        show(el, shownThisPass++);
      } else {
        still.push(el);
      }
    }

    pending = still;
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
    }
  }

  /* Throttled on a timer rather than requestAnimationFrame. rAF is the usual
     choice for scroll work, but it only runs while the page is being painted,
     so a tab that is restored in the background — or a browser that has
     paused rendering — can come back with content still hidden and no frame
     ever scheduled to reveal it. A 90ms timer always runs, the check is
     idempotent, and at this granularity the difference is invisible. */
  function onScroll() {
    if (queued) return;
    queued = true;
    window.setTimeout(check, 90);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  /* Late-loading images change where everything sits. */
  window.addEventListener('load', onScroll);

  /* The guarantee. Events are the fast path, but they are a path: a browser
     that has paused rendering delivers no scroll events, no animation frames
     and no IntersectionObserver callbacks, and content that is only ever
     revealed by an event stays invisible. I watched exactly that happen in a
     non-rendering preview — a whole page of cream with nothing on it.

     A timer does not care whether anything is being painted. It re-reads
     positions four times a second, reveals whatever has come into view, and
     clears itself the moment nothing is left. The cost is a handful of
     getBoundingClientRect calls on a list that only shrinks; the payoff is
     that hidden content cannot outlive the reader scrolling to it, whatever
     the browser is doing. */
  var sweep = window.setInterval(function () {
    check();
    if (!pending.length) window.clearInterval(sweep);
  }, 250);

  check();
})();
