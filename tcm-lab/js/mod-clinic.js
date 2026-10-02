/* Virtual clinic (诊室 / Phòng khám): examine a patient with the Four Examinations,
   differentiate the pattern (辨证 / biện chứng), choose treatment (论治 / luận trị), get scored. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { open: null, cases: {} };
  var engine = null;
  function stopEngine() { if (engine) { engine.stop(); engine = null; } }

  var STEPS = [
    ['look', '望闻', { en: 'Look & listen', vi: 'Vọng – Văn' }],
    ['ask', '问', { en: 'Ask', vi: 'Vấn' }],
    ['feel', '切', { en: 'Palpate', vi: 'Thiết' }],
    ['dx', '辨证', { en: 'Diagnose', vi: 'Biện chứng' }],
    ['tx', '论治', { en: 'Treat', vi: 'Luận trị' }],
    ['review', '评', { en: 'Review', vi: 'Nhận xét' }]
  ];

  function freshState(k) {
    var pats = Object.keys(D.patterns).filter(function (p) { return p !== k.dx.pattern && p !== 'normal'; });
    var prs = Object.keys(D.principles).filter(function (p) { return p !== k.dx.principle; });
    var fos = D.formulas.map(function (f) { return f.id; }).filter(function (f) { return f !== k.dx.formula && k.dx.formulaAlt.indexOf(f) < 0; });
    return {
      step: 'look', asked: [], seed: 1 + Math.floor(Math.random() * 999),
      eight: {}, pattern: null, principle: null, formula: null, points: [],
      patOpts: TCM.shuffle([k.dx.pattern].concat(TCM.sample(pats, 5))),
      prOpts: TCM.shuffle([k.dx.principle].concat(TCM.sample(prs, 4))),
      foOpts: TCM.shuffle([k.dx.formula].concat(k.dx.formulaAlt, TCM.sample(fos, 4 - k.dx.formulaAlt.length))),
      result: null, pressure: 0.5
    };
  }
  function S(k) { return st.cases[k.id] || (st.cases[k.id] = freshState(k)); }

  function patientLine(k) {
    var p = k.patient;
    return p.age + ' · ' + (p.sex === 'F' ? tx('female', 'nữ') : tx('male', 'nam')) + ' · ' + TCM.esc(L(p.note));
  }

  /* ---------- scoring ---------- */
  function score(k, s) {
    var dx = k.dx, parts = [];
    var keyAsked = k.key.filter(function (q) { return s.asked.indexOf(q) >= 0; }).length;
    parts.push({ id: 'inq', label: tx('Inquiry: key questions asked', 'Vấn chẩn: hỏi đúng câu then chốt'), pts: Math.round(15 * keyAsked / k.key.length), max: 15,
      note: keyAsked + ' / ' + k.key.length + ' · ' + k.key.map(function (q) { return L(D.questions.filter(function (x) { return x.id === q; })[0]); }).join(', ') });
    var ax = 0, axNotes = [];
    D.axes.forEach(function (a) {
      var ok = dx[a.id].indexOf(s.eight[a.id]) >= 0;
      if (ok) ax += 5;
      axNotes.push(L(a.opts[dx[a.id][0]]) + (ok ? ' ✓' : ' ✗'));
    });
    parts.push({ id: 'eight', label: tx('Eight Principles', 'Bát cương'), pts: ax, max: 15, note: axNotes.join(' · ') });
    parts.push({ id: 'pat', label: tx('Pattern', 'Chứng'), pts: s.pattern === dx.pattern ? 25 : 0, max: 25, note: TCM.nmText(D.patterns[dx.pattern]) });
    parts.push({ id: 'pr', label: tx('Treatment principle', 'Pháp điều trị'), pts: s.principle === dx.principle ? 15 : 0, max: 15, note: TCM.nmText(D.principles[dx.principle]) });
    var fpts = s.formula === dx.formula ? 15 : dx.formulaAlt.indexOf(s.formula) >= 0 ? 7 : 0;
    parts.push({ id: 'fo', label: tx('Formula', 'Bài thuốc'), pts: fpts, max: 15, note: TCM.nmText(D.formulaById[dx.formula], 'py') + (fpts === 7 ? tx(' (your choice is a reasonable alternative)', ' (lựa chọn của bạn là phương án thay thế hợp lý)') : '') });
    var hit = s.points.filter(function (p) { return dx.points.indexOf(p) >= 0; });
    var bad = s.points.filter(function (p) { return dx.pointsAvoid.indexOf(p) >= 0; });
    var off = s.points.filter(function (p) { return dx.points.indexOf(p) < 0 && dx.pointsOk.indexOf(p) < 0 && dx.pointsAvoid.indexOf(p) < 0; });
    var ppts = Math.max(0, Math.min(15, Math.round(15 * hit.length / dx.points.length) - 3 * off.length - 8 * bad.length));
    parts.push({ id: 'pts', label: tx('Acupoints', 'Huyệt'), pts: ppts, max: 15, note: dx.points.join(', '), bad: bad, off: off });
    var total = parts.reduce(function (t, p) { return t + p.pts; }, 0);
    return { parts: parts, total: total };
  }

  /* ---------- step views ---------- */
  function viewLook(k, s) {
    return '<div class="split"><div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Inspection · 望诊 · Vọng chẩn', 'Vọng chẩn · 望诊') + '</p><p>' + TCM.esc(L(k.look)) + '</p></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Listening & smelling · 闻诊 · Văn chẩn', 'Văn chẩn · 闻诊') + '</p><p>' + TCM.esc(L(k.listen)) + '</p></div>' +
      '<div class="callout callout-info"><span>' + tx('Look at the tongue closely: body colour, shape, coating and moisture. You can compare it with the Tongue reading station later.', 'Quan sát kỹ lưỡi: màu chất lưỡi, hình thể, rêu và độ ẩm. Có thể đối chiếu với trạm Xem lưỡi sau.') + '</span></div></div>' +
      '<div class="tongue-stage">' + TCM.renderTongue(Object.assign({ seed: s.seed }, k.tongue), { label: tx('Patient’s tongue', 'Lưỡi bệnh nhân') }) + '</div></div>';
  }

  function viewAsk(k, s) {
    var qs = D.questions.filter(function (q) { return !(q.id === 'menses' && k.patient.sex === 'M'); });
    var chart = s.asked.map(function (qid) {
      var q = D.questions.filter(function (x) { return x.id === qid; })[0];
      var a = k.ans[qid] || D.caseDefaultAnswer;
      return '<div class="chart-entry"><span class="q">' + TCM.esc(L(q)) + ' <span class="zh" lang="zh-Hans">' + q.zh + '</span></span><span>“' + TCM.esc(L(a)) + '”</span></div>';
    }).join('');
    return '<div class="split"><div class="panel stack"><p class="eyebrow">' + tx('The Ten Questions · 十问 · Thập vấn', 'Thập vấn · 十问') + '</p>' +
      '<p class="small muted">' + tx('Ask what you need. Asking the questions that matter for this patient counts towards your score; asking everything costs nothing but time.', 'Hãy hỏi những gì cần thiết. Hỏi đúng câu then chốt được tính điểm; hỏi hết cũng không bị trừ điểm, chỉ tốn thời gian.') + '</p>' +
      '<div class="q-grid">' + qs.map(function (q) {
        var asked = s.asked.indexOf(q.id) >= 0;
        return '<button type="button" class="q-btn" data-ask="' + q.id + '"' + (asked ? ' disabled' : '') + '><span class="zh" lang="zh-Hans">' + q.zh + '</span><br>' + TCM.esc(L(q)) + '</button>';
      }).join('') + '</div><p class="small muted">' + tx('Asked ', 'Đã hỏi ') + '<span class="mono">' + s.asked.length + ' / ' + qs.length + '</span></p></div>' +
      '<div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Patient’s answers', 'Bệnh nhân trả lời') + '</p>' +
      '<div class="chart-entry"><span class="q">' + tx('Chief complaint', 'Lý do đến khám') + '</span><span>“' + TCM.esc(L(k.cc)) + '”</span></div>' +
      (chart || '<p class="small muted">' + tx('No questions asked yet.', 'Chưa hỏi câu nào.') + '</p>') + '</div></div></div>';
  }

  function viewFeel(k, s) {
    return '<div class="split-wide"><div class="stack"><div class="monitor"><canvas id="cl-canvas" aria-label="' + tx('Patient pulse', 'Mạch bệnh nhân') + '"></canvas><div class="monitor-read" id="cl-read"></div></div>' +
      '<div class="panel panel-tight pressure"><label for="cl-pressure" class="small"><b>' + tx('Finger pressure', 'Lực ấn ngón tay') + '</b></label>' +
      '<input type="range" id="cl-pressure" min="0" max="100" value="' + Math.round(s.pressure * 100) + '">' +
      '<div class="pressure-scale"><span>' + tx('Light · 浮', 'Nhẹ · 浮') + '</span><span>' + tx('Medium · 中', 'Vừa · 中') + '</span><span>' + tx('Heavy · 沉', 'Mạnh · 沉') + '</span></div></div></div>' +
      '<div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Pulse · 脉诊', 'Mạch chẩn · 脉诊') + '</p><p class="small">' + tx('Sweep from light to heavy pressure. Where is it strongest? Is it fast or slow, broad or thin, smooth, taut or rough? Name it to yourself before moving on; the review will tell you.', 'Ấn từ nhẹ đến mạnh. Mạch rõ nhất ở đâu? Nhanh hay chậm, to hay nhỏ, trơn, căng hay rít? Hãy tự gọi tên trước khi đi tiếp; phần nhận xét sẽ cho đáp án.') + '</p></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Body palpation · 按诊', 'Sờ nắn · 按诊') + '</p><p>' + TCM.esc(L(k.palp)) + '</p></div></div></div>';
  }

  function optionList(name, ids, cur, dict, opts) {
    return '<div class="options">' + ids.map(function (id, i) {
      return '<button type="button" class="opt" data-' + name + '="' + id + '" aria-pressed="' + (cur === id) + '"><span class="key">' + 'ABCDEF'[i] + '</span>' + TCM.nm(dict[id], opts) + '</button>';
    }).join('') + '</div>';
  }

  function viewDx(k, s) {
    return '<div class="split"><div class="panel stack"><p class="eyebrow">' + tx('Eight Principles · 八纲 · Bát cương', 'Bát cương · 八纲') + '</p>' +
      D.axes.map(function (a) {
        return '<div class="axis"><span class="small"><b>' + TCM.esc(L(a)) + '</b> <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">' + a.zh + '</span></span><div class="seg" role="group">' +
          Object.keys(a.opts).map(function (o) {
            return '<button type="button" data-axis="' + a.id + '" data-v="' + o + '" aria-pressed="' + (s.eight[a.id] === o) + '">' + TCM.esc(L(a.opts[o])) + ' <span class="zh" lang="zh-Hans">' + a.opts[o].zh + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '<p class="small muted">' + tx('Yin and yang, the last pair of the eight, summarise the other three: interior, cold and deficiency lean yin; exterior, heat and excess lean yang.', 'Âm dương, cặp cuối của bát cương, tổng hợp ba cặp kia: lý, hàn, hư thuộc âm; biểu, nhiệt, thực thuộc dương.') + '</p></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Pattern differentiation · 辨证', 'Biện chứng · 辨证') + '</p>' + optionList('pat', s.patOpts, s.pattern, D.patterns) + '</div></div>';
  }

  function viewTx(k, s) {
    var chs = Object.keys(D.channels);
    var pointsHtml = chs.map(function (ch) {
      var list = D.points.filter(function (p) { return p.ch === ch; });
      if (!list.length) return '';
      return '<div class="row" style="gap:6px"><span class="mono small muted" style="width:28px">' + ch + '</span>' + list.map(function (p) {
        return '<button type="button" class="chip" data-pt="' + p.id + '" aria-pressed="' + (s.points.indexOf(p.id) >= 0) + '" title="' + TCM.esc(TCM.nmText(p) + ' · ' + p.zh) + '"><span class="mono">' + p.id + '</span> ' + TCM.esc(TCM.store.lang() === 'vi' ? p.vi : p.py) + '</button>';
      }).join('') + '</div>';
    }).join('');
    return '<div class="split"><div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Treatment principle · 治法', 'Pháp điều trị · 治法') + '</p>' + optionList('pr', s.prOpts, s.principle, D.principles) + '</div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Formula · 方剂', 'Bài thuốc · 方剂') + '</p>' + optionList('fo', s.foOpts, s.formula, D.formulaById, { enMain: 'py' }) + '</div></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Acupoint prescription · 配穴', 'Phối huyệt · 配穴') + '</p><p class="small muted">' + tx('Choose 3 to 6 points. Points that do not fit cost a little; points that are unsafe for this patient cost a lot.', 'Chọn 3 đến 6 huyệt. Huyệt không phù hợp bị trừ ít; huyệt không an toàn cho bệnh nhân này bị trừ nhiều.') + '</p>' +
      '<p class="small"><b class="mono">' + s.points.length + '</b> / 6 ' + tx('selected', 'đã chọn') + (s.points.length ? ': <span class="mono">' + s.points.join(', ') + '</span>' : '') + '</p>' +
      '<div class="stack" style="gap:6px">' + pointsHtml + '</div></div></div>';
  }

  function viewReview(k, s) {
    var r = s.result;
    var best = TCM.store.caseBest(k.id);
    var h = '<div class="split"><div class="stack"><div class="panel stack"><div class="score-line"><span class="score-big">' + r.total + '</span><span class="muted">/ 100</span>' +
      '<span class="chip ' + (r.total >= 80 ? 'chip-good' : r.total >= 55 ? 'chip-warn' : 'chip-bad') + '">' + (r.total >= 80 ? tx('Sound clinical reasoning', 'Lập luận lâm sàng vững') : r.total >= 55 ? tx('On the right track', 'Đi đúng hướng') : tx('Review this case', 'Cần xem lại ca này')) + '</span>' +
      (best != null ? '<span class="small muted">' + tx('Best: ', 'Cao nhất: ') + '<span class="mono">' + best + '</span></span>' : '') + '</div>' +
      r.parts.map(function (p) {
        var extra = '';
        if (p.bad && p.bad.length) extra += '<div class="callout callout-bad"><b>' + tx('Unsafe for this patient: ', 'Không an toàn cho bệnh nhân này: ') + p.bad.join(', ') + '</b><span>' + tx('These points are traditionally forbidden in pregnancy.', 'Các huyệt này theo truyền thống cấm châm khi có thai.') + '</span></div>';
        if (p.off && p.off.length) extra += '<span class="small muted">' + tx('Less relevant here: ', 'Ít phù hợp: ') + p.off.join(', ') + '</span>';
        return '<div class="result-row"><div class="stack" style="gap:2px"><b>' + p.label + '</b><span class="small muted">' + tx('Expected: ', 'Đáp án: ') + TCM.esc(p.note) + '</span>' + extra + '</div><span class="pts">' + p.pts + ' / ' + p.max + '</span></div>';
      }).join('') + '</div>' +
      '<div class="panel stack"><h4>' + tx('Teaching point', 'Bài học') + '</h4><p>' + TCM.esc(L(k.teach)) + '</p></div>' +
      '<div class="row"><button type="button" class="btn btn-primary" id="cl-next">' + tx('Next patient', 'Bệnh nhân tiếp theo') + '</button><button type="button" class="btn" id="cl-retry">' + tx('Examine again', 'Khám lại') + '</button><button type="button" class="btn btn-ghost" id="cl-list">' + tx('All patients', 'Danh sách bệnh nhân') + '</button></div></div>' +
      '<div class="stack"><div class="panel stack"><h4>' + tx('What you should have found', 'Những gì cần phát hiện') + '</h4><dl class="kv">' +
      '<dt>' + tx('Pattern', 'Chứng') + '</dt><dd>' + TCM.nm(D.patterns[k.dx.pattern]) + '</dd>' +
      '<dt>' + tx('Method', 'Pháp') + '</dt><dd>' + TCM.nm(D.principles[k.dx.principle]) + '</dd>' +
      '<dt>' + tx('Formula', 'Phương') + '</dt><dd><button type="button" class="chip" data-f="' + k.dx.formula + '">' + TCM.esc(TCM.nmText(D.formulaById[k.dx.formula], 'py')) + ' <span class="zh" lang="zh-Hans">' + D.formulaById[k.dx.formula].zh + '</span></button></dd>' +
      '<dt>' + tx('Points', 'Huyệt') + '</dt><dd class="mono">' + k.dx.points.join(', ') + (k.dx.pointsOk.length ? ' <span class="muted">(+ ' + k.dx.pointsOk.join(', ') + ')</span>' : '') + '</dd>' +
      '<dt>' + tx('Pulse', 'Mạch') + '</dt><dd>' + k.pulse.map(function (p) { return TCM.nm(D.pulses[p]); }).join(' + ') + '</dd>' +
      '<dt>' + tx('Tongue', 'Lưỡi') + '</dt><dd>' + TCM.readTongue(k.tongue).findings.map(function (f) { return TCM.esc(TCM.nmText(f.term)); }).join(', ') + '</dd></dl></div>' +
      '<div class="tongue-stage">' + TCM.renderTongue(Object.assign({ seed: s.seed }, k.tongue)) + '</div></div></div>';
    return h;
  }

  /* ---------- case screen ---------- */
  function renderCase(el, k) {
    var s = S(k);
    stopEngine();
    var idx = STEPS.map(function (x) { return x[0]; }).indexOf(s.step);
    var canReview = !!s.result;
    var h = '<div class="page"><header class="page-head"><a href="#clinic" class="small" id="cl-back">← ' + tx('All patients', 'Danh sách bệnh nhân') + '</a>' +
      '<div class="title-row"><span class="title-han" lang="zh-Hans">诊</span><h1>' + TCM.esc(k.patient.name) + '</h1></div>' +
      '<p class="lede">' + patientLine(k) + '</p><p><b>' + tx('Chief complaint: ', 'Lý do khám: ') + '</b>' + TCM.esc(L(k.cc)) + '</p>' +
      (k.preg && s.asked.indexOf('menses') >= 0 ? '<div class="row"><span class="chip chip-bad">' + tx('Pregnant · 20 weeks', 'Đang mang thai · 20 tuần') + '</span></div>' : '') + '</header>' +
      '<nav class="steps" aria-label="' + tx('Examination steps', 'Các bước khám') + '">' + STEPS.map(function (x, i) {
        if (x[0] === 'review' && !canReview) return '';
        var done = (x[0] === 'ask' && s.asked.length) || (x[0] === 'dx' && s.pattern) || (x[0] === 'tx' && s.formula);
        return '<button type="button" class="step' + (done ? ' done' : '') + '" data-step="' + x[0] + '"' + (s.step === x[0] ? ' aria-current="step"' : '') + '><span lang="zh-Hans" class="zh">' + x[1] + '</span> ' + TCM.esc(L(x[2])) + '</button>';
      }).join('') + '</nav><div id="cl-step"></div>';
    if (s.step !== 'review') {
      var ready = s.pattern && s.principle && s.formula && D.axes.every(function (a) { return s.eight[a.id]; }) && s.points.length >= 1;
      h += '<div class="row" style="justify-content:space-between">' +
        (idx > 0 ? '<button type="button" class="btn" id="cl-prev">← ' + TCM.esc(L(STEPS[idx - 1][2])) + '</button>' : '<span></span>') +
        (s.step === 'tx' ? '<button type="button" class="btn btn-primary" id="cl-submit"' + (ready ? '' : ' disabled') + '>' + tx('Submit diagnosis and treatment', 'Nộp chẩn đoán và điều trị') + '</button>'
          : '<button type="button" class="btn btn-primary" id="cl-nextstep">' + TCM.esc(L(STEPS[idx + 1][2])) + ' →</button>') + '</div>';
      if (s.step === 'tx' && !ready) h += '<p class="small muted" style="text-align:right">' + tx('To submit, complete the Eight Principles, pattern, principle, formula and at least one point.', 'Để nộp bài, hãy hoàn thành bát cương, chứng, pháp, phương và ít nhất một huyệt.') + '</p>';
    }
    h += TCM.disclaimer() + '</div>';
    el.innerHTML = h;
    var body = TCM.$('#cl-step', el);
    var views = { look: viewLook, ask: viewAsk, feel: viewFeel, dx: viewDx, tx: viewTx, review: viewReview };
    body.innerHTML = views[s.step](k, s);

    function go(step) { s.step = step; renderCase(el, k); window.scrollTo(0, 0); }
    TCM.$$('[data-step]', el).forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-step')); }); });
    var pv = TCM.$('#cl-prev', el); if (pv) pv.addEventListener('click', function () { go(STEPS[idx - 1][0]); });
    var nx = TCM.$('#cl-nextstep', el); if (nx) nx.addEventListener('click', function () { go(STEPS[idx + 1][0]); });
    TCM.$('#cl-back', el).addEventListener('click', function (e) { e.preventDefault(); st.open = null; TCM.rerender(); });
    var sb = TCM.$('#cl-submit', el);
    if (sb) sb.addEventListener('click', function () {
      s.result = score(k, s);
      TCM.store.setCase(k.id, s.result.total);
      go('review');
    });

    if (s.step === 'ask') {
      TCM.$$('[data-ask]', el).forEach(function (b) {
        b.addEventListener('click', function () { s.asked.push(b.getAttribute('data-ask')); renderCase(el, k); });
      });
    }
    if (s.step === 'feel') {
      var P = TCM.composePulse(k.pulse);
      engine = new TCM.PulseEngine(TCM.$('#cl-canvas', el));
      engine.labels = { light: tx('Light', 'Phù'), mid: tx('Middle', 'Trung'), deep: tx('Deep', 'Trầm') };
      engine.set(P);
      engine.setPressure(s.pressure);
      engine.start();
      var read = TCM.$('#cl-read', el);
      var upd = function () {
        var v = TCM.pulseStrength(P, s.pressure);
        read.innerHTML = '<span><b>' + P.rate + '</b> ' + tx('beats/min', 'lần/phút') + '</span><span>≈ <b>' + (P.rate / 18).toFixed(1) + '</b> ' + tx('per breath', 'nhịp/hơi thở') + '</span><span>' + tx('Felt: ', 'Cảm nhận: ') + '<b>' + (v < 0.06 ? tx('not palpable', 'không bắt được') : v < 0.35 ? tx('faint', 'yếu') : v < 0.75 ? tx('clear', 'rõ') : v < 1.2 ? tx('strong', 'mạnh') : tx('very strong', 'rất mạnh')) + '</b></span>';
      };
      upd();
      TCM.$('#cl-pressure', el).addEventListener('input', function (e) { s.pressure = Number(e.target.value) / 100; engine.setPressure(s.pressure); upd(); });
    }
    if (s.step === 'dx') {
      TCM.$$('[data-axis]', el).forEach(function (b) { b.addEventListener('click', function () { s.eight[b.getAttribute('data-axis')] = b.getAttribute('data-v'); renderCase(el, k); }); });
      TCM.$$('[data-pat]', el).forEach(function (b) { b.addEventListener('click', function () { s.pattern = b.getAttribute('data-pat'); renderCase(el, k); }); });
    }
    if (s.step === 'tx') {
      TCM.$$('[data-pr]', el).forEach(function (b) { b.addEventListener('click', function () { s.principle = b.getAttribute('data-pr'); renderCase(el, k); }); });
      TCM.$$('[data-fo]', el).forEach(function (b) { b.addEventListener('click', function () { s.formula = b.getAttribute('data-fo'); renderCase(el, k); }); });
      TCM.$$('[data-pt]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-pt'), i = s.points.indexOf(id);
          if (i >= 0) s.points.splice(i, 1);
          else if (s.points.length < 6) s.points.push(id);
          else { TCM.toast(tx('Six points at most: remove one first.', 'Tối đa sáu huyệt: hãy bỏ bớt một huyệt.')); return; }
          var y = window.scrollY;
          renderCase(el, k);
          window.scrollTo(0, y);
        });
      });
    }
    if (s.step === 'review') {
      TCM.$('#cl-retry', el).addEventListener('click', function () { st.cases[k.id] = freshState(k); renderCase(el, k); window.scrollTo(0, 0); });
      TCM.$('#cl-list', el).addEventListener('click', function () { st.open = null; TCM.rerender(); });
      TCM.$('#cl-next', el).addEventListener('click', function () {
        var i = D.cases.indexOf(k);
        var nextCase = D.cases[(i + 1) % D.cases.length];
        st.open = nextCase.id;
        TCM.rerender();
      });
      TCM.$$('[data-f]', el).forEach(function (b) { b.addEventListener('click', function () { TCM.openFormula(b.getAttribute('data-f')); }); });
    }
  }

  function renderList(el) {
    var h = '<div class="page">' + TCM.pageHead('诊', tx('Virtual clinic', 'Phòng khám ảo'),
      tx('Each patient is examined in the classical order: look and listen, ask, palpate, then differentiate the pattern and choose a treatment. Scores reward the reasoning chain, not just the final label.',
        'Mỗi bệnh nhân được khám theo trình tự kinh điển: vọng, văn, vấn, thiết, rồi biện chứng và chọn phép trị. Điểm số đánh giá cả chuỗi lập luận, không chỉ kết luận cuối cùng.')) +
      '<div class="case-list">' + D.cases.map(function (k) {
        var best = TCM.store.caseBest(k.id);
        var lv = ['', tx('Foundation', 'Cơ bản'), tx('Intermediate', 'Trung cấp'), tx('Advanced', 'Nâng cao')][k.level];
        return '<button type="button" class="case-card" data-case="' + k.id + '"><span class="who">' + TCM.esc(k.patient.name) + ' <span class="muted small">· ' + k.patient.age + ' · ' + (k.patient.sex === 'F' ? tx('F', 'Nữ') : tx('M', 'Nam')) + '</span></span>' +
          '<span class="cc">“' + TCM.esc(L(k.cc)) + '”</span><span class="foot"><span class="chip">' + lv + '</span>' +
          (best != null ? '<span class="chip ' + (best >= 80 ? 'chip-good' : best >= 55 ? 'chip-warn' : 'chip-bad') + '">' + tx('Best ', 'Cao nhất ') + best + '</span>' : '<span class="small muted">' + tx('Not seen yet', 'Chưa khám') + '</span>') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="panel stack"><h4>' + tx('How the score works', 'Cách tính điểm') + '</h4><div class="table-wrap"><table class="grid-table"><tbody>' +
      '<tr><td>' + tx('Inquiry: asking the key questions', 'Vấn chẩn: hỏi đúng câu then chốt') + '</td><td class="mono">15</td></tr>' +
      '<tr><td>' + tx('Eight Principles: location, nature, strength', 'Bát cương: biểu lý, hàn nhiệt, hư thực') + '</td><td class="mono">15</td></tr>' +
      '<tr><td>' + tx('Pattern differentiation', 'Biện chứng') + '</td><td class="mono">25</td></tr>' +
      '<tr><td>' + tx('Treatment principle', 'Pháp điều trị') + '</td><td class="mono">15</td></tr>' +
      '<tr><td>' + tx('Formula (half credit for a reasonable alternative)', 'Bài thuốc (nửa điểm nếu là phương án thay thế hợp lý)') + '</td><td class="mono">15</td></tr>' +
      '<tr><td>' + tx('Acupoints (deductions for irrelevant or unsafe points)', 'Huyệt (trừ điểm nếu không phù hợp hoặc không an toàn)') + '</td><td class="mono">15</td></tr>' +
      '</tbody></table></div></div>' + TCM.disclaimer() + '</div>';
    el.innerHTML = h;
    TCM.$$('[data-case]', el).forEach(function (b) {
      b.addEventListener('click', function () { st.open = b.getAttribute('data-case'); TCM.rerender(); window.scrollTo(0, 0); });
    });
  }

  TCM.modules.clinic = {
    han: '诊',
    title: { en: 'Virtual clinic', vi: 'Phòng khám ảo' },
    sub: { en: 'Tứ chẩn · 四诊合参', vi: 'Tứ chẩn hợp tham · 四诊' },
    blurb: { en: 'Eleven patients, from a common cold to shaoyang disharmony. Examine, differentiate, prescribe herbs and points, and get a scored review.', vi: 'Mười một bệnh nhân, từ cảm mạo đến chứng thiếu dương. Thăm khám, biện chứng, kê thuốc và huyệt, rồi nhận bài nhận xét có điểm.' },
    leave: stopEngine,
    render: function (el) {
      stopEngine();
      var k = st.open ? D.caseById[st.open] : null;
      if (k) renderCase(el, k); else renderList(el);
    }
  };
})();
