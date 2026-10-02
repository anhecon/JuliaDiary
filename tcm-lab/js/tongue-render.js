/* Procedural tongue drawing. TCM.renderTongue(params) returns an SVG string.
   params: { body, shape, coat, moist, teeth, cracks, redTip, redSides, spots, seed } */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var uid = 0;

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(c) { return Math.max(0, Math.min(255, Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }

  var CX = 150, ROOT = 46, TIP = 322, LEN = TIP - ROOT;

  function halfWidth(u, W) {
    return W * Math.sqrt(Math.max(0, 1 - Math.pow(u, 3))) * (0.93 + 0.15 * Math.sin(Math.PI * u));
  }

  function outline(W, teeth) {
    var right = [], left = [], N = 90;
    for (var i = 0; i <= N; i++) {
      var u = i / N;
      var hw = halfWidth(u, W);
      if (teeth && u > 0.2 && u < 0.84) {
        var k = (u - 0.2) / 0.08;
        var dent = Math.pow(Math.abs(Math.sin(Math.PI * k)), 0.7);
        hw -= 4.2 * dent * Math.sin(Math.PI * (u - 0.2) / 0.64);
      }
      var y = ROOT + u * LEN;
      right.push([CX + hw, y]);
      left.unshift([CX - hw, y]);
    }
    var pts = right.concat(left);
    return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
  }

  function coatPath(W, reach) {
    var right = [], left = [], N = 50;
    for (var i = 0; i <= N; i++) {
      var u = i / N;
      var uu = u * reach;
      var hw = halfWidth(uu, W) * 0.74 * Math.sqrt(Math.max(0, 1 - Math.pow(u, 4)));
      var y = ROOT + uu * LEN;
      right.push([CX + hw, y]);
      left.unshift([CX - hw, y]);
    }
    var pts = right.concat(left);
    return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
  }

  TCM.renderTongue = function (p, opts) {
    p = p || {};
    opts = opts || {};
    var id = 'tg' + ++uid;
    var R = rng(p.seed || 7);
    var bodyDef = D.tongue.body[p.body] || D.tongue.body.lightred;
    var coatDef = D.tongue.coat[p.coat] || D.tongue.coat.thin_white;
    var W = p.shape === 'swollen' ? 106 : p.shape === 'thin' ? 74 : 90;
    var base = bodyDef.fill;
    var edge = shade(base, -0.22);
    var light = shade(base, 0.16);
    var outlineD = outline(W, !!p.teeth);
    var s = [];

    s.push('<svg viewBox="0 0 300 340" role="img" aria-label="' + TCM.esc(opts.label || 'Tongue') + '" xmlns="http://www.w3.org/2000/svg">');
    s.push('<defs>');
    s.push('<clipPath id="' + id + 'c"><path d="' + outlineD + '"/></clipPath>');
    s.push('<radialGradient id="' + id + 'b" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="' + light + '"/><stop offset=".7" stop-color="' + base + '"/><stop offset="1" stop-color="' + edge + '"/></radialGradient>');
    s.push('<radialGradient id="' + id + 'tip" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#d91f25" stop-opacity=".95"/><stop offset="1" stop-color="#d91f25" stop-opacity="0"/></radialGradient>');
    s.push('<radialGradient id="' + id + 'side" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#cf1f27" stop-opacity=".85"/><stop offset="1" stop-color="#cf1f27" stop-opacity="0"/></radialGradient>');
    s.push('<linearGradient id="' + id + 'ct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".75" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>');
    s.push('<mask id="' + id + 'cm"><rect x="0" y="0" width="300" height="340" fill="url(#' + id + 'ct)"/>');
    if (coatDef.patches) {
      for (var g = 0; g < 7; g++) {
        var gx = CX + (R() - 0.5) * W * 1.1, gy = ROOT + 60 + R() * 150;
        s.push('<ellipse cx="' + gx.toFixed(1) + '" cy="' + gy.toFixed(1) + '" rx="' + (10 + R() * 18).toFixed(1) + '" ry="' + (8 + R() * 14).toFixed(1) + '" fill="#000"/>');
      }
    }
    s.push('</mask>');
    var freq = coatDef.grain > 1 ? 0.9 : coatDef.grain < 1 ? 1.1 : 0.7;
    s.push('<filter id="' + id + 'gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="2" seed="' + ((p.seed || 7) % 50) + '" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ' + (-1.4 * coatDef.grain).toFixed(2) + ' ' + (0.6 + 0.65 * coatDef.grain).toFixed(2) + '" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>');
    s.push('<filter id="' + id + 'dry"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.12  0 0 0 0 0.12  0 0 0 0.35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>');
    s.push('<filter id="' + id + 'blur"><feGaussianBlur stdDeviation="2.2"/></filter>');
    s.push('</defs>');

    // mouth cavity and lower lip (behind the tongue)
    s.push('<ellipse cx="150" cy="70" rx="126" ry="52" fill="#3a1c20"/>');
    s.push('<path d="M34 92 Q150 150 266 92 Q262 112 150 136 Q38 112 34 92 Z" fill="#c4736f"/>');

    // tongue body
    s.push('<path d="' + outlineD + '" fill="url(#' + id + 'b)" stroke="' + edge + '" stroke-width="1.5"/>');
    s.push('<g clip-path="url(#' + id + 'c)">');
    // papillae texture
    for (var i = 0; i < 160; i++) {
      var u = R() * 0.97, x = CX + (R() * 2 - 1) * halfWidth(u, W) * 0.95, y = ROOT + u * LEN;
      s.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (0.6 + R() * 0.9).toFixed(2) + '" fill="' + shade(base, R() > 0.5 ? 0.12 : -0.1) + '" opacity=".55"/>');
    }
    if (p.moist === 'dry') s.push('<path d="' + outlineD + '" fill="#000" filter="url(#' + id + 'dry)" opacity=".9"/>');
    // red sides
    if (p.redSides) {
      s.push('<ellipse cx="' + (CX - W * 0.86).toFixed(1) + '" cy="' + (ROOT + LEN * 0.5) + '" rx="26" ry="78" fill="url(#' + id + 'side)"/>');
      s.push('<ellipse cx="' + (CX + W * 0.86).toFixed(1) + '" cy="' + (ROOT + LEN * 0.5) + '" rx="26" ry="78" fill="url(#' + id + 'side)"/>');
    }
    // red tip with prickles
    if (p.redTip) {
      s.push('<ellipse cx="150" cy="' + (TIP - 22) + '" rx="58" ry="44" fill="url(#' + id + 'tip)"/>');
      for (var t = 0; t < 26; t++) {
        var tu = 0.8 + R() * 0.17, tx = CX + (R() * 2 - 1) * halfWidth(tu, W) * 0.8;
        s.push('<circle cx="' + tx.toFixed(1) + '" cy="' + (ROOT + tu * LEN).toFixed(1) + '" r="' + (1 + R() * 1.1).toFixed(2) + '" fill="#a50f19"/>');
      }
    }
    // central groove
    s.push('<path d="M150 ' + (ROOT + 25) + ' C 149 ' + (ROOT + 120) + ', 151 ' + (ROOT + 170) + ', 150 ' + (ROOT + LEN * 0.74) + '" stroke="' + edge + '" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>');
    // coating
    if (coatDef.col) {
      var reach = p.coat === 'thin_white' || p.coat === 'thin_yellow' ? 0.8 : 0.86;
      s.push('<g mask="url(#' + id + 'cm)" opacity="' + coatDef.op + '"><path d="' + coatPath(W, reach) + '" fill="' + coatDef.col + '" filter="url(#' + id + 'gr)"/>');
      if (coatDef.grain < 1) s.push('<path d="' + coatPath(W * 0.94, reach * 0.97) + '" fill="' + coatDef.col + '" opacity=".7" filter="url(#' + id + 'blur)"/>');
      s.push('</g>');
    }
    // cracks
    if (p.cracks) {
      var cr = '#6e1820';
      s.push('<path d="M150 ' + (ROOT + 40) + ' L148 ' + (ROOT + 90) + ' L152 ' + (ROOT + 130) + ' L149 ' + (ROOT + 175) + ' L151 ' + (ROOT + 205) + '" stroke="' + cr + '" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>');
      var branches = [[ROOT + 70, -1], [ROOT + 95, 1], [ROOT + 120, -1], [ROOT + 145, 1], [ROOT + 165, -1], [ROOT + 180, 1]];
      branches.forEach(function (b) {
        var len = 18 + R() * 22, y0 = b[0];
        s.push('<path d="M150 ' + y0 + ' l' + (b[1] * len * 0.55).toFixed(1) + ' ' + (6 + R() * 8).toFixed(1) + ' l' + (b[1] * len * 0.45).toFixed(1) + ' ' + (R() * 8 - 2).toFixed(1) + '" stroke="' + cr + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>');
      });
    }
    // stasis spots
    if (p.spots) {
      for (var k = 0; k < 14; k++) {
        var su = 0.3 + R() * 0.62, side = R() > 0.5 ? 1 : -1;
        var sx = CX + side * halfWidth(su, W) * (0.62 + R() * 0.3);
        s.push('<circle cx="' + sx.toFixed(1) + '" cy="' + (ROOT + su * LEN).toFixed(1) + '" r="' + (2 + R() * 2.6).toFixed(2) + '" fill="#3f1235" opacity=".85"/>');
      }
    }
    // moisture highlights
    if (p.moist !== 'dry') {
      var hl = p.moist === 'wet' ? 0.55 : 0.28;
      s.push('<ellipse cx="' + (CX - W * 0.38).toFixed(1) + '" cy="' + (ROOT + LEN * 0.55) + '" rx="12" ry="30" fill="#fff" opacity="' + hl + '" filter="url(#' + id + 'blur)"/>');
      s.push('<ellipse cx="' + (CX + W * 0.32).toFixed(1) + '" cy="' + (ROOT + LEN * 0.66) + '" rx="8" ry="18" fill="#fff" opacity="' + (hl * 0.8) + '" filter="url(#' + id + 'blur)"/>');
      if (p.moist === 'wet') {
        s.push('<path d="M' + (CX - W * 0.6).toFixed(1) + ' ' + (ROOT + LEN * 0.8) + ' q 30 14 60 4" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round" filter="url(#' + id + 'blur)"/>');
        s.push('<ellipse cx="150" cy="' + (ROOT + LEN * 0.38) + '" rx="30" ry="9" fill="#fff" opacity=".25" filter="url(#' + id + 'blur)"/>');
      }
    }
    // teeth-mark shadows along edges
    if (p.teeth) {
      for (var m = 0; m < 8; m++) {
        var mu = 0.24 + m * 0.08;
        if (mu > 0.82) break;
        var mhw = halfWidth(mu, W) - 6;
        s.push('<path d="M' + (CX + mhw).toFixed(1) + ' ' + (ROOT + mu * LEN - 7).toFixed(1) + ' q -5 7 0 14" stroke="' + edge + '" stroke-width="1.4" fill="none" opacity=".7"/>');
        s.push('<path d="M' + (CX - mhw).toFixed(1) + ' ' + (ROOT + mu * LEN - 7).toFixed(1) + ' q 5 7 0 14" stroke="' + edge + '" stroke-width="1.4" fill="none" opacity=".7"/>');
      }
    }
    s.push('</g>');

    // upper teeth and lip on top of the tongue root
    var teeth = [];
    for (var n = 0; n < 8; n++) {
      var tx0 = 72 + n * 19.5;
      teeth.push('<rect x="' + tx0 + '" y="52" width="17" height="' + (n === 3 || n === 4 ? 24 : 20) + '" rx="4" fill="#f5f1e8" stroke="#d8d0c2" stroke-width=".8"/>');
    }
    s.push(teeth.join(''));
    s.push('<path d="M22 60 Q80 22 150 34 Q220 22 278 60 Q230 50 150 56 Q70 50 22 60 Z" fill="#b8605d"/>');
    s.push('</svg>');
    return s.join('');
  };

  /* Interpret a set of findings: list of {label, meaning} plus a best-guess pattern id. */
  TCM.readTongue = function (p) {
    var T = D.tongue, out = [];
    function add(group, key) {
      var d = T[group][key];
      if (d && d.mean) out.push({ term: d, mean: d.mean });
    }
    add('body', p.body);
    add('shape', p.shape);
    ['teeth', 'cracks', 'redTip', 'redSides', 'spots'].forEach(function (k) { if (p[k]) add('marks', k); });
    add('coat', p.coat);
    add('moist', p.moist);

    var guess = null, b = p.body, coat = p.coat;
    var whiteish = coat === 'thin_white' || coat === 'thick_white' || coat === 'white_greasy';
    if (b === 'purple' || p.spots) guess = 'blood_stasis';
    else if ((b === 'red' || b === 'crimson') && (coat === 'none' || coat === 'geographic')) guess = 'yin_def';
    else if ((b === 'red' || b === 'crimson') && coat === 'yellow_greasy') guess = 'damp_heat';
    else if (p.redSides && (b === 'red' || coat === 'thick_yellow' || coat === 'thin_yellow')) guess = 'lv_fire';
    else if ((b === 'red' || b === 'crimson') && coat === 'thick_yellow') guess = 'excess_heat';
    else if (p.redTip && b !== 'pale') guess = 'ht_fire';
    else if (b === 'pale' && p.shape === 'swollen' && p.moist === 'wet') guess = 'yang_def';
    else if (b === 'pale' && (p.teeth || p.shape === 'swollen')) guess = 'sp_qi_def';
    else if (b === 'pale' && p.shape === 'thin') guess = 'blood_def';
    else if (p.shape === 'swollen' && (coat === 'white_greasy' || coat === 'thick_white')) guess = 'phlegm_damp';
    else if (b === 'red' && p.cracks) guess = 'yin_def';
    else if (b === 'lightred' && coat === 'thin_white' && p.shape === 'normal' && p.moist === 'normal' && !p.cracks && !p.teeth) guess = 'normal';
    else if (b === 'pale' && whiteish) guess = 'yang_def';
    return { findings: out, guess: guess };
  };
})();
