/* Virtual clinic (诊室 / Phòng khám): an illustrated patient examined with hands-on tools
   (四诊 / Tứ chẩn), then pattern differentiation, treatment and a scored review. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { open: null, cases: {} };
  var engine = null;
  function stopEngine() { if (engine) { engine.stop(); engine = null; } }

  var STEPS = [
    ['exam', '四诊', { en: 'Examine', vi: 'Thăm khám' }],
    ['dx', '辨证', { en: 'Diagnose', vi: 'Biện chứng' }],
    ['tx', '论治', { en: 'Treat', vi: 'Luận trị' }],
    ['review', '评', { en: 'Review', vi: 'Nhận xét' }]
  ];
  var TOOLS = [
    ['look', 'eye', '望', { en: 'Inspect', vi: 'Nhìn' }],
    ['tongue', 'tongue', '舌', { en: 'Tongue', vi: 'Xem lưỡi' }],
    ['listen', 'ear', '闻', { en: 'Listen', vi: 'Nghe' }],
    ['ask', 'chat', '问', { en: 'Ask', vi: 'Hỏi' }],
    ['temp', 'thermo', '温', { en: 'Temperature', vi: 'Đo nhiệt' }],
    ['pulse', 'pulse', '脉', { en: 'Pulse', vi: 'Bắt mạch' }],
    ['abd', 'hand', '按', { en: 'Abdomen', vi: 'Sờ bụng' }]
  ];
  var VOICE = {
    c_wind_cold: { v: 'nasal', cough: true }, c_wind_heat: { v: 'hoarse', cough: true }, c_sp_qi: { v: 'weak' },
    c_liver_qi: { v: 'sigh' }, c_kidney_yin: { v: 'normal' }, c_sp_yang: { v: 'weak' }, c_yangming: { v: 'loud' },
    c_phlegm: { v: 'rattle', cough: true }, c_blood_def: { v: 'weak' }, c_insomnia: { v: 'normal' }, c_shaoyang: { v: 'weak', retch: true }
  };
  var PULSES = ['floating', 'deep', 'slow', 'rapid', 'slippery', 'wiry', 'thin', 'deficient', 'excess', 'choppy', 'tight', 'flooding', 'knotted', 'soggy'];

  function V(k) { return D.caseVisual[k.id] || { av: {}, temp: 36.8, touch: D.abdSoft, abd: {} }; }
  function avParams(k) {
    var a = {}, src = V(k).av;
    for (var x in src) a[x] = src[x];
    a.sex = k.patient.sex; a.age = k.patient.age;
    return a;
  }

  function freshState(k) {
    var pats = Object.keys(D.patterns).filter(function (p) { return p !== k.dx.pattern && p !== 'normal'; });
    var prs = Object.keys(D.principles).filter(function (p) { return p !== k.dx.principle; });
    var fos = D.formulas.map(function (f) { return f.id; }).filter(function (f) { return f !== k.dx.formula && k.dx.formulaAlt.indexOf(f) < 0; });
    return {
      step: 'exam', tool: 'look', asked: [], chat: [], seed: 1 + Math.floor(Math.random() * 999),
      found: { look: false, tongue: false, listen: false, temp: false, touch: false, pulse: false }, abd: [],
      pulseRec: [], eight: {}, pattern: null, principle: null, formula: null, points: [], view: 'front',
      patOpts: TCM.shuffle([k.dx.pattern].concat(TCM.sample(pats, 5))),
      prOpts: TCM.shuffle([k.dx.principle].concat(TCM.sample(prs, 4))),
      foOpts: TCM.shuffle([k.dx.formula].concat(k.dx.formulaAlt, TCM.sample(fos, 4 - k.dx.formulaAlt.length))),
      result: null, pressure: 0.5, side: 'left', greeted: false
    };
  }
  function S(k) { return st.cases[k.id] || (st.cases[k.id] = freshState(k)); }
  function qById(id) { return D.questions.filter(function (q) { return q.id === id; })[0]; }

  /* ---------- scoring ---------- */
  function score(k, s) {
    var dx = k.dx, parts = [];
    var keyAsked = k.key.filter(function (q) { return s.asked.indexOf(q) >= 0; }).length;
    parts.push({ label: tx('Inquiry: key questions asked', 'Vấn chẩn: hỏi đúng câu then chốt'), pts: Math.round(10 * keyAsked / k.key.length), max: 10,
      note: keyAsked + ' / ' + k.key.length + ' · ' + k.key.map(function (q) { return L(qById(q)); }).join(', ') });
    var hitP = s.pulseRec.filter(function (p) { return k.pulse.indexOf(p) >= 0; }).length;
    var pp = s.pulseRec.length ? Math.round(10 * hitP / Math.max(k.pulse.length, s.pulseRec.length)) : 0;
    parts.push({ label: tx('Pulse reading', 'Nhận định mạch'), pts: pp, max: 10,
      note: k.pulse.map(function (p) { return TCM.nmText(D.pulses[p]); }).join(' + ') + (s.pulseRec.length ? tx(' · you recorded ', ' · bạn ghi ') + s.pulseRec.map(function (p) { return TCM.nmText(D.pulses[p]); }).join(' + ') : tx(' · not recorded', ' · chưa ghi')) });
    var ax = 0, axNotes = [];
    D.axes.forEach(function (a) {
      var ok = dx[a.id].indexOf(s.eight[a.id]) >= 0;
      if (ok) ax += 5;
      axNotes.push(L(a.opts[dx[a.id][0]]) + (ok ? ' ✓' : ' ✗'));
    });
    parts.push({ label: tx('Eight Principles', 'Bát cương'), pts: ax, max: 15, note: axNotes.join(' · ') });
    parts.push({ label: tx('Pattern', 'Chứng'), pts: s.pattern === dx.pattern ? 25 : 0, max: 25, note: TCM.nmText(D.patterns[dx.pattern]) });
    parts.push({ label: tx('Treatment principle', 'Pháp điều trị'), pts: s.principle === dx.principle ? 10 : 0, max: 10, note: TCM.nmText(D.principles[dx.principle]) });
    var fpts = s.formula === dx.formula ? 15 : dx.formulaAlt.indexOf(s.formula) >= 0 ? 7 : 0;
    parts.push({ label: tx('Formula', 'Bài thuốc'), pts: fpts, max: 15, note: TCM.nmText(D.formulaById[dx.formula], 'py') + (fpts === 7 ? tx(' (your choice is a reasonable alternative)', ' (lựa chọn của bạn là phương án thay thế hợp lý)') : '') });
    var hit = s.points.filter(function (p) { return dx.points.indexOf(p) >= 0; });
    var bad = s.points.filter(function (p) { return dx.pointsAvoid.indexOf(p) >= 0; });
    var off = s.points.filter(function (p) { return dx.points.indexOf(p) < 0 && dx.pointsOk.indexOf(p) < 0 && dx.pointsAvoid.indexOf(p) < 0; });
    var ppts = Math.max(0, Math.min(15, Math.round(15 * hit.length / dx.points.length) - 3 * off.length - 8 * bad.length));
    parts.push({ label: tx('Acupoints', 'Huyệt'), pts: ppts, max: 15, note: dx.points.join(', '), bad: bad, off: off });
    return { parts: parts, total: parts.reduce(function (t, p) { return t + p.pts; }, 0) };
  }

  /* ---------- the consulting room ---------- */
  function roomBackdrop() {
    return '<svg class="room-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="400" height="300" style="fill:var(--surface-2)"/>' +
      '<rect x="292" y="34" width="62" height="118" rx="3" style="fill:var(--surface);stroke:var(--line)"/>' +
      '<text x="323" y="78" text-anchor="middle" font-size="24" font-family="Noto Serif SC, serif" font-weight="700" style="fill:var(--ink)" opacity=".75">仁</text>' +
      '<text x="323" y="110" text-anchor="middle" font-size="24" font-family="Noto Serif SC, serif" font-weight="700" style="fill:var(--ink)" opacity=".75">心</text>' +
      '<rect x="316" y="124" width="14" height="14" rx="2" style="fill:var(--cinnabar)" opacity=".8"/>' +
      '<g opacity=".55"><rect x="22" y="40" width="70" height="150" rx="3" style="fill:var(--surface);stroke:var(--line)"/>' +
      '<path d="M22 78h70M22 115h70M22 152h70M57 40v150" style="stroke:var(--line)"/>' +
      '<circle cx="40" cy="60" r="2.5" style="fill:var(--bronze)"/><circle cx="75" cy="60" r="2.5" style="fill:var(--bronze)"/><circle cx="40" cy="97" r="2.5" style="fill:var(--bronze)"/><circle cx="75" cy="97" r="2.5" style="fill:var(--bronze)"/><circle cx="40" cy="134" r="2.5" style="fill:var(--bronze)"/><circle cx="75" cy="134" r="2.5" style="fill:var(--bronze)"/><circle cx="40" cy="171" r="2.5" style="fill:var(--bronze)"/><circle cx="75" cy="171" r="2.5" style="fill:var(--bronze)"/></g>' +
      '<rect x="0" y="262" width="400" height="38" style="fill:var(--bronze)" opacity=".35"/>' +
      '<rect x="230" y="248" width="56" height="16" rx="8" style="fill:var(--jade)" opacity=".7"/></svg>';
  }

  function recordHtml(k, s) {
    var v = V(k);
    var groups = { wang: [], wen: [], wenq: [], qie: [] };
    if (s.found.look) groups.wang.push('<li>' + TCM.esc(L(k.look)) + '</li>');
    if (s.found.tongue) groups.wang.push('<li class="rec-tongue">' + TCM.renderTongue(Object.assign({ seed: s.seed }, k.tongue), { label: tx('Tongue sketch', 'Hình lưỡi') }) + '<span>' + tx('Tongue observed. Note its colour, shape, coating and moisture.', 'Đã xem lưỡi. Ghi nhận màu, hình thể, rêu và độ ẩm.') + '</span></li>');
    if (s.found.listen) groups.wen.push('<li>' + TCM.esc(L(k.listen)) + '</li>');
    groups.wenq.push('<li><b>' + tx('Complaint: ', 'Lý do khám: ') + '</b>' + TCM.esc(L(k.cc)) + '</li>');
    s.asked.forEach(function (q) { groups.wenq.push('<li><b>' + TCM.esc(L(qById(q))) + ':</b> ' + TCM.esc(L(k.ans[q] || D.caseDefaultAnswer)) + '</li>'); });
    if (s.found.temp) groups.qie.push('<li><b>' + tx('Temperature', 'Nhiệt độ') + ':</b> <span class="mono">' + v.temp.toFixed(1) + ' °C</span></li>');
    if (s.found.touch) groups.qie.push('<li>' + TCM.esc(L(v.touch)) + '</li>');
    if (s.found.pulse) groups.qie.push('<li><b>' + tx('Pulse', 'Mạch') + ':</b> ' + (s.pulseRec.length ? s.pulseRec.map(function (p) { return TCM.esc(TCM.nmText(D.pulses[p])); }).join(' + ') : '<span class="muted">' + tx('felt, not yet named', 'đã bắt, chưa ghi tên mạch') + '</span>') + '</li>');
    s.abd.forEach(function (z) {
      var zone = D.abdZones.filter(function (x) { return x.id === z; })[0];
      var f = v.abd[z];
      groups.qie.push('<li><b>' + TCM.esc(TCM.nmText(zone)) + ':</b> ' + TCM.esc(L(f ? f.t : D.abdSoft)) + '</li>');
    });
    var seals = [['wang', '望', groups.wang.length], ['wen', '闻', groups.wen.length], ['wenq', '问', s.asked.length], ['qie', '切', groups.qie.length]];
    var all = seals.every(function (x) { return x[2]; });
    var h = '<aside class="record"><div class="record-head"><div><p class="eyebrow">' + tx('Case record · 病案', 'Bệnh án · 病案') + '</p><h3>' + TCM.esc(k.patient.name) + '</h3><p class="small muted">' + k.patient.age + ' · ' + (k.patient.sex === 'F' ? tx('female', 'nữ') : tx('male', 'nam')) + ' · ' + TCM.esc(L(k.patient.note)) + '</p></div>' +
      '<div class="seals">' + seals.map(function (x) { return '<span class="seal' + (x[2] ? ' is-on' : '') + '" lang="zh-Hans">' + x[1] + '</span>'; }).join('') + '</div></div>';
    if (all) h += '<p class="small record-ok">' + tx('All four examinations done: 四诊合参.', 'Đã đủ tứ chẩn: tứ chẩn hợp tham.') + '</p>';
    [['wang', tx('Inspection 望', 'Vọng chẩn 望')], ['wen', tx('Listening & smelling 闻', 'Văn chẩn 闻')], ['wenq', tx('Inquiry 问', 'Vấn chẩn 问')], ['qie', tx('Palpation 切', 'Thiết chẩn 切')]].forEach(function (g) {
      h += '<div class="rec-sec"><h4>' + g[1] + '</h4>' + (groups[g[0]].length ? '<ul>' + groups[g[0]].join('') + '</ul>' : '<p class="small muted">' + tx('Nothing recorded yet.', 'Chưa ghi nhận.') + '</p>') + '</div>';
    });
    return h + '</aside>';
  }

  function toolbar(s) {
    return '<div class="tool-tray" role="toolbar" aria-label="' + tx('Examination tools', 'Dụng cụ thăm khám') + '">' + TOOLS.map(function (t) {
      var done = t[0] === 'ask' ? s.asked.length > 0 : t[0] === 'abd' ? s.abd.length > 0 : t[0] === 'temp' ? s.found.temp : !!s.found[t[0]];
      return '<button type="button" class="tool' + (s.tool === t[0] ? ' is-on' : '') + (done ? ' is-done' : '') + '" data-tool="' + t[0] + '">' + TCM.icon(t[1], 22) +
        '<span>' + TCM.esc(L(t[3])) + '</span><i lang="zh-Hans">' + t[2] + '</i></button>';
    }).join('') + '</div>';
  }

  /* --- individual tool panels --- */
  function panelLook(k) {
    return '<div class="work-look"><div class="lens-face">' + TCM.renderAvatar(avParams(k), { label: tx('Close-up of the face', 'Cận cảnh khuôn mặt') }) + '</div>' +
      '<div class="stack"><p class="eyebrow">' + tx('Inspection · 望神 望色 望形态', 'Vọng thần, vọng sắc, vọng hình thái') + '</p><p class="typed" data-typed="' + TCM.esc(L(k.look)) + '"></p>' +
      '<p class="small muted">' + tx('Look at spirit (神), complexion colour and lustre, build and posture.', 'Quan sát thần, màu sắc và độ tươi nhuận của da mặt, hình thể, tư thế.') + '</p></div></div>';
  }
  function panelTongue(k, s) {
    return '<div class="stack"><p class="small muted">' + tx('The patient is showing you the tongue. Move the magnifier across it: tip, sides, centre and root.', 'Bệnh nhân đang thè lưỡi. Di kính lúp khắp lưỡi: đầu, rìa, giữa và cuống lưỡi.') + '</p>' +
      '<div class="magnify" id="cl-mag">' + TCM.renderTongue(Object.assign({ seed: s.seed }, k.tongue), { label: tx('Patient’s tongue', 'Lưỡi bệnh nhân') }) + '<div class="lens" hidden></div></div></div>';
  }
  function panelListen(k) {
    var vc = VOICE[k.id] || { v: 'normal' };
    return '<div class="stack"><div class="voice-scope"><canvas id="cl-voice" aria-label="' + tx('Voice waveform', 'Sóng âm giọng nói') + '"></canvas></div>' +
      '<div class="row"><button type="button" class="btn btn-sm" id="cl-speak">' + TCM.icon('play', 16) + tx(' Ask the patient to speak', ' Mời bệnh nhân nói') + '</button>' +
      (vc.cough ? '<button type="button" class="btn btn-sm" id="cl-cough">' + TCM.icon('play', 16) + tx(' Ask them to cough', ' Mời bệnh nhân ho') + '</button>' : '') + '</div>' +
      '<p class="typed" data-typed="' + TCM.esc(L(k.listen)) + '"></p></div>';
  }
  function panelAsk(k, s) {
    var qs = D.questions.filter(function (q) { return !(q.id === 'menses' && k.patient.sex === 'M'); });
    return '<div class="chat-wrap"><div class="chat" id="cl-chat">' +
      '<div class="msg pt"><span>' + TCM.esc(tx('Hello doctor. ', 'Chào bác sĩ. ') + L(k.cc)) + '</span></div>' +
      s.chat.map(function (m) { return '<div class="msg ' + m[0] + '"><span>' + TCM.esc(m[1]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="q-chips">' + qs.map(function (q) {
        var asked = s.asked.indexOf(q.id) >= 0;
        return '<button type="button" class="chip" data-ask="' + q.id + '"' + (asked ? ' disabled aria-pressed="true"' : '') + '><span class="zh" lang="zh-Hans">' + q.zh.replace('问', '') + '</span> ' + TCM.esc(L(q)) + '</button>';
      }).join('') + '</div><p class="small muted">' + tx('Ask what matters. Key questions earn points; extra ones only cost time.', 'Hãy hỏi điều cần thiết. Câu then chốt được tính điểm; hỏi thêm chỉ tốn thời gian.') + '</p></div>';
  }
  function panelTemp(k, s) {
    var v = V(k);
    var h = Math.round(((s.found.temp ? v.temp : 35) - 35) / 7 * 150);
    return '<div class="work-temp"><svg class="thermo" viewBox="0 0 80 240" role="img" aria-label="' + tx('Thermometer', 'Nhiệt kế') + '">' +
      '<rect x="30" y="14" width="20" height="186" rx="10" style="fill:var(--surface);stroke:var(--line)" stroke-width="2"/>' +
      '<circle cx="40" cy="206" r="18" style="fill:var(--cinnabar)"/>' +
      '<rect id="cl-merc" x="35" y="' + (200 - h) + '" width="10" height="' + (h + 6) + '" rx="5" style="fill:var(--cinnabar);transition:all 1.8s cubic-bezier(.2,.8,.2,1)"/>' +
      [35, 36, 37, 38, 39, 40, 41, 42].map(function (t) { var y = 200 - (t - 35) / 7 * 150; return '<path d="M52 ' + y + ' h8" style="stroke:var(--ink-soft)"/><text x="64" y="' + (y + 3) + '" font-size="9" style="fill:var(--ink-soft)">' + t + '</text>'; }).join('') +
      '<path d="M26 ' + (200 - 2.2 / 7 * 150) + ' h-6" style="stroke:var(--good)" stroke-width="2"/></svg>' +
      '<div class="stack"><div class="score-line"><span class="score-big mono" id="cl-tread">' + (s.found.temp ? v.temp.toFixed(1) : '--.-') + '</span><span class="muted">°C</span></div>' +
      '<div class="row"><button type="button" class="btn btn-primary btn-sm" id="cl-measure">' + tx('Measure (under the arm)', 'Đo nhiệt độ (kẹp nách)') + '</button>' +
      '<button type="button" class="btn btn-sm" id="cl-touch">' + TCM.icon('hand', 16) + tx(' Feel forehead and hands', ' Sờ trán và bàn tay') + '</button></div>' +
      (s.found.touch ? '<p class="typed" data-typed="' + TCM.esc(L(v.touch)) + '"></p>' : '') +
      '<p class="small muted">' + tx('Compare what the patient feels (chills or heat) with what you measure: in a wind-cold attack the patient feels freezing while the skin is warm.', 'So sánh cảm giác của bệnh nhân (sợ lạnh hay nóng) với nhiệt độ đo được: khi cảm phong hàn, bệnh nhân rét run trong khi da vẫn ấm.') + '</p></div></div>';
  }
  function panelPulse(k, s) {
    return '<div class="stack"><div class="row"><div class="seg" role="group"><button type="button" data-side="left" aria-pressed="' + (s.side === 'left') + '">' + tx('Left wrist', 'Cổ tay trái') + '</button><button type="button" data-side="right" aria-pressed="' + (s.side === 'right') + '">' + tx('Right wrist', 'Cổ tay phải') + '</button></div>' +
      '<span class="small muted" id="cl-wstat"></span></div>' +
      '<div id="cl-wrist" class="wrist-host"></div>' +
      '<div class="monitor"><canvas id="cl-canvas" aria-label="' + tx('Pulse under your fingers', 'Mạch dưới ngón tay') + '"></canvas><div class="monitor-read" id="cl-read"></div></div>' +
      '<div class="pressure"><label for="cl-pressure" class="small"><b>' + tx('Finger pressure', 'Lực ấn') + '</b></label><input type="range" id="cl-pressure" min="0" max="100" value="' + Math.round(s.pressure * 100) + '">' +
      '<div class="pressure-scale"><span>' + tx('Light · 浮', 'Nhẹ · 浮') + '</span><span>' + tx('Medium · 中', 'Vừa · 中') + '</span><span>' + tx('Heavy · 沉', 'Mạnh · 沉') + '</span></div></div>' +
      '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Record your reading (up to two)', 'Ghi nhận mạch (tối đa hai)') + '</span><div class="row" style="gap:6px">' + PULSES.map(function (p) {
        return '<button type="button" class="chip" data-prec="' + p + '" aria-pressed="' + (s.pulseRec.indexOf(p) >= 0) + '">' + TCM.esc(TCM.nmText(D.pulses[p])) + ' <span class="zh" lang="zh-Hans">' + D.pulses[p].zh.charAt(0) + '</span></button>';
      }).join('') + '</div></div></div>';
  }
  function panelAbd(k, s) {
    var zones = {
      rhyp: 'M78 70 Q104 88 128 96 L120 132 Q92 120 70 104 Z', epi: 'M128 96 Q150 104 172 96 L180 132 Q150 142 120 132 Z',
      lhyp: 'M172 96 Q196 88 222 70 L230 104 Q208 120 180 132 Z', umb: 'M100 140 Q150 156 200 140 L204 196 Q150 210 96 196 Z',
      lower: 'M96 204 Q150 218 204 204 L196 252 Q150 268 104 252 Z'
    };
    var h = '<div class="work-abd"><svg class="abd-svg" viewBox="0 0 300 290" role="img" aria-label="' + tx('Abdomen: tap a region to palpate', 'Bụng: chạm vào một vùng để sờ nắn') + '">' +
      '<path d="M60 20 Q150 6 240 20 L246 120 Q252 200 230 290 L70 290 Q48 200 54 120 Z" style="fill:var(--skin);stroke:var(--skin-line)" stroke-width="1.5"/>' +
      '<path d="M76 66 Q112 92 150 96 Q188 92 224 66" style="stroke:var(--skin-detail);fill:none" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<path d="M150 20 L150 92" style="stroke:var(--skin-detail)" stroke-width="1" opacity=".6"/>' +
      '<ellipse cx="150" cy="172" rx="4" ry="5" style="fill:var(--skin-detail)"/>';
    D.abdZones.forEach(function (z) {
      h += '<path class="abd-zone' + (s.abd.indexOf(z.id) >= 0 ? ' is-done' : '') + '" data-zone="' + z.id + '" d="' + zones[z.id] + '" tabindex="0" role="button" aria-label="' + TCM.esc(TCM.nmText(z)) + '"/>';
    });
    h += '<g id="cl-press"></g></svg><div class="stack" id="cl-abdtxt"><p class="small muted">' + tx('Tap a region to press it. Watch the patient’s face: is it tender, does pressure bring relief, is it full?', 'Chạm vào một vùng để ấn. Quan sát nét mặt bệnh nhân: đau khi ấn (cự án), ấn thì dễ chịu (hỉ án), hay đầy tức?') + '</p>' +
      s.abd.map(function (z) { var f = V(k).abd[z], zone = D.abdZones.filter(function (x) { return x.id === z; })[0]; return '<div class="chart-entry"><span class="q">' + TCM.nm(zone) + '</span><span>' + TCM.esc(L(f ? f.t : D.abdSoft)) + '</span></div>'; }).join('') + '</div></div>';
    return h;
  }

  function typeOut(el) {
    TCM.$$('.typed', el).forEach(function (p) {
      var full = p.getAttribute('data-typed') || '';
      if (p._done) return;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { p.textContent = full; return; }
      var i = 0;
      (function step() {
        if (!p.isConnected) return;
        i = Math.min(full.length, i + 3);
        p.textContent = full.slice(0, i);
        if (i < full.length) setTimeout(step, 16);
      })();
    });
  }

  function voiceScope(canvas, k, mode) {
    var vc = VOICE[k.id] || { v: 'normal' };
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || 400, h = canvas.clientHeight || 110;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var amp = { weak: 0.25, normal: 0.55, loud: 0.95, hoarse: 0.5, nasal: 0.45, sigh: 0.4, rattle: 0.6 }[vc.v] || 0.5;
    var t0 = performance.now();
    var dur = mode === 'cough' ? 1400 : 2600;
    (function frame(now) {
      if (!canvas.isConnected) return;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(127, 224, 180, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 2) {
        var u = x / w, env;
        if (mode === 'cough') env = Math.exp(-Math.pow((t * 2.2 - u * 1.4 - 0.3) * 4, 2)) * 1.2 + (vc.v === 'rattle' ? 0.15 * Math.sin(u * 90 + t * 30) : 0);
        else env = (0.55 + 0.45 * Math.sin(u * 7 + t * 3)) * (t * 1000 < dur ? 1 : Math.max(0, 1 - (t * 1000 - dur) / 400));
        var noise = vc.v === 'hoarse' || vc.v === 'rattle' ? (Math.random() - 0.5) * 0.5 : 0;
        var y = h / 2 + Math.sin(u * 140 + t * 40) * env * amp * (h * 0.38) * (0.7 + 0.3 * Math.sin(u * 23)) + noise * env * h * 0.2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      if ((now - t0) < dur + 500) requestAnimationFrame(frame);
    })(t0);
  }

  function wireMagnifier(host) {
    var lens = TCM.$('.lens', host), svg = TCM.$('svg', host);
    if (!lens || !svg) return;
    lens.innerHTML = svg.outerHTML;
    var inner = lens.firstChild, Z = 2.6;
    function move(e) {
      var r = host.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { lens.hidden = true; return; }
      lens.hidden = false;
      var sz = lens.offsetWidth || 130;
      lens.style.left = (x - sz / 2) + 'px';
      lens.style.top = (y - sz / 2) + 'px';
      var sr = svg.getBoundingClientRect();
      inner.style.width = (sr.width * Z) + 'px';
      inner.style.left = (-(e.clientX - sr.left) * Z + sz / 2) + 'px';
      inner.style.top = (-(e.clientY - sr.top) * Z + sz / 2) + 'px';
    }
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerdown', move);
    host.addEventListener('pointerleave', function () { lens.hidden = true; });
  }

  function renderExam(el, k, s, rerender) {
    var v = V(k);
    var panels = { look: panelLook, tongue: panelTongue, listen: panelListen, ask: panelAsk, temp: panelTemp, pulse: panelPulse, abd: panelAbd };
    el.innerHTML = '<div class="clinic-grid"><div class="stack"><div class="room">' +
      '<div class="room-stage" id="cl-stage">' + roomBackdrop() +
      TCM.renderAvatar(avParams(k), { label: tx('Your patient', 'Bệnh nhân của bạn'), tongue: D.tongue.body[k.tongue.body].fill, cls: s.tool === 'tongue' ? 'open' : '' }) +
      '<div class="say-bubble" hidden></div></div>' + toolbar(s) + '</div>' +
      '<div class="panel work">' + panels[s.tool](k, s) + '</div></div>' + recordHtml(k, s) + '</div>';
    var stage = TCM.$('#cl-stage', el);
    typeOut(el);
    TCM.$$('[data-tool]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        stopEngine();
        s.tool = b.getAttribute('data-tool');
        if (s.tool === 'look') s.found.look = true;
        if (s.tool === 'tongue') s.found.tongue = true;
        rerender();
        var stg = TCM.$('#cl-stage');
        if (s.tool === 'tongue') TCM.say(stg, tx('Aaah…', 'Aaa…'), { ms: 1600 });
        if (s.tool === 'ask' && !s.greeted) { s.greeted = true; TCM.say(stg, tx('Hello doctor. ', 'Chào bác sĩ. ') + L(k.cc)); }
        if (s.tool === 'pulse') TCM.say(stg, tx('Here is my wrist.', 'Bác sĩ bắt mạch giúp tôi.'), { ms: 1800 });
        if (s.tool === 'abd') TCM.say(stg, tx('Should I lie down?', 'Tôi nằm xuống nhé?'), { ms: 1800 });
      });
    });
    if (s.tool === 'look' && !s.found.look) { s.found.look = true; rerender(); return; }

    if (s.tool === 'tongue') wireMagnifier(TCM.$('#cl-mag', el));

    if (s.tool === 'listen') {
      var cv = TCM.$('#cl-voice', el);
      var vc = VOICE[k.id] || {};
      function speak() {
        if (!s.found.listen) { s.found.listen = true; setTimeout(rerender, 2700); }
        voiceScope(cv, k, 'voice');
        var line = vc.v === 'sigh' ? tx('(sighs deeply) …It has been a stressful year.', '(thở dài) …Một năm nay căng thẳng quá.') : vc.v === 'loud' ? tx('It’s so hot! Can I have some cold water?', 'Nóng quá! Cho tôi xin cốc nước lạnh!') : vc.v === 'weak' ? tx('(quietly) I just feel so tired…', '(nói nhỏ) Tôi thấy mệt quá…') : tx('I’ve been feeling unwell.', 'Dạo này tôi thấy không khỏe.');
        TCM.say(stage, line);
      }
      TCM.$('#cl-speak', el).addEventListener('click', speak);
      var cb = TCM.$('#cl-cough', el);
      if (cb) cb.addEventListener('click', function () {
        if (!s.found.listen) { s.found.listen = true; setTimeout(rerender, 1800); }
        voiceScope(cv, k, 'cough');
        TCM.avatarPulse(stage, 'cough', 1100);
        TCM.say(stage, tx('*cough, cough*', '*khụ khụ*'), { silent: true, ms: 1500 });
      });
      voiceScope(cv, k, 'idle');
    }

    if (s.tool === 'ask') {
      var chat = TCM.$('#cl-chat', el);
      chat.scrollTop = chat.scrollHeight;
      TCM.$$('[data-ask]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var q = qById(b.getAttribute('data-ask'));
          b.disabled = true;
          s.asked.push(q.id);
          var qtext = L(q) + '?';
          s.chat.push(['dr', qtext]);
          var m = document.createElement('div'); m.className = 'msg dr'; m.innerHTML = '<span>' + TCM.esc(qtext) + '</span>'; chat.appendChild(m);
          var typing = document.createElement('div'); typing.className = 'msg pt typing'; typing.innerHTML = '<span><i></i><i></i><i></i></span>'; chat.appendChild(typing);
          chat.scrollTop = chat.scrollHeight;
          setTimeout(function () {
            var ans = L(k.ans[q.id] || D.caseDefaultAnswer);
            s.chat.push(['pt', ans]);
            rerender();
            TCM.say(TCM.$('#cl-stage'), ans);
          }, 700);
        });
      });
    }

    if (s.tool === 'temp') {
      TCM.$('#cl-measure', el).addEventListener('click', function () {
        var merc = TCM.$('#cl-merc', el), hh = Math.round((v.temp - 35) / 7 * 150);
        merc.setAttribute('y', 200 - hh); merc.setAttribute('height', hh + 6);
        var rd = TCM.$('#cl-tread', el), t0 = performance.now();
        (function tick(now) {
          var u = Math.min(1, (now - t0) / 1800);
          rd.textContent = (35 + (v.temp - 35) * (1 - Math.pow(1 - u, 3))).toFixed(1);
          if (u < 1) requestAnimationFrame(tick); else if (!s.found.temp) { s.found.temp = true; setTimeout(rerender, 500); }
        })(t0);
        TCM.say(stage, v.temp >= 37.5 ? tx('Do I have a fever?', 'Tôi có sốt không bác sĩ?') : tx('Is it normal?', 'Có bình thường không ạ?'), { ms: 1800 });
      });
      TCM.$('#cl-touch', el).addEventListener('click', function () { s.found.touch = true; rerender(); });
    }

    if (s.tool === 'pulse') {
      var P = TCM.composePulse(k.pulse);
      engine = new TCM.PulseEngine(TCM.$('#cl-canvas', el));
      engine.labels = { light: tx('Light', 'Phù'), mid: tx('Middle', 'Trung'), deep: tx('Deep', 'Trầm') };
      engine.set(P);
      engine.setPressure(s.pressure);
      engine.start();
      var read = TCM.$('#cl-read', el), wstat = TCM.$('#cl-wstat', el);
      var wrist = new TCM.WristExam(TCM.$('#cl-wrist', el), {
        side: s.side, preplace: s.found.pulse, engine: engine,
        onChange: function (stt) {
          if (stt.correct) {
            wstat.innerHTML = '<span style="color:var(--good)">' + tx('Fingers in place. Now vary the pressure.', 'Đã đặt đúng tay. Giờ hãy thay đổi lực ấn.') + '</span>';
            if (!s.found.pulse) { s.found.pulse = true; var rec = TCM.$('.record', el); if (rec) rec.outerHTML = recordHtml(k, s); }
          } else if (stt.placed === 3) {
            wstat.innerHTML = '<span style="color:var(--bad)">' + tx('Check the order: index on cun (nearest the wrist), middle on guan at the styloid, ring on chi.', 'Kiểm tra lại: ngón trỏ ở thốn (gần cổ tay), ngón giữa ở quan ngang mỏm trâm, ngón áp út ở xích.') + '</span>';
          } else wstat.textContent = tx('Place three fingers: start with the middle finger on guan.', 'Đặt ba ngón: bắt đầu bằng ngón giữa ở bộ quan.');
        }
      });
      wrist.setPressure(s.pressure);
      var upd = function () {
        var vv = engine.contact ? TCM.pulseStrength(P, s.pressure) : 0;
        read.innerHTML = engine.contact ? '<span><b>' + P.rate + '</b> ' + tx('beats/min', 'lần/phút') + '</span><span>≈ <b>' + (P.rate / 18).toFixed(1) + '</b> ' + tx('per breath', 'nhịp/hơi thở') + '</span><span>' + tx('Felt: ', 'Cảm nhận: ') + '<b>' + (vv < 0.06 ? tx('not palpable', 'không bắt được') : vv < 0.35 ? tx('faint', 'yếu') : vv < 0.75 ? tx('clear', 'rõ') : vv < 1.2 ? tx('strong', 'mạnh') : tx('very strong', 'rất mạnh')) + '</b></span>'
          : '<span>' + tx('No contact yet: place your fingers on the wrist.', 'Chưa tiếp xúc: hãy đặt ngón tay lên cổ tay.') + '</span>';
      };
      upd();
      setInterval(function () { if (read.isConnected) upd(); }, 400);
      TCM.$('#cl-pressure', el).addEventListener('input', function (e) { s.pressure = Number(e.target.value) / 100; engine.setPressure(s.pressure); wrist.setPressure(s.pressure); upd(); });
      TCM.$$('[data-side]', el).forEach(function (b) { b.addEventListener('click', function () { s.side = b.getAttribute('data-side'); TCM.$$('[data-side]', el).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); wrist.setSide(s.side); }); });
      TCM.$$('[data-prec]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-prec'), i = s.pulseRec.indexOf(id);
          if (i >= 0) s.pulseRec.splice(i, 1); else { s.pulseRec.push(id); if (s.pulseRec.length > 2) s.pulseRec.shift(); }
          TCM.$$('[data-prec]', el).forEach(function (x) { x.setAttribute('aria-pressed', String(s.pulseRec.indexOf(x.getAttribute('data-prec')) >= 0)); });
          var rec = TCM.$('.record', el); if (rec) rec.outerHTML = recordHtml(k, s);
        });
      });
    }

    if (s.tool === 'abd') {
      var svgA = TCM.$('.abd-svg', el);
      TCM.$$('[data-zone]', el).forEach(function (z) {
        function press(e) {
          var id = z.getAttribute('data-zone');
          var f = v.abd[id];
          var r = f ? f.r : 'none';
          var p = e && e.clientX != null ? TCM.figure.toSvg(svgA, e) : null;
          var bb = z.getBBox();
          var cx = p ? p[0] : bb.x + bb.width / 2, cy = p ? p[1] : bb.y + bb.height / 2;
          TCM.$('#cl-press', el).innerHTML = '<g class="press-hand" transform="translate(' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ')"><circle r="10" class="press-ring"/><circle r="22" class="press-ring r2"/>' +
            '<path d="M-14 -30 q14 -10 28 0 l2 22 q-16 10 -32 0 Z" class="press-palm"/></g>';
          if (r === 'tender') { TCM.avatarPulse(stage, 'wince', 1000); TCM.say(stage, tx('Ow! That’s uncomfortable.', 'Ui! Chỗ đó tức khó chịu lắm.'), { tone: 'pain' }); }
          else if (r === 'relief') TCM.say(stage, tx('Mm, pressing there actually feels good.', 'Ấn vào đó lại thấy dễ chịu.'), { tone: 'ok' });
          else if (r === 'full') TCM.say(stage, tx('It feels so full and bloated.', 'Đầy tức, chướng quá.'));
          else TCM.say(stage, tx('That’s fine, no pain.', 'Không sao, không đau.'), { ms: 1600 });
          if (s.abd.indexOf(id) < 0) s.abd.push(id);
          setTimeout(rerender, 900);
        }
        z.addEventListener('click', press);
        z.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(null); } });
      });
    }
  }

  /* ---------- diagnose ---------- */
  function taiji(lean) {
    var a = Math.max(-1, Math.min(1, lean));
    return '<svg class="taiji" viewBox="-60 -60 120 120" aria-hidden="true"><g style="transform:rotate(' + (a * 60) + 'deg);transition:transform .6s ease">' +
      '<circle r="56" style="fill:var(--surface);stroke:var(--ink)" stroke-width="2"/>' +
      '<path d="M0 -56 A56 56 0 0 1 0 56 A28 28 0 0 1 0 0 A28 28 0 0 0 0 -56 Z" style="fill:var(--ink)"/>' +
      '<circle cy="-28" r="8" style="fill:var(--ink)"/><circle cy="28" r="8" style="fill:var(--surface)"/></g></svg>';
  }
  function viewDx(k, s) {
    var yin = 0, n = 0;
    var map = { exterior: 1, half: 0, interior: -1, cold: -1, neutral: 0, heat: 1, deficiency: -1, mixed: 0, excess: 1 };
    D.axes.forEach(function (a) { if (s.eight[a.id]) { yin += map[s.eight[a.id]]; n++; } });
    var lean = n ? yin / 3 : 0;
    var leanTxt = !n ? tx('Choose each axis to see the yin–yang balance.', 'Chọn từng cặp để thấy cán cân âm dương.') : lean > 0.2 ? tx('Leans yang (表 热 实).', 'Thiên về dương (biểu, nhiệt, thực).') : lean < -0.2 ? tx('Leans yin (里 寒 虚).', 'Thiên về âm (lý, hàn, hư).') : tx('Mixed yin and yang.', 'Âm dương lẫn lộn.');
    return '<div class="split"><div class="panel stack"><div class="row" style="justify-content:space-between;align-items:flex-start"><p class="eyebrow">' + tx('Eight Principles · 八纲', 'Bát cương · 八纲') + '</p>' + taiji(lean) + '</div>' +
      D.axes.map(function (a) {
        return '<div class="axis"><span class="small"><b>' + TCM.esc(L(a)) + '</b> <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">' + a.zh + '</span></span><div class="seg" role="group">' +
          Object.keys(a.opts).map(function (o) {
            return '<button type="button" data-axis="' + a.id + '" data-v="' + o + '" aria-pressed="' + (s.eight[a.id] === o) + '">' + TCM.esc(L(a.opts[o])) + ' <span class="zh" lang="zh-Hans">' + a.opts[o].zh + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '<p class="small muted">' + leanTxt + '</p></div>' +
      '<div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Pattern differentiation · 辨证', 'Biện chứng · 辨证') + '</p><div class="options">' + s.patOpts.map(function (id, i) {
        return '<button type="button" class="opt" data-pat="' + id + '" aria-pressed="' + (s.pattern === id) + '"><span class="key">' + 'ABCDEF'[i] + '</span>' + TCM.nm(D.patterns[id]) + '</button>';
      }).join('') + '</div></div>' + recordHtml(k, s) + '</div></div>';
  }

  /* ---------- treat ---------- */
  function viewTx(k, s) {
    function marks(view) {
      return D.points.filter(function (p) { return p.view === view; }).map(function (p) {
        var on = s.points.indexOf(p.id) >= 0;
        return TCM.figure.positions(p).map(function (xy, i) {
          return '<g class="pt' + (on ? ' is-sel' : '') + '" data-pt="' + p.id + '" tabindex="0" role="button" aria-label="' + TCM.esc(p.id + ' ' + TCM.nmText(p)) + '"><title>' + TCM.esc(p.id + ' · ' + TCM.nmText(p)) + '</title>' +
            '<circle class="hit" cx="' + xy[0] + '" cy="' + xy[1] + '" r="9"/><circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + (on ? 5 : 3.4) + '"/>' +
            (on ? '<path class="mini-needle" d="M' + xy[0] + ' ' + xy[1] + ' l7 -16"/><rect class="mini-handle" x="' + (xy[0] + 5) + '" y="' + (xy[1] - 24) + '" width="4" height="9" rx="1.5" transform="rotate(24 ' + (xy[0] + 7) + ' ' + (xy[1] - 20) + ')"/>' : '') +
            (on && i === 0 ? '<text x="' + (xy[0] + 9) + '" y="' + (xy[1] + 3) + '" style="font-size:8px">' + p.id + '</text>' : '') + '</g>';
        }).join('');
      }).join('');
    }
    return '<div class="split"><div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Treatment principle · 治法', 'Pháp điều trị · 治法') + '</p><div class="options">' + s.prOpts.map(function (id, i) {
      return '<button type="button" class="opt" data-pr="' + id + '" aria-pressed="' + (s.principle === id) + '"><span class="key">' + 'ABCDE'[i] + '</span>' + TCM.nm(D.principles[id]) + '</button>';
    }).join('') + '</div></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Formula · 方剂', 'Bài thuốc · 方剂') + '</p><div class="options">' + s.foOpts.map(function (id, i) {
        var f = D.formulaById[id];
        return '<button type="button" class="opt opt-formula" data-fo="' + id + '" aria-pressed="' + (s.formula === id) + '"><span class="key">' + 'ABCDE'[i] + '</span><span class="stack" style="gap:4px">' + TCM.nm(f, { enMain: 'py' }) +
          '<span class="herb-dots">' + f.herbs.map(function (r) { var lk = D.herbLook[r[0]] || ['#999']; return '<i style="background:' + lk[0] + '" title="' + TCM.esc(TCM.nmText(D.herbById[r[0]], 'py')) + '"></i>'; }).join('') + '<span class="small muted">' + f.herbs.length + tx(' herbs', ' vị') + '</span></span></span></button>';
      }).join('') + '</div></div></div>' +
      '<div class="panel stack"><p class="eyebrow">' + tx('Acupoint prescription · 配穴', 'Phối huyệt · 配穴') + '</p><p class="small muted">' + tx('Tap points on the body to place a needle (3 to 6). Unsafe points for this patient cost a lot.', 'Chạm vào huyệt trên cơ thể để cắm kim (3 đến 6 huyệt). Huyệt không an toàn cho bệnh nhân này bị trừ nhiều điểm.') + '</p>' +
      '<div class="tx-figs"><div class="figure-wrap">' + TCM.figure.svg('front', marks('front'), tx('Front', 'Mặt trước')) + '</div><div class="figure-wrap">' + TCM.figure.svg('back', marks('back'), tx('Back', 'Mặt sau')) + '</div></div>' +
      '<p class="small"><b class="mono">' + s.points.length + '</b> / 6 ' + tx('needles: ', 'kim: ') + '<span class="mono">' + (s.points.join(', ') || '—') + '</span></p></div></div>';
  }

  /* ---------- review ---------- */
  function viewReview(k, s) {
    var r = s.result, best = TCM.store.caseBest(k.id);
    return '<div class="split"><div class="stack"><div class="panel stack"><div class="score-line"><span class="score-big">' + r.total + '</span><span class="muted">/ 100</span>' +
      '<span class="chip ' + (r.total >= 80 ? 'chip-good' : r.total >= 55 ? 'chip-warn' : 'chip-bad') + '">' + (r.total >= 80 ? tx('Sound clinical reasoning', 'Lập luận lâm sàng vững') : r.total >= 55 ? tx('On the right track', 'Đi đúng hướng') : tx('Review this case', 'Cần xem lại ca này')) + '</span>' +
      (best != null ? '<span class="small muted">' + tx('Best: ', 'Cao nhất: ') + '<span class="mono">' + best + '</span></span>' : '') + '</div>' +
      r.parts.map(function (p) {
        var extra = '';
        if (p.bad && p.bad.length) extra += '<div class="callout callout-bad"><b>' + tx('Unsafe for this patient: ', 'Không an toàn cho bệnh nhân này: ') + p.bad.join(', ') + '</b><span>' + tx('These points are traditionally forbidden in pregnancy.', 'Các huyệt này theo truyền thống cấm châm khi có thai.') + '</span></div>';
        if (p.off && p.off.length) extra += '<span class="small muted">' + tx('Less relevant here: ', 'Ít phù hợp: ') + p.off.join(', ') + '</span>';
        return '<div class="result-row"><div class="stack" style="gap:2px"><b>' + p.label + '</b><span class="small muted">' + tx('Expected: ', 'Đáp án: ') + TCM.esc(p.note) + '</span>' + extra + '</div><span class="pts">' + p.pts + ' / ' + p.max + '</span></div>';
      }).join('') + '</div>' +
      '<div class="panel stack"><h4>' + tx('Teaching point', 'Bài học') + '</h4><p>' + TCM.esc(L(k.teach)) + '</p></div>' +
      '<div class="panel stack next-actions"><h4>' + tx('Carry out your treatment', 'Thực hiện điều trị') + '</h4>' +
      '<div class="row"><button type="button" class="btn btn-primary" id="cl-needle">' + TCM.icon('needle', 18) + tx(' Needle your points in the treatment room', ' Châm các huyệt đã chọn ở phòng thủ thuật') + '</button>' +
      '<button type="button" class="btn btn-primary" id="cl-fill">' + TCM.icon('scale', 18) + tx(' Fill your prescription in the pharmacy', ' Bốc thuốc theo đơn ở nhà thuốc') + '</button></div></div>' +
      '<div class="row"><button type="button" class="btn" id="cl-next">' + tx('Next patient', 'Bệnh nhân tiếp theo') + '</button><button type="button" class="btn" id="cl-retry">' + tx('Examine again', 'Khám lại') + '</button><button type="button" class="btn btn-ghost" id="cl-list">' + tx('Waiting room', 'Phòng chờ') + '</button></div></div>' +
      '<div class="stack"><div class="panel stack"><h4>' + tx('What you should have found', 'Những gì cần phát hiện') + '</h4><dl class="kv">' +
      '<dt>' + tx('Pattern', 'Chứng') + '</dt><dd>' + TCM.nm(D.patterns[k.dx.pattern]) + '</dd>' +
      '<dt>' + tx('Method', 'Pháp') + '</dt><dd>' + TCM.nm(D.principles[k.dx.principle]) + '</dd>' +
      '<dt>' + tx('Formula', 'Phương') + '</dt><dd><button type="button" class="chip" data-f="' + k.dx.formula + '">' + TCM.esc(TCM.nmText(D.formulaById[k.dx.formula], 'py')) + ' <span class="zh" lang="zh-Hans">' + D.formulaById[k.dx.formula].zh + '</span></button></dd>' +
      '<dt>' + tx('Points', 'Huyệt') + '</dt><dd class="mono">' + k.dx.points.join(', ') + (k.dx.pointsOk.length ? ' <span class="muted">(+ ' + k.dx.pointsOk.join(', ') + ')</span>' : '') + '</dd>' +
      '<dt>' + tx('Pulse', 'Mạch') + '</dt><dd>' + k.pulse.map(function (p) { return TCM.nm(D.pulses[p]); }).join(' + ') + '</dd>' +
      '<dt>' + tx('Tongue', 'Lưỡi') + '</dt><dd>' + TCM.readTongue(k.tongue).findings.map(function (f) { return TCM.esc(TCM.nmText(f.term)); }).join(', ') + '</dd></dl></div>' +
      '<div class="tongue-stage">' + TCM.renderTongue(Object.assign({ seed: s.seed }, k.tongue)) + '</div></div></div>';
  }

  /* ---------- case screen ---------- */
  function renderCase(el, k) {
    var s = S(k);
    stopEngine();
    var idx = STEPS.map(function (x) { return x[0]; }).indexOf(s.step);
    function rerender() { renderCase(el, k); }
    var h = '<div class="page"><header class="page-head case-head"><a href="#clinic" class="small" id="cl-back">← ' + tx('Waiting room', 'Phòng chờ') + '</a>' +
      '<div class="title-row"><span class="title-han" lang="zh-Hans">诊</span><h1>' + TCM.esc(k.patient.name) + '</h1>' +
      (k.preg && s.asked.indexOf('menses') >= 0 ? '<span class="chip chip-bad">' + tx('Pregnant · 20 weeks', 'Đang mang thai · 20 tuần') + '</span>' : '') + '</div></header>' +
      '<nav class="steps" aria-label="' + tx('Consultation steps', 'Các bước khám') + '">' + STEPS.map(function (x) {
        if (x[0] === 'review' && !s.result) return '';
        var done = (x[0] === 'exam' && s.asked.length && s.found.pulse) || (x[0] === 'dx' && s.pattern) || (x[0] === 'tx' && s.formula);
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
    if (s.step === 'exam') renderExam(body, k, s, rerender);
    else body.innerHTML = s.step === 'dx' ? viewDx(k, s) : s.step === 'tx' ? viewTx(k, s) : viewReview(k, s);

    function go(step) { s.step = step; rerender(); window.scrollTo(0, 0); }
    TCM.$$('[data-step]', el).forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-step')); }); });
    var pv = TCM.$('#cl-prev', el); if (pv) pv.addEventListener('click', function () { go(STEPS[idx - 1][0]); });
    var nx = TCM.$('#cl-nextstep', el); if (nx) nx.addEventListener('click', function () { go(STEPS[idx + 1][0]); });
    TCM.$('#cl-back', el).addEventListener('click', function (e) { e.preventDefault(); stopEngine(); st.open = null; TCM.rerender(); });
    var sb = TCM.$('#cl-submit', el);
    if (sb) sb.addEventListener('click', function () { s.result = score(k, s); TCM.store.setCase(k.id, s.result.total); go('review'); });

    if (s.step === 'dx') {
      TCM.$$('[data-axis]', el).forEach(function (b) { b.addEventListener('click', function () { s.eight[b.getAttribute('data-axis')] = b.getAttribute('data-v'); rerender(); }); });
      TCM.$$('[data-pat]', el).forEach(function (b) { b.addEventListener('click', function () { s.pattern = b.getAttribute('data-pat'); rerender(); }); });
    }
    if (s.step === 'tx') {
      TCM.$$('[data-pr]', el).forEach(function (b) { b.addEventListener('click', function () { s.principle = b.getAttribute('data-pr'); var y = window.scrollY; rerender(); window.scrollTo(0, y); }); });
      TCM.$$('[data-fo]', el).forEach(function (b) { b.addEventListener('click', function () { s.formula = b.getAttribute('data-fo'); var y = window.scrollY; rerender(); window.scrollTo(0, y); }); });
      var figs = TCM.$$('.tx-figs svg', el);
      figs.forEach(function (svgF, fi) { TCM.figure.onPick(svgF, fi ? 'back' : 'front', function (id) { tog(id); }); });
      function tog(id) {
          var i = s.points.indexOf(id);
          if (i >= 0) s.points.splice(i, 1);
          else if (s.points.length < 6) s.points.push(id);
          else { TCM.toast(tx('Six needles at most: remove one first.', 'Tối đa sáu kim: hãy bỏ bớt một kim.')); return; }
          var y = window.scrollY; rerender(); window.scrollTo(0, y);
      }
    }
    if (s.step === 'review') {
      TCM.$('#cl-retry', el).addEventListener('click', function () { st.cases[k.id] = freshState(k); rerender(); window.scrollTo(0, 0); });
      TCM.$('#cl-list', el).addEventListener('click', function () { st.open = null; TCM.rerender(); });
      TCM.$('#cl-next', el).addEventListener('click', function () { st.open = D.cases[(D.cases.indexOf(k) + 1) % D.cases.length].id; TCM.rerender(); window.scrollTo(0, 0); });
      TCM.$$('[data-f]', el).forEach(function (b) { b.addEventListener('click', function () { TCM.openFormula(b.getAttribute('data-f')); }); });
      TCM.$('#cl-needle', el).addEventListener('click', function () { if (TCM.treatLoad) TCM.treatLoad({ name: k.patient.name, points: s.points.slice(), preg: !!k.preg, caseId: k.id }); });
      TCM.$('#cl-fill', el).addEventListener('click', function () { if (TCM.pharmacyLoad) TCM.pharmacyLoad({ name: k.patient.name, formula: s.formula || k.dx.formula }); });
    }
  }

  function renderList(el) {
    var h = '<div class="page">' + TCM.pageHead('诊', tx('Virtual clinic', 'Phòng khám ảo'),
      tx('Your waiting room. Pick a patient, examine them with your own eyes, ears and hands, then differentiate the pattern and treat.',
        'Phòng chờ của bạn. Chọn một bệnh nhân, thăm khám bằng mắt, tai và đôi tay, rồi biện chứng và điều trị.')) +
      '<div class="waiting">' + D.cases.map(function (k) {
        var best = TCM.store.caseBest(k.id);
        var lv = ['', tx('Foundation', 'Cơ bản'), tx('Intermediate', 'Trung cấp'), tx('Advanced', 'Nâng cao')][k.level];
        return '<button type="button" class="patient-card" data-case="' + k.id + '"><span class="pc-face">' + TCM.renderAvatar(avParams(k), { label: k.patient.name }) + '</span>' +
          '<span class="pc-body"><span class="who">' + TCM.esc(k.patient.name) + ' <span class="muted small">· ' + k.patient.age + '</span></span>' +
          '<span class="cc">“' + TCM.esc(L(k.cc)) + '”</span><span class="foot"><span class="chip">' + lv + '</span>' +
          (best != null ? '<span class="chip ' + (best >= 80 ? 'chip-good' : best >= 55 ? 'chip-warn' : 'chip-bad') + '">' + tx('Best ', 'Cao nhất ') + best + '</span>' : '<span class="small muted">' + tx('Waiting', 'Đang chờ') + '</span>') + '</span></span></button>';
      }).join('') + '</div>' + TCM.disclaimer() + '</div>';
    el.innerHTML = h;
    TCM.$$('[data-case]', el).forEach(function (b) {
      b.addEventListener('click', function () { st.open = b.getAttribute('data-case'); TCM.rerender(); window.scrollTo(0, 0); });
    });
  }

  TCM.openCase = function (id) { st.open = id; if (location.hash === '#clinic') TCM.rerender(); else location.hash = 'clinic'; };

  TCM.modules.clinic = {
    han: '诊',
    title: { en: 'Virtual clinic', vi: 'Phòng khám ảo' },
    sub: { en: 'Tứ chẩn · 四诊合参', vi: 'Tứ chẩn hợp tham · 四诊' },
    blurb: { en: 'Eleven illustrated patients. Look, listen, chat, take the temperature, place your fingers on the pulse and palpate the abdomen, then diagnose and treat.', vi: 'Mười một bệnh nhân minh họa. Nhìn, nghe, trò chuyện, đo nhiệt, đặt tay bắt mạch, sờ bụng, rồi chẩn đoán và điều trị.' },
    leave: stopEngine,
    render: function (el) {
      stopEngine();
      var k = st.open ? D.caseById[st.open] : null;
      if (k) renderCase(el, k); else renderList(el);
    }
  };
})();
