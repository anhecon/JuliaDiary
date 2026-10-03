/* Herbal pharmacy (药房 / Nhà thuốc): fill a prescription from the cabinet, weigh it on the
   steelyard, wrap the packets, and decoct them on the stove ("sắc 3 bát còn 1 bát"). */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = { order: null, hint: true, search: '' };
  var loopTok = null;

  function rng(seed) { var s = seed >>> 0 || 7; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function look(id) { return D.herbLook[id] || ['#b59a6a', 'chunk']; }
  function prep(id) { return D.herbPrep[id] || 'normal'; }
  function hName(id) { return TCM.nmText(D.herbById[id], 'py'); }

  /* ---------- herb pile drawing ---------- */
  function piece(shape, col, x, y, r, R) {
    var rot = (R() * 360).toFixed(0), dark = shade(col, -0.25);
    switch (shape) {
      case 'slice': return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.3) + '" ry="' + (r * 0.8) + '" fill="' + col + '" stroke="' + dark + '" stroke-width=".8" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 0.5) + '" ry="' + (r * 0.3) + '" fill="none" stroke="' + dark + '" stroke-width=".6" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      case 'root': return '<rect x="' + (x - r * 1.6) + '" y="' + (y - r * 0.4) + '" width="' + (r * 3.2) + '" height="' + (r * 0.8) + '" rx="' + (r * 0.4) + '" fill="' + col + '" stroke="' + dark + '" stroke-width=".7" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      case 'stem': return '<path d="M' + (x - r * 1.8) + ' ' + y + ' L' + (x + r * 1.8) + ' ' + y + '" stroke="' + col + '" stroke-width="' + (r * 0.45) + '" stroke-linecap="round" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      case 'leaf': return '<path d="M' + (x - r * 1.4) + ' ' + y + ' Q' + x + ' ' + (y - r) + ' ' + (x + r * 1.4) + ' ' + y + ' Q' + x + ' ' + (y + r) + ' ' + (x - r * 1.4) + ' ' + y + ' Z" fill="' + col + '" stroke="' + dark + '" stroke-width=".6" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      case 'berry': return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.75) + '" fill="' + col + '" stroke="' + dark + '" stroke-width=".6"/><circle cx="' + (x - r * 0.25) + '" cy="' + (y - r * 0.25) + '" r="' + (r * 0.2) + '" fill="#fff" opacity=".5"/>';
      case 'seed': return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 0.6) + '" ry="' + (r * 0.4) + '" fill="' + col + '" stroke="' + dark + '" stroke-width=".5" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      case 'flower': return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="0" cy="' + (-r * 0.5) + '" rx="' + (r * 0.3) + '" ry="' + (r * 0.55) + '" fill="' + col + '" transform="rotate(' + a + ')"/>'; }).join('') + '</g>';
      case 'mineral': return '<path d="M' + (x - r) + ' ' + y + ' L' + (x - r * 0.3) + ' ' + (y - r) + ' L' + (x + r) + ' ' + (y - r * 0.4) + ' L' + (x + r * 0.6) + ' ' + (y + r * 0.8) + ' Z" fill="' + col + '" stroke="' + dark + '" stroke-width=".7"/>';
      case 'bark': return '<path d="M' + (x - r * 1.5) + ' ' + y + ' Q' + x + ' ' + (y - r * 0.9) + ' ' + (x + r * 1.5) + ' ' + y + '" stroke="' + col + '" stroke-width="' + (r * 0.6) + '" fill="none" stroke-linecap="round" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      default: return '<path d="M' + (x - r) + ' ' + (y + r * 0.3) + ' L' + (x - r * 0.4) + ' ' + (y - r * 0.8) + ' L' + (x + r * 0.9) + ' ' + (y - r * 0.5) + ' L' + (x + r) + ' ' + (y + r * 0.6) + ' Z" fill="' + col + '" stroke="' + dark + '" stroke-width=".7"/>';
    }
  }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  /* Heap centred on (cx, base), width w; size grows with grams. */
  function pile(id, grams, cx, base, w, seedN) {
    if (grams <= 0) return '';
    var lk = look(id), R = rng((seedN || 3) + id.length * 17);
    var count = Math.min(80, Math.round(6 + Math.sqrt(grams) * 7));
    var hh = Math.min(w * 0.5, 6 + Math.sqrt(grams) * 5);
    var s = '';
    for (var i = 0; i < count; i++) {
      var u = R() * 2 - 1, v = R();
      var x = cx + u * (w / 2) * (1 - v * 0.55), y = base - v * hh * (1 - Math.abs(u) * 0.7);
      s += piece(lk[1], lk[0], Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round((3 + R() * 2.6) * 10) / 10, R);
    }
    return s;
  }

  /* ---------- order ---------- */
  function makeOrder(formulaId, name) {
    var f = D.formulaById[formulaId];
    var packets = 3;
    return {
      name: name || tx('Walk-in prescription', 'Đơn thuốc khách vãng lai'), formula: f.id, packets: packets,
      items: f.herbs.map(function (r) { return { id: r[0], per: r[2], target: r[2] * packets, got: 0, done: false }; }),
      stage: 'dispense', open: null, pan: 0, panHerb: null, wrongs: [], seed: Math.floor(Math.random() * 999),
      dc: null, result: null
    };
  }
  TCM.pharmacyLoad = function (o) {
    st.order = makeOrder(o.formula, o.name);
    if (location.hash === '#pharmacy') TCM.rerender(); else location.hash = 'pharmacy';
  };
  function O() {
    if (!st.order) st.order = makeOrder(TCM.pick(D.formulas).id);
    return st.order;
  }
  function tol(target) { return Math.max(0.5, target * 0.05); }

  /* ---------- dispensing ---------- */
  function slipHtml(o) {
    var f = D.formulaById[o.formula];
    var kind = D.decoction[D.formulaDecoction[f.id] || 'standard'];
    return '<div class="rx-slip"><div class="rx-head"><span class="rx-title" lang="zh-Hans">处方</span><span class="rx-sub">' + tx('Prescription', 'Đơn thuốc') + '</span><span class="rx-seal" lang="zh-Hans">医</span></div>' +
      '<p class="small"><b>' + tx('Patient: ', 'Bệnh nhân: ') + '</b>' + TCM.esc(o.name) + '</p>' +
      '<p class="rx-formula">' + TCM.nm(f, { enMain: 'py' }) + '</p>' +
      '<ul class="rx-list">' + o.items.map(function (it) {
        var pr = prep(it.id);
        return '<li class="' + (it.done ? 'is-done' : '') + (o.panHerb === it.id ? ' is-now' : '') + '"><span>' + (it.done ? TCM.icon('check', 14) : '<i class="dotc" style="background:' + look(it.id)[0] + '"></i>') + ' ' + TCM.esc(hName(it.id)) + ' <span class="zh" lang="zh-Hans">' + D.herbById[it.id].zh + '</span>' +
          (st.hint && pr !== 'normal' ? ' <span class="chip chip-warn">' + TCM.esc(L(D.prepNames[pr])) + '</span>' : '') + '</span><span class="mono">' + it.per + ' g × ' + o.packets + ' = <b>' + it.target + '</b> g</span></li>';
      }).join('') + '</ul>' +
      '<p class="small rx-foot">' + tx('Dispense ', 'Bốc ') + '<b>' + o.packets + '</b>' + tx(' packets (thang). Decoct ' + kind.water + ' bowls of water down to 1.', ' thang. Sắc ' + kind.water + ' bát nước còn 1 bát.') + '</p></div>';
  }

  function scaleSvg(o) {
    var it = o.items.filter(function (x) { return x.id === o.panHerb; })[0];
    var target = it ? it.target : 0;
    var diff = target ? (o.pan - target) / target : (o.pan > 0 ? 1 : 0);
    var ang = Math.max(-16, Math.min(16, -diff * 30));
    var ok = it && Math.abs(o.pan - target) <= tol(target);
    var s = '<svg class="steelyard" viewBox="0 0 320 220" role="img" aria-label="' + tx('Steelyard scale', 'Cân tiểu ly') + '">';
    s += '<path d="M160 6 L160 30" style="stroke:var(--ink)" stroke-width="2"/><circle cx="160" cy="6" r="4" style="fill:var(--bronze)"/>';
    s += '<g class="beam" style="transform:rotate(' + ang.toFixed(1) + 'deg);transform-origin:160px 34px;transition:transform .5s cubic-bezier(.3,1.6,.5,1)">';
    s += '<rect x="40" y="31" width="250" height="6" rx="3" style="fill:var(--bronze)"/>';
    for (var i = 0; i < 12; i++) s += '<path d="M' + (180 + i * 9) + ' 31 v6" stroke="#5a3a12" stroke-width="1"/>';
    s += '<path d="M48 37 L28 120 M48 37 L68 120" style="stroke:var(--ink-soft)" stroke-width="1"/>';
    s += '<path d="M14 120 Q48 140 82 120 Z" style="fill:var(--surface);stroke:var(--bronze)" stroke-width="2"/>';
    s += '<g transform="translate(0 0)">' + (o.panHerb ? pile(o.panHerb, o.pan, 48, 122, 58, 5) : '') + '</g>';
    var px = target ? 190 + Math.min(95, target * 0.9) : 200;
    s += '<path d="M' + px + ' 37 L' + px + ' 64" style="stroke:var(--ink-soft)" stroke-width="1"/><rect x="' + (px - 9) + '" y="64" width="18" height="22" rx="4" style="fill:var(--ink)"/>';
    s += '</g>';
    s += '<text x="160" y="178" text-anchor="middle" font-size="22" font-family="IBM Plex Mono, monospace" style="fill:' + (ok ? 'var(--good)' : 'var(--ink)') + '">' + o.pan.toFixed(1) + ' g</text>';
    s += '<text x="160" y="198" text-anchor="middle" font-size="11" style="fill:var(--ink-soft)">' + (it ? tx('target ', 'cần ') + target + ' g · ±' + tol(target).toFixed(1) : o.panHerb ? tx('not on this prescription', 'không có trong đơn') : tx('empty pan', 'đĩa cân trống')) + '</text>';
    s += '<text x="160" y="214" text-anchor="middle" font-size="11" style="fill:' + (ok ? 'var(--good)' : 'var(--ink-soft)') + '">' + (ok ? tx('balanced: the beam is level', 'cân thăng bằng') : o.pan && it ? (o.pan < target ? tx('too light: add more', 'còn thiếu: thêm thuốc') : tx('too heavy: take some back', 'thừa: bớt lại')) : '') + '</text>';
    return s + '</svg>';
  }

  function drawerHtml(o) {
    var q = TCM.norm(st.search);
    var order = Object.keys(D.categories);
    var herbs = D.herbs.slice().sort(function (a, b) { return order.indexOf(a.cat) - order.indexOf(b.cat); });
    var onRx = o.items.map(function (x) { return x.id; });
    return '<div class="cabinet-grid">' + herbs.map(function (h) {
      var match = !q || TCM.norm([h.zh, h.py, h.vi, h.en].join(' ')).indexOf(q) >= 0;
      var cls = 'drawer-box' + (o.open === h.id ? ' is-open' : '') + (!match ? ' is-dim' : '') + (st.hint && onRx.indexOf(h.id) >= 0 ? ' is-rx' : '');
      return '<button type="button" class="' + cls + '" data-drawer="' + h.id + '" title="' + TCM.esc(hName(h.id) + ' · ' + h.vi) + '"><span class="db-han" lang="zh-Hans">' + h.zh + '</span><span class="db-name">' + TCM.esc(TCM.store.lang() === 'vi' ? h.vi.split(' (')[0] : h.py) + '</span><i class="db-pull"></i></button>';
    }).join('') + '</div>';
  }

  function trayHtml(o) {
    if (!o.open) return '<div class="tray empty"><p class="small muted">' + tx('Open a drawer to take a herb.', 'Mở một ngăn kéo để lấy thuốc.') + '</p></div>';
    var h = D.herbById[o.open];
    return '<div class="tray"><svg viewBox="0 0 220 90" class="tray-svg" aria-hidden="true"><rect x="6" y="20" width="208" height="64" rx="6" fill="#8a5a2b"/><rect x="12" y="26" width="196" height="54" rx="4" fill="#6b4320"/>' + pile(o.open, 60, 110, 78, 180, 9) + '</svg>' +
      '<div class="stack" style="gap:6px"><b>' + TCM.nm(h, { enMain: 'py' }) + '</b><div class="row">' +
      '<button type="button" class="btn btn-primary btn-sm" id="ph-scoop">' + tx('Scoop', 'Xúc') + '</button>' +
      '<button type="button" class="btn btn-sm" id="ph-pinch">' + tx('Pinch +0.5 g', 'Nhón +0,5 g') + '</button>' +
      '<button type="button" class="btn btn-sm" id="ph-back">' + tx('Put back −0.5 g', 'Bớt −0,5 g') + '</button></div></div></div>';
  }

  function paperHtml(o) {
    var done = o.items.filter(function (x) { return x.done; });
    var s = '<svg class="paper" viewBox="0 0 340 130" aria-label="' + tx('Wrapping paper with the weighed herbs', 'Giấy gói với các vị đã cân') + '"><path d="M10 20 L330 12 L326 122 L14 126 Z" fill="#f4ecd8" stroke="#d8cba8"/>';
    done.forEach(function (it, i) {
      var cx = 40 + (i % 6) * 52, base = i < 6 ? 72 : 116;
      s += pile(it.id, it.got, cx, base, 46, 11 + i);
    });
    return s + '</svg>';
  }

  function renderDispense(el, o) {
    var allDone = o.items.every(function (x) { return x.done; });
    el.innerHTML = '<div class="pharm-top">' + slipHtml(o) +
      '<div class="panel stack scale-panel">' + scaleSvg(o) +
      '<div class="row"><button type="button" class="btn btn-primary btn-sm" id="ph-tip"' + (o.pan > 0 ? '' : ' disabled') + '>' + tx('Tip onto the paper', 'Đổ ra giấy') + '</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="ph-empty"' + (o.pan > 0 ? '' : ' disabled') + '>' + tx('Return to the drawer', 'Trả lại ngăn kéo') + '</button></div>' + trayHtml(o) + '</div></div>' +
      '<div class="panel stack"><div class="row" style="justify-content:space-between"><h3>' + tx('Medicine cabinet', 'Tủ thuốc') + ' <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">百子柜</span></h3>' +
      '<div class="row"><input class="input" id="ph-search" type="search" style="max-width:220px" placeholder="' + tx('Find a drawer…', 'Tìm ngăn kéo…') + '" value="' + TCM.esc(st.search) + '">' +
      '<label class="row small"><input type="checkbox" id="ph-hint"' + (st.hint ? ' checked' : '') + '> ' + tx('Hints', 'Gợi ý') + '</label></div></div>' + drawerHtml(o) + '</div>' +
      '<div class="panel stack"><h4>' + tx('Weighed herbs', 'Thuốc đã cân') + '</h4>' + paperHtml(o) +
      (o.wrongs.length ? '<div class="callout callout-warn"><span>' + tx('Wrong herbs returned: ', 'Vị lấy nhầm đã trả lại: ') + TCM.esc(o.wrongs.map(hName).join(', ')) + '</span></div>' : '') +
      '<div class="row"><button type="button" class="btn btn-primary" id="ph-wrap"' + (allDone ? '' : ' disabled') + '>' + tx('Divide into ', 'Chia thành ') + o.packets + tx(' packets and wrap', ' thang và gói lại') + '</button>' +
      (o.journeyCase ? '' : '<button type="button" class="btn btn-ghost btn-sm" id="ph-new">' + tx('New random prescription', 'Đơn thuốc ngẫu nhiên khác') + '</button>') + '</div></div>';

    function rer() { renderDispense(el, o); }
    TCM.$$('[data-drawer]', el).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-drawer'); o.open = o.open === id ? null : id; rer(); }); });
    var sr = TCM.$('#ph-search', el);
    sr.addEventListener('input', function () { st.search = sr.value; var pos = sr.selectionStart; rer(); var n = TCM.$('#ph-search', el); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* ignore */ } });
    TCM.$('#ph-hint', el).addEventListener('change', function (e) { st.hint = e.target.checked; rer(); });
    function add(g) {
      if (!o.open) return;
      if (o.panHerb && o.panHerb !== o.open && o.pan > 0) { TCM.toast(tx('Empty the pan first: one herb at a time.', 'Đổ đĩa cân trước: mỗi lần một vị.')); return; }
      o.panHerb = o.open;
      o.pan = Math.max(0, Math.round((o.pan + g) * 10) / 10);
      if (o.pan === 0) o.panHerb = null;
      rer();
    }
    var sc = TCM.$('#ph-scoop', el);
    if (sc) sc.addEventListener('click', function () {
      var it = o.items.filter(function (x) { return x.id === o.open; })[0];
      var base = it ? Math.max(1, it.target / 5) : 4;
      add(Math.round(base * (0.75 + Math.random() * 0.5) * 10) / 10);
    });
    var pn = TCM.$('#ph-pinch', el); if (pn) pn.addEventListener('click', function () { add(0.5); });
    var bk = TCM.$('#ph-back', el); if (bk) bk.addEventListener('click', function () { if (o.panHerb === o.open) add(-0.5); });
    TCM.$('#ph-empty', el).addEventListener('click', function () { o.pan = 0; o.panHerb = null; rer(); });
    TCM.$('#ph-tip', el).addEventListener('click', function () {
      var it = o.items.filter(function (x) { return x.id === o.panHerb; })[0];
      if (!it) {
        var bad = o.items.some(function (x) { return D.antagonisms.concat(D.fears).some(function (p) { return (p[0] === x.id && p[1] === o.panHerb) || (p[1] === x.id && p[0] === o.panHerb); }); });
        TCM.toast(bad ? tx('Stop! That herb is incompatible with this prescription (18 antagonisms / 19 fears).', 'Dừng lại! Vị này tương phản / tương úy với đơn thuốc.') : tx('That herb is not on the prescription. Put it back.', 'Vị này không có trong đơn. Hãy trả lại.'));
        if (o.wrongs.indexOf(o.panHerb) < 0) o.wrongs.push(o.panHerb);
        o.pan = 0; o.panHerb = null; rer();
        return;
      }
      if (it.done) { TCM.toast(tx('Already weighed.', 'Vị này đã cân rồi.')); return; }
      if (Math.abs(o.pan - it.target) > tol(it.target)) { TCM.toast(tx('Not balanced yet: the beam must be level before you tip it out.', 'Cân chưa thăng bằng: phải cân đúng rồi mới đổ ra.')); return; }
      it.got = o.pan; it.done = true; o.pan = 0; o.panHerb = null; o.open = null;
      rer();
    });
    TCM.$('#ph-wrap', el).addEventListener('click', function () { o.stage = 'wrap'; TCM.rerender(); });
    var pn0 = TCM.$('#ph-new', el); if (pn0) pn0.addEventListener('click', function () { st.order = makeOrder(TCM.pick(D.formulas).id); TCM.rerender(); });
  }

  function renderWrap(el, o) {
    var f = D.formulaById[o.formula];
    var packs = '';
    for (var i = 0; i < o.packets; i++) {
      packs += '<div class="packet" style="animation-delay:' + (i * 0.25) + 's"><svg viewBox="0 0 140 120" aria-hidden="true"><path d="M10 40 L70 10 L130 40 L130 100 L10 100 Z" fill="#efe2c4" stroke="#c9b68e"/><path d="M10 40 L70 66 L130 40" fill="none" stroke="#c9b68e"/><path d="M70 10 L70 100" stroke="#a5402e" stroke-width="2.5"/><path d="M10 70 L130 70" stroke="#a5402e" stroke-width="2.5"/>' +
        '<rect x="44" y="76" width="52" height="18" fill="#fff" stroke="#c9b68e"/><text x="70" y="89" text-anchor="middle" font-size="10" font-family="Noto Serif SC, serif" fill="#a5402e">' + f.zh + '</text></svg><span class="small mono">' + tx('Packet ', 'Thang ') + (i + 1) + '</span></div>';
    }
    var acc = o.items.map(function (it) { return Math.abs(it.got - it.target) / it.target; });
    var avg = 100 - Math.round(acc.reduce(function (a, b) { return a + b; }, 0) / acc.length * 100);
    el.innerHTML = '<div class="panel stack"><h3>' + tx('Wrapped and tied', 'Đã gói và buộc dây') + '</h3><div class="packets">' + packs + '</div>' +
      '<p>' + tx('Weighing accuracy: ', 'Độ chính xác khi cân: ') + '<b class="mono">' + avg + '%</b>' + (o.wrongs.length ? tx(' · wrong drawers opened: ', ' · lấy nhầm: ') + o.wrongs.length : '') + '</p>' +
      '<div class="row"><button type="button" class="btn btn-primary" id="ph-decoct">' + TCM.icon('pot', 18) + tx(' Decoct one packet', ' Sắc một thang') + '</button>' + (o.journeyCase ? '' : '<button type="button" class="btn btn-ghost" id="ph-new">' + tx('New prescription', 'Đơn thuốc mới') + '</button>') + '</div></div>';
    TCM.$('#ph-decoct', el).addEventListener('click', function () { o.stage = 'decoct'; o.dc = null; TCM.rerender(); });
    var pn0 = TCM.$('#ph-new', el); if (pn0) pn0.addEventListener('click', function () { st.order = makeOrder(TCM.pick(D.formulas).id); TCM.rerender(); });
  }

  /* ---------- decoction ---------- */
  function DC(o) {
    return o.dc || (o.dc = { water: 0, vol: 0, T: 25, heat: 'off', min: 0, boilAt: null, added: {}, burnt: false, speed: 1, running: false, done: false });
  }
  function stoveSvg(o, d) {
    var lvl = Math.max(0, Math.min(1, d.vol / 1000));
    var flames = d.heat === 'off' ? 0 : d.heat === 'low' ? 1 : 2;
    var s = '<svg class="stove" viewBox="0 0 320 300" role="img" aria-label="' + tx('Clay pot on a charcoal stove', 'Ấm đất trên bếp than') + '">';
    s += '<g id="ph-steam"></g>';
    // pot
    s += '<path d="M90 90 Q86 60 120 56 L200 56 Q234 60 230 90 Q252 150 222 196 L98 196 Q68 150 90 90 Z" fill="#8a4a2a" stroke="#5a2e18" stroke-width="2"/>';
    s += '<path d="M118 56 Q160 40 202 56" fill="#7a3e22" stroke="#5a2e18" stroke-width="2"/><circle cx="160" cy="44" r="7" fill="#7a3e22" stroke="#5a2e18"/>';
    s += '<path d="M230 96 Q268 90 276 70" stroke="#7a3e22" stroke-width="9" fill="none" stroke-linecap="round"/>';
    s += '<path d="M90 110 Q60 112 62 140" stroke="#5a2e18" stroke-width="6" fill="none"/>';
    // cutaway window showing liquid
    var top = 186 - lvl * 110;
    var col = d.burnt ? '#1a1410' : Object.keys(d.added).length ? '#6b3b16' : '#9fc7d8';
    s += '<rect x="140" y="76" width="40" height="112" rx="8" fill="#2a1a12" stroke="#5a2e18"/>';
    s += '<rect x="142" y="' + top.toFixed(1) + '" width="36" height="' + (186 - top).toFixed(1) + '" rx="6" fill="' + col + '" opacity=".9"/>';
    if (d.T >= 99 && !d.burnt) s += '<g class="bubbles">' + [0, 1, 2, 3].map(function (i) { return '<circle cx="' + (150 + i * 7) + '" cy="' + (184 - i * 9) + '" r="2" fill="#fff" opacity=".6" class="bub b' + i + '"/>'; }).join('') + '</g>';
    [1, 2, 3, 4].forEach(function (b) { var y = 186 - b * 200 / 1000 * 110; s += '<path d="M182 ' + y.toFixed(1) + ' h6" stroke="#f4ecd8" stroke-width="1.5"/><text x="191" y="' + (y + 3).toFixed(1) + '" font-size="8" fill="#f4ecd8">' + b + '</text>'; });
    // stove
    s += '<path d="M70 200 L250 200 L236 286 L84 286 Z" fill="#6d6a64" stroke="#4a4842" stroke-width="2"/><rect x="120" y="236" width="80" height="34" rx="6" fill="#2a2420"/>';
    if (flames) {
      s += '<g class="flames f' + flames + '">' + [0, 1, 2, 3, 4].map(function (i) { return '<path class="flame fl' + i + '" d="M' + (126 + i * 17) + ' 268 q-8 -' + (12 + flames * 8) + ' 6 -' + (20 + flames * 12) + ' q-2 ' + (12 + flames * 5) + ' 8 ' + (20 + flames * 12) + ' Z" fill="' + (i % 2 ? '#ff8a1a' : '#ffc24a') + '"/>'; }).join('') + '</g>';
    }
    s += [0, 1, 2, 3].map(function (i) { return '<circle cx="' + (134 + i * 17) + '" cy="266" r="6" fill="' + (flames ? '#ff5a1a' : '#3a3430') + '"/>'; }).join('');
    return s + '</svg>';
  }

  function evaluate(o, d) {
    var f = D.formulaById[o.formula];
    var kind = D.decoction[D.formulaDecoction[f.id] || 'standard'];
    var notes = [], sc = 0;
    var flags = { firstFail: [], laterFail: [], simmerOff: false };
    if (d.burnt) return { total: 0, burnt: true, flags: flags, notes: [tx('The pot boiled dry and the herbs burnt. A burnt decoction must be thrown away.', 'Ấm cạn khô, thuốc bị cháy. Thuốc cháy phải bỏ đi.')] };
    if (Math.abs(d.water - kind.water) <= 0) sc += 15; else if (Math.abs(d.water - kind.water) === 1) { sc += 8; notes.push(tx('Usual water for this formula: ', 'Lượng nước thường dùng cho bài này: ') + kind.water + tx(' bowls.', ' bát.')); } else notes.push(tx('Water amount was far off: ', 'Lượng nước sai nhiều: ') + kind.water + tx(' bowls expected.', ' bát.'));
    var ids = o.items.map(function (x) { return x.id; });
    var firsts = ids.filter(function (x) { return prep(x) === 'first'; }), laters = ids.filter(function (x) { return prep(x) === 'later'; }), normals = ids.filter(function (x) { return prep(x) === 'normal'; });
    var missing = ids.filter(function (x) { return d.added[x] == null; });
    if (missing.length) notes.push(tx('Never added: ', 'Chưa cho vào: ') + missing.map(hName).join(', '));
    var normalAt = Math.max.apply(null, normals.map(function (x) { return d.added[x] == null ? 1e9 : d.added[x]; }).concat([0]));
    var cookStart = Math.max(normalAt, d.boilAt == null ? 1e9 : d.boilAt);
    var orderOk = !missing.length;
    firsts.forEach(function (x) {
      var boilFirst = Math.min.apply(null, normals.map(function (n) { return d.added[n]; })) - Math.max(d.added[x], d.boilAt || 0);
      if (boilFirst < 15 || d.added[x] == null) { orderOk = false; flags.firstFail.push(x); notes.push(hName(x) + tx(' should be boiled first, about 15–30 minutes before the other herbs (先煎).', ' cần sắc trước khoảng 15–30 phút rồi mới cho các vị khác (tiên tiễn).')); }
    });
    laters.forEach(function (x) {
      var cooked = d.min - d.added[x];
      if (d.added[x] < normalAt || cooked > 10 || cooked < 2) { orderOk = false; if (cooked > 10 || d.added[x] < normalAt) flags.laterFail.push(x); notes.push(hName(x) + tx(' should go in only for the last 5–10 minutes (后下) to keep its aromatic oils.', ' chỉ nên cho vào 5–10 phút cuối (hậu hạ) để giữ tinh dầu thơm.')); }
    });
    if (orderOk) sc += 25;
    var simmer = d.min - cookStart;
    if (simmer >= kind.min && simmer <= kind.max) sc += 30;
    else { flags.simmerOff = true; }
    if (simmer >= kind.min && simmer <= kind.max) { /* scored above */ }
    else if (simmer >= kind.min - 8 && simmer <= kind.max + 10) { sc += 15; notes.push(tx('Simmer time ', 'Thời gian sắc ') + Math.max(0, Math.round(simmer)) + tx(' min; aim for ', ' phút; nên ') + kind.min + '–' + kind.max + '.'); }
    else notes.push(tx('Simmer time ', 'Thời gian sắc ') + Math.max(0, Math.round(simmer)) + tx(' min is far from ', ' phút, quá xa so với ') + kind.min + '–' + kind.max + '. ' + L(kind));
    if (d.vol >= 150 && d.vol <= 260) sc += 30;
    else if (d.vol >= 100 && d.vol <= 350) { sc += 15; notes.push(tx('You strained ', 'Thu được ') + Math.round(d.vol) + tx(' ml; one bowl is about 200 ml.', ' ml; một bát khoảng 200 ml.')); }
    else notes.push(tx('You strained ', 'Thu được ') + Math.round(d.vol) + tx(' ml: far from one bowl (about 200 ml).', ' ml: quá xa so với một bát (khoảng 200 ml).'));
    return { total: sc, notes: notes, simmer: simmer, flags: flags, burnt: false };
  }

  function renderDecoct(el, o) {
    var d = DC(o), f = D.formulaById[o.formula];
    var kind = D.decoction[D.formulaDecoction[f.id] || 'standard'];
    var started = d.water > 0;
    function chip(id) {
      var pr = prep(id), on = d.added[id] != null;
      return '<button type="button" class="chip herb-add" data-add="' + id + '"' + (on || !started || d.done ? ' disabled' : '') + '><i class="dotc" style="background:' + look(id)[0] + '"></i> ' + TCM.esc(hName(id)) +
        (st.hint && pr !== 'normal' ? ' <b class="chip-warn" style="padding:0 5px;border-radius:6px">' + TCM.esc(L(D.prepNames[pr])) + '</b>' : '') + (on ? ' · ' + Math.round(d.added[id]) + "'" : '') + '</button>';
    }
    el.innerHTML = '<div class="split"><div class="panel stack"><div class="xs-wrap" id="ph-stage">' + stoveSvg(o, d) + '<div class="say-bubble" hidden></div></div>' +
      '<div class="meters"><div class="meter-row"><span class="small">' + tx('Clock', 'Thời gian') + '</span><span class="mono" id="ph-min">' + Math.floor(d.min) + ' ' + tx('min', 'phút') + '</span><span class="small muted" id="ph-boil">' + (d.boilAt != null ? tx('boiling since ', 'sôi từ phút ') + Math.round(d.boilAt) : '') + '</span></div>' +
      '<div class="meter-row"><span class="small">' + tx('Water', 'Nước') + '</span><span class="mono" id="ph-vol">' + Math.round(d.vol) + ' ml</span><span class="small muted">' + tx('target ≈ 200 ml (1 bowl)', 'mục tiêu ≈ 200 ml (1 bát)') + '</span></div>' +
      '<div class="meter-row"><span class="small">' + tx('Temperature', 'Nhiệt độ') + '</span><span class="mono" id="ph-T">' + Math.round(d.T) + ' °C</span></div></div></div>' +
      '<div class="stack"><div class="panel stack"><h3>' + TCM.nm(f, { enMain: 'py' }) + '</h3><p class="small muted">' + TCM.esc(L(kind)) + (st.hint ? ' ' + tx('Simmer ', 'Sắc ') + kind.min + '–' + kind.max + tx(' min.', ' phút.') : '') + '</p>' +
      '<div class="field"><span class="lbl">' + tx('1 · Water', '1 · Nước') + '</span><div class="row"><button type="button" class="btn btn-sm" id="ph-water"' + (d.running || d.water >= 5 ? ' disabled' : '') + '>' + tx('Add 1 bowl (200 ml)', 'Thêm 1 bát (200 ml)') + '</button><span class="small mono">' + d.water + tx(' bowls', ' bát') + '</span></div></div>' +
      '<div class="field"><span class="lbl">' + tx('2 · Heat', '2 · Lửa') + '</span><div class="seg" role="group">' + [['off', tx('Off', 'Tắt')], ['low', tx('Low 文火', 'Nhỏ (văn hỏa)')], ['high', tx('High 武火', 'To (vũ hỏa)')]].map(function (x) { return '<button type="button" data-heat="' + x[0] + '" aria-pressed="' + (d.heat === x[0]) + '"' + (!started || d.done ? ' disabled' : '') + '>' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><span class="lbl">' + tx('3 · Put herbs in the pot (order matters)', '3 · Cho thuốc vào ấm (thứ tự quan trọng)') + '</span><div class="row" style="gap:6px">' + o.items.map(function (it) { return chip(it.id); }).join('') + '</div></div>' +
      '<div class="row"><label class="row small"><input type="checkbox" id="ph-fast"' + (d.speed > 1 ? ' checked' : '') + '> ' + tx('Fast-forward ×3', 'Tua nhanh ×3') + '</label>' +
      '<button type="button" class="btn btn-primary" id="ph-strain"' + (Object.keys(d.added).length && !d.done ? '' : ' disabled') + '>' + tx('Strain into the bowl', 'Chắt ra bát') + '</button></div></div>' +
      (o.result ? '<div class="panel stack"><div class="score-line"><span class="score-big">' + o.result.total + '</span><span class="muted">/ 100</span>' +
        '<svg class="bowl" viewBox="0 0 120 60" aria-hidden="true"><path d="M8 18 Q60 22 112 18 Q104 56 60 56 Q16 56 8 18 Z" fill="#f5f1e8" stroke="#c9b68e" stroke-width="2"/><ellipse cx="60" cy="19" rx="50" ry="6" fill="' + (d.burnt ? '#1a1410' : '#5a2e12') + '"/></svg></div>' +
        o.result.notes.map(function (x) { return '<div class="callout callout-warn"><span>' + TCM.esc(x) + '</span></div>'; }).join('') +
        (!o.result.notes.length ? '<div class="callout callout-good"><span>' + tx('A textbook decoction. Serve it warm, half an hour after a meal.', 'Thang thuốc chuẩn mực. Uống ấm, sau ăn khoảng nửa giờ.') + '</span></div>' : '') +
        (o.journeyCase ? '<div class="row"><button type="button" class="btn btn-primary" id="ph-home">' + tx('Give the medicine to the patient and send them home', 'Giao thuốc cho bệnh nhân về nhà') + '</button><button type="button" class="btn" id="ph-again">' + tx('Decoct again', 'Sắc lại') + '</button></div></div>'
          : '<div class="row"><button type="button" class="btn" id="ph-again">' + tx('Decoct another packet', 'Sắc thang khác') + '</button><button type="button" class="btn btn-ghost" id="ph-new">' + tx('New prescription', 'Đơn thuốc mới') + '</button></div></div>') : '') +
      '</div></div>';

    var stage = TCM.$('#ph-stage', el);
    function rer() { renderDecoct(el, o); }
    TCM.$('#ph-water', el).addEventListener('click', function () { d.water++; d.vol += 200; rer(); });
    TCM.$$('[data-heat]', el).forEach(function (b) { b.addEventListener('click', function () { d.heat = b.getAttribute('data-heat'); d.running = true; rer(); }); });
    TCM.$$('[data-add]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-add');
        d.added[id] = d.min;
        d.running = true;
        TCM.say(stage, '+ ' + hName(id), { silent: true, ms: 1200 });
        rer();
      });
    });
    TCM.$('#ph-fast', el).addEventListener('change', function (e) { d.speed = e.target.checked ? 3 : 1; });
    TCM.$('#ph-strain', el).addEventListener('click', function () {
      d.done = true; d.heat = 'off';
      o.result = evaluate(o, d);
      TCM.store.record('pharmacy', o.result.total >= 70);
      rer();
    });
    var ag = TCM.$('#ph-again', el); if (ag) ag.addEventListener('click', function () { o.dc = null; o.result = null; rer(); });
    var hm = TCM.$('#ph-home', el);
    if (hm) hm.addEventListener('click', function () {
      var errs = o.items.map(function (it) { return it.target ? Math.abs(it.got - it.target) / it.target : 0; });
      TCM.journey.active.pharm = { weighErr: errs.reduce(function (a2, b2) { return a2 + b2; }, 0) / Math.max(1, errs.length), wrongs: o.wrongs.slice(), decoct: { total: o.result.total, burnt: !!o.result.burnt, flags: o.result.flags } };
      loopTok = null;
      TCM.journey.move('followup');
    });
    var nw = TCM.$('#ph-new', el); if (nw) nw.addEventListener('click', function () { st.order = makeOrder(TCM.pick(D.formulas).id); TCM.rerender(); });

    var tok = {}; loopTok = tok;
    var last = performance.now(), lastStage = '';
    (function tick(now) {
      if (loopTok !== tok || !el.isConnected) return;
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (d.running && !d.done && d.water > 0) {
        var dm = dt * 2 * d.speed;                       // simulated minutes
        d.min += dm;
        var target = d.heat === 'high' ? 112 : d.heat === 'low' ? 101 : 25;
        var rate = d.heat === 'high' ? 16 : d.heat === 'low' ? 7 : 4;
        if (d.T < target) d.T = Math.min(100, d.T + rate * dm); else d.T = Math.max(target === 25 ? 25 : 100, d.T - 4 * dm);
        if (d.T >= 100) {
          if (d.boilAt == null) { d.boilAt = d.min; TCM.say(stage, tx('Boiling!', 'Sôi rồi!'), { silent: true, ms: 1400 }); }
          d.vol -= (d.heat === 'high' ? 22 : d.heat === 'low' ? 11 : 0) * dm;
        }
        if (d.vol <= 0) { d.vol = 0; d.burnt = true; d.done = true; o.result = evaluate(o, d); TCM.store.record('pharmacy', false); TCM.toast(tx('The pot boiled dry: the herbs burnt!', 'Ấm cạn: thuốc bị cháy!')); rer(); return; }
      }
      var m = TCM.$('#ph-min', el); if (m) m.textContent = Math.floor(d.min) + ' ' + tx('min', 'phút');
      var v = TCM.$('#ph-vol', el); if (v) v.textContent = Math.round(d.vol) + ' ml';
      var T = TCM.$('#ph-T', el); if (T) T.textContent = Math.round(d.T) + ' °C';
      var bo = TCM.$('#ph-boil', el); if (bo) bo.textContent = d.boilAt != null ? tx('boiling since minute ', 'sôi từ phút ') + Math.round(d.boilAt) : '';
      var sig = Math.round(d.vol / 10) + '|' + (d.T >= 99) + '|' + d.heat;
      if (sig !== lastStage) {
        lastStage = sig;
        var svg = TCM.$('.stove', el);
        if (svg) svg.outerHTML = stoveSvg(o, d);
      }
      var steam = TCM.$('#ph-steam', el);
      if (steam) {
        var n = d.T >= 99 ? (d.heat === 'high' ? 6 : 3) : d.T > 70 ? 1 : 0, out = '';
        for (var i = 0; i < n; i++) {
          var t = ((now / 1000) * 0.8 + i / n) % 1;
          out += '<circle cx="' + (270 + Math.sin(t * 6 + i) * 6 + t * 18).toFixed(1) + '" cy="' + (66 - t * 60).toFixed(1) + '" r="' + (4 + t * 10).toFixed(1) + '" fill="#d8dde0" opacity="' + (0.5 * (1 - t)).toFixed(2) + '"/>';
        }
        steam.innerHTML = out;
      }
      requestAnimationFrame(tick);
    })(last);
  }

  function syncJourney() {
    var J = TCM.journey, a = J && J.active;
    if (a && a.stage === 'pharmacy' && a.clinic) {
      if (!st.order || st.order.journeyCase !== a.caseId) {
        st.order = makeOrder(a.clinic.formula, D.caseById[a.caseId].patient.name);
        st.order.journeyCase = a.caseId;
      }
    } else if (st.order && st.order.journeyCase) st.order = null;
  }

  function render(el) {
    syncJourney();
    var o = O();
    var jbar = o.journeyCase ? TCM.journey.bar() : '';
    el.innerHTML = '<div class="page">' + jbar + TCM.pageHead('药房', tx('Herbal pharmacy', 'Nhà thuốc'),
      tx('Fill a prescription the traditional way: open the cabinet drawers, weigh each herb on the steelyard for all the packets, wrap them, then decoct a packet on the charcoal stove.',
        'Bốc thuốc theo lối truyền thống: mở ngăn tủ thuốc, cân từng vị trên cân tiểu ly cho đủ số thang, gói lại, rồi sắc một thang trên bếp than.')) +
      '<nav class="steps" aria-label="' + tx('Pharmacy steps', 'Các bước') + '">' + [['dispense', '抓药', tx('Weigh', 'Bốc thuốc')], ['wrap', '包药', tx('Wrap', 'Gói thuốc')], ['decoct', '煎药', tx('Decoct', 'Sắc thuốc')]].map(function (x) {
        return '<span class="step' + (o.stage === x[0] ? '" aria-current="step' : '') + '"><span class="zh" lang="zh-Hans">' + x[1] + '</span> ' + x[2] + '</span>';
      }).join('') + '</nav><div id="ph-body"></div>' + TCM.disclaimer() + '</div>';
    if (jbar) TCM.journey.wireBar(el);
    var body = TCM.$('#ph-body', el);
    if (o.stage === 'wrap') renderWrap(body, o);
    else if (o.stage === 'decoct') renderDecoct(body, o);
    else renderDispense(body, o);
  }

  TCM.modules.pharmacy = {
    han: '秤',
    title: { en: 'Herbal pharmacy', vi: 'Nhà thuốc' },
    sub: { en: 'Bốc & sắc thuốc · 抓药煎药', vi: 'Bốc & sắc thuốc · 抓药煎药' },
    blurb: { en: 'Open the drawers of the medicine cabinet, weigh herbs on a steelyard, wrap the packets and decoct them on a charcoal stove.', vi: 'Mở ngăn tủ thuốc, cân thuốc bằng cân tiểu ly, gói thang và sắc thuốc trên bếp than.' },
    leave: function () { loopTok = null; },
    render: function (el) { loopTok = null; render(el); }
  };
})();
