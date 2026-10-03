/* Realistic scene rendering: procedural material textures (wood, plaster, paper, fabric,
   brass, coals) and the rooms of the clinic, plus an architectural floor plan. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var uid = 0;

  /* Texture filters. Each generates a material from noise and clips it to the shape it is applied to. */
  function tex(p) {
    function T(id, freq, oct, seed, r, g, b, extra) {
      return '<filter id="' + p + id + '" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + oct + '" seed="' + seed + '" result="n"/>' +
        '<feColorMatrix in="n" type="saturate" values="0" result="g"/>' +
        '<feComponentTransfer in="g" result="c"><feFuncR type="table" tableValues="' + r + '"/><feFuncG type="table" tableValues="' + g + '"/><feFuncB type="table" tableValues="' + b + '"/><feFuncA type="discrete" tableValues="1"/></feComponentTransfer>' +
        (extra || '') +
        '<feComposite in="c" in2="SourceAlpha" operator="in"/></filter>';
    }
    return T('wood', '0.006 0.18', 4, 3, '0.30 0.46 0.38 0.55 0.42', '0.17 0.29 0.22 0.36 0.26', '0.08 0.16 0.11 0.21 0.13') +
      T('woodL', '0.006 0.22', 4, 8, '0.55 0.70 0.60 0.76 0.64', '0.36 0.49 0.40 0.55 0.44', '0.20 0.30 0.23 0.35 0.26') +
      T('plaster', '0.9', 3, 2, '0.86 0.92 0.89 0.94', '0.81 0.87 0.84 0.89', '0.72 0.79 0.75 0.81') +
      T('paper', '0.6', 3, 5, '0.90 0.95 0.92 0.97', '0.84 0.90 0.87 0.92', '0.70 0.78 0.74 0.80') +
      T('linen', '1.6 0.3', 2, 9, '0.86 0.95 0.90 0.98', '0.86 0.94 0.90 0.97', '0.84 0.93 0.88 0.96') +
      T('indigo', '1.2', 2, 4, '0.10 0.16 0.12 0.19', '0.16 0.23 0.18 0.27', '0.30 0.40 0.34 0.45') +
      T('clay', '0.5', 4, 6, '0.36 0.48 0.40 0.52', '0.18 0.26 0.21 0.29', '0.10 0.15 0.12 0.17') +
      T('coal', '0.08', 3, 7, '0.05 0.25 0.95 1 1', '0.03 0.08 0.45 0.75 0.9', '0.02 0.02 0.08 0.2 0.45') +
      T('stone', '0.25', 4, 1, '0.38 0.50 0.44 0.55', '0.37 0.48 0.43 0.53', '0.35 0.45 0.40 0.50') +
      '<linearGradient id="' + p + 'brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d38a"/><stop offset=".45" stop-color="#b8862e"/><stop offset=".55" stop-color="#8a5f1c"/><stop offset="1" stop-color="#d9b060"/></linearGradient>' +
      '<radialGradient id="' + p + 'brassR" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#fbe7b0"/><stop offset=".5" stop-color="#c0902f"/><stop offset="1" stop-color="#6e4a12"/></radialGradient>' +
      '<linearGradient id="' + p + 'steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c868c"/><stop offset=".4" stop-color="#f4f7f9"/><stop offset=".6" stop-color="#c3cbd0"/><stop offset="1" stop-color="#5f686d"/></linearGradient>' +
      '<filter id="' + p + 'soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="' + p + 'soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>' +
      '<filter id="' + p + 'shadow" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>' +
      '<radialGradient id="' + p + 'vign" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>' +
      '<linearGradient id="' + p + 'daylight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6e0" stop-opacity=".55"/><stop offset=".55" stop-color="#fff6e0" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>';
  }
  TCM.tex = tex;

  function windowPane(p, x, y, w, h) {
    return '<rect x="' + (x - 8) + '" y="' + (y - 8) + '" width="' + (w + 16) + '" height="' + (h + 16) + '" fill="#000" filter="url(#' + p + 'wood)"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#eef4f2"/>' +
      '<rect x="' + x + '" y="' + (y + h * 0.55) + '" width="' + w + '" height="' + (h * 0.45) + '" fill="#a9b9a0" opacity=".55" filter="url(#' + p + 'soft)"/>' +
      '<ellipse cx="' + (x + w * 0.3) + '" cy="' + (y + h * 0.7) + '" rx="' + (w * 0.35) + '" ry="' + (h * 0.22) + '" fill="#7d9a72" opacity=".55" filter="url(#' + p + 'soft)"/>' +
      '<path d="M' + (x + w / 2) + ' ' + y + 'v' + h + 'M' + x + ' ' + (y + h / 2) + 'h' + w + '" stroke="#3a2a1c" stroke-width="5"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#fff" opacity=".18"/>';
  }

  function scroll(p, x, y, w, h, chars) {
    return '<rect x="' + (x + 6) + '" y="' + (y + 10) + '" width="' + w + '" height="' + h + '" fill="#000" opacity=".25" filter="url(#' + p + 'soft2)"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#000" filter="url(#' + p + 'paper)"/>' +
      '<rect x="' + (x - 6) + '" y="' + (y - 6) + '" width="' + (w + 12) + '" height="8" rx="4" fill="#000" filter="url(#' + p + 'wood)"/>' +
      '<rect x="' + (x - 6) + '" y="' + (y + h - 2) + '" width="' + (w + 12) + '" height="8" rx="4" fill="#000" filter="url(#' + p + 'wood)"/>' +
      chars.map(function (c, i) {
        return '<text x="' + (x + w / 2) + '" y="' + (y + 52 + i * 58) + '" text-anchor="middle" font-size="44" font-family="Noto Serif SC, serif" font-weight="700" fill="#1a1512" opacity=".86">' + c + '</text>';
      }).join('') +
      '<rect x="' + (x + w / 2 - 9) + '" y="' + (y + h - 34) + '" width="18" height="18" fill="#a8261c" opacity=".85"/>';
  }

  function cabinet(p, x, y, w, h, cols, rows) {
    var s = '<rect x="' + (x + 8) + '" y="' + (y + 12) + '" width="' + w + '" height="' + h + '" fill="#000" opacity=".3" filter="url(#' + p + 'shadow)"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#000" filter="url(#' + p + 'wood)"/>';
    var dw = (w - 12) / cols, dh = (h - 12) / rows;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var dx = x + 6 + c * dw, dy = y + 6 + r * dh;
      s += '<rect x="' + (dx + 2) + '" y="' + (dy + 2) + '" width="' + (dw - 4) + '" height="' + (dh - 4) + '" fill="#000" filter="url(#' + p + 'woodL)" opacity=".9"/>' +
        '<rect x="' + (dx + 2) + '" y="' + (dy + 2) + '" width="' + (dw - 4) + '" height="' + (dh - 4) + '" fill="none" stroke="#24160b" stroke-opacity=".6"/>' +
        '<rect x="' + (dx + dw / 2 - 7) + '" y="' + (dy + 6) + '" width="14" height="' + Math.min(10, dh * 0.3) + '" fill="#000" filter="url(#' + p + 'paper)" opacity=".85"/>' +
        '<circle cx="' + (dx + dw / 2) + '" cy="' + (dy + dh * 0.68) + '" r="' + Math.max(2, dh * 0.09) + '" fill="url(#' + p + 'brassR)"/>';
    }
    return s;
  }

  function room(p, w, h, opts) {
    opts = opts || {};
    var fy = opts.floor || h * 0.74;
    var s = '';
    s += '<rect width="' + w + '" height="' + fy + '" fill="#000" filter="url(#' + p + 'plaster)"/>';
    s += '<rect y="' + (fy - 46) + '" width="' + w + '" height="46" fill="#000" filter="url(#' + p + 'wood)" opacity=".92"/>';
    s += '<rect y="' + (fy - 48) + '" width="' + w + '" height="4" fill="#2a1a0e" opacity=".7"/>';
    s += '<rect y="' + fy + '" width="' + w + '" height="' + (h - fy) + '" fill="#000" filter="url(#' + p + 'woodL)"/>';
    for (var i = -8; i <= 18; i++) {
      var x0 = w / 2 + i * 70, x1 = w / 2 + i * 150;
      s += '<path d="M' + x0 + ' ' + fy + ' L' + x1 + ' ' + h + '" stroke="#2c1c10" stroke-opacity=".35" stroke-width="1.2"/>';
    }
    s += '<rect y="' + fy + '" width="' + w + '" height="' + (h - fy) + '" fill="url(#' + p + 'floorShade)"/>';
    return s;
  }

  function wrap(p, w, h, inner, cls) {
    return '<svg class="' + (cls || 'scene') + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>' + tex(p) +
      '<linearGradient id="' + p + 'floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".3" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>' +
      '</defs>' + inner + '</svg>';
  }

  /* Consulting room behind the patient. */
  TCM.scene = function (name, opts) {
    var p = 'sc' + ++uid + '_';
    opts = opts || {};
    var W = 800, H = 450, s = '';
    if (name === 'clinic') {
      s += room(p, W, H, { floor: 330 });
      s += '<path d="M40 330 L210 330 L330 450 L0 450 L0 380 Z" fill="#fff4dc" opacity=".22" filter="url(#' + p + 'soft)"/>';
      s += windowPane(p, 50, 60, 150, 190);
      s += '<path d="M200 60 L420 120 L420 330 L200 250 Z" fill="#fff6e2" opacity=".18" filter="url(#' + p + 'soft)"/>';
      s += scroll(p, 590, 46, 76, 210, ['仁', '心']);
      s += cabinet(p, 688, 80, 112, 250, 3, 6);
      s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + p + 'daylight)"/>';
      s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + p + 'vign)"/>';
      return wrap(p, W, H, s, 'scene room-bg');
    }
    if (name === 'clinic-fg') {
      // desk edge and pulse pillow in front of the patient
      s += '<rect x="-10" y="392" width="820" height="70" fill="#000" filter="url(#' + p + 'wood)"/>';
      s += '<rect x="-10" y="390" width="820" height="6" fill="#d8b98a" opacity=".55"/>';
      s += '<rect x="330" y="372" width="120" height="30" rx="14" fill="#000" filter="url(#' + p + 'indigo)"/>';
      s += '<rect x="330" y="372" width="120" height="12" rx="10" fill="#fff" opacity=".12"/>';
      s += '<path d="M336 400 Q390 410 444 400" stroke="#000" stroke-opacity=".35" stroke-width="5" fill="none" filter="url(#' + p + 'soft2)"/>';
      s += '<rect x="560" y="356" width="70" height="44" rx="3" fill="#000" filter="url(#' + p + 'paper)"/><path d="M570 368h50M570 378h44M570 388h48" stroke="#555" stroke-width="1.2" opacity=".6"/>';
      return '<svg class="scene room-fg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' + tex(p) + '</defs>' + s + '</svg>';
    }
    if (name === 'waiting') {
      s += room(p, W, H, { floor: 330 });
      s += windowPane(p, 520, 60, 170, 190);
      s += '<path d="M690 60 L800 30 L800 330 L690 250 Z" fill="#fff6e2" opacity=".15" filter="url(#' + p + 'soft)"/>';
      s += scroll(p, 90, 46, 76, 210, ['仁', '心']);
      // bench
      s += '<rect x="60" y="360" width="680" height="16" fill="#000" filter="url(#' + p + 'wood)"/><rect x="80" y="376" width="12" height="60" fill="#2a1a0e"/><rect x="708" y="376" width="12" height="60" fill="#2a1a0e"/>';
      s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + p + 'vign)"/>';
      return wrap(p, W, H, s, 'scene room-bg');
    }
    return '';
  };

  /* Treatment room with the patient lying on the couch. needles: [{x,y}] in figure space (300×640). */
  TCM.couchScene = function (opts) {
    opts = opts || {};
    var p = 'cs' + ++uid + '_';
    var W = 800, H = 300, s = '';
    s += room(p, W, H, { floor: 210 });
    s += windowPane(p, 40, 30, 120, 120);
    s += '<path d="M160 30 L380 90 L380 210 L160 150 Z" fill="#fff6e2" opacity=".18" filter="url(#' + p + 'soft)"/>';
    // couch
    s += '<ellipse cx="420" cy="268" rx="330" ry="16" fill="#000" opacity=".35" filter="url(#' + p + 'shadow)"/>';
    s += '<rect x="120" y="196" width="10" height="72" fill="#3a2a1c"/><rect x="700" y="196" width="10" height="72" fill="#3a2a1c"/>';
    s += '<rect x="100" y="176" width="630" height="30" rx="8" fill="#000" filter="url(#' + p + 'linen)"/>';
    s += '<rect x="100" y="198" width="630" height="10" rx="4" fill="#000" opacity=".15"/>';
    s += '<g transform="translate(110 178)">';
    // simplified lying silhouette: head, torso, legs (seen from the side), skin with shading
    s += '<defs><linearGradient id="' + p + 'skinL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0cfae"/><stop offset=".6" stop-color="#d9a882"/><stop offset="1" stop-color="#a87a58"/></linearGradient></defs>';
    s += '<path d="M14 -6 C10 -34 52 -40 62 -18 L70 -12 C120 -26 250 -30 330 -20 C390 -16 470 -16 560 -12 C590 -12 610 -8 610 0 L14 2 Z" fill="url(#' + p + 'skinL)"/>';
    s += '<ellipse cx="38" cy="-14" rx="26" ry="20" fill="url(#' + p + 'skinL)"/>';
    s += '<path d="M16 -24 C20 -42 58 -40 60 -22 C50 -30 30 -32 16 -24 Z" fill="#2a2220" opacity=".9"/>';
    s += '<path d="M300 -22 C380 -24 470 -22 560 -16 L610 -6 L610 2 L300 2 Z" fill="#000" filter="url(#' + p + 'linen)" opacity=".98"/>';
    s += '<path d="M300 -22 C380 -24 470 -22 560 -16" stroke="#b9b2a4" stroke-width="1.5" fill="none"/>';
    s += '<rect x="-4" y="-10" width="70" height="14" rx="7" fill="#000" filter="url(#' + p + 'linen)"/>';
    // needles
    (opts.needles || []).forEach(function (n) {
      var nx = 20 + n.u * 580, ny = n.u < 0.06 ? -30 : n.u > 0.5 ? -20 : -26;
      s += '<path d="M' + nx.toFixed(1) + ' ' + ny.toFixed(1) + ' l' + (n.lean || 4) + ' -26" stroke="url(#' + p + 'steel)" stroke-width="1.4"/>' +
        '<rect x="' + (nx + (n.lean || 4) - 1.6).toFixed(1) + '" y="' + (ny - 40).toFixed(1) + '" width="3.4" height="14" rx="1" fill="url(#' + p + 'brass)"/>';
    });
    (opts.moxa || []).forEach(function (n) {
      var nx = 20 + n.u * 580;
      s += '<ellipse cx="' + nx.toFixed(1) + '" cy="-24" rx="10" ry="4" fill="#e0533f" opacity=".35" filter="url(#' + p + 'soft2)"/>';
    });
    s += '</g>';
    // lamp
    s += '<path d="M640 0 L640 40" stroke="#333" stroke-width="2"/><path d="M610 40 Q640 26 670 40 L662 54 L618 54 Z" fill="#2f3a36"/><ellipse cx="640" cy="56" rx="22" ry="4" fill="#fff4cc" opacity=".8"/>';
    s += '<path d="M618 56 L520 176 L760 176 L662 56 Z" fill="#fff4cc" opacity=".12" filter="url(#' + p + 'soft)"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#' + p + 'daylight)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + p + 'vign)"/>';
    return wrap(p, W, H, s, 'scene couch-scene');
  };

  /* Architectural floor plan of the clinic; patient walks from room a to room b. */
  var ROOMS = {
    wait: { x: 20, y: 20, w: 200, h: 150, zh: '候诊', vi: 'Sảnh chờ', en: 'Waiting hall', door: [220, 95] },
    clinic: { x: 240, y: 20, w: 200, h: 150, zh: '诊室', vi: 'Phòng chẩn bệnh', en: 'Consulting room', door: [340, 170] },
    treat: { x: 460, y: 20, w: 220, h: 150, zh: '针灸室', vi: 'Phòng thủ thuật', en: 'Treatment room', door: [570, 170] },
    pharmacy: { x: 460, y: 230, w: 220, h: 130, zh: '药房', vi: 'Nhà thuốc', en: 'Herbal pharmacy', door: [570, 230] },
    exit: { x: 20, y: 230, w: 200, h: 130, zh: '出口', vi: 'Lối ra', en: 'Exit', door: [220, 300] }
  };
  TCM.floorRooms = ROOMS;
  TCM.floorPlan = function (from, to, opts) {
    opts = opts || {};
    var s = '<svg class="floorplan" viewBox="0 0 700 380" role="img" aria-label="' + TCM.esc(TCM.tx('Floor plan of the clinic', 'Sơ đồ phòng khám')) + '">';
    s += '<rect x="0" y="0" width="700" height="380" fill="#f7f5ef"/>';
    s += '<defs><pattern id="fp-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#dcd7ca" stroke-width=".6"/></pattern></defs><rect width="700" height="380" fill="url(#fp-grid)"/>';
    s += '<rect x="20" y="170" width="660" height="60" fill="#ece7da"/>';
    Object.keys(ROOMS).forEach(function (k) {
      var r = ROOMS[k], on = k === from || k === to;
      s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="' + (k === to ? '#e4efe8' : '#fbfaf6') + '" stroke="#2b2b2b" stroke-width="4"/>';
      s += '<text x="' + (r.x + 12) + '" y="' + (r.y + 26) + '" font-size="15" font-family="Noto Serif SC, serif" font-weight="700" fill="#2b2b2b">' + r.zh + '</text>';
      s += '<text x="' + (r.x + 12) + '" y="' + (r.y + 44) + '" font-size="12" fill="#3d3d3d"' + (on ? ' font-weight="700"' : '') + '>' + TCM.esc(TCM.tx(r.en, r.vi)) + '</text>';
      var d = r.door;
      s += '<rect x="' + (d[0] - 16) + '" y="' + (d[1] - 3) + '" width="32" height="6" fill="#f7f5ef"/>';
    });
    // furniture symbols
    s += '<rect x="300" y="80" width="80" height="40" fill="none" stroke="#777"/><circle cx="340" cy="138" r="9" fill="none" stroke="#777"/><circle cx="340" cy="62" r="9" fill="none" stroke="#777"/>';
    s += '<rect x="490" y="70" width="150" height="34" rx="4" fill="none" stroke="#777"/><rect x="490" y="118" width="150" height="34" rx="4" fill="none" stroke="#777"/>';
    s += '<rect x="470" y="300" width="200" height="22" fill="none" stroke="#777"/><rect x="480" y="244" width="190" height="20" fill="none" stroke="#777"/>';
    s += '<rect x="40" y="110" width="160" height="16" fill="none" stroke="#777"/>';
    var a = ROOMS[from] || ROOMS.wait, b = ROOMS[to] || ROOMS.clinic;
    var pa = [a.x + a.w / 2, a.y + a.h / 2 + 20], pb = [b.x + b.w / 2, b.y + b.h / 2 + 20];
    var path = 'M' + pa[0] + ' ' + pa[1] + ' L' + a.door[0] + ' ' + a.door[1] + ' L' + a.door[0] + ' 200 L' + b.door[0] + ' 200 L' + b.door[0] + ' ' + b.door[1] + ' L' + pb[0] + ' ' + pb[1];
    s += '<path id="fp-path" d="' + path + '" fill="none" stroke="#a8261c" stroke-width="2.5" stroke-dasharray="6 6" opacity=".75"/>';
    s += '<g id="fp-walker"><circle r="11" fill="#a8261c"/><circle r="11" fill="none" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">' + TCM.esc((opts.initial || 'P').charAt(0)) + '</text></g>';
    s += '<g transform="translate(640 350)"><path d="M0 0v-24" stroke="#2b2b2b" stroke-width="2"/><path d="M-6 -16 L0 -26 L6 -16" fill="#2b2b2b"/><text y="14" text-anchor="middle" font-size="11" fill="#2b2b2b">N</text></g>';
    return s + '</svg>';
  };
  /* Animate the walker along the path, then call done. */
  TCM.walk = function (host, ms, done) {
    var path = host.querySelector('#fp-path'), w = host.querySelector('#fp-walker');
    if (!path || !w) { if (done) done(); return; }
    var len = path.getTotalLength(), t0 = performance.now();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) ms = 1;
    (function step(now) {
      if (!host.isConnected) return;
      var u = Math.min(1, (now - t0) / ms);
      var e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      var pt = path.getPointAtLength(e * len);
      w.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
      if (u < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  };
})();
