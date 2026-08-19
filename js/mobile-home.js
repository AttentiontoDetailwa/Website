/* Home page, phone layout only. Both blocks this drives are display:none
   above 40em, so the work is skipped entirely on desktop. */
(function () {
  'use strict';

  /* --- hero drag-to-compare ------------------------------------------- */
  /* The range input is the control; the clip and the handle follow it. Touch
     drag, click-to-jump and arrow keys all come from the browser. */
  var range = document.getElementById('ba-range');
  if (range) {
    var clip = document.getElementById('ba-clip');
    var handle = document.getElementById('ba-handle');
    var paint = function () {
      clip.style.width = range.value + '%';
      handle.style.left = range.value + '%';
    };
    range.addEventListener('input', paint);
    paint();
  }

  /* --- pricing segmented control --------------------------------------- */
  var seg = document.querySelector('.price-tabs__seg');
  if (!seg) return;

  var CAR = '<path d="M9 24a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 9 24Zm35 0a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 44 24Z"/><path d="M19.8 24h24.2M3 24h6m46 0h6"/><path d="M4 21c1-5.5 3-8 6-8.6l9-5.2c2-1.2 4.3-1.6 6.6-1.2l14 2.6c2 .4 3.8 1.4 5.2 2.9l4.4 4.6 8 1.8c3 .7 4.8 2.5 4.8 5"/>';
  var SUV = '<path d="M11 24a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 11 24Zm31 0a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 42 24Z"/><path d="M21.8 24h20.2M3 24h8m42 0h8"/><path d="M4 21V13c0-1.6 1-3 2.6-3.4l12-3.2a10 10 0 0 1 4-.2l16 2.4c1.6.2 3 1 4 2.2l4.4 5 9 2c2.4.6 4 2.6 4 5v1"/><path d="M8 16h44"/>';
  var BIG = '<path d="M13 24a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 13 24Zm28 0a5.4 5.4 0 1 0 10.8 0A5.4 5.4 0 0 0 41 24Z"/><path d="M23.8 24h17.2M3 24h10m39 0h9"/><path d="M3 22V10a3 3 0 0 1 3-3h34a5 5 0 0 1 3.7 1.6l6.3 6.9 7 1.6a5 5 0 0 1 4 4.9V22"/><path d="M3 16h44"/>';

  var DATA = [
    { name: 'Car',                  amt: '$120', icon: CAR, fits: 'Sedans, coupes, compacts and hatchbacks.' },
    { name: 'Mid-size SUV / Truck', amt: '$140', icon: SUV, fits: 'Crossovers, two-row SUVs and pickups.' },
    { name: 'Large / 3-row',        amt: '$160', icon: BIG, fits: 'Full-size SUVs, minivans and three-row vehicles.' }
  ];

  var tabs  = Array.prototype.slice.call(seg.querySelectorAll('button'));
  var panel = document.getElementById('pt-panel');
  var name  = document.getElementById('pt-name');
  var amt   = document.getElementById('pt-amt');
  var fits  = document.getElementById('pt-fits');
  var icon  = document.getElementById('pt-icon');

  function show(i) {
    var d = DATA[i];
    tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
    name.textContent = d.name;
    amt.textContent  = d.amt;
    fits.textContent = d.fits;
    icon.innerHTML   = d.icon;
    panel.setAttribute('aria-labelledby', tabs[i].id);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (n < 0 || n >= tabs.length) return;
      e.preventDefault();
      tabs[n].focus();
      show(n);
    });
  });

  show(0);
})();
