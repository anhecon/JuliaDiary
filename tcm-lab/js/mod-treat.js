/* Treatment room (针灸室 / Phòng thủ thuật): needle and moxa points on a live tissue cross-section. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var K = 80;          // px per cun in the cross-section
  var EX = 150, EY = 64; // entry point on the skin
  var LENS = [0.5, 1, 1.5, 2, 3];

  var st = { session: null, view: 'front', sel: 'ST36', mode: 'needle', guide: true, n: {}, m: {} };
  var loopOn = false, held = null;

  TCM.treatLoad = function (session) {
    st.session = session;
    st.n = {}; st.m = {};
    var first = session.points.filter(function (p) { return D.pointById[p]; })[0];
    if (first) { st.sel = first; st.view = D.pointById[first].view; }
    if (location.hash === '#treat') TCM.rerender(); else location.hash = 'treat';
  };

  function NP(id) { return D.needling[id] || { a: ['perp'], d: [0.5, 1], deep: { t: 'bone', at: 1.5 }, moxa: false }; }
  function nState(id) {
    return st.n[id] || (st.n[id] = { len: 1.5, angle: 'perp', swab: false, dep: 0, maxDep: 0, deqi: 0, deqiDone: false, twirl: 0, retain: 0, phase: 'ready', incident: null, bone: false, full: false, score: null, pressed: false });
  }
  function mState(id) { return st.m[id] || (st.m[id] = { dist: 5, T: 34, dose: 0, hot: 0, burned: false, done: false, score: null }); }
  function fatFor(p) { return ['face', 'hand'].indexOf(region(p)) >= 0 ? 0.1 : region(p) === 'trunk' ? 0.4 : 0.25; }
  function region(p) {
    if (/^(GV20|EX-HN3|EX-HN5|LI20)$/.test(p.id)) return 'face';
    if (/^(LI4|LU7|HT7|PC6|TE5|LR3|KI3|BL60)$/.test(p.id)) return 'hand';
    if (/^(CV|ST25|BL1|BL2|LU1|GV4|GV14|GB21)/.test(p.id)) return 'trunk';
    return 'limb';
  }
  function sinA(a) { return Math.sin(D.angles[a].deg * Math.PI / 180); }
  function dirV(a) { var r = D.angles[a].deg * Math.PI / 180; return [Math.cos(r), Math.sin(r)]; }
  function isTarget(id) { return !st.session || st.session.points.indexOf(id) >= 0; }

  /* ---------- scoring ---------- */
  function scoreNeedle(id, n) {
    var np = NP(id), pt = D.pointById[id], notes = [];
    if (n.incident) return { total: 0, notes: [L(n.incident)] };
    var s = 0;
    if (n.swab) s += 10; else notes.push(tx('Skin was not cleaned first.', 'Chưa sát trùng da.'));
    if (np.a.indexOf(n.angle) >= 0) s += 20; else notes.push(tx('Angle should be ', 'Góc châm nên là ') + np.a.map(function (a) { return L(D.angles[a]); }).join(' / ') + '.');
    if (n.maxDep >= np.d[0] - 0.05 && n.maxDep <= np.d[1] + 0.1) s += 25; else notes.push(tx('Depth should be ', 'Độ sâu nên là ') + np.d[0] + '–' + np.d[1] + tx(' cun.', ' thốn.'));
    if (n.deqiDone) s += 25; else notes.push(tx('De qi (得气) was not obtained.', 'Chưa đắc khí (得气).'));
    if (n.retain >= 1) s += 10; else notes.push(tx('Needle not retained.', 'Chưa lưu kim.'));
    if (n.pressed) s += 10;
    if (n.bone) { s -= 15; notes.push(tx('The needle struck bone.', 'Kim chạm xương.')); }
    if (n.full) { s -= 10; notes.push(tx('Inserted to the root of the shaft: always leave part of the shaft out.', 'Châm ngập hết thân kim: luôn chừa lại một phần thân kim.')); }
    if (st.session && st.session.preg && pt.preg) { s = 0; notes.push(tx('Forbidden in pregnancy.', 'Cấm châm khi có thai.')); }
    return { total: Math.max(0, s), notes: notes };
  }

  /* ---------- cross-section ---------- */
  function crossSection(p, n, mode) {
    var np = NP(p.id), deep = D.deepTypes[np.deep.t];
    var yF = EY + 4, yM = EY + fatFor(p) * K, yD = EY + np.deep.at * K;
    var s = '<svg id="tr-xs" class="xs" viewBox="0 0 420 300" role="img" aria-label="' + tx('Tissue cross-section under the point', 'Mặt cắt mô dưới huyệt') + '">';
    s += '<defs><pattern id="tr-musc" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#c9675e"/><path d="M0 3h10M0 8h10" stroke="#b5554d" stroke-width="1.2"/></pattern>' +
      '<pattern id="tr-lung" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#f2b8c0"/><circle cx="7" cy="7" r="4" fill="#f7d0d5"/></pattern>' +
      '<pattern id="tr-coil" width="4" height="6" patternUnits="userSpaceOnUse"><rect width="4" height="6" fill="#b87333"/><rect width="4" height="2" fill="#e0a060"/></pattern>' +
      '<radialGradient id="tr-ember"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ff3b00" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect x="0" y="0" width="420" height="' + EY + '" style="fill:var(--surface)"/>';
    s += '<rect x="0" y="' + EY + '" width="420" height="' + (yM - EY) + '" fill="#f3d9a6"/>';
    s += '<rect x="0" y="' + yM + '" width="420" height="' + Math.max(0, yD - yM) + '" fill="url(#tr-musc)"/>';
    if (np.deep.t === 'lung') s += '<rect x="0" y="' + (yD - 8) + '" width="420" height="8" fill="#efe7d4"/><rect x="0" y="' + yD + '" width="420" height="' + (300 - yD) + '" fill="url(#tr-lung)"/><path d="M0 ' + yD + 'H420" stroke="#d9707e" stroke-width="3"/>';
    else if (np.deep.t === 'artery') s += '<rect x="0" y="' + yD + '" width="420" height="22" rx="11" fill="#c0392b"/><path d="M0 ' + (yD + 11) + 'H420" stroke="#e8786b" stroke-width="3" class="flow"/><rect x="0" y="' + (yD + 22) + '" width="420" height="' + (300 - yD - 22) + '" fill="url(#tr-musc)"/>';
    else if (np.deep.t === 'organ') s += '<path d="M0 ' + yD + 'H420" stroke="#9a6a5a" stroke-width="2"/><rect x="0" y="' + (yD + 2) + '" width="420" height="' + (300 - yD) + '" fill="#e8a98c"/>' + [40, 120, 200, 280, 360].map(function (x) { return '<ellipse cx="' + x + '" cy="' + (yD + 30) + '" rx="34" ry="16" fill="#d98f72" stroke="#c07a60"/>'; }).join('');
    else if (np.deep.t === 'spine' || np.deep.t === 'medulla') s += '<rect x="0" y="' + (yD - 14) + '" width="420" height="14" fill="#efe7d4"/><rect x="0" y="' + yD + '" width="420" height="' + (300 - yD) + '" fill="#d9c7e8"/><path d="M0 ' + (yD + 24) + 'H420" stroke="#b9a2cf" stroke-width="2" stroke-dasharray="6 4"/>';
    else s += '<rect x="0" y="' + yD + '" width="420" height="' + (300 - yD) + '" fill="#efe7d4"/><path d="M0 ' + yD + 'H420" stroke="#d6c9a8" stroke-width="3"/>';
    s += '<rect x="0" y="' + EY + '" width="420" height="4" fill="#e6b796"/>';
    // labels
    var lab = function (y, t) { return '<text x="414" y="' + y + '" text-anchor="end" font-size="10" fill="#3a2a22" opacity=".85">' + TCM.esc(t) + '</text>'; };
    s += lab(EY - 4, tx('skin surface', 'mặt da')) + lab((yF + yM) / 2 + 4, tx('subcutaneous fat', 'mỡ dưới da')) + lab((yM + yD) / 2 + 4, tx('muscle', 'cơ'));
    s += lab(yD + 16, L(deep) + (deep.serious ? tx(' (danger)', ' (nguy hiểm)') : ''));
    // depth ruler (vertical cun)
    for (var c = 0; c <= 2.75; c += 0.25) {
      var yy = EY + c * K;
      s += '<path d="M0 ' + yy + 'h' + (c % 1 === 0 ? 12 : c % 0.5 === 0 ? 8 : 4) + '" stroke="#1b2420" stroke-width="1" opacity=".6"/>';
      if (c % 0.5 === 0 && c > 0) s += '<text x="14" y="' + (yy + 3) + '" font-size="9" fill="#1b2420" opacity=".75">' + c + '</text>';
    }
    s += '<text x="4" y="' + (EY - 6) + '" font-size="9" style="fill:var(--ink-soft)">' + tx('cun', 'thốn') + '</text>';
    s += '<g id="tr-guide"></g><g id="tr-needle"></g><g id="tr-moxa"></g><g id="tr-fx"></g>';
    s += '<circle cx="' + EX + '" cy="' + EY + '" r="3" fill="#8f5d22"/>';
    return s + '</svg>';
  }

  function drawGuide(p, n) {
    var g = TCM.$('#tr-guide');
    if (!g) return;
    if (!st.guide || st.mode !== 'needle') { g.innerHTML = ''; return; }
    var np = NP(p.id), dv = dirV(n.angle);
    var a = [EX + dv[0] * np.d[0] * K, EY + dv[1] * np.d[0] * K], b = [EX + dv[0] * np.d[1] * K, EY + dv[1] * np.d[1] * K];
    var e = [EX + dv[0] * 3 * K, EY + dv[1] * 3 * K];
    g.innerHTML = '<path d="M' + EX + ' ' + EY + ' L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '" stroke="#1b2420" stroke-dasharray="3 4" opacity=".35"/>' +
      '<path d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + '" stroke="#2b7a4b" stroke-width="10" stroke-linecap="round" opacity=".45"/>';
  }

  function drawNeedle(p, n) {
    var g = TCM.$('#tr-needle');
    if (!g) return;
    if (st.mode !== 'needle') { g.innerHTML = ''; return; }
    var dv = dirV(n.angle);
    var gap = n.phase === 'ready' ? 0.35 : 0;
    var d = n.dep - gap;
    var tip = [EX + dv[0] * d * K, EY + dv[1] * d * K];
    var root = [tip[0] - dv[0] * n.len * K, tip[1] - dv[1] * n.len * K];
    var hEnd = [root[0] - dv[0] * 46, root[1] - dv[1] * 46];
    var ang = Math.atan2(dv[1], dv[0]) * 180 / Math.PI;
    var off = (n.twirl * 8) % 6;
    g.innerHTML =
      (n.deqiDone ? '<circle cx="' + tip[0].toFixed(1) + '" cy="' + tip[1].toFixed(1) + '" r="16" class="deqi-glow"/>' : '') +
      '<path d="M' + root[0].toFixed(1) + ' ' + root[1].toFixed(1) + ' L' + tip[0].toFixed(1) + ' ' + tip[1].toFixed(1) + '" stroke="#c9d2d6" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M' + root[0].toFixed(1) + ' ' + root[1].toFixed(1) + ' L' + tip[0].toFixed(1) + ' ' + tip[1].toFixed(1) + '" stroke="#6f7c82" stroke-width=".8"/>' +
      '<g transform="translate(' + hEnd[0].toFixed(1) + ' ' + hEnd[1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ')" class="tr-handle"><rect x="0" y="-4" width="46" height="8" rx="2" fill="url(#tr-coil)" style="transform:translateY(' + 0 + 'px)"/>' +
      '<g style="transform:translateX(' + off.toFixed(1) + 'px)"><path d="M0 -4v8M6 -4v8M12 -4v8M18 -4v8M24 -4v8M30 -4v8M36 -4v8M42 -4v8" stroke="#7a4a1e" stroke-width="1" opacity=".6"/></g>' +
      '<circle cx="-3" cy="0" r="3.5" fill="#b87333"/></g>' +
      (n.pressed ? '<circle cx="' + EX + '" cy="' + (EY - 6) + '" r="9" fill="#ffffff" stroke="#d8d0c2"/>' : '');
  }

  function drawMoxa(p, m) {
    var g = TCM.$('#tr-moxa');
    if (!g) return;
    if (st.mode !== 'moxa') { g.innerHTML = ''; return; }
    var y = EY - 8 - m.dist * 10;
    var flush = m.done ? '<ellipse cx="' + EX + '" cy="' + (EY + 3) + '" rx="34" ry="6" fill="#e0533f" opacity=".45"/>' : '';
    var blister = m.burned ? '<ellipse cx="' + EX + '" cy="' + (EY - 2) + '" rx="9" ry="5" fill="#fff6d6" stroke="#e0a060"/>' : '';
    var warm = Math.max(0, Math.min(1, (m.T - 36) / 16));
    g.innerHTML = flush + blister +
      '<ellipse cx="' + EX + '" cy="' + (EY + 2) + '" rx="' + (16 + warm * 26).toFixed(1) + '" ry="' + (4 + warm * 6).toFixed(1) + '" fill="#ff7a1a" opacity="' + (warm * 0.45).toFixed(2) + '"/>' +
      '<g class="moxa-stick" data-drag="moxa" style="cursor:ns-resize"><rect x="' + (EX - 9) + '" y="' + (y - 120) + '" width="18" height="120" rx="3" fill="#e9dcc0" stroke="#b9a684"/>' +
      '<rect x="' + (EX - 9) + '" y="' + (y - 120) + '" width="18" height="18" fill="#c94f2e" opacity=".7"/>' +
      '<circle cx="' + EX + '" cy="' + (y + 2) + '" r="16" fill="url(#tr-ember)" class="ember"/><rect x="' + (EX - 9) + '" y="' + (y - 6) + '" width="18" height="8" fill="#5a4a3a"/></g>' +
      '<path d="M' + (EX + 26) + ' ' + (EY - 2) + ' v' + (-(m.dist * 10 + 6)) + '" stroke="#1b2420" stroke-width="1" opacity=".5"/><text x="' + (EX + 30) + '" y="' + (EY - m.dist * 5) + '" font-size="10" style="fill:var(--ink)">' + m.dist.toFixed(1) + ' cm</text>';
    var fx = TCM.$('#tr-fx');
    if (fx && !m._smoke) {
      m._smoke = true;
      fx.innerHTML = [0, 1, 2, 3, 4].map(function (i) { return '<circle class="smoke s' + i + '" r="6" fill="#9aa0a0"/>'; }).join('');
    }
    TCM.$$('#tr-fx .smoke').forEach(function (c, i) {
      var t = (performance.now() / 1000 + i * 0.5) % 2.5;
      c.setAttribute('cx', (EX + Math.sin(t * 2 + i) * 8).toFixed(1));
      c.setAttribute('cy', (y - 124 - t * 30).toFixed(1));
      c.setAttribute('opacity', (0.35 * (1 - t / 2.5)).toFixed(2));
      c.setAttribute('r', (5 + t * 5).toFixed(1));
    });
  }

  /* ---------- page ---------- */
  function figureMarks(view) {
    return D.points.filter(function (p) { return p.view === view; }).map(function (p) {
      var n = st.n[p.id], m = st.m[p.id], target = st.session && st.session.points.indexOf(p.id) >= 0;
      var inNow = n && n.dep > 0 && !n.incident && n.phase !== 'done';
      var cls = 'pt' + (st.sel === p.id ? ' is-sel' : '') + (target ? ' is-target' : '') + (st.session && !target ? ' is-dim' : '');
      return TCM.figure.positions(p).map(function (xy, i) {
        var h = '<g class="' + cls + '" data-id="' + p.id + '" tabindex="0" role="button" aria-label="' + TCM.esc(p.id + ' ' + TCM.nmText(p)) + '"><title>' + TCM.esc(p.id + ' · ' + TCM.nmText(p)) + '</title>';
        if (target) h += '<circle class="target-ring" cx="' + xy[0] + '" cy="' + xy[1] + '" r="9"/>';
        h += '<circle class="hit" cx="' + xy[0] + '" cy="' + xy[1] + '" r="9"/><circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="3.4"/>';
        if (inNow) h += '<path class="mini-needle" d="M' + xy[0] + ' ' + xy[1] + ' l6 -16"/><rect class="mini-handle" x="' + (xy[0] + 4) + '" y="' + (xy[1] - 24) + '" width="4" height="9" rx="1.5" transform="rotate(22 ' + (xy[0] + 6) + ' ' + (xy[1] - 20) + ')"/>';
        if (m && m.done) h += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="8" fill="#ff7a1a" opacity=".35"/>';
        if ((n && n.score) || (m && m.score)) {
          var sc = n && n.score ? n.score.total : m.score.total;
          h += '<circle cx="' + (xy[0] + 7) + '" cy="' + (xy[1] - 7) + '" r="4" fill="' + (sc >= 70 ? '#2b7a4b' : sc >= 40 ? '#c08a1a' : '#b3392c') + '"/>';
        }
        if (target && i === 0) h += '<text x="' + (xy[0] + 10) + '" y="' + (xy[1] + 3) + '" style="font-size:8px">' + p.id + '</text>';
        return h + '</g>';
      }).join('');
    }).join('');
  }

  function benchHtml(p) {
    var np = NP(p.id), n = nState(p.id), m = mState(p.id);
    var preg = st.session && st.session.preg && p.preg;
    var locked = n.phase !== 'ready';
    var h = '<div class="panel stack bench"><div class="row" style="justify-content:space-between;align-items:flex-start"><div class="row" style="gap:12px"><span class="detail-han" lang="zh-Hans" style="font-size:2rem">' + p.zh + '</span><div><h3>' + TCM.esc(TCM.store.lang() === 'vi' ? p.vi : p.py) + ' <span class="mono small muted">' + p.id + '</span></h3><span class="small muted">' + TCM.esc(L(p.loc)) + '</span></div></div>' +
      '<div class="seg" role="group"><button type="button" data-mode="needle" aria-pressed="' + (st.mode === 'needle') + '">' + TCM.icon('needle', 16) + ' ' + tx('Needle', 'Châm') + '</button><button type="button" data-mode="moxa" aria-pressed="' + (st.mode === 'moxa') + '"' + (np.moxa ? '' : ' disabled title="' + tx('Moxa is not usually applied here', 'Thường không cứu ở huyệt này') + '"') + '>' + TCM.icon('moxa', 16) + ' ' + tx('Moxa', 'Cứu') + '</button></div></div>';
    if (preg) h += '<div class="callout callout-bad"><b>' + tx('This patient is pregnant.', 'Bệnh nhân đang mang thai.') + '</b><span>' + TCM.esc(L(p.caution)) + '</span></div>';
    else if (p.caution && st.guide) h += '<div class="callout callout-warn"><span>' + TCM.esc(L(p.caution)) + '</span></div>';
    h += '<div class="xs-wrap" id="tr-xswrap">' + crossSection(p, n, st.mode) + '<div class="say-bubble xs-say" hidden></div></div>';
    if (st.mode === 'needle') {
      h += '<div class="bench-ctrls"><div class="field"><span class="lbl">' + tx('1 · Needle length', '1 · Chiều dài kim') + '</span><div class="seg" role="group">' + LENS.map(function (l) { return '<button type="button" data-len="' + l + '" aria-pressed="' + (n.len === l) + '"' + (locked ? ' disabled' : '') + '>' + l + ' ' + tx('cun', 'thốn') + '</button>'; }).join('') + '</div></div>' +
        '<div class="field"><span class="lbl">' + tx('2 · Angle', '2 · Góc châm') + '</span><div class="seg" role="group">' + ['perp', 'obl', 'trans'].map(function (a) { return '<button type="button" data-ang="' + a + '" aria-pressed="' + (n.angle === a) + '"' + (locked ? ' disabled' : '') + '>' + TCM.esc(L(D.angles[a])) + '</button>'; }).join('') + '</div></div></div>' +
        '<div class="row"><button type="button" class="btn btn-sm" id="tr-swab"' + (n.swab || locked ? ' disabled' : '') + '>' + (n.swab ? TCM.icon('check', 16) + ' ' : '') + tx('Clean the skin', 'Sát trùng da') + '</button>' +
        '<button type="button" class="btn btn-primary btn-sm hold" data-hold="in"' + (n.incident || n.phase === 'done' || n.phase === 'out' ? ' disabled' : '') + '>' + tx('Insert (hold)', 'Đẩy kim (giữ)') + '</button>' +
        '<button type="button" class="btn btn-sm hold" data-hold="back"' + (n.dep <= 0 || n.phase === 'done' ? ' disabled' : '') + '>' + tx('Withdraw a little (hold)', 'Rút lui kim (giữ)') + '</button>' +
        '<button type="button" class="btn btn-sm hold" data-hold="twirl"' + (n.dep <= 0 || n.incident || n.phase === 'done' ? ' disabled' : '') + '>' + tx('Twirl 捻转 (hold)', 'Vê kim 捻转 (giữ)') + '</button>' +
        '<button type="button" class="btn btn-sm hold" data-hold="lift"' + (n.dep <= 0 || n.incident || n.phase === 'done' ? ' disabled' : '') + '>' + tx('Lift–thrust 提插 (hold)', 'Đề sáp 提插 (giữ)') + '</button></div>' +
        '<div class="meters"><div class="meter-row"><span class="small">' + tx('Depth', 'Độ sâu') + '</span><span class="mono" id="tr-dep">0.00</span><span class="small muted">' + tx('cun along the needle', 'thốn theo thân kim') + (st.guide ? ' · ' + tx('target ', 'mục tiêu ') + np.d[0] + '–' + np.d[1] : '') + '</span></div>' +
        '<div class="meter-row"><span class="small">' + tx('De qi 得气', 'Đắc khí 得气') + '</span><span class="meter deqi"><span id="tr-deqi" style="width:' + Math.round(n.deqi * 100) + '%"></span></span></div>' +
        '<div class="meter-row"><span class="small">' + tx('Retention', 'Lưu kim') + '</span><span class="meter"><span id="tr-ret" style="width:' + Math.round(n.retain * 100) + '%"></span></span><span class="small muted mono" id="tr-retmin">' + Math.round(n.retain * 20) + ' / 20 ' + tx('min', 'phút') + '</span></div></div>' +
        '<div class="row"><button type="button" class="btn btn-sm" id="tr-retain"' + (n.dep > 0 && !n.incident && n.retain < 1 && n.phase !== 'done' ? '' : ' disabled') + '>' + tx('Retain 20 min', 'Lưu kim 20 phút') + '</button>' +
        '<button type="button" class="btn btn-sm" id="tr-out"' + (n.dep > 0 && n.phase !== 'done' ? '' : ' disabled') + '>' + tx('Withdraw and press the hole', 'Rút kim, ấn lỗ kim') + '</button>' +
        (n.phase === 'done' ? '<button type="button" class="btn btn-sm btn-ghost" id="tr-again">' + tx('Needle again', 'Châm lại') + '</button>' : '') + '</div>';
      if (n.score) h += resultHtml(n.score);
      else if (n.incident) h += '<div class="callout callout-bad"><b>' + tx('Incident', 'Tai biến') + '</b><span>' + TCM.esc(L(n.incident)) + '</span></div>';
    } else {
      h += '<div class="field"><label class="lbl" for="tr-dist">' + tx('Distance of the moxa stick from the skin (drag the stick or use the slider)', 'Khoảng cách điếu ngải tới da (kéo điếu ngải hoặc dùng thanh trượt)') + '</label><input type="range" id="tr-dist" min="0.5" max="8" step="0.1" value="' + m.dist + '"' + (m.done ? ' disabled' : '') + '></div>' +
        '<div class="meters"><div class="meter-row"><span class="small">' + tx('Skin heat', 'Nhiệt độ da') + '</span><span class="heat-bar"><i id="tr-heat"></i><b class="band"></b></span><span class="mono small" id="tr-T">' + m.T.toFixed(0) + ' °C</span></div>' +
        '<div class="meter-row"><span class="small">' + tx('Warming dose', 'Lượng cứu') + '</span><span class="meter"><span id="tr-dose" style="width:' + Math.round(m.dose * 100) + '%"></span></span></div></div>' +
        '<p class="small muted">' + tx('Gentle warming moxibustion (温和灸): keep the skin pleasantly warm, flushed pink but never burning, for about 10 to 15 minutes.', 'Ôn hòa cứu (温和灸): giữ da ấm dễ chịu, ửng hồng nhưng không bỏng, khoảng 10–15 phút.') + '</p>' +
        (m.score ? resultHtml(m.score) + '<div class="row"><button type="button" class="btn btn-sm btn-ghost" id="tr-moxa-again">' + tx('Apply again', 'Cứu lại') + '</button></div>' : '');
    }
    h += '</div>';
    return h;
  }
  function resultHtml(sc) {
    return '<div class="callout ' + (sc.total >= 70 ? 'callout-good' : sc.total >= 40 ? 'callout-warn' : 'callout-bad') + '"><b>' + tx('Result: ', 'Kết quả: ') + sc.total + ' / 100</b>' + sc.notes.map(function (x) { return '<span>' + TCM.esc(x) + '</span>'; }).join('') + '</div>';
  }

  function sessionHtml() {
    var ids = st.session ? st.session.points : Object.keys(st.n).concat(Object.keys(st.m).filter(function (x) { return !st.n[x]; }));
    if (!ids.length) return '<div class="panel stack"><h4>' + tx('Free practice', 'Luyện tập tự do') + '</h4><p class="small muted">' + tx('Pick any point on the body. Or diagnose a patient in the Virtual clinic and send your prescription here.', 'Chọn bất kỳ huyệt nào trên cơ thể. Hoặc chẩn đoán một bệnh nhân ở Phòng khám ảo rồi chuyển đơn huyệt sang đây.') + '</p></div>';
    var tot = 0, cnt = 0;
    var rows = ids.map(function (id) {
      var p = D.pointById[id];
      if (!p) return '';
      var n = st.n[id], m = st.m[id], sc = n && n.score ? n.score.total : m && m.score ? m.score.total : null;
      if (sc != null) { tot += sc; cnt++; }
      return '<button type="button" class="sess-row' + (st.sel === id ? ' is-on' : '') + '" data-go="' + id + '"><span class="mono">' + id + '</span><span>' + TCM.esc(TCM.store.lang() === 'vi' ? p.vi : p.py) + '</span><span class="mono">' + (sc == null ? '—' : sc) + '</span></button>';
    }).join('');
    return '<div class="panel stack"><div class="row" style="justify-content:space-between"><h4>' + (st.session ? tx('Treatment for ', 'Điều trị cho ') + TCM.esc(st.session.name) : tx('This session', 'Buổi tập này')) + '</h4>' +
      (cnt ? '<span class="chip ' + (tot / cnt >= 70 ? 'chip-good' : 'chip-warn') + '">' + tx('Average ', 'Trung bình ') + Math.round(tot / cnt) + '</span>' : '') + '</div>' +
      (st.session && st.session.preg ? '<span class="chip chip-bad">' + tx('Patient is pregnant', 'Bệnh nhân đang mang thai') + '</span>' : '') +
      '<div class="sess-list">' + rows + '</div>' +
      (st.session ? '<button type="button" class="btn btn-sm btn-ghost" id="tr-free">' + tx('End and switch to free practice', 'Kết thúc, chuyển sang tập tự do') + '</button>' : '') + '</div>';
  }

  function render(el) {
    var p = D.pointById[st.sel] || D.points[0];
    el.innerHTML = '<div class="page">' + TCM.pageHead('针', tx('Treatment room', 'Phòng thủ thuật'),
      tx('Needle and moxa points on a live cross-section of the tissue. Choose the needle and angle, clean the skin, insert, obtain de qi (得气) by twirling or lifting and thrusting, retain, then withdraw. Go too deep over the chest, neck or spine and you will see what happens.',
        'Châm và cứu trên mặt cắt mô sống động. Chọn kim và góc châm, sát trùng, đẩy kim, vê kim hoặc đề sáp để đắc khí (得气), lưu kim rồi rút kim. Châm quá sâu ở ngực, cổ hay cột sống sẽ thấy hậu quả.')) +
      '<div class="row"><label class="row small"><input type="checkbox" id="tr-guide"' + (st.guide ? ' checked' : '') + '> ' + tx('Show guidance (target depth band and cautions)', 'Hiện hướng dẫn (vùng độ sâu mục tiêu và lưu ý)') + '</label></div>' +
      '<div class="treat-grid"><div class="stack"><div class="seg" role="group"><button type="button" data-v="front" aria-pressed="' + (st.view === 'front') + '">' + tx('Front', 'Mặt trước') + '</button><button type="button" data-v="back" aria-pressed="' + (st.view === 'back') + '">' + tx('Back', 'Mặt sau') + '</button></div>' +
      '<div class="figure-wrap">' + TCM.figure.svg(st.view, figureMarks(st.view), tx('Body: choose a point', 'Cơ thể: chọn huyệt')) + '</div>' + sessionHtml() + '</div>' +
      '<div class="stack">' + benchHtml(p) + '</div></div>' + TCM.disclaimer() + '</div>';
    wire(el, p);
  }

  function refreshFigure(el) {
    var wrap = TCM.$('.figure-wrap', el);
    if (wrap) wrap.innerHTML = TCM.figure.svg(st.view, figureMarks(st.view));
    var sess = TCM.$('.treat-grid > .stack > .panel:last-child', el);
    if (sess) sess.outerHTML = sessionHtml();
    wireFigure(el);
  }
  function wireFigure(el) {
    var fsvg = TCM.$('.figure-wrap svg', el);
    if (fsvg) TCM.figure.onPick(fsvg, st.view, function (id) { st.sel = id; TCM.rerender(); });
    TCM.$$('[data-go]', el).forEach(function (b) { b.addEventListener('click', function () { st.sel = b.getAttribute('data-go'); st.view = D.pointById[st.sel].view; TCM.rerender(); }); });
    var fr = TCM.$('#tr-free', el);
    if (fr) fr.addEventListener('click', function () { st.session = null; TCM.rerender(); });
  }

  function say(text, tone) { TCM.say(TCM.$('#tr-xswrap'), text, { tone: tone, silent: true }); }

  function wire(el, p) {
    var np = NP(p.id), n = nState(p.id), m = mState(p.id);
    var preg = st.session && st.session.preg && p.preg;
    wireFigure(el);
    TCM.$$('[data-v]', el).forEach(function (b) { b.addEventListener('click', function () { st.view = b.getAttribute('data-v'); TCM.rerender(); }); });
    TCM.$('#tr-guide', el).addEventListener('change', function (e) { st.guide = e.target.checked; TCM.rerender(); });
    TCM.$$('[data-mode]', el).forEach(function (b) { b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); m._smoke = false; TCM.rerender(); }); });
    var ctl = function () { TCM.rerender(); };
    TCM.$$('[data-len]', el).forEach(function (b) { b.addEventListener('click', function () { n.len = Number(b.getAttribute('data-len')); ctl(); }); });
    TCM.$$('[data-ang]', el).forEach(function (b) { b.addEventListener('click', function () { n.angle = b.getAttribute('data-ang'); ctl(); }); });
    var sw = TCM.$('#tr-swab', el);
    if (sw) sw.addEventListener('click', function () {
      n.swab = true;
      var fx = TCM.$('#tr-fx');
      if (fx) fx.innerHTML = '<g class="swab"><circle cx="' + EX + '" cy="' + (EY - 10) + '" r="10" fill="#ffffff" stroke="#c9c2b5"/></g>';
      setTimeout(ctl, 800);
    });
    var rt = TCM.$('#tr-retain', el);
    if (rt) rt.addEventListener('click', function () { n.phase = 'retain'; say(tx('Mm… it feels heavy and warm. I feel relaxed.', 'Ừm… thấy nặng nặng, ấm ấm. Dễ chịu, thư giãn.'), 'ok'); });
    var out = TCM.$('#tr-out', el);
    if (out) out.addEventListener('click', function () { n.phase = 'out'; });
    var ag = TCM.$('#tr-again', el);
    if (ag) ag.addEventListener('click', function () { delete st.n[p.id]; ctl(); });
    var ma = TCM.$('#tr-moxa-again', el);
    if (ma) ma.addEventListener('click', function () { delete st.m[p.id]; ctl(); });
    var dist = TCM.$('#tr-dist', el);
    if (dist) dist.addEventListener('input', function () { m.dist = Number(dist.value); });

    TCM.$$('.hold', el).forEach(function (b) {
      var kind = b.getAttribute('data-hold');
      function down(e) { e.preventDefault(); if (b.disabled) return; held = kind; b.classList.add('is-held'); }
      function up() { if (held === kind) held = null; b.classList.remove('is-held'); }
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); held = kind; } });
      b.addEventListener('keyup', up);
    });

    // drag the moxa stick
    var xs = TCM.$('#tr-xs', el);
    if (xs && st.mode === 'moxa') {
      var drag = false;
      xs.addEventListener('pointerdown', function (e) { if (m.done) return; drag = true; try { xs.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } });
      xs.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var q = TCM.figure.toSvg(xs, e);
        if (q) { m.dist = Math.max(0.5, Math.min(8, (EY - 8 - q[1]) / 10)); if (dist) dist.value = m.dist; }
      });
      xs.addEventListener('pointerup', function () { drag = false; });
    }

    drawGuide(p, n);
    drawNeedle(p, n);
    drawMoxa(p, m);

    var last = performance.now(), lastTalk = 0, needRender = false;
    var dv = dirV(n.angle), sA = sinA(n.angle), deep = D.deepTypes[np.deep.t];
    var token = {};
    loopOn = token;
    (function tick(now) {
      if (loopOn !== token || !el.isConnected || !TCM.$('#tr-xs', el)) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (st.mode === 'needle') {
        var moved = false;
        if (held === 'in' && !n.incident && n.phase !== 'out' && n.phase !== 'done') {
          if (n.phase === 'ready') {
            n.phase = 'in';
            if (preg) { n.incident = { en: 'You needled a point that is forbidden in pregnancy.', vi: 'Bạn đã châm huyệt cấm châm khi có thai.' }; say(tx('Doctor, is this point safe for my baby?', 'Bác sĩ ơi, huyệt này có ảnh hưởng đến em bé không?'), 'pain'); needRender = true; }
            else say(n.swab ? tx('Just a tiny prick.', 'Chỉ nhói nhẹ một chút.') : tx('Ouch! Wasn’t that skin supposed to be cleaned?', 'Ui! Chưa sát trùng mà bác sĩ?'), n.swab ? 'ok' : 'pain');
            n.dep = 0.1;
          }
          n.dep += 0.55 * dt; moved = true;
        }
        if (held === 'back' && n.dep > 0) { n.dep = Math.max(0.05, n.dep - 0.55 * dt); moved = true; }
        if (held === 'lift' && n.dep > 0) { n.dep = Math.max(0.05, n.dep + Math.sin(now / 90) * 0.012); moved = true; }
        if (held === 'twirl' || held === 'lift') {
          n.twirl += dt * 6;
          var inBand = n.dep >= np.d[0] - 0.1 && n.dep <= np.d[1] + 0.15;
          if (inBand && !n.incident) n.deqi = Math.min(1, n.deqi + dt * (held === 'twirl' ? 0.42 : 0.32));
          else if (now - lastTalk > 2500) { lastTalk = now; say(n.dep < np.d[0] ? tx('I don’t feel much yet.', 'Chưa thấy cảm giác gì.') : tx('That’s a sharp, unpleasant feeling.', 'Thấy nhói, khó chịu.'), 'pain'); }
          if (n.deqi >= 1 && !n.deqiDone) {
            n.deqiDone = true;
            say(tx('Oh… a dull, heavy ache spreading out. Tingling.', 'Ồ… thấy tức, nặng, lan ra xung quanh. Tê tê.'), 'ok');
            TCM.toast(tx('De qi obtained: the needle feels grasped, "like a fish taking the bait".', 'Đã đắc khí: kim như bị mút chặt, “như cá cắn câu”.'));
            needRender = true;
          }
        } else if (!n.deqiDone) n.deqi = Math.max(0, n.deqi - dt * 0.08);
        if (moved && !n.incident) {
          n.maxDep = Math.max(n.maxDep, n.dep);
          var vert = n.dep * sA;
          if (vert > np.deep.at) {
            if (deep.serious) {
              n.incident = deep.hit; held = null;
              var xsw = TCM.$('#tr-xswrap'); if (xsw) { xsw.classList.remove('flash'); void xsw.offsetWidth; xsw.classList.add('flash'); }
              say(np.deep.t === 'lung' ? tx('Ah! Sharp pain in my chest… I can’t breathe properly!', 'Á! Đau nhói ngực… tôi khó thở quá!') : np.deep.t === 'artery' ? tx('It’s bleeding!', 'Chảy máu rồi!') : tx('Aah! Like an electric shock!', 'Á! Như điện giật!'), 'pain');
              needRender = true;
            } else {
              n.dep = np.deep.at / sA; n.bone = true; held = null;
              say(tx('Ow, that hit something hard.', 'Ui, chạm vào chỗ cứng.'), 'pain');
            }
          }
          if (n.dep > n.len * 0.95) { n.dep = n.len * 0.95; n.full = true; held = null; TCM.toast(tx('Never insert the whole shaft: needles break at the root.', 'Không bao giờ châm ngập thân kim: kim thường gãy ở chân.')); }
        }
        if (n.phase === 'retain') {
          n.retain = Math.min(1, n.retain + dt / 6);
          if (n.retain >= 1) { n.phase = 'in'; needRender = true; }
        }
        if (n.phase === 'out') {
          n.dep = Math.max(0, n.dep - dt * 1.6);
          if (n.dep <= 0) {
            n.pressed = true; n.phase = 'done';
            n.score = scoreNeedle(p.id, n);
            TCM.store.record('treat', n.score.total >= 70);
            needRender = true;
          }
        }
        drawNeedle(p, n);
        syncButtons(el, n);
        var dd = TCM.$('#tr-dep'); if (dd) dd.textContent = n.dep.toFixed(2);
        var dq = TCM.$('#tr-deqi'); if (dq) dq.style.width = Math.round(n.deqi * 100) + '%';
        var rr = TCM.$('#tr-ret'); if (rr) rr.style.width = Math.round(n.retain * 100) + '%';
        var rm = TCM.$('#tr-retmin'); if (rm) rm.textContent = Math.round(n.retain * 20) + ' / 20 ' + tx('min', 'phút');
      } else if (!m.done || m.burned) {
        var Teq = 34 + 26 / Math.max(0.5, m.dist);
        m.T += (Teq - m.T) * Math.min(1, dt / 1.6);
        if (!m.done) {
          if (m.T >= 41 && m.T <= 47) m.dose = Math.min(1, m.dose + dt / 10);
          if (m.T > 50) m.hot += dt; else m.hot = Math.max(0, m.hot - dt);
          if (now - lastTalk > 2600) {
            lastTalk = now;
            say(m.T < 39 ? tx('I can’t feel any warmth yet.', 'Chưa thấy ấm gì cả.') : m.T <= 46 ? tx('Lovely and warm, spreading inside.', 'Ấm dễ chịu, lan tỏa vào trong.') : m.T <= 50 ? tx('Getting too hot!', 'Bắt đầu nóng quá!') : tx('Ah! It’s burning!', 'Á! Bỏng quá!'), m.T <= 46 && m.T >= 39 ? 'ok' : m.T > 46 ? 'pain' : null);
          }
          if (m.hot > 1.2) { m.burned = true; m.done = true; m.score = { total: 30, notes: [tx('A blister formed: the stick was held too close.', 'Da bị phồng rộp: giữ điếu ngải quá gần.')] }; TCM.store.record('treat', false); needRender = true; }
          else if (m.dose >= 1) { m.done = true; m.score = { total: 100, notes: [tx('The skin is flushed pink (红晕): a full, safe warming dose.', 'Da ửng hồng (红晕): đủ lượng cứu, an toàn.')] }; TCM.store.record('treat', true); needRender = true; }
        }
        drawMoxa(p, m);
        var hb = TCM.$('#tr-heat'); if (hb) hb.style.left = Math.max(0, Math.min(100, (m.T - 34) / 22 * 100)).toFixed(1) + '%';
        var tt = TCM.$('#tr-T'); if (tt) tt.textContent = m.T.toFixed(0) + ' °C';
        var ds = TCM.$('#tr-dose'); if (ds) ds.style.width = Math.round(m.dose * 100) + '%';
      } else drawMoxa(p, m);
      if (needRender) { needRender = false; var keep = TCM.$('.bench .say-bubble'); var txt = keep && !keep.hidden ? keep.textContent : null; held = null; TCM.rerender(); if (txt) say(txt); return; }
      if (st.mode === 'needle' && Math.round(now / 400) !== Math.round((now - dt * 1000) / 400)) refreshFigureLight(el);
      requestAnimationFrame(tick);
    })(last);
  }
  function syncButtons(el, n) {
    function set(sel, on) { TCM.$$(sel, el).forEach(function (b) { if (b.disabled === on) b.disabled = !on; }); }
    var live = n.dep > 0 && !n.incident && n.phase !== 'done';
    set('[data-hold="in"]', !n.incident && n.phase !== 'out' && n.phase !== 'done');
    set('[data-hold="back"]', n.dep > 0 && n.phase !== 'done' && n.phase !== 'out');
    set('[data-hold="twirl"]', live && n.phase !== 'out');
    set('[data-hold="lift"]', live && n.phase !== 'out');
    set('#tr-retain', live && n.retain < 1 && n.phase !== 'retain' && n.phase !== 'out');
    set('#tr-out', n.dep > 0 && n.phase !== 'done' && n.phase !== 'out');
    set('[data-len], [data-ang]', n.phase === 'ready');
    set('#tr-swab', !n.swab && n.phase === 'ready');
  }
  var lastFig = '';
  function refreshFigureLight(el) {
    var sig = JSON.stringify(Object.keys(st.n).map(function (k) { return [k, st.n[k].dep > 0, st.n[k].phase]; }));
    if (sig !== lastFig) { lastFig = sig; refreshFigure(el); }
  }

  TCM.modules.treat = {
    han: '针',
    title: { en: 'Treatment room', vi: 'Phòng thủ thuật' },
    sub: { en: 'Châm cứu · 针灸', vi: 'Châm cứu · 针灸' },
    blurb: { en: 'Hands-on needling and moxibustion: pick the needle and angle, insert, twirl for de qi, retain and withdraw, with real anatomical dangers under the skin.', vi: 'Thực hành châm và cứu: chọn kim và góc, đẩy kim, vê kim để đắc khí, lưu kim và rút kim, với những nguy hiểm giải phẫu thật dưới da.' },
    leave: function () { loopOn = false; held = null; },
    render: function (el) { loopOn = false; held = null; render(el); }
  };
})();
