// Mobile menu + article category filter
(function () {
  var toggle = document.querySelector('.nav-toggle');
  function label(open) { var th = open ? 'ปิดเมนู' : 'เปิดเมนู'; return window.I18N ? window.I18N.t(th) : th; }
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', label(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('#article-list [data-category]');
  var empty = document.querySelector('.empty-state');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var shown = 0;
      cards.forEach(function (c) {
        var match = f === 'all' || c.getAttribute('data-category') === f;
        c.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    });
  });

  var y = document.getElementById('year');
  function setYear() { if (y) y.textContent = new Date().getFullYear() + (document.documentElement.lang === 'en' || document.documentElement.lang === 'ja' ? 0 : 543); }
  setYear();
  document.addEventListener('i18n:change', function () {
    setYear();
    if (toggle && nav) toggle.setAttribute('aria-label', label(nav.classList.contains('is-open')));
  });
})();
