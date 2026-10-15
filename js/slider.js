/* Photo slideshow: continuous auto-advance (~4s, loops forever), arrows, dots, swipe.
   Autoplay pauses only while a finger is down or a real mouse hovers; it always resumes.
   Reduce-Motion users keep autoplay (CSS makes the change an instant swap, no animation). */
(function () {
  'use strict';
  var root = document.querySelector('[data-slider]');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.slider-dot'));
  var live = root.querySelector('.slider-viewport');
  var INTERVAL = 4000, IDLE = 3000, idx = 0, timer = null, fingerDown = false, hovering = false;

  // iOS Safari may not load lazy images that sit in a hidden slide: load them all now
  slides.forEach(function (s) { var im = s.querySelector('img'); if (im) { im.loading = 'eager'; } });

  function show(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var on = i === idx;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
  }
  function schedule(ms) {
    if (timer) { clearTimeout(timer); }
    if (slides.length < 2) { return; }
    timer = setTimeout(tick, ms);
  }
  function tick() {
    timer = null;
    try {
      if (!document.hidden && !fingerDown && !hovering) { show(idx + 1); schedule(INTERVAL); }
      else { schedule(600); }
    } catch (err) { schedule(INTERVAL); }
  }
  function go(n) { show(n); schedule(IDLE); }

  root.querySelector('.slider-prev').addEventListener('click', function () { go(idx - 1); });
  root.querySelector('.slider-next').addEventListener('click', function () { go(idx + 1); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(idx - 1); } else if (e.key === 'ArrowRight') { go(idx + 1); }
  });

  // hover pause: real mouse only (iOS fires emulated mouseenter on tap and never mouseleave)
  if (window.PointerEvent) {
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; } });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; schedule(IDLE); } });
  }

  // swipe: paused only while the finger is down, resumes ~3s after it lifts
  var x0 = null, y0 = null;
  live.addEventListener('touchstart', function (e) {
    fingerDown = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  live.addEventListener('touchend', function (e) {
    var t = e.changedTouches && e.changedTouches[0];
    if (x0 !== null && t) {
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { show(idx + (dx < 0 ? 1 : -1)); }
    }
    x0 = null; fingerDown = false; schedule(IDLE);
  }, { passive: true });
  live.addEventListener('touchcancel', function () { x0 = null; fingerDown = false; schedule(IDLE); }, { passive: true });

  // restart whenever the page comes back (tab switch, app switch, back/forward cache)
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { fingerDown = false; schedule(INTERVAL); } });
  window.addEventListener('pageshow', function () { fingerDown = false; schedule(INTERVAL); });
  window.addEventListener('focus', function () { if (!timer) { schedule(INTERVAL); } });

  show(0);
  schedule(INTERVAL);
})();
