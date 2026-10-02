/* Core helpers: language, storage, small DOM utilities. Everything hangs off window.TCM. */
(function () {
  'use strict';
  var TCM = (window.TCM = window.TCM || {});
  TCM.modules = {};
  TCM.data = TCM.data || {};

  var KEY = 'tcmlab.v1';

  function guessLang() {
    try {
      return (navigator.language || '').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en';
    } catch (e) {
      return 'en';
    }
  }
  function fresh(lang) {
    return { lang: lang || guessLang(), stats: {}, cases: {} };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          var base = fresh();
          base.lang = s.lang === 'vi' ? 'vi' : s.lang === 'en' ? 'en' : base.lang;
          base.stats = s.stats && typeof s.stats === 'object' ? s.stats : {};
          base.cases = s.cases && typeof s.cases === 'object' ? s.cases : {};
          return base;
        }
      }
    } catch (e) { /* storage unavailable */ }
    return fresh();
  }
  var state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  TCM.store = {
    lang: function () { return state.lang; },
    setLang: function (l) { state.lang = l === 'vi' ? 'vi' : 'en'; save(); },
    record: function (mod, ok) {
      var s = state.stats[mod] || (state.stats[mod] = { c: 0, n: 0 });
      s.n += 1;
      if (ok) s.c += 1;
      save();
    },
    stat: function (mod) { return state.stats[mod] || { c: 0, n: 0 }; },
    caseBest: function (id) { return state.cases[id]; },
    setCase: function (id, score) {
      if (!(state.cases[id] >= score)) { state.cases[id] = score; save(); }
    },
    reset: function () { state = fresh(state.lang); save(); }
  };

  /* tx('English', 'Tiếng Việt') picks the active language. */
  TCM.tx = function (en, vi) { return state.lang === 'vi' && vi != null ? vi : en; };
  /* L({en, vi}) for bilingual data objects. */
  TCM.L = function (o) {
    if (o == null) return '';
    if (typeof o === 'string' || typeof o === 'number') return String(o);
    return o[state.lang] != null ? o[state.lang] : o.en != null ? o.en : '';
  };

  TCM.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* Name display for a term with zh / py / vi / en fields.
     opts.enMain: 'en' (default) or 'py' — what leads in English mode (herbs lead with pinyin). */
  TCM.nm = function (o, opts) {
    if (!o) return '';
    opts = opts || {};
    var vi = state.lang === 'vi';
    var main, sub;
    if (vi) {
      main = o.vi || o.en || o.py;
      sub = opts.noSub ? '' : o.py || '';
    } else if (opts.enMain === 'py') {
      main = o.py || o.en;
      sub = opts.noSub ? '' : o.en || '';
    } else {
      main = o.en || o.py;
      sub = opts.noSub ? '' : o.py || '';
    }
    var h = '<span class="nm"><span class="nm-main">' + TCM.esc(main) + '</span>';
    if (o.zh && !opts.noZh) h += '<span class="nm-zh" lang="zh-Hans">' + TCM.esc(o.zh) + '</span>';
    if (sub && sub !== main) h += '<span class="nm-sub">' + TCM.esc(sub) + '</span>';
    return h + '</span>';
  };
  /* Plain-text main name. */
  TCM.nmText = function (o, enMain) {
    if (!o) return '';
    if (state.lang === 'vi') return o.vi || o.en || o.py;
    return enMain === 'py' ? o.py || o.en : o.en || o.py;
  };

  TCM.norm = function (s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase();
  };

  TCM.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  TCM.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  TCM.sample = function (arr, n) { return TCM.shuffle(arr).slice(0, n); };
  /* Build n options containing `answer` plus distractors from pool (by id). */
  TCM.options = function (answer, pool, n) {
    var rest = pool.filter(function (x) { return x !== answer; });
    return TCM.shuffle([answer].concat(TCM.sample(rest, n - 1)));
  };

  TCM.$ = function (sel, root) { return (root || document).querySelector(sel); };
  TCM.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var toastTimer;
  TCM.toast = function (msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  };

  TCM.pct = function (s) { return s.n ? Math.round((100 * s.c) / s.n) : 0; };

  /* Shared page header. */
  TCM.pageHead = function (han, title, lede) {
    return (
      '<header class="page-head"><div class="title-row"><span class="title-han" lang="zh-Hans">' +
      han + '</span><h1>' + title + '</h1></div>' + (lede ? '<p class="lede">' + lede + '</p>' : '') + '</header>'
    );
  };

  TCM.disclaimer = function () {
    return (
      '<p class="disclaimer">' +
      TCM.tx(
        'For study and practice only. This lab is a learning aid and not medical advice, diagnosis or a prescription. Herbs and acupuncture can cause harm: real treatment needs a licensed practitioner, and anyone pregnant, on medication or seriously unwell should see a qualified clinician.',
        'Chỉ dùng để học và luyện tập. Phòng thực hành này là công cụ học tập, không phải lời khuyên y khoa, chẩn đoán hay đơn thuốc. Thuốc và châm cứu có thể gây hại: điều trị thực tế cần thầy thuốc có giấy phép hành nghề; người đang mang thai, đang dùng thuốc hoặc bệnh nặng cần đến cơ sở y tế có chuyên môn.'
      ) +
      '</p>'
    );
  };
})();
