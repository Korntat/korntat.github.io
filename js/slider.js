/* Photo slideshow: auto-advance, arrows, dots, swipe, pause on hover/focus/touch, reduced-motion safe */
(function () {
  'use strict';
  var root = document.querySelector('[data-slider]');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.slider-dot'));
  var live = root.querySelector('.slider-viewport');
  var INTERVAL = 5000, idx = 0, timer = null, paused = false;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var on = i === idx;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (reduce || paused || slides.length < 2) return;
    timer = setInterval(function () { show(idx + 1); }, INTERVAL);
  }
  function pause() { paused = true; stop(); live.setAttribute('aria-live', 'polite'); }
  function resume() { paused = false; live.setAttribute('aria-live', 'off'); start(); }
  function go(n) { show(n); start(); }

  root.querySelector('.slider-prev').addEventListener('click', function () { go(idx - 1); });
  root.querySelector('.slider-next').addEventListener('click', function () { go(idx + 1); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
  root.addEventListener('mouseenter', pause);
  root.addEventListener('mouseleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) resume(); });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(idx - 1); } else if (e.key === 'ArrowRight') { go(idx + 1); }
  });

  // swipe (touch / pen); pauses while the finger is down and for a few seconds after
  var x0 = null, y0 = null, resumeT = null;
  live.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; clearTimeout(resumeT); pause();
  }, { passive: true });
  live.addEventListener('touchend', function (e) {
    if (x0 !== null) {
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
    }
    x0 = null;
    resumeT = setTimeout(resume, 4000);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  show(0);
  start();
})();
