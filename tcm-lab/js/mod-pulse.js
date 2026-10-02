/* Pulse station (脉诊 / Mạch chẩn): feel simulated pulses at three depths, identify them,
   and learn the cun–guan–chi positions. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var QUALITIES = ['normal', 'floating', 'deep', 'slow', 'rapid', 'slippery', 'wiry', 'thin', 'deficient', 'excess', 'choppy', 'tight', 'flooding', 'knotted', 'soggy'];
  var st = { mode: 'explore', sel: ['normal'], pressure: 0.5, sound: false, quiz: null, hand: 'left', pos: 'guan' };
  var engine = null;

  function stopEngine() { if (engine) { engine.stop(); engine = null; } }

  function strengthWord(v) {
    if (v < 0.06) return tx('not palpable', 'không bắt được');
    if (v < 0.35) return tx('faint', 'yếu, mờ');
    if (v < 0.75) return tx('clear', 'rõ');
    if (v < 1.2) return tx('strong', 'mạnh');
    return tx('very strong', 'rất mạnh');
  }
  function levelWord(p) {
    return p < 0.34 ? tx('light (浮 floating level)', 'nhẹ tay (phù)') : p < 0.67 ? tx('medium (中 middle level)', 'vừa tay (trung)') : tx('heavy (沉 deep level)', 'ấn mạnh (trầm)');
  }

  function monitorHtml(showRate) {
    return '<div class="wrist-host" id="pl-wrist"></div><div class="monitor"><canvas id="pl-canvas" aria-label="' + tx('Simulated pulse waveform', 'Sóng mạch mô phỏng') + '"></canvas>' +
      '<div class="monitor-read" id="pl-read"></div></div>' +
      '<div class="panel panel-tight pressure"><label for="pl-pressure" class="small"><b>' + tx('Finger pressure', 'Lực ấn ngón tay') + '</b> · <span id="pl-level"></span></label>' +
      '<input type="range" id="pl-pressure" min="0" max="100" value="' + Math.round(st.pressure * 100) + '">' +
      '<div class="pressure-scale"><span>' + tx('Light · 浮 Phù', 'Nhẹ · 浮 Phù') + '</span><span>' + tx('Medium · 中 Trung', 'Vừa · 中 Trung') + '</span><span>' + tx('Heavy · 沉 Trầm', 'Mạnh · 沉 Trầm') + '</span></div>' +
      '<div class="row"><button type="button" class="btn btn-sm" id="pl-sound" aria-pressed="' + st.sound + '">' + (st.sound ? tx('Sound on', 'Đang bật âm thanh') : tx('Play heartbeat sound', 'Bật âm thanh nhịp đập')) + '</button>' +
      (showRate ? '' : '<span class="small muted">' + tx('Rate is hidden: count the beats against the 4-second trace.', 'Tần số được ẩn: hãy đếm nhịp trên dải sóng 4 giây.') + '</span>') + '</div></div>';
  }

  function wireMonitor(el, P, showRate) {
    stopEngine();
    var cv = TCM.$('#pl-canvas', el);
    engine = new TCM.PulseEngine(cv);
    engine.labels = { light: tx('Light', 'Phù'), mid: tx('Middle', 'Trung'), deep: tx('Deep', 'Trầm') };
    engine.set(P);
    engine.setPressure(st.pressure);
    if (st.sound) engine.setSound(true);
    engine.start();
    var wrist = new TCM.WristExam(TCM.$('#pl-wrist', el), { side: st.hand, preplace: true, engine: engine });
    wrist.setPressure(st.pressure);
    var read = TCM.$('#pl-read', el), lvl = TCM.$('#pl-level', el);
    function update() {
      var v = TCM.pulseStrength(P, st.pressure);
      lvl.textContent = levelWord(st.pressure);
      var parts = [];
      if (showRate) {
        parts.push('<span><b>' + P.rate + '</b> ' + tx('beats/min', 'lần/phút') + '</span>');
        parts.push('<span>≈ <b>' + (P.rate / 18).toFixed(1) + '</b> ' + tx('beats per breath', 'nhịp mỗi hơi thở') + '</span>');
      }
      parts.push('<span>' + tx('Felt here: ', 'Cảm nhận: ') + '<b>' + strengthWord(v) + '</b></span>');
      read.innerHTML = parts.join('');
    }
    update();
    TCM.$('#pl-pressure', el).addEventListener('input', function (e) {
      st.pressure = Number(e.target.value) / 100;
      engine.setPressure(st.pressure);
      wrist.setPressure(st.pressure);
      update();
    });
    TCM.$('#pl-sound', el).addEventListener('click', function (e) {
      st.sound = !st.sound;
      engine.setSound(st.sound);
      e.currentTarget.setAttribute('aria-pressed', String(st.sound));
      e.currentTarget.textContent = st.sound ? tx('Sound on', 'Đang bật âm thanh') : tx('Play heartbeat sound', 'Bật âm thanh nhịp đập');
    });
    var ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { if (engine) engine.resize(); });
      ro.observe(cv);
    }
  }

  function qualityCard(id) {
    var q = D.pulses[id];
    return '<div class="chart-entry"><b>' + TCM.nm(q) + '</b><span class="small">' + TCM.esc(L(q.feel)) + '</span><span class="small muted">' + TCM.esc(L(q.mean)) + '</span></div>';
  }

  function renderExplore(el) {
    var P = TCM.composePulse(st.sel);
    el.innerHTML = '<div class="split-wide"><div class="stack">' + monitorHtml(true) + '</div>' +
      '<div class="stack"><div class="panel stack"><h3>' + tx('Choose a pulse', 'Chọn loại mạch') + '</h3>' +
      '<p class="small muted">' + tx('Select up to two qualities to combine them, as in "floating and tight". Slide the pressure from light to heavy and watch where the pulse is strongest.', 'Chọn tối đa hai đặc tính để kết hợp, ví dụ “phù khẩn”. Kéo lực ấn từ nhẹ đến mạnh và quan sát mạch rõ nhất ở đâu.') + '</p>' +
      '<div class="row">' + QUALITIES.map(function (id) {
        var q = D.pulses[id];
        return '<button type="button" class="chip" data-q="' + id + '" aria-pressed="' + (st.sel.indexOf(id) >= 0) + '">' + TCM.esc(TCM.nmText(q)) + ' <span class="zh" lang="zh-Hans">' + q.zh.charAt(0) + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="chart">' + st.sel.map(qualityCard).join('') + '</div></div></div>';
    TCM.$$('[data-q]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-q');
        var i = st.sel.indexOf(id);
        if (id === 'normal') st.sel = ['normal'];
        else if (i >= 0) st.sel.splice(i, 1);
        else {
          st.sel = st.sel.filter(function (x) { return x !== 'normal'; });
          st.sel.push(id);
          if (st.sel.length > 2) st.sel.shift();
        }
        if (!st.sel.length) st.sel = ['normal'];
        renderExplore(el);
      });
    });
    wireMonitor(el, P, true);
  }

  function newQuiz() {
    var pool = QUALITIES;
    var ans = TCM.pick(pool.filter(function (x) { return !st.quiz || x !== st.quiz.ans; }));
    st.quiz = { ans: ans, opts: TCM.options(ans, pool, 4), picked: null };
    st.pressure = 0.5;
  }

  function renderQuiz(el) {
    if (!st.quiz) newQuiz();
    var q = st.quiz, answered = q.picked != null;
    var P = TCM.composePulse([q.ans]);
    var s = TCM.store.stat('pulse');
    var h = '<div class="split-wide"><div class="stack">' + monitorHtml(answered) + '</div><div class="stack"><div class="panel stack">' +
      '<h3>' + tx('Which pulse is this?', 'Đây là mạch gì?') + '</h3>' +
      '<p class="small muted">' + tx('Feel all three depths before you decide. Check the rate, the width of the vessel and the shape of each beat.', 'Hãy bắt ở cả ba mức trước khi kết luận. Chú ý tần số, độ to nhỏ của mạch và hình dạng mỗi nhịp.') + '</p>' +
      '<div class="options">' + q.opts.map(function (id, i) {
        var cls = '';
        if (answered) { if (id === q.ans) cls = ' is-right'; else if (id === q.picked) cls = ' is-wrong'; }
        return '<button type="button" class="opt' + cls + '" data-id="' + id + '"' + (answered ? ' disabled' : '') + '><span class="key">' + 'ABCD'[i] + '</span>' + TCM.nm(D.pulses[id]) + '</button>';
      }).join('') + '</div>';
    if (answered) {
      var ok = q.picked === q.ans;
      h += '<div class="callout ' + (ok ? 'callout-good' : 'callout-bad') + '"><b>' + (ok ? tx('Correct.', 'Chính xác.') : tx('Not quite. It was: ', 'Chưa đúng. Đáp án: ') + TCM.esc(TCM.nmText(D.pulses[q.ans]))) + '</b></div>' +
        qualityCard(q.ans) + '<div class="row"><button type="button" class="btn btn-primary" id="pq-next">' + tx('Next pulse', 'Mạch tiếp theo') + '</button></div>';
    }
    h += '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span></p></div></div></div>';
    el.innerHTML = h;
    TCM.$$('.opt', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.picked != null) return;
        q.picked = b.getAttribute('data-id');
        TCM.store.record('pulse', q.picked === q.ans);
        renderQuiz(el);
      });
    });
    var nx = TCM.$('#pq-next', el);
    if (nx) nx.addEventListener('click', function () { newQuiz(); renderQuiz(el); });
    wireMonitor(el, P, answered);
  }

  function wristSvg() {
    var pos = { cun: 292, guan: 222, chi: 152 };
    var hand = D.pulsePositions[st.hand];
    function short(o) { return TCM.nmText(o).split(' (')[0]; }
    var h = '<svg class="wrist-svg" viewBox="0 0 400 222" role="img" aria-label="' + tx('Wrist pulse positions', 'Vị trí bắt mạch ở cổ tay') + '">';
    h += '<path d="M10 72 L322 64 Q342 62 352 54 L394 46 L396 150 L352 146 Q340 140 322 140 L10 140 Z" style="fill:var(--skin);stroke:var(--skin-line)" stroke-width="1.5"/>';
    h += '<path d="M246 66 Q262 60 270 74 Q262 72 250 72 Z" style="fill:var(--skin-line)" opacity=".5"/>';
    h += '<path d="M326 66 L326 140" style="stroke:var(--skin-detail)" stroke-dasharray="3 3"/>';
    h += '<path d="M20 86 L318 80" stroke="#c0574f" stroke-width="3" opacity=".5"/>';
    h += '<text x="24" y="106" font-size="10" style="fill:var(--ink-soft)">' + tx('radial artery', 'động mạch quay') + ' →</text>';
    h += '<text x="394" y="36" text-anchor="end" font-size="10" style="fill:var(--ink-soft)">' + tx('hand', 'bàn tay') + ' →</text>';
    h += '<text x="326" y="156" text-anchor="middle" font-size="10" style="fill:var(--ink-soft)">' + tx('wrist crease', 'lằn chỉ cổ tay') + '</text>';
    h += '<text x="222" y="156" text-anchor="middle" font-size="10" style="fill:var(--ink-soft)">' + tx('radial styloid', 'mỏm trâm quay') + '</text>';
    ['cun', 'guan', 'chi'].forEach(function (k) {
      var x = pos[k], on = st.pos === k;
      h += '<g class="wx-node" data-pos="' + k + '" tabindex="0" role="button" aria-label="' + TCM.esc(L(D.pulsePositions[k])) + '">' +
        '<rect x="' + (x - 17) + '" y="8" width="34" height="76" rx="16" style="fill:' + (on ? 'var(--jade)' : 'var(--surface)') + ';stroke:var(--jade)" stroke-width="1.5" opacity=".95"/>' +
        '<text x="' + x + '" y="42" text-anchor="middle" font-size="18" font-family="Noto Serif SC, serif" font-weight="700" style="fill:' + (on ? 'var(--jade-ink)' : 'var(--jade)') + '">' + D.pulsePositions[k].zh + '</text>' +
        '<text x="' + x + '" y="64" text-anchor="middle" font-size="10" style="fill:' + (on ? 'var(--jade-ink)' : 'var(--ink)') + '">' + TCM.esc(D.pulsePositions[k].vi) + '</text>' +
        '<text x="' + x + '" y="188" text-anchor="middle" font-size="16" font-family="Noto Serif SC, serif" style="fill:var(--cinnabar)">' + hand[k].zh + '</text>' +
        '<text x="' + x + '" y="206" text-anchor="middle" font-size="10" style="fill:var(--ink)">' + TCM.esc(short(hand[k])) + '</text></g>';
    });
    return h + '</svg>';
  }

  function renderPositions(el) {
    stopEngine();
    var pp = D.pulsePositions;
    el.innerHTML = '<div class="split-wide"><div class="stack"><div class="row"><div class="seg" role="group" id="pp-hand"><button type="button" data-h="left" aria-pressed="' + (st.hand === 'left') + '">' + tx('Patient\u2019s left wrist', 'Cổ tay trái bệnh nhân') + '</button><button type="button" data-h="right" aria-pressed="' + (st.hand === 'right') + '">' + tx('Patient\u2019s right wrist', 'Cổ tay phải bệnh nhân') + '</button></div>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="pp-reset">' + tx('Take fingers off', 'Nhấc tay ra') + '</button></div>' +
      '<div class="wrist-host" id="pp-wrist"></div><div class="callout callout-info" id="pp-stat"></div>' +
      '<div class="monitor"><canvas id="pp-canvas" aria-label="' + tx('Pulse under your fingers', 'Mạch dưới ngón tay') + '"></canvas></div></div>' +
      '<div class="stack"><div class="panel stack"><h3>' + tx('Finger placement drill', 'Luyện đặt ngón tay') + '</h3><p class="small">' + tx(
        'Drag your middle finger onto guan, level with the radial styloid process, then your index finger onto cun (towards the wrist) and your ring finger onto chi. Each position shows the organ it reflects on this wrist. Once all three are right, the pulse comes alive under your fingertips.',
        'Kéo ngón giữa đặt vào bộ quan, ngang mỏm trâm quay, rồi ngón trỏ vào bộ thốn (phía cổ tay) và ngón áp út vào bộ xích. Mỗi bộ hiện tạng phủ tương ứng ở cổ tay này. Khi đặt đúng cả ba, mạch sẽ đập dưới đầu ngón tay.') + '</p></div>' +
      '<div class="panel"><div class="table-wrap"><table class="grid-table"><thead><tr><th></th><th>' + tx('Left', 'Trái') + '</th><th>' + tx('Right', 'Phải') + '</th></tr></thead><tbody>' +
      ['cun', 'guan', 'chi'].map(function (k) { return '<tr><th>' + TCM.esc(L(pp[k])) + ' <span class="zh" lang="zh-Hans">' + pp[k].zh + '</span></th><td>' + TCM.nm(pp.left[k]) + '</td><td>' + TCM.nm(pp.right[k]) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel stack"><h4>' + tx('How to take the pulse', 'Cách bắt mạch') + '</h4><p class="small">' + tx(
        'Seat the patient with the forearm resting at heart level, palm up. Feel each position at light, medium and heavy pressure: three positions times three depths gives the "three regions and nine indicators" (三部九候 / tam bộ cửu hậu). Take at least 50 beats (五十动).',
        'Cho bệnh nhân ngồi, cẳng tay đặt ngang tim, lòng bàn tay ngửa. Bắt mỗi bộ ở ba mức nhẹ, vừa, mạnh: ba bộ nhân ba mức là “tam bộ cửu hậu”. Mỗi lần bắt không dưới 50 nhịp (ngũ thập động).'
      ) + '</p></div></div></div>';
    engine = new TCM.PulseEngine(TCM.$('#pp-canvas', el));
    engine.labels = { light: tx('Light', 'Phù'), mid: tx('Middle', 'Trung'), deep: tx('Deep', 'Trầm') };
    engine.set(TCM.composePulse(['normal']));
    engine.setPressure(0.5);
    engine.start();
    var stat = TCM.$('#pp-stat', el);
    var counted = false;
    var wrist = new TCM.WristExam(TCM.$('#pp-wrist', el), {
      side: st.hand, engine: engine,
      onChange: function (s) {
        if (s.correct) {
          stat.className = 'callout callout-good';
          stat.innerHTML = '<b>' + tx('Correct placement.', 'Đặt tay chính xác.') + '</b><span>' + tx('Feel the pulse rise under all three fingertips.', 'Cảm nhận mạch đập dưới cả ba đầu ngón tay.') + '</span>';
          if (!counted) { counted = true; TCM.store.record('pulse', true); }
        } else if (s.placed === 3) {
          stat.className = 'callout callout-bad';
          stat.innerHTML = '<b>' + tx('Not quite.', 'Chưa đúng.') + '</b><span>' + tx('Index finger on cun nearest the wrist, middle on guan at the styloid, ring on chi.', 'Ngón trỏ ở thốn gần cổ tay, ngón giữa ở quan ngang mỏm trâm, ngón áp út ở xích.') + '</span>';
        } else {
          stat.className = 'callout callout-info';
          stat.innerHTML = '<span>' + tx('Fingers placed: ', 'Đã đặt: ') + s.placed + ' / 3</span>';
        }
      }
    });
    wrist.setPressure(0.5);
    TCM.$$('[data-h]', el).forEach(function (b) { b.addEventListener('click', function () { st.hand = b.getAttribute('data-h'); TCM.$$('[data-h]', el).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); wrist.setSide(st.hand); }); });
    TCM.$('#pp-reset', el).addEventListener('click', function () { renderPositions(el); });
  }

  TCM.modules.pulse = {
    han: '脉',
    title: { en: 'Pulse lab', vi: 'Bắt mạch' },
    sub: { en: 'Mạch chẩn · 脉诊', vi: 'Mạch chẩn · 脉诊' },
    blurb: { en: 'Fifteen pulse qualities you can feel at three depths, with an identification drill and the cun–guan–chi map of both wrists.', vi: 'Mười lăm loại mạch có thể bắt ở ba mức ấn, kèm bài luyện nhận diện và sơ đồ thốn – quan – xích hai tay.' },
    leave: stopEngine,
    render: function (el) {
      stopEngine();
      el.innerHTML = '<div class="page">' + TCM.pageHead('脉', tx('Pulse lab', 'Bắt mạch (Mạch chẩn)'),
        tx('A pulse is described by its depth, rate, width, strength, length and the shape of each wave. The trace shows the force under your finger; the gauge on the right shows where the vessel lies and where your finger is pressing.',
          'Mạch được mô tả theo vị trí nông sâu, tần số, độ to nhỏ, lực, độ dài và hình dạng mỗi làn sóng. Dải sóng cho thấy lực dưới ngón tay; thang bên phải cho thấy mạch nằm ở đâu và ngón tay đang ấn tới đâu.')) +
        '<div class="tabs" role="tablist">' +
        [['explore', tx('Explore', 'Khám phá')], ['quiz', tx('Identify', 'Nhận diện')], ['positions', tx('Place your fingers', 'Đặt ngón tay')]].map(function (t) {
          return '<button type="button" class="tab" role="tab" data-mode="' + t[0] + '" aria-selected="' + (st.mode === t[0]) + '">' + t[1] + '</button>';
        }).join('') + '</div><div id="pl-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) {
        b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); TCM.rerender(); });
      });
      var body = TCM.$('#pl-body', el);
      if (st.mode === 'quiz') renderQuiz(body);
      else if (st.mode === 'positions') renderPositions(body);
      else renderExplore(body);
    }
  };
})();
