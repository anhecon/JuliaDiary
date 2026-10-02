/* Five Phases (五行 / Ngũ hành) and the horary clock (子午流注 / Tý ngọ lưu chú). */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { mode: 'cycles', sel: 'earth', show: 'both', quiz: null, hour: null };
  var IDS = ['wood', 'fire', 'earth', 'metal', 'water'];
  function E(id) { return D.elements[IDS.indexOf(id)]; }
  function gen(id) { return IDS[(IDS.indexOf(id) + 1) % 5]; }      // child
  function mother(id) { return IDS[(IDS.indexOf(id) + 4) % 5]; }
  function ctrl(id) { return IDS[(IDS.indexOf(id) + 2) % 5]; }     // controls
  function ctrlBy(id) { return IDS[(IDS.indexOf(id) + 3) % 5]; }

  // positions: fire top, then clockwise earth, metal, water, wood
  var ANG = { fire: -90, earth: -18, metal: 54, water: 126, wood: 198 };
  function pos(id, r) { var a = ANG[id] * Math.PI / 180; return [260 + r * Math.cos(a), 250 + r * Math.sin(a)]; }

  function wuxingSvg(ov) {
    ov = ov || {};
    var R = 170, nr = 46, sel = ov.hot ? null : st.sel;
    var s = '<svg viewBox="0 0 520 500" role="img" aria-label="' + tx('Five Phases cycles', 'Chu trình Ngũ hành') + '">';
    s += '<defs><marker id="wx-ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--jade)"/></marker>' +
      '<marker id="wx-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--cinnabar)"/></marker></defs>';
    function related(a, b) { return !sel || a === sel || b === sel; }
    if (st.show !== 'ctrl') {
      IDS.forEach(function (id) {
        var to = gen(id);
        var a1 = (ANG[id] + 17) * Math.PI / 180, a2 = (ANG[to] - 17 + (ANG[to] < ANG[id] ? 360 : 0)) * Math.PI / 180;
        var p1 = [260 + R * Math.cos(a1), 250 + R * Math.sin(a1)], p2 = [260 + R * Math.cos(a2), 250 + R * Math.sin(a2)];
        s += '<path class="wx-arrow wx-gen' + (related(id, to) ? '' : ' wx-dim') + '" d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" marker-end="url(#wx-ag)"/>';
      });
    }
    if (st.show !== 'gen') {
      IDS.forEach(function (id) {
        var to = ctrl(id), a = pos(id, R), b = pos(to, R);
        var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        var p1 = [a[0] + ux * (nr + 4), a[1] + uy * (nr + 4)], p2 = [b[0] - ux * (nr + 8), b[1] - uy * (nr + 8)];
        s += '<path class="wx-arrow wx-ctrl' + (related(id, to) ? '' : ' wx-dim') + '" d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" marker-end="url(#wx-ac)"/>';
      });
    }
    if (ov.hot) {
      var ha = pos(ov.hot[0], R), hb = pos(ov.hot[1], R);
      var hdx = hb[0] - ha[0], hdy = hb[1] - ha[1], hl = Math.hypot(hdx, hdy), hux = hdx / hl, huy = hdy / hl;
      s += '<path class="wx-arrow wx-hot" d="M' + (ha[0] + hux * (nr + 4)).toFixed(1) + ' ' + (ha[1] + huy * (nr + 4)).toFixed(1) + ' L' + (hb[0] - hux * (nr + 10)).toFixed(1) + ' ' + (hb[1] - huy * (nr + 10)).toFixed(1) + '" marker-end="url(#wx-ac)"/>';
    }
    IDS.forEach(function (id) {
      var e = E(id), p = pos(id, R), on = sel === id || (ov.nodes && ov.nodes[id] === 'is-strong');
      s += '<g class="wx-node ' + ((ov.nodes && ov.nodes[id]) || '') + '" data-el="' + id + '" tabindex="0" role="button" aria-label="' + TCM.esc(L(e)) + '">' +
        '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + nr + '" style="fill:' + (on ? e.color : 'var(--surface)') + ';stroke:' + e.color + '"/>' +
        '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 6).toFixed(1) + '" text-anchor="middle" font-size="30" font-family="Noto Serif SC, serif" font-weight="700" style="fill:' + (on ? '#ffffff' : e.color) + '">' + e.zh + '</text>' +
        '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 24).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="600" style="fill:' + (on ? '#ffffff' : 'var(--ink)') + '">' + TCM.esc(TCM.store.lang() === 'vi' ? e.vi : e.en) + '</text></g>';
    });
    return s + '</svg>';
  }

  function relationHtml() {
    var id = st.sel, e = E(id);
    function chip(x) { var o = E(x); return '<b style="color:' + o.color + '">' + TCM.esc(L(o)) + ' <span class="zh" lang="zh-Hans">' + o.zh + '</span></b>'; }
    var rows = [
      [tx('Mother (generates it)', 'Mẹ (sinh ra nó)'), chip(mother(id))],
      [tx('Child (it generates)', 'Con (nó sinh ra)'), chip(gen(id))],
      [tx('It controls', 'Nó khắc'), chip(ctrl(id))],
      [tx('Controlled by', 'Bị khắc bởi'), chip(ctrlBy(id))]
    ];
    var h = '<div class="panel stack"><div class="row" style="gap:12px"><span class="detail-han" lang="zh-Hans" style="color:' + e.color + '">' + e.zh + '</span><div><h3>' + TCM.esc(L(e)) + '</h3><span class="small muted">' + TCM.esc(TCM.store.lang() === 'vi' ? e.en + ' · ' + e.py : e.vi + ' · ' + e.py) + '</span></div></div>' +
      '<dl class="kv">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl></div>';
    h += '<div class="panel"><div class="table-wrap"><table class="grid-table"><tbody>' + D.elementRows.map(function (r) {
      var v = e.rows[r[0]];
      return '<tr><th>' + TCM.esc(L(r[1])) + '</th><td>' + TCM.esc(L(v)) + ' <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">' + v.zh + '</span></td></tr>';
    }).join('') + '</tbody></table></div></div>';
    return h;
  }

  function teachingHtml() {
    return '<div class="cols-3">' +
      '<div class="panel stack"><h4>' + tx('Generating · 相生 · Tương sinh', 'Tương sinh · 相生') + '</h4><p class="small">' + tx('Wood feeds Fire, Fire makes Earth (ash), Earth bears Metal, Metal carries Water (condensation), Water nourishes Wood. Treatment rule: for deficiency tonify the mother, for excess drain the child (虚则补其母，实则泻其子).', 'Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc. Nguyên tắc: hư thì bổ mẹ, thực thì tả con (虚则补其母，实则泻其子).') + '</p></div>' +
      '<div class="panel stack"><h4>' + tx('Controlling · 相克 · Tương khắc', 'Tương khắc · 相克') + '</h4><p class="small">' + tx('Wood parts Earth, Earth dams Water, Water quenches Fire, Fire melts Metal, Metal cuts Wood. Control keeps each phase in check; it is healthy restraint.', 'Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc. Tương khắc giữ cho các hành cân bằng; đó là sự chế ước bình thường.') + '</p></div>' +
      '<div class="panel stack"><h4>' + tx('When control goes wrong', 'Khi chế ước bị rối loạn') + '</h4><p class="small">' + tx('Overacting (相乘 tương thừa): Wood attacks Earth too hard, as when stress (Liver qi) upsets digestion (Spleen). Insulting (相侮 tương vũ): the controlled phase hits back, as when Liver fire scorches the Lung (木火刑金) and anger brings on coughing.', 'Tương thừa (相乘): Mộc khắc Thổ quá mức, như căng thẳng (can khí) làm rối loạn tiêu hóa (tỳ). Tương vũ (相侮): hành bị khắc quay lại khắc ngược, như can hỏa phạm phế (mộc hỏa hình kim) khiến tức giận thì ho.') + '</p></div></div>';
  }

  function renderCycles(el) {
    el.innerHTML = '<div class="split"><div class="stack"><div class="row"><div class="seg" role="group">' +
      [['both', tx('Both cycles', 'Cả hai')], ['gen', tx('Generating', 'Tương sinh')], ['ctrl', tx('Controlling', 'Tương khắc')]].map(function (o) {
        return '<button type="button" data-show="' + o[0] + '" aria-pressed="' + (st.show === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</div><span class="small muted"><span style="color:var(--jade)">━</span> ' + tx('generates', 'sinh') + ' · <span style="color:var(--cinnabar)">╍</span> ' + tx('controls', 'khắc') + '</span></div>' +
      '<div class="panel wuxing">' + wuxingSvg() + '</div></div><div class="stack">' + relationHtml() + '</div></div>' + teachingHtml();
    TCM.$$('[data-show]', el).forEach(function (b) { b.addEventListener('click', function () { st.show = b.getAttribute('data-show'); renderCycles(el); }); });
    TCM.$$('[data-el]', el).forEach(function (g) {
      function go() { st.sel = g.getAttribute('data-el'); renderCycles(el); }
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* ---------- horary clock ---------- */
  function slotFor(hour) {
    for (var i = 0; i < D.organClock.length; i++) {
      var s = D.organClock[i], end = (s.start + 2) % 24;
      if (s.start < end ? hour >= s.start && hour < end : hour >= s.start || hour < end) return s;
    }
    return D.organClock[0];
  }
  function clockSvg(active) {
    var cx = 170, cy = 170, r1 = 150, r0 = 78;
    var s = '<svg viewBox="0 0 340 340" role="img" aria-label="' + tx('Horary clock', 'Đồng hồ sinh học') + '">';
    D.organClock.forEach(function (o) {
      var a0 = (o.start / 24) * 2 * Math.PI - Math.PI / 2, a1 = ((o.start + 2) / 24) * 2 * Math.PI - Math.PI / 2;
      function P(r, a) { return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
      var on = active && active.ch === o.ch;
      s += '<g class="wx-node" data-slot="' + o.start + '" tabindex="0" role="button" aria-label="' + TCM.esc(L(o) + ' ' + o.start + ':00') + '">' +
        '<path d="M' + P(r0, a0) + ' L' + P(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + P(r1, a1) + ' L' + P(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + P(r0, a0) + ' Z" style="fill:' + (on ? 'var(--jade)' : 'var(--surface)') + ';stroke:var(--line)"/>';
      var am = (a0 + a1) / 2;
      s += '<text x="' + (cx + 124 * Math.cos(am)).toFixed(1) + '" y="' + (cy + 124 * Math.sin(am) + 6).toFixed(1) + '" text-anchor="middle" font-size="17" font-family="Noto Serif SC, serif" font-weight="700" style="fill:' + (on ? 'var(--jade-ink)' : 'var(--cinnabar)') + '">' + o.zh.charAt(0) + '</text>';
      s += '<text x="' + (cx + 97 * Math.cos(am)).toFixed(1) + '" y="' + (cy + 97 * Math.sin(am) + 4).toFixed(1) + '" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" style="fill:' + (on ? 'var(--jade-ink)' : 'var(--ink-soft)') + '">' + o.ch + '</text></g>';
    });
    [0, 6, 12, 18].forEach(function (hh) {
      var a = (hh / 24) * 2 * Math.PI - Math.PI / 2;
      s += '<text x="' + (cx + 62 * Math.cos(a)).toFixed(1) + '" y="' + (cy + 62 * Math.sin(a) + 4).toFixed(1) + '" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" style="fill:var(--ink-soft)">' + (hh < 10 ? '0' : '') + hh + '</text>';
    });
    s += '<text x="170" y="166" text-anchor="middle" font-size="12" style="fill:var(--ink)" font-weight="600">' + TCM.esc(active ? active.start + ':00–' + ((active.start + 2) % 24) + ':00' : '') + '</text>';
    s += '<text x="170" y="184" text-anchor="middle" font-size="11" style="fill:var(--ink-soft)">' + TCM.esc(active ? active.branch + ' · ' + tx('hour of ', 'giờ ') + active.bvi : '') + '</text>';
    return s + '</svg>';
  }
  function renderClock(el) {
    var nowH = new Date().getHours();
    var active = st.hour != null ? slotFor(st.hour) : slotFor(nowH);
    var opp = slotFor((active.start + 12) % 24);
    el.innerHTML = '<div class="split"><div class="panel clock stack">' + clockSvg(active) +
      '<p class="small muted" style="text-align:center">' + (st.hour == null ? tx('Showing the current hour on this device.', 'Đang hiện giờ hiện tại trên thiết bị.') : '<button type="button" class="btn btn-sm" id="ck-now">' + tx('Back to the current hour', 'Về giờ hiện tại') + '</button>') + '</p></div>' +
      '<div class="stack"><div class="panel stack"><p class="eyebrow">' + tx('Peak time of the channel', 'Giờ vượng của kinh') + '</p><h3>' + TCM.nm(active) + '</h3>' +
      '<dl class="kv"><dt>' + tx('Hours', 'Giờ') + '</dt><dd class="mono">' + active.start + ':00 – ' + ((active.start + 2) % 24) + ':00</dd>' +
      '<dt>' + tx('Earthly branch', 'Địa chi') + '</dt><dd>' + active.branch + ' · ' + active.bvi + '</dd>' +
      '<dt>' + tx('Opposite (lowest)', 'Đối diện (suy nhất)') + '</dt><dd>' + TCM.nm(opp) + '</dd></dl></div>' +
      '<div class="panel stack"><h4>' + tx('Reading the clock', 'Cách dùng') + '</h4><p class="small">' + tx(
        'Qi is said to flow through the twelve channels in a daily circuit, peaking in each for two hours. Clinicians use it as a clue, not a rule: waking at 1–3 a.m. points towards the Liver (as in the insomnia case), early-morning diarrhoea at 5–7 a.m. towards the Large Intestine and Kidney yang.',
        'Khí được cho là chạy qua mười hai kinh theo vòng ngày đêm, mỗi kinh vượng trong hai giờ. Thầy thuốc dùng như gợi ý chứ không phải quy luật: hay tỉnh lúc 1–3 giờ sáng gợi ý can (như ca mất ngủ), tiêu chảy lúc sáng sớm 5–7 giờ gợi ý đại trường và thận dương.'
      ) + '</p></div></div></div>';
    TCM.$$('[data-slot]', el).forEach(function (g) {
      function go() { st.hour = Number(g.getAttribute('data-slot')); renderClock(el); }
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var nb = TCM.$('#ck-now', el);
    if (nb) nb.addEventListener('click', function () { st.hour = null; renderClock(el); });
  }


  /* ---------- disease spread ---------- */
  var SCEN = [
    { id: 'cheng', zh: '肝木乘脾', vi: 'Can mộc thừa tỳ thổ', en: 'Wood overacts on Earth', hot: ['wood', 'earth'], nodes: { wood: 'is-strong', earth: 'is-hit' },
      story: { en: 'Stress makes Liver qi stagnate and swell. It "overacts" on the Spleen it normally restrains: bloating, poor appetite, loose stools that come with tension (like Ngọc Anh in the clinic).', vi: 'Căng thẳng làm can khí uất kết, thịnh lên, “thừa” (khắc quá mức) tỳ thổ vốn bị nó chế ước: đầy bụng, kém ăn, đi ngoài phân lỏng khi căng thẳng (như ca Ngọc Anh).' },
      rx: { en: 'Restrain Wood, support Earth (抑木扶土): Xiāoyáo Sǎn; LR3 with ST36.', vi: 'Ức mộc phù thổ (抑木扶土): Tiêu dao tán; Thái xung phối Túc tam lý.' } },
    { id: 'wu', zh: '木火刑金', vi: 'Mộc hỏa hình kim', en: 'Wood insults Metal', hot: ['wood', 'metal'], nodes: { wood: 'is-strong', metal: 'is-hit' },
      story: { en: 'Normally Metal cuts Wood. When Liver fire flares it "insults" (counter-attacks) the Lung: a fit of anger brings on coughing, chest and flank pain, even blood-streaked sputum.', vi: 'Bình thường Kim khắc Mộc. Khi can hỏa bốc mạnh sẽ “vũ” (khắc ngược) phế kim: tức giận thì ho, đau ngực sườn, thậm chí đờm lẫn máu.' },
      rx: { en: 'Assist Metal, calm Wood (佐金平木).', vi: 'Tá kim bình mộc (佐金平木).' } },
    { id: 'han', zh: '水不涵木', vi: 'Thủy bất hàm mộc', en: 'Water fails to nourish Wood', hot: ['water', 'wood'], nodes: { water: 'is-weak', wood: 'is-hit' },
      story: { en: 'The mother (Kidney water) is deficient and cannot moisten her child (Liver wood). Liver yang rises unchecked: dizziness, headache, tinnitus, irritability, often with high blood pressure.', vi: 'Mẹ (thận thủy) hư không nuôi được con (can mộc). Can dương bốc lên không chế ước: chóng mặt, đau đầu, ù tai, dễ cáu, hay kèm tăng huyết áp.' },
      rx: { en: 'Enrich Water to nourish Wood (滋水涵木): Liù Wèi Dì Huáng Wán base; KI3 with LR3.', vi: 'Tư thủy hàm mộc (滋水涵木): nền Lục vị địa hoàng hoàn; Thái khê phối Thái xung.' } },
    { id: 'sheng', zh: '土不生金', vi: 'Thổ bất sinh kim', en: 'Earth fails to generate Metal', hot: ['earth', 'metal'], nodes: { earth: 'is-weak', metal: 'is-hit' },
      story: { en: 'A weak Spleen (mother) cannot feed the Lung (child): someone with chronic poor digestion who also catches every cold and is short of breath with a weak voice.', vi: 'Tỳ (mẹ) hư không nuôi được phế (con): người tiêu hóa kém lâu ngày lại hay cảm, hụt hơi, tiếng nói yếu.' },
      rx: { en: 'Bank up Earth to generate Metal (培土生金): Sì Jūnzǐ Tāng base; ST36, BL20 with BL13.', vi: 'Bồi thổ sinh kim (培土生金): nền Tứ quân tử thang; Túc tam lý, Tỳ du phối Phế du.' } }
  ];
  function renderSpread(el) {
    var sc = SCEN.filter(function (x) { return x.id === st.scen; })[0] || SCEN[0];
    st.scen = sc.id;
    el.innerHTML = '<div class="split"><div class="stack"><div class="row" style="gap:6px">' + SCEN.map(function (x) {
      return '<button type="button" class="chip" data-scen="' + x.id + '" aria-pressed="' + (x.id === sc.id) + '"><span class="zh" lang="zh-Hans">' + x.zh + '</span> ' + TCM.esc(L(x)) + '</button>';
    }).join('') + '</div><div class="panel wuxing">' + wuxingSvg({ hot: sc.hot, nodes: sc.nodes }) + '</div></div>' +
      '<div class="stack"><div class="panel stack"><p class="eyebrow">' + TCM.esc(tx(sc.vi, sc.en)) + '</p><h3><span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">' + sc.zh + '</span> ' + TCM.esc(L(sc)) + '</h3><p>' + TCM.esc(L(sc.story)) + '</p>' +
      '<div class="callout callout-good"><b>' + tx('Treatment strategy', 'Phép trị') + '</b><span>' + TCM.esc(L(sc.rx)) + '</span></div></div>' +
      '<div class="panel stack"><h4>' + tx('Legend', 'Chú giải') + '</h4><p class="small">' + tx('Thick red arrow: where the disease travels. Shaking circle: the organ being harmed. Faded circle: a deficient phase. Bold ring: an excess phase.', 'Mũi tên đỏ đậm: hướng bệnh truyền. Vòng tròn rung: tạng bị tổn hại. Vòng tròn mờ: hành bị hư. Viền đậm: hành thịnh.') + '</p></div></div></div>';
    TCM.$$('[data-scen]', el).forEach(function (b) { b.addEventListener('click', function () { st.scen = b.getAttribute('data-scen'); renderSpread(el); }); });
  }

  /* ---------- quiz ---------- */
  function newQuiz() {
    var id = TCM.pick(IDS), kind = TCM.pick(['mother', 'child', 'controls', 'controlledBy', 'zang', 'emotion', 'reverse']);
    var q = { id: id, kind: kind, picked: null };
    if (kind === 'reverse') {
      q.row = TCM.pick(['taste', 'colour', 'season', 'sense', 'climate', 'tissue']);
      q.answer = id;
      q.opts = IDS.slice();
    } else if (kind === 'zang' || kind === 'emotion') {
      q.answer = id;
      q.opts = IDS.slice();
    } else {
      q.answer = kind === 'mother' ? mother(id) : kind === 'child' ? gen(id) : kind === 'controls' ? ctrl(id) : ctrlBy(id);
      q.opts = IDS.slice();
    }
    st.quiz = q;
  }
  function promptFor(q) {
    var e = E(q.id), n = TCM.esc(L(e)) + ' (' + e.zh + ')';
    if (q.kind === 'mother') return tx('Which phase generates ', 'Hành nào sinh ra ') + n + '?';
    if (q.kind === 'child') return tx('Which phase does ', 'Hành ') + n + tx(' generate?', ' sinh ra hành nào?');
    if (q.kind === 'controls') return tx('Which phase does ', 'Hành ') + n + tx(' control?', ' khắc hành nào?');
    if (q.kind === 'controlledBy') return tx('Which phase controls ', 'Hành nào khắc ') + n + '?';
    if (q.kind === 'zang') { var z = e.rows.zang; return tx('The ', 'Tạng ') + TCM.esc(L(z)) + ' (' + z.zh + ')' + tx(' belongs to which phase?', ' thuộc hành nào?'); }
    if (q.kind === 'emotion') { var m = e.rows.emotion; return tx('The emotion ', 'Tình chí ') + TCM.esc(L(m)) + ' (' + m.zh + ')' + tx(' belongs to which phase?', ' thuộc hành nào?'); }
    var row = D.elementRows.filter(function (r) { return r[0] === q.row; })[0];
    var v = e.rows[q.row];
    return TCM.esc(L(row[1])) + ': ' + TCM.esc(L(v)) + ' (' + v.zh + ')' + tx('. Which phase?', '. Thuộc hành nào?');
  }
  function renderQuiz(el) {
    if (!st.quiz) newQuiz();
    var q = st.quiz, done = q.picked != null, s = TCM.store.stat('elements');
    el.innerHTML = '<div class="split"><div class="panel stack"><h3>' + promptFor(q) + '</h3><div class="options">' + q.opts.map(function (id, i) {
      var cls = '', e = E(id);
      if (done) { if (id === q.answer) cls = ' is-right'; else if (id === q.picked) cls = ' is-wrong'; }
      return '<button type="button" class="opt' + cls + '" data-v="' + id + '"' + (done ? ' disabled' : '') + '><span class="key">' + 'ABCDE'[i] + '</span><span><b style="color:' + e.color + '" lang="zh-Hans" class="zh">' + e.zh + '</b> ' + TCM.esc(L(e)) + '</span></button>';
    }).join('') + '</div>' + (done ? '<div class="row"><button type="button" class="btn btn-primary" id="eq-next">' + tx('Next question', 'Câu tiếp theo') + '</button></div>' : '') +
      '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span></p></div>' +
      '<div class="panel wuxing">' + (done ? wuxingSvg() : '<p class="muted small">' + tx('The diagram appears after you answer.', 'Sơ đồ sẽ hiện sau khi trả lời.') + '</p>') + '</div></div>';
    TCM.$$('.opt', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.picked != null) return;
        q.picked = b.getAttribute('data-v');
        TCM.store.record('elements', q.picked === q.answer);
        st.sel = q.id;
        renderQuiz(el);
      });
    });
    var nx = TCM.$('#eq-next', el);
    if (nx) nx.addEventListener('click', function () { newQuiz(); renderQuiz(el); });
  }

  TCM.modules.elements = {
    han: '行',
    title: { en: 'Five Phases', vi: 'Ngũ hành' },
    sub: { en: 'Ngũ hành · 五行', vi: 'Âm dương ngũ hành · 五行' },
    blurb: { en: 'Interactive generating and controlling cycles with full correspondences, the horary clock, and a quick-fire quiz.', vi: 'Chu trình tương sinh, tương khắc tương tác với bảng quy loại đầy đủ, đồng hồ sinh học và bài trắc nghiệm nhanh.' },
    render: function (el) {
      el.innerHTML = '<div class="page">' + TCM.pageHead('五行', tx('Five Phases', 'Ngũ hành'),
        tx('Wood, Fire, Earth, Metal and Water are phases of movement, not substances. Each gathers an organ pair, a sense, a tissue, an emotion, a taste and a season, and the cycles between them explain how disease spreads from one organ to another.',
          'Mộc, Hỏa, Thổ, Kim, Thủy là các trạng thái vận động chứ không phải vật chất. Mỗi hành quy nạp một cặp tạng phủ, một khiếu, một thể, một tình chí, một vị và một mùa; các chu trình giữa chúng giải thích sự truyền biến bệnh từ tạng này sang tạng khác.')) +
        '<div class="tabs" role="tablist">' + [['cycles', tx('Cycles', 'Sinh khắc')], ['spread', tx('Disease spread', 'Truyền biến bệnh')], ['clock', tx('Horary clock', 'Đồng hồ sinh học')], ['quiz', tx('Quiz', 'Trắc nghiệm')]].map(function (t) {
          return '<button type="button" class="tab" role="tab" data-mode="' + t[0] + '" aria-selected="' + (st.mode === t[0]) + '">' + t[1] + '</button>';
        }).join('') + '</div><div id="el-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) { b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); TCM.rerender(); }); });
      var body = TCM.$('#el-body', el);
      if (st.mode === 'clock') renderClock(body);
      else if (st.mode === 'spread') renderSpread(body);
      else if (st.mode === 'quiz') renderQuiz(body);
      else renderCycles(body);
    }
  };
})();
