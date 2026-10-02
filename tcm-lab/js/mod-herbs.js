/* Materia medica (本草 / Dược liệu): searchable library and flashcard drill. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { mode: 'library', q: '', cat: 'all', temp: 'all', nam: false, sel: 'ren_shen', quiz: null };
  var TEMP_GROUP = { hot: 'hot', warm: 'warm', sl_warm: 'warm', neutral: 'neutral', cool: 'cool', cold: 'cold', v_cold: 'cold' };
  var TEMP_KEYS = ['hot', 'warm', 'neutral', 'cool', 'cold'];

  function natPill(h) {
    var n = D.natures[h.nat];
    return '<span class="temp-pill ' + n.cls + '">' + TCM.esc(L(n)) + ' <span lang="zh-Hans" class="zh">' + n.zh + '</span></span>';
  }
  function flavorText(h) { return h.fl.map(function (f) { return L(D.flavors[f]); }).join(', '); }
  function organText(list) { return list.map(function (o) { return L(D.organs[o]); }).join(', '); }

  function partners(id) {
    var out = [];
    D.antagonisms.forEach(function (p) { if (p[0] === id || p[1] === id) out.push({ id: p[0] === id ? p[1] : p[0], kind: 'anti' }); });
    D.fears.forEach(function (p) { if (p[0] === id || p[1] === id) out.push({ id: p[0] === id ? p[1] : p[0], kind: 'fear' }); });
    return out;
  }

  function matches(h) {
    if (st.cat !== 'all' && h.cat !== st.cat) return false;
    if (st.temp !== 'all' && TEMP_GROUP[h.nat] !== st.temp) return false;
    if (st.nam && !h.nam) return false;
    if (st.q) {
      var hay = TCM.norm([h.zh, h.py, h.vi, h.en, h.lat, L(h.fn)].join(' '));
      var terms = TCM.norm(st.q).split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return false;
    }
    return true;
  }

  function cardHtml(h) {
    var vi = TCM.store.lang() === 'vi';
    return '<button type="button" class="herb-card" data-h="' + h.id + '" aria-pressed="' + (st.sel === h.id) + '">' +
      '<span class="han" lang="zh-Hans">' + h.zh + '</span>' +
      '<span class="names">' + TCM.esc(vi ? h.vi : h.py) + '</span>' +
      '<span class="sub">' + TCM.esc(vi ? h.py : h.en) + '</span>' +
      '<span class="tags">' + natPill(h) + (h.nam ? '<span class="chip chip-nam">' + tx('Nam', 'Nam') + '</span>' : '') + (h.tox ? '<span class="chip chip-bad">' + tx('Toxic', 'Có độc') + '</span>' : '') + '</span></button>';
  }

  function detailHtml(h) {
    var cat = D.categories[h.cat];
    var inFormulas = D.formulas.filter(function (f) { return f.herbs.some(function (x) { return x[0] === h.id; }); });
    var pr = partners(h.id);
    var vi = TCM.store.lang() === 'vi';
    var s = '<div class="panel stack"><div class="row" style="align-items:flex-start;gap:14px"><span class="detail-han" lang="zh-Hans">' + h.zh + '</span><div class="stack" style="gap:2px">' +
      '<h3>' + TCM.esc(vi ? h.vi : h.py) + '</h3><span class="small muted">' + TCM.esc(vi ? h.py + ' · ' + h.en : h.vi + ' · ' + h.en) + '</span><span class="small muted"><i>' + TCM.esc(h.lat) + '</i></span></div></div>' +
      '<div class="row">' + natPill(h) + '<span class="chip">' + TCM.esc(L(cat)) + ' <span class="zh" lang="zh-Hans">' + cat.zh + '</span></span>' +
      (h.nam ? '<span class="chip chip-nam">' + tx('Used in Vietnamese folk medicine (thuốc Nam)', 'Thuốc Nam') + '</span>' : '') +
      (h.preg === 'contra' ? '<span class="chip chip-bad">' + tx('Forbidden in pregnancy', 'Cấm dùng khi có thai') + '</span>' : h.preg === 'caution' ? '<span class="chip chip-warn">' + tx('Caution in pregnancy', 'Thận trọng khi có thai') + '</span>' : '') +
      (h.tox ? '<span class="chip chip-bad">' + tx('Toxic', 'Có độc') + '</span>' : '') + '</div>' +
      '<dl class="kv"><dt>' + tx('Flavour', 'Vị') + '</dt><dd>' + TCM.esc(flavorText(h)) + '</dd>' +
      '<dt>' + tx('Channels', 'Quy kinh') + '</dt><dd>' + TCM.esc(organText(h.mer)) + '</dd>' +
      '<dt>' + tx('Typical dose', 'Liều thường dùng') + '</dt><dd class="mono">' + h.dose[0] + '–' + h.dose[1] + ' g</dd>' +
      '<dt>' + tx('Functions', 'Công năng') + '</dt><dd>' + TCM.esc(L(h.fn)) + '</dd></dl>';
    if (h.caut) s += '<div class="callout ' + (h.tox || h.preg === 'contra' ? 'callout-bad' : 'callout-warn') + '"><b>' + tx('Cautions', 'Lưu ý') + '</b><span>' + TCM.esc(L(h.caut)) + '</span></div>';
    if (h.note) s += '<div class="callout callout-info"><b>' + tx('Note', 'Ghi chú') + '</b><span>' + TCM.esc(L(h.note)) + '</span></div>';
    if (pr.length) {
      s += '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Do not combine with', 'Không phối hợp với') + '</span><div class="row">' + pr.map(function (x) {
        var o = D.herbById[x.id];
        return '<button type="button" class="chip ' + (x.kind === 'anti' ? 'chip-bad' : 'chip-warn') + '" data-h="' + o.id + '">' + TCM.esc(TCM.nmText(o, 'py')) + ' · ' + (x.kind === 'anti' ? tx('18 antagonisms', 'Thập bát phản') : tx('19 fears', 'Thập cửu úy')) + '</button>';
      }).join('') + '</div></div>';
    }
    if (inFormulas.length) {
      s += '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Appears in', 'Có trong bài') + '</span><div class="row">' + inFormulas.map(function (f) {
        return '<button type="button" class="chip" data-f="' + f.id + '">' + TCM.esc(TCM.nmText(f, 'py')) + ' <span class="zh" lang="zh-Hans">' + f.zh + '</span></button>';
      }).join('') + '</div></div>';
    }
    s += '<div class="row"><button type="button" class="btn btn-primary btn-sm" id="hb-add">' + tx('Add to decoction', 'Thêm vào thang thuốc') + '</button></div></div>';
    return s;
  }

  function renderLibrary(el) {
    var list = D.herbs.filter(matches);
    if (!D.herbById[st.sel] || (list.length && list.indexOf(D.herbById[st.sel]) < 0)) st.sel = list.length ? list[0].id : st.sel;
    var cats = Object.keys(D.categories);
    el.innerHTML = '<div class="split-wide"><div class="stack">' +
      '<div class="panel panel-tight stack"><div class="cols-2">' +
        '<div class="field"><label for="hb-q">' + tx('Search any name: Vietnamese, pinyin, 中文, English, Latin', 'Tìm theo tên: tiếng Việt, pinyin, 中文, tiếng Anh, Latin') + '</label><input class="input" id="hb-q" type="search" autocomplete="off" value="' + TCM.esc(st.q) + '" placeholder="' + tx('e.g. cam thao, ginseng, 当归', 'ví dụ: cam thao, nhân sâm, 当归') + '"></div>' +
        '<div class="field"><label for="hb-cat">' + tx('Category', 'Nhóm thuốc') + '</label><select class="input" id="hb-cat"><option value="all">' + tx('All categories', 'Tất cả các nhóm') + '</option>' +
          cats.map(function (k) { return '<option value="' + k + '"' + (st.cat === k ? ' selected' : '') + '>' + TCM.esc(L(D.categories[k])) + ' · ' + D.categories[k].zh + '</option>'; }).join('') + '</select></div>' +
      '</div><div class="row"><div class="seg" role="group" id="hb-temp"><button type="button" data-t="all" aria-pressed="' + (st.temp === 'all') + '">' + tx('Any nature', 'Mọi tính') + '</button>' +
        TEMP_KEYS.map(function (k) { return '<button type="button" data-t="' + k + '" aria-pressed="' + (st.temp === k) + '">' + TCM.esc(L(D.natures[k])) + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="chip" id="hb-nam" aria-pressed="' + st.nam + '">' + tx('Thuốc Nam only', 'Chỉ thuốc Nam') + '</button>' +
        '<span class="small muted mono">' + list.length + ' / ' + D.herbs.length + '</span></div></div>' +
      (list.length ? '<div class="herb-grid">' + list.map(cardHtml).join('') + '</div>' : '<div class="panel"><p class="muted">' + tx('No herbs match. Clear the search or choose another category.', 'Không có vị thuốc phù hợp. Hãy xóa từ khóa hoặc chọn nhóm khác.') + '</p></div>') +
      '</div><div class="sticky-detail">' + detailHtml(D.herbById[st.sel]) + '</div></div>';

    var q = TCM.$('#hb-q', el);
    q.addEventListener('input', function () {
      st.q = q.value;
      var pos = q.selectionStart;
      renderLibrary(el);
      var nq = TCM.$('#hb-q', el);
      nq.focus();
      try { nq.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
    });
    TCM.$('#hb-cat', el).addEventListener('change', function (e) { st.cat = e.target.value; renderLibrary(el); });
    TCM.$$('[data-t]', el).forEach(function (b) { b.addEventListener('click', function () { st.temp = b.getAttribute('data-t'); renderLibrary(el); }); });
    TCM.$('#hb-nam', el).addEventListener('click', function () { st.nam = !st.nam; renderLibrary(el); });
    TCM.$$('[data-h]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        st.sel = b.getAttribute('data-h');
        if (!matches(D.herbById[st.sel])) { st.q = ''; st.cat = 'all'; st.temp = 'all'; st.nam = false; }
        renderLibrary(el);
        if (window.matchMedia('(max-width: 1020px)').matches) {
          var d = TCM.$('.sticky-detail', el);
          if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    TCM.$$('[data-f]', el).forEach(function (b) {
      b.addEventListener('click', function () { if (TCM.openFormula) TCM.openFormula(b.getAttribute('data-f')); });
    });
    TCM.$('#hb-add', el).addEventListener('click', function () {
      if (TCM.pot) {
        var added = TCM.pot.add(st.sel);
        TCM.toast(added ? tx('Added to the decoction in the Formula workshop', 'Đã thêm vào thang thuốc ở mục Phương tễ') : tx('Already in the decoction', 'Vị này đã có trong thang'));
      }
    });
  }

  /* ---------- flashcards ---------- */
  function newQuiz() {
    var types = ['nature', 'category', 'function', 'name'];
    var type = TCM.pick(types);
    var h = TCM.pick(D.herbs.filter(function (x) { return x.cat !== 'emetic'; }));
    var q = { type: type, herb: h.id, picked: null };
    if (type === 'nature') {
      q.answer = TEMP_GROUP[h.nat];
      q.opts = TEMP_KEYS.slice();
    } else if (type === 'category') {
      q.answer = h.cat;
      q.opts = TCM.options(h.cat, Object.keys(D.categories).filter(function (k) { return k !== 'emetic'; }), 4);
    } else {
      q.answer = h.id;
      var others = D.herbs.filter(function (x) { return x.id !== h.id && x.cat !== h.cat && x.cat !== 'emetic'; }).map(function (x) { return x.id; });
      q.opts = TCM.shuffle([h.id].concat(TCM.sample(others, 3)));
    }
    st.quiz = q;
  }

  function optLabel(q, v) {
    if (q.type === 'nature') return TCM.esc(L(D.natures[v])) + ' <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">' + D.natures[v].zh + '</span>';
    if (q.type === 'category') return TCM.nm(D.categories[v]);
    var o = D.herbById[v];
    if (q.type === 'name') return TCM.esc(TCM.store.lang() === 'vi' ? o.vi : o.en);
    return TCM.nm(o, { enMain: 'py' });
  }

  function renderQuiz(el) {
    if (!st.quiz) newQuiz();
    var q = st.quiz, h = D.herbById[q.herb], done = q.picked != null;
    var vi = TCM.store.lang() === 'vi';
    var prompt;
    if (q.type === 'nature') prompt = tx('What is the nature (temperature) of this herb?', 'Vị thuốc này có tính gì?');
    else if (q.type === 'category') prompt = tx('Which category does it belong to?', 'Vị thuốc này thuộc nhóm nào?');
    else if (q.type === 'function') prompt = tx('Which herb has these functions?', 'Vị thuốc nào có công năng sau?');
    else prompt = vi ? 'Tên tiếng Việt của vị thuốc này là gì?' : 'What is this herb’s common English name?';
    var card = q.type === 'function'
      ? '<p class="lede" style="font-size:1.05rem">“' + TCM.esc(L(h.fn)) + '”</p>'
      : '<div class="row" style="gap:16px"><span class="detail-han" lang="zh-Hans">' + h.zh + '</span><div><h3>' + TCM.esc(q.type === 'name' ? h.py : vi ? h.vi : h.py) + '</h3>' +
        (q.type === 'name' ? '' : '<span class="small muted">' + TCM.esc(vi ? h.py : h.en) + '</span>') + '</div></div>';
    var s = TCM.store.stat('herbs');
    var html = '<div class="split"><div class="panel stack"><p class="eyebrow">' + prompt + '</p>' + card +
      '<div class="options">' + q.opts.map(function (v, i) {
        var cls = '';
        if (done) { if (v === q.answer) cls = ' is-right'; else if (v === q.picked) cls = ' is-wrong'; }
        return '<button type="button" class="opt' + cls + '" data-v="' + v + '"' + (done ? ' disabled' : '') + '><span class="key">' + 'ABCDE'[i] + '</span>' + optLabel(q, v) + '</button>';
      }).join('') + '</div>' +
      (done ? '<div class="row"><button type="button" class="btn btn-primary" id="hq-next">' + tx('Next card', 'Thẻ tiếp theo') + '</button></div>' : '') +
      '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span></p></div>' +
      '<div>' + (done ? detailHtml(h) : '<div class="panel"><p class="muted small">' + tx('Answer to see the full monograph.', 'Trả lời để xem chi tiết vị thuốc.') + '</p></div>') + '</div></div>';
    el.innerHTML = html;
    TCM.$$('.opt', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.picked != null) return;
        q.picked = b.getAttribute('data-v');
        TCM.store.record('herbs', q.picked === q.answer);
        renderQuiz(el);
      });
    });
    var nx = TCM.$('#hq-next', el);
    if (nx) nx.addEventListener('click', function () { newQuiz(); renderQuiz(el); });
    var add = TCM.$('#hb-add', el);
    if (add) add.addEventListener('click', function () { if (TCM.pot) TCM.toast(TCM.pot.add(h.id) ? tx('Added to the decoction', 'Đã thêm vào thang thuốc') : tx('Already in the decoction', 'Vị này đã có trong thang')); });
    TCM.$$('[data-f]', el).forEach(function (b) { b.addEventListener('click', function () { if (TCM.openFormula) TCM.openFormula(b.getAttribute('data-f')); }); });
    TCM.$$('.panel [data-h]', el).forEach(function (b) { b.addEventListener('click', function () { st.sel = b.getAttribute('data-h'); st.mode = 'library'; TCM.rerender(); }); });
  }

  TCM.openHerb = function (id) {
    st.sel = id; st.mode = 'library'; st.q = ''; st.cat = 'all'; st.temp = 'all'; st.nam = false;
    if (location.hash === '#herbs') TCM.rerender(); else location.hash = 'herbs';
  };

  TCM.modules.herbs = {
    han: '药',
    title: { en: 'Materia medica', vi: 'Dược liệu' },
    sub: { en: 'Bản thảo · 本草', vi: 'Bản thảo · 本草' },
    blurb: { en: 'Sixty-six herbs, thuốc Bắc and thuốc Nam, with nature, flavour, channels, dose, cautions and incompatibilities, plus a flashcard drill.', vi: 'Sáu mươi sáu vị thuốc Bắc và thuốc Nam với tính, vị, quy kinh, liều, lưu ý và tương kỵ, kèm bài luyện thẻ nhớ.' },
    render: function (el) {
      el.innerHTML = '<div class="page">' + TCM.pageHead('药', tx('Materia medica', 'Dược liệu (Bản thảo)'),
        tx('Every herb is described by its four natures (四气 / tứ khí), five flavours (五味 / ngũ vị) and channel tropism (归经 / quy kinh). Cold herbs treat heat, warm herbs treat cold; flavour hints at action: acrid disperses, sweet tonifies, bitter drains and dries, sour astringes, salty softens.',
          'Mỗi vị thuốc được mô tả bằng tứ khí (四气), ngũ vị (五味) và quy kinh (归经). Thuốc hàn lương trị nhiệt, thuốc ôn nhiệt trị hàn; vị gợi ý tác dụng: cay thì phát tán, ngọt thì bổ, đắng thì tả và táo, chua thì thu liễm, mặn thì làm mềm.')) +
        '<div class="tabs" role="tablist"><button type="button" class="tab" role="tab" data-mode="library" aria-selected="' + (st.mode === 'library') + '">' + tx('Library', 'Tra cứu') + '</button>' +
        '<button type="button" class="tab" role="tab" data-mode="quiz" aria-selected="' + (st.mode === 'quiz') + '">' + tx('Flashcards', 'Thẻ nhớ') + '</button></div>' +
        '<div id="hb-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) { b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); TCM.rerender(); }); });
      var body = TCM.$('#hb-body', el);
      if (st.mode === 'quiz') renderQuiz(body); else renderLibrary(body);
    }
  };
})();
