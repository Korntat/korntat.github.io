/* Language switcher: Thai (source HTML, default), English, Japanese.
   The page HTML stays Thai so search engines index Thai. For en/ja the Thai text is replaced in the browser
   using a dictionary (js/i18n-dict.js, plus js/i18n-article.js on article pages) that is only loaded when needed.
   Keys are the Thai texts with all whitespace removed. Entry = [en, ja, flags]; flags: o = keep the Thai original as a
   small line under the translation (Thai-language publications), f = replace the whole element, j = drop whitespace in ja. */
(function () {
  'use strict';
  var STORE = 'site-lang', LANGS = ['th', 'en', 'ja'];
  var script = document.currentScript || document.querySelector('script[src*="i18n.js"]');
  var src = script ? script.getAttribute('src') : 'js/i18n.js';
  var base = src.replace(/[^\/]*$/, ''), ver = (src.split('?')[1] || '');
  var html = document.documentElement;
  var D = {}, reg = [], cur = 'th', loading = {}, applied = 'th';
  var TH = /[\u0e00-\u0e7f]/;
  var MON = { 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };
  var EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function norm(s) { return s.replace(/\s+/g, ''); }

  function add(obj) { for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) D[norm(k)] = obj[k]; } }

  // ---- translation of one text (dictionary, then date / year rules) ----
  function one(t, lang) {
    var e = D[norm(t)], i = lang === 'en' ? 0 : 1, m;
    if (e) return { s: e[i], f: e[2] || '' };
    t = t.trim();
    if ((m = t.match(/^(\d{1,2})\s*(\S+?)\s*(25\d\d)$/)) && MON[m[2]]) {
      var y = +m[3] - 543, mo = MON[m[2]];
      return { s: lang === 'en' ? (+m[1]) + ' ' + EN_MON[mo - 1] + ' ' + y : y + '年' + mo + '月' + (+m[1]) + '日', f: '' };
    }
    if ((m = t.match(/^พ\.ศ\.\s*(25\d\d)\s*[–-]\s*(ปัจจุบัน|25\d\d)$/))) {
      var a = +m[1] - 543, b = m[2] === 'ปัจจุบัน' ? null : +m[2] - 543;
      return { s: lang === 'en' ? a + ' – ' + (b === null ? 'present' : b) : a + '年~' + (b === null ? '現在' : b + '年'), f: '' };
    }
    if ((m = t.match(/^25\d\d$/))) return { s: String(+t - 543), f: '' };
    return null;
  }
  function tr(t, lang) {
    var r = one(t, lang);
    if (r) return r;
    if (t.indexOf('·') > -1) {           // "date · category · co-author" style lines
      var parts = t.split('·'), out = [];
      for (var k = 0; k < parts.length; k++) { var p = one(parts[k], lang); if (!p) return null; out.push(p.s); }
      return { s: out.join(' · '), f: '' };
    }
    return null;
  }
  // exposed helper for scripts (menu label etc.): Thai text in, text for the current language out
  function t(th) { if (cur === 'th') return th; var r = tr(th, cur); return r ? r.s : th; }

  // ---- DOM walk ----
  function origSpan(text) {
    var s = document.createElement('span');
    s.className = 'i18n-orig'; s.lang = 'th'; s.textContent = text.trim(); return s;
  }
  function setAttr(el, name) {
    var v = el.getAttribute(name);
    if (!v || !TH.test(v)) return;
    var r = tr(v, cur);
    if (r) { reg.push({ k: 'at', el: el, name: name, val: v }); el.setAttribute(name, r.s); }
  }
  function applyEl(el, r) {
    var old = el.innerHTML, th = el.textContent;
    reg.push({ k: 'el', el: el, html: old });
    if (r.s.indexOf('<') > -1) el.innerHTML = r.s; else el.textContent = r.s;
    if (r.f.indexOf('o') > -1) el.appendChild(origSpan(th));
  }
  function applyText(node, r) {
    var d = node.data, lead = (d.match(/^\s*/) || [''])[0], trail = (d.match(/\s*$/) || [''])[0];
    if (cur === 'ja' && r.f.indexOf('j') > -1) { lead = ''; trail = ''; }
    reg.push({ k: 'tx', node: node, data: d });
    node.data = lead + r.s + trail;
    if (r.f.indexOf('o') > -1 && node.parentNode) {
      var sp = origSpan(d); node.parentNode.insertBefore(sp, node.nextSibling);
      reg.push({ k: 'ins', node: sp });
    }
  }
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, svg: 1, SVG: 1, TEXTAREA: 1 };
  function visit(el) {
    if (SKIP[el.tagName] || el.hasAttribute('data-i18n-skip') || el.classList.contains('i18n-orig')) return;
    var txt = el.textContent;
    if (!TH.test(txt)) return;
    var r = tr(txt, cur);
    if (r && !el.querySelector('img,picture,video,iframe,canvas') && (!el.children.length || r.s.indexOf('<') > -1 || r.f.indexOf('f') > -1)) { applyEl(el, r); return; }
    var kids = Array.prototype.slice.call(el.childNodes);
    for (var i = 0; i < kids.length; i++) {
      var n = kids[i];
      if (n.nodeType === 1) visit(n);
      else if (n.nodeType === 3 && TH.test(n.data)) { var x = tr(n.data, cur); if (x) applyText(n, x); }
    }
  }
  function applyAll() {
    var body = document.body;
    var els = body.querySelectorAll('[alt],[aria-label],[title]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].closest('[data-i18n-skip]')) continue;
      setAttr(els[i], 'alt'); setAttr(els[i], 'aria-label'); setAttr(els[i], 'title');
    }
    visit(body);
    var tt = tr(document.title, cur);
    if (tt) { reg.push({ k: 'dt', val: document.title }); document.title = tt.s; }
    var md = document.querySelector('meta[name="description"]');
    if (md) { var dd = tr(md.getAttribute('content') || '', cur); if (dd) { reg.push({ k: 'md', el: md, val: md.getAttribute('content') }); md.setAttribute('content', dd.s); } }
  }
  function restore() {
    for (var i = reg.length - 1; i >= 0; i--) {
      var x = reg[i];
      if (x.k === 'ins') { if (x.node.parentNode) x.node.parentNode.removeChild(x.node); }
      else if (x.k === 'tx') x.node.data = x.data;
      else if (x.k === 'el') x.el.innerHTML = x.html;
      else if (x.k === 'at') x.el.setAttribute(x.name, x.val);
      else if (x.k === 'dt') document.title = x.val;
      else if (x.k === 'md') x.el.setAttribute('content', x.val);
    }
    reg = [];
  }

  // ---- loading dictionaries (only for en / ja) ----
  function load(file, cb) {
    if (loading[file] === 2) return cb();
    if (loading[file]) { loading[file].push(cb); return; }
    loading[file] = [cb];
    var s = document.createElement('script');
    s.src = base + file + (ver ? '?' + ver : '');
    s.onload = s.onerror = function () { var q = loading[file]; loading[file] = 2; q.forEach(function (f) { f(); }); };
    document.head.appendChild(s);
  }
  function needFiles() { return ['i18n-dict.js'].concat(location.pathname.indexOf('/articles/') > -1 ? ['i18n-article.js'] : []); }

  function paint() {
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === cur ? 'true' : 'false'); });
    html.classList.remove('i18n-wait');
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: cur } }));
  }
  function setLang(l, persist) {
    if (LANGS.indexOf(l) < 0) l = 'th';
    cur = l; html.lang = l;
    if (persist !== false) { try { localStorage.setItem(STORE, l); } catch (e) {} }
    if (l === 'th') { restore(); applied = 'th'; paint(); return; }
    var files = needFiles(), left = files.length;
    files.forEach(function (f) {
      load(f, function () {
        if (--left) return;
        if (cur !== l) return;       // user switched again while loading
        restore(); applyAll(); applied = l; paint();
      });
    });
  }

  window.I18N = { add: add, t: t, set: setLang, get: function () { return cur; } };

  function init() {
    var l = 'th', q = (location.search.match(/[?&]lang=(th|en|ja)\b/) || [])[1];
    try { l = q || localStorage.getItem(STORE) || 'th'; } catch (e) { l = q || 'th'; }
    if (q) { try { localStorage.setItem(STORE, q); } catch (e) {} }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.lang-btn');
      if (!b) return;
      setLang(b.getAttribute('data-lang'));
      var nav = document.getElementById('site-nav'), tg = document.querySelector('.nav-toggle');
      if (nav && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); if (tg) tg.setAttribute('aria-expanded', 'false'); }
    });
    setLang(l, false);
    setTimeout(function () { html.classList.remove('i18n-wait'); }, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
