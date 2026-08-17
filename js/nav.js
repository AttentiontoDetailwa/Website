/* Mobile nav toggle — the only interactive piece in this mockup. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });

  // Close the menu if the viewport grows back to desktop width.
  // Must match the drawer breakpoint in style.css (max-width: 1259px).
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1259) {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
