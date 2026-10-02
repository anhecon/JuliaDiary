/* Router and navigation. Sections are addressed by bare hash tokens (#pulse, #herbs …). */
(function () {
  'use strict';
  var TCM = window.TCM;
  var ORDER = ['home', 'clinic', 'treat', 'pharmacy', 'tongue', 'pulse', 'points', 'herbs', 'formulas', 'elements'];
  var current = null;
  var view = document.getElementById('view');
  var nav = document.getElementById('nav');

  function renderNav(active) {
    nav.innerHTML = ORDER.map(function (id) {
      var m = TCM.modules[id];
      if (!m) return '';
      return '<a class="drawer" href="#' + id + '"' + (id === active ? ' aria-current="page"' : '') + '>' +
        '<span class="drawer-glyph" lang="zh-Hans">' + m.han + '</span>' +
        '<span class="drawer-label"><b>' + TCM.L(m.title) + '</b><small>' + TCM.L(m.sub) + '</small></span>' +
        '<span class="drawer-pull" aria-hidden="true"></span></a>';
    }).join('');
  }

  function syncLangButtons() {
    var lang = TCM.store.lang();
    document.documentElement.lang = lang;
    TCM.$$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    var sub = TCM.$('[data-i18n="brandSub"]');
    if (sub) sub.textContent = TCM.tx('Practice Lab · 中医 · Đông y', 'Phòng thực hành · 中医 · Đông y');
  }

  function route(keepScroll) {
    var id = (location.hash || '').replace('#', '') || 'home';
    if (!TCM.modules[id]) id = 'home';
    var mod = TCM.modules[id];
    if (current && current !== mod && current.leave) current.leave();
    current = mod;
    renderNav(id);
    view.innerHTML = '';
    mod.render(view);
    if (!keepScroll) {
      window.scrollTo(0, 0);
      try { view.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    var active = TCM.$('.drawer[aria-current="page"]', nav);
    if (active && active.scrollIntoView && window.matchMedia('(max-width: 820px)').matches) {
      try { active.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { /* ignore */ }
    }
  }

  TCM.rerender = function () { route(true); };

  TCM.$$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      TCM.store.setLang(b.getAttribute('data-lang'));
      syncLangButtons();
      route(true);
    });
  });
  window.addEventListener('hashchange', function () { route(false); });
  syncLangButtons();
  route(true);
})();
