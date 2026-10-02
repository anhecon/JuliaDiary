/* Tongue reading station (舌诊 / Thiệt chẩn): build a tongue and read it, or identify presets. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = {
    mode: 'explore',
    t: { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal', seed: 11 },
    map: false,
    quiz: null
  };

  function mapOverlay() {
    var lab = function (x, y, zh, txt) {
      return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="11" font-family="Be Vietnam Pro, sans-serif" fill="#1b2420" stroke="#ffffff" stroke-width="3" paint-order="stroke">' +
        '<tspan font-family="Noto Serif SC, serif" font-weight="700">' + zh + '</tspan> ' + TCM.esc(txt) + '</text>';
    };
    return '<g opacity=".95">' +
      '<path d="M90 120 Q150 104 210 120 M80 210 Q150 228 220 210" stroke="#1b2420" stroke-dasharray="3 3" fill="none" opacity=".5"/>' +
      lab(150, 98, '肾', tx('Kidney · root', 'Thận · cuống')) +
      lab(150, 172, '脾胃', tx('Spleen–Stomach', 'Tỳ Vị')) +
      lab(150, 290, '心肺', tx('Heart–Lung · tip', 'Tâm Phế · đầu')) +
      lab(66, 170, '肝', '') + lab(234, 170, '胆', '') +
      '</g>';
  }

  function tongueSvg(t, withMap) {
    var svg = TCM.renderTongue(t, { label: tx('Tongue illustration', 'Hình minh họa lưỡi') });
    if (withMap) svg = svg.replace('</svg>', mapOverlay() + '</svg>');
    return svg;
  }

  function seg(group, current, items, chips) {
    return '<div class="' + (chips ? 'row' : 'seg') + ' tg-group" role="group" data-group="' + group + '" style="' + (chips ? 'gap:6px' : '') + '">' + items.map(function (k) {
      var d = D.tongue[group][k];
      var sw = group === 'body' ? '<span aria-hidden="true" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + d.fill + ';margin-right:5px;vertical-align:-1px"></span>' : '';
      return '<button type="button"' + (chips ? ' class="chip"' : '') + ' data-val="' + k + '" aria-pressed="' + (current === k) + '">' + sw + TCM.esc(TCM.nmText(d)) + '</button>';
    }).join('') + '</div>';
  }

  function readingHtml(t) {
    var r = TCM.readTongue(t);
    var h = '<ul class="finding-list">';
    r.findings.forEach(function (f) {
      h += '<li><b>' + TCM.nm(f.term) + '</b><span>' + TCM.esc(L(f.mean)) + '</span></li>';
    });
    if (!r.findings.length) h += '<li><span>' + tx('Choose findings to see what they mean.', 'Chọn các dấu hiệu để xem ý nghĩa.') + '</span></li>';
    h += '</ul>';
    var g = r.guess ? D.patterns[r.guess] : null;
    h += '<div class="callout callout-info"><span class="eyebrow">' + tx('Most consistent with', 'Phù hợp nhất với') + '</span><b>' +
      (g ? TCM.nm(g) : tx('A mixed picture: weigh it with the pulse and the inquiry.', 'Hình ảnh hỗn hợp: cần kết hợp với mạch và hỏi bệnh.')) + '</b>' +
      '<span class="muted">' + tx('The tongue is one piece of evidence. Always confirm with the other three examinations.', 'Lưỡi chỉ là một bằng chứng. Luôn đối chiếu với ba phép chẩn còn lại.') + '</span></div>';
    return h;
  }

  function newQuiz() {
    var pre = TCM.pick(D.tonguePresets.filter(function (p) { return !st.quiz || p !== st.quiz.pre; }));
    var pool = [];
    D.tonguePresets.forEach(function (p) { if (pool.indexOf(p.answer) < 0) pool.push(p.answer); });
    var t = {};
    for (var k in pre.t) t[k] = pre.t[k];
    t.seed = 1 + Math.floor(Math.random() * 999);
    st.quiz = { pre: pre, t: t, opts: TCM.options(pre.answer, pool, 4), picked: null };
  }

  function renderExplore(el) {
    var t = st.t;
    var marks = ['teeth', 'cracks', 'redTip', 'redSides', 'spots'];
    el.innerHTML =
      '<div class="split">' +
        '<div class="stack"><div class="tongue-stage">' + tongueSvg(t, st.map) + '</div>' +
          '<div class="row"><button type="button" class="btn btn-sm" id="tg-map" aria-pressed="' + st.map + '">' + (st.map ? tx('Hide organ map', 'Ẩn bản đồ tạng phủ') : tx('Show organ map', 'Hiện bản đồ tạng phủ')) + '</button>' +
          '<button type="button" class="btn btn-sm" id="tg-rand">' + tx('Random tongue', 'Lưỡi ngẫu nhiên') + '</button>' +
          '<button type="button" class="btn btn-sm btn-ghost" id="tg-reset">' + tx('Back to normal', 'Về lưỡi bình thường') + '</button></div></div>' +
        '<div class="stack">' +
          '<div class="panel ctrl-grid">' +
            '<div class="field"><span class="lbl">' + tx('Body colour · 舌色', 'Màu chất lưỡi · 舌色') + '</span>' + seg('body', t.body, ['pale', 'lightred', 'red', 'crimson', 'purple'], true) + '</div>' +
            '<div class="field"><span class="lbl">' + tx('Shape · 舌形', 'Hình thể · 舌形') + '</span>' + seg('shape', t.shape, ['thin', 'normal', 'swollen']) + '</div>' +
            '<div class="field"><span class="lbl">' + tx('Coating · 舌苔', 'Rêu lưỡi · 舌苔') + '</span>' + seg('coat', t.coat, ['thin_white', 'thick_white', 'white_greasy', 'thin_yellow', 'thick_yellow', 'yellow_greasy', 'geographic', 'none'], true) + '</div>' +
            '<div class="field"><span class="lbl">' + tx('Moisture · 润燥', 'Độ ẩm · 润燥') + '</span>' + seg('moist', t.moist, ['dry', 'normal', 'wet']) + '</div>' +
            '<div class="field"><span class="lbl">' + tx('Features', 'Đặc điểm') + '</span><div class="row">' + marks.map(function (k) {
              return '<button type="button" class="chip" data-mark="' + k + '" aria-pressed="' + !!t[k] + '">' + TCM.esc(TCM.nmText(D.tongue.marks[k])) + ' <span lang="zh-Hans" class="zh">' + D.tongue.marks[k].zh + '</span></button>';
            }).join('') + '</div></div>' +
          '</div>' +
          '<div class="panel stack"><h3>' + tx('Reading', 'Nhận định') + '</h3>' + readingHtml(t) + '</div>' +
        '</div>' +
      '</div>';

    TCM.$$('.tg-group', el).forEach(function (g) {
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        st.t[g.getAttribute('data-group')] = b.getAttribute('data-val');
        renderExplore(el);
      });
    });
    TCM.$$('[data-mark]', el).forEach(function (b) {
      b.addEventListener('click', function () { var k = b.getAttribute('data-mark'); st.t[k] = !st.t[k]; renderExplore(el); });
    });
    TCM.$('#tg-map', el).addEventListener('click', function () { st.map = !st.map; renderExplore(el); });
    TCM.$('#tg-reset', el).addEventListener('click', function () { st.t = { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal', seed: 11 }; renderExplore(el); });
    TCM.$('#tg-rand', el).addEventListener('click', function () {
      var pre = TCM.pick(D.tonguePresets);
      var t = { seed: 1 + Math.floor(Math.random() * 999) };
      for (var k in pre.t) t[k] = pre.t[k];
      st.t = t;
      renderExplore(el);
    });
  }

  function renderQuiz(el) {
    if (!st.quiz) newQuiz();
    var q = st.quiz, answered = q.picked != null;
    var s = TCM.store.stat('tongue');
    var h = '<div class="split"><div class="tongue-stage">' + tongueSvg(q.t, false) + '</div><div class="stack">' +
      '<div class="panel stack"><div class="score-line"><h3>' + tx('Which pattern does this tongue suggest?', 'Lưỡi này gợi ý chứng nào?') + '</h3></div>' +
      '<div class="options">' + q.opts.map(function (id, i) {
        var cls = '';
        if (answered) { if (id === q.pre.answer) cls = ' is-right'; else if (id === q.picked) cls = ' is-wrong'; }
        return '<button type="button" class="opt' + cls + '" data-id="' + id + '"' + (answered ? ' disabled' : '') + '><span class="key">' + 'ABCD'[i] + '</span>' + TCM.nm(D.patterns[id]) + '</button>';
      }).join('') + '</div>';
    if (answered) {
      var ok = q.picked === q.pre.answer;
      h += '<div class="callout ' + (ok ? 'callout-good' : 'callout-bad') + '"><b>' + (ok ? tx('Correct.', 'Chính xác.') : tx('Not quite.', 'Chưa đúng.')) + '</b><span>' + TCM.esc(L(q.pre.why)) + '</span></div>' +
        '<div class="row"><button type="button" class="btn btn-primary" id="tq-next">' + tx('Next tongue', 'Lưỡi tiếp theo') + '</button><button type="button" class="btn" id="tq-open">' + tx('Open in explorer', 'Mở trong phần khám phá') + '</button></div>';
    }
    h += '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span></p></div>';
    if (answered) h += '<div class="panel stack"><h4>' + tx('Findings on this tongue', 'Các dấu hiệu trên lưỡi này') + '</h4>' + readingHtml(q.t) + '</div>';
    h += '</div></div>';
    el.innerHTML = h;

    TCM.$$('.opt', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.picked != null) return;
        q.picked = b.getAttribute('data-id');
        TCM.store.record('tongue', q.picked === q.pre.answer);
        renderQuiz(el);
      });
    });
    var nx = TCM.$('#tq-next', el);
    if (nx) nx.addEventListener('click', function () { newQuiz(); renderQuiz(el); });
    var op = TCM.$('#tq-open', el);
    if (op) op.addEventListener('click', function () {
      var t = {};
      for (var k in q.t) t[k] = q.t[k];
      st.t = t;
      st.mode = 'explore';
      TCM.rerender();
    });
  }

  TCM.modules.tongue = {
    han: '舌',
    title: { en: 'Tongue reading', vi: 'Xem lưỡi' },
    sub: { en: 'Thiệt chẩn · 舌诊', vi: 'Thiệt chẩn · 舌诊' },
    blurb: { en: 'Build a tongue from body colour, shape, coating and moisture, see what each sign means, then test yourself on twelve classic presentations.', vi: 'Dựng lưỡi theo màu chất, hình thể, rêu và độ ẩm, xem ý nghĩa từng dấu hiệu, rồi tự kiểm tra với mười hai hình ảnh kinh điển.' },
    render: function (el) {
      el.innerHTML = '<div class="page">' + TCM.pageHead('舌', tx('Tongue reading', 'Xem lưỡi (Thiệt chẩn)'),
        tx('The tongue is the "sprout of the Heart" and a window on the Spleen and Stomach. Read the body (colour, shape) for the state of the organs, qi and blood, and the coating for the depth and nature of the pathogen.',
          'Lưỡi là “mầm của tâm”, là cửa sổ của tỳ vị. Chất lưỡi (màu, hình thể) phản ánh tạng phủ, khí huyết; rêu lưỡi phản ánh vị trí nông sâu và tính chất của tà khí.')) +
        '<div class="tabs" role="tablist"><button type="button" class="tab" role="tab" data-mode="explore" aria-selected="' + (st.mode === 'explore') + '">' + tx('Explore', 'Khám phá') + '</button>' +
        '<button type="button" class="tab" role="tab" data-mode="quiz" aria-selected="' + (st.mode === 'quiz') + '">' + tx('Identify', 'Nhận diện') + '</button></div>' +
        '<div id="tg-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) {
        b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); TCM.rerender(); });
      });
      var body = TCM.$('#tg-body', el);
      if (st.mode === 'quiz') renderQuiz(body); else renderExplore(body);
    }
  };
})();
