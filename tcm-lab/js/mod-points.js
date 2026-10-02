/* Acupoint station (腧穴 / Huyệt vị): study points on the body, then locate them from memory. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { mode: 'study', view: 'front', sel: 'ST36', ch: 'all', labels: true, quiz: null };

  // Label placement tweaks: [dx, dy, anchor]
  var LBL = {
    LU7: [6, 9, 'start'], PC6: [-6, 1, 'end'], HT7: [-5, 10, 'end'],
    KI3: [0, 13, 'middle'], 'EX-HN5': [6, 2.5, 'start']
  };

  function pointMarks(view, opts) {
    opts = opts || {};
    var list = D.points.filter(function (p) { return p.view === view && (st.ch === 'all' || p.ch === st.ch); });
    return list.map(function (p) {
      return TCM.figure.positions(p).map(function (xy, i) {
        var cls = 'pt' + (st.sel === p.id ? ' is-sel' : '');
        var lab = '';
        if (st.labels && i === 0) {
          var o = LBL[p.id] || (Math.abs(xy[0] - 150) < 0.5 ? [0, -6.5, 'middle'] : [6, 2.8, 'start']);
          lab = '<text x="' + (xy[0] + o[0]) + '" y="' + (xy[1] + o[1]) + '" text-anchor="' + o[2] + '" style="font-size:8px">' + p.id + '</text>';
        }
        return '<g class="' + cls + '" data-id="' + p.id + '" tabindex="0" role="button" aria-label="' + TCM.esc(p.id + ' ' + TCM.nmText(p)) + '">' +
          '<title>' + TCM.esc(p.id + ' · ' + TCM.nmText(p) + ' · ' + p.zh) + '</title>' +
          '<circle class="hit" cx="' + xy[0] + '" cy="' + xy[1] + '" r="9"/>' +
          '<circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + (st.sel === p.id ? 4.6 : 3.6) + '"/>' + lab + '</g>';
      }).join('');
    }).join('');
  }

  function infoHtml(p) {
    var ch = D.channels[p.ch];
    var h = '<div class="panel stack"><div class="row" style="align-items:flex-start;gap:14px"><span class="detail-han" lang="zh-Hans">' + p.zh + '</span>' +
      '<div class="stack" style="gap:2px"><span class="mono small muted">' + p.id + '</span><h3>' + TCM.esc(TCM.store.lang() === 'vi' ? p.vi : p.py) + '</h3>' +
      '<span class="muted small">' + TCM.esc(TCM.store.lang() === 'vi' ? p.py + ' · ' + p.en : p.vi + ' · ' + p.en) + '</span></div></div>' +
      '<div class="row"><span class="chip">' + TCM.esc(L(ch)) + ' <span class="zh" lang="zh-Hans">' + ch.zh + '</span></span>' +
      '<span class="chip">' + (p.view === 'back' ? tx('Back view', 'Mặt sau') : tx('Front view', 'Mặt trước')) + '</span>' +
      (p.preg ? '<span class="chip chip-bad">' + tx('Forbidden in pregnancy', 'Cấm châm khi có thai') + '</span>' : '') + '</div>' +
      '<dl class="kv"><dt>' + tx('Location', 'Vị trí') + '</dt><dd>' + TCM.esc(L(p.loc)) + '</dd>' +
      '<dt>' + tx('Actions', 'Tác dụng') + '</dt><dd>' + TCM.esc(L(p.act)) + '</dd>' +
      '<dt>' + tx('Used for', 'Chủ trị') + '</dt><dd>' + TCM.esc(L(p.ind)) + '</dd></dl>';
    if (p.caution) h += '<div class="callout ' + (p.preg ? 'callout-bad' : 'callout-warn') + '"><b>' + tx('Caution', 'Thận trọng') + '</b><span>' + TCM.esc(L(p.caution)) + '</span></div>';
    return h + '</div>';
  }

  function figureBlock(inner) {
    return '<div class="figure-wrap">' + TCM.figure.svg(st.view, inner, st.view === 'back' ? tx('Back of the body', 'Mặt sau cơ thể') : tx('Front of the body', 'Mặt trước cơ thể')) + '</div>';
  }

  function controls(showFilter) {
    var chs = ['all'].concat(Object.keys(D.channels).filter(function (k) { return D.points.some(function (p) { return p.ch === k; }); }));
    return '<div class="row"><div class="seg" role="group" id="pt-view"><button type="button" data-v="front" aria-pressed="' + (st.view === 'front') + '">' + tx('Front', 'Mặt trước') + '</button><button type="button" data-v="back" aria-pressed="' + (st.view === 'back') + '">' + tx('Back', 'Mặt sau') + '</button></div>' +
      (showFilter ? '<button type="button" class="btn btn-sm" id="pt-labels" aria-pressed="' + st.labels + '">' + (st.labels ? tx('Hide codes', 'Ẩn mã huyệt') : tx('Show codes', 'Hiện mã huyệt')) + '</button>' : '') + '</div>' +
      (showFilter ? '<div class="channel-chips">' + chs.map(function (k) {
        return '<button type="button" class="chip" data-ch="' + k + '" aria-pressed="' + (st.ch === k) + '">' + (k === 'all' ? tx('All channels', 'Tất cả') : k) + '</button>';
      }).join('') + '</div>' : '');
  }

  function wireControls(el, rerender) {
    TCM.$$('[data-v]', el).forEach(function (b) { b.addEventListener('click', function () { st.view = b.getAttribute('data-v'); rerender(); }); });
    var lb = TCM.$('#pt-labels', el);
    if (lb) lb.addEventListener('click', function () { st.labels = !st.labels; rerender(); });
    TCM.$$('[data-ch]', el).forEach(function (b) { b.addEventListener('click', function () { st.ch = b.getAttribute('data-ch'); rerender(); }); });
  }

  function renderStudy(el) {
    var p = D.pointById[st.sel] || D.points[0];
    var list = D.points.filter(function (x) { return st.ch === 'all' || x.ch === st.ch; });
    el.innerHTML = '<div class="split"><div class="stack">' + controls(true) + figureBlock(pointMarks(st.view)) + '</div>' +
      '<div class="stack sticky-detail">' + infoHtml(p) +
      '<div class="panel stack"><h4>' + tx('Points in this set', 'Các huyệt trong nhóm') + ' <span class="muted small mono">' + list.length + '</span></h4><div class="row">' +
      list.map(function (x) {
        return '<button type="button" class="chip" data-pick="' + x.id + '" aria-pressed="' + (x.id === st.sel) + '"><span class="mono">' + x.id + '</span> ' + TCM.esc(TCM.store.lang() === 'vi' ? x.vi : x.py) + '</button>';
      }).join('') + '</div></div></div></div>';
    wireControls(el, function () { renderStudy(el); });
    function pick(id) {
      st.sel = id;
      var pt = D.pointById[id];
      if (pt && pt.view !== st.view) st.view = pt.view;
      renderStudy(el);
    }
    TCM.$$('.pt', el).forEach(function (g) {
      g.addEventListener('click', function () { pick(g.getAttribute('data-id')); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.getAttribute('data-id')); } });
    });
    TCM.$$('[data-pick]', el).forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-pick')); }); });
  }

  function newQuiz() {
    var pool = D.points.filter(function (p) { return !st.quiz || p.id !== st.quiz.id; });
    var p = TCM.pick(pool);
    st.quiz = { id: p.id, guess: null, dist: null };
    st.view = p.view;
  }

  function renderQuiz(el) {
    if (!st.quiz) newQuiz();
    var q = st.quiz, p = D.pointById[q.id], done = q.guess != null;
    var inner = '';
    if (done) {
      TCM.figure.positions(p).forEach(function (xy) {
        inner += '<circle class="answer-ring" cx="' + xy[0] + '" cy="' + xy[1] + '" r="14"/><circle class="answer-mark" cx="' + xy[0] + '" cy="' + xy[1] + '" r="4.5"/>';
      });
      inner += '<path class="guess-mark" d="M' + (q.guess[0] - 5) + ' ' + (q.guess[1] - 5) + ' l10 10 M' + (q.guess[0] + 5) + ' ' + (q.guess[1] - 5) + ' l-10 10"/>';
    }
    var s = TCM.store.stat('points');
    var verdict = '';
    if (done) {
      var cun = q.dist / 8;
      if (q.dist <= 14) verdict = '<div class="callout callout-good"><b>' + tx('On the point.', 'Trúng huyệt.') + '</b><span>' + tx('About ', 'Lệch khoảng ') + cun.toFixed(1) + tx(' cun away.', ' thốn.') + '</span></div>';
      else if (q.dist <= 28) verdict = '<div class="callout callout-warn"><b>' + tx('Close, but not on it.', 'Gần đúng, nhưng chưa trúng.') + '</b><span>' + tx('About ', 'Lệch khoảng ') + cun.toFixed(1) + tx(' cun away. The green dot marks the point.', ' thốn. Chấm xanh là vị trí huyệt.') + '</span></div>';
      else verdict = '<div class="callout callout-bad"><b>' + tx('Missed.', 'Chưa đúng.') + '</b><span>' + tx('The green dot marks the point. Read the location note and try again later.', 'Chấm xanh là vị trí huyệt. Hãy đọc mô tả vị trí rồi thử lại sau.') + '</span></div>';
    }
    el.innerHTML = '<div class="split"><div class="stack"><div class="row"><span class="chip">' + (p.view === 'back' ? tx('Back view', 'Mặt sau') : tx('Front view', 'Mặt trước')) + '</span><span class="small muted">' + tx('Click the figure where you would needle.', 'Bấm vào hình nơi bạn sẽ châm.') + '</span></div>' +
      figureBlock(inner) + '</div><div class="stack sticky-detail"><div class="panel stack">' +
      '<p class="eyebrow">' + tx('Locate this point', 'Tìm huyệt này') + '</p>' +
      '<div class="row" style="gap:14px;align-items:center"><span class="detail-han" lang="zh-Hans">' + p.zh + '</span><div><h3>' + TCM.esc(TCM.store.lang() === 'vi' ? p.vi : p.py) + '</h3><span class="small muted">' + (done ? '<span class="mono">' + p.id + '</span> · ' : '') + TCM.esc(L(D.channels[p.ch])) + '</span></div></div>' +
      (done ? verdict + '<div class="row"><button type="button" class="btn btn-primary" id="pq-next">' + tx('Next point', 'Huyệt tiếp theo') + '</button></div>' : '') +
      '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span> · ' + tx('within about 1.7 cun counts as correct', 'lệch dưới khoảng 1,7 thốn được tính là đúng') + '</p></div>' +
      (done ? infoHtml(p) : '') + '</div></div>';

    var svg = TCM.$('.figure-wrap svg', el);
    if (!done) {
      svg.style.cursor = 'crosshair';
      svg.addEventListener('click', function (e) {
        var g = TCM.figure.toSvg(svg, e);
        if (!g) return;
        var best = Infinity;
        TCM.figure.positions(p).forEach(function (xy) {
          var d = Math.hypot(xy[0] - g[0], xy[1] - g[1]);
          if (d < best) best = d;
        });
        q.guess = g;
        q.dist = best;
        TCM.store.record('points', best <= 14);
        renderQuiz(el);
      });
    }
    var nx = TCM.$('#pq-next', el);
    if (nx) nx.addEventListener('click', function () { newQuiz(); renderQuiz(el); });
  }

  TCM.modules.points = {
    han: '穴',
    title: { en: 'Acupoints', vi: 'Huyệt vị' },
    sub: { en: 'Huyệt vị · 腧穴', vi: 'Châm cứu · 腧穴' },
    blurb: { en: 'Thirty-six core points on front and back figures with location, actions, indications and safety notes, plus a click-to-locate drill.', vi: 'Ba mươi sáu huyệt cốt lõi trên hình mặt trước và mặt sau, kèm vị trí, tác dụng, chủ trị, lưu ý an toàn, và bài luyện bấm tìm huyệt.' },
    render: function (el) {
      el.innerHTML = '<div class="page">' + TCM.pageHead('穴', tx('Acupoints', 'Huyệt vị'),
        tx('Points are located with proportional body inches (同身寸 / thốn): for example 12 cun from wrist crease to elbow crease and 16 cun from the knee to the ankle. Figures are in the anatomical position, palms forward.',
          'Huyệt được xác định bằng thốn đồng thân (同身寸): ví dụ từ lằn chỉ cổ tay đến nếp khuỷu là 12 thốn, từ gối đến mắt cá là 16 thốn. Hình vẽ ở tư thế giải phẫu, lòng bàn tay hướng ra trước.')) +
        '<div class="tabs" role="tablist"><button type="button" class="tab" role="tab" data-mode="study" aria-selected="' + (st.mode === 'study') + '">' + tx('Study', 'Học') + '</button>' +
        '<button type="button" class="tab" role="tab" data-mode="quiz" aria-selected="' + (st.mode === 'quiz') + '">' + tx('Locate', 'Tìm huyệt') + '</button></div>' +
        '<div id="pt-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          st.mode = b.getAttribute('data-mode');
          if (st.mode === 'study' && D.pointById[st.sel]) st.view = D.pointById[st.sel].view;
          TCM.rerender();
        });
      });
      var body = TCM.$('#pt-body', el);
      if (st.mode === 'quiz') renderQuiz(body); else renderStudy(body);
    }
  };
})();
