/* Realistic patient portrait. TCM.renderAvatar(av, opts) returns an SVG string.
   av: { sex, age, skin, mood, hair, style, shirt, extras[] }; opts.tongue = tongue body colour.
   States are classes on the <svg>: talking, open (tongue out), wince, cough. Rendering uses
   soft light and shadow, layered eyes, hair strands and skin texture rather than outlines. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var uid = 0;

  var SKIN = { normal: '#dfb08c', pale: '#e5c8b2', sallow: '#cfac78', flushed: '#e0a180', malar: '#dfb08c' };
  var LIPS = { normal: '#b46a5e', pale: '#c79d93', sallow: '#ab7466', flushed: '#ad4a40', malar: '#b0584e' };
  var HAIR = { black: ['#16110f', '#3a2c25'], grey: ['#7d7872', '#cfcac2'] };

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  function rng(seed) { var s = seed >>> 0 || 3; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

  /* brow inner/outer heights by mood: [innerY, archY, outerY] offsets */
  var BROW = { neutral: [0, -4, 1], tired: [1, -2, 3], tense: [3, -2, -1], worried: [-3, -4, 3], restless: [3, -1, -1] };
  var CORNER = { neutral: 0, tired: 1.5, tense: 0.5, worried: 2.2, restless: 1.8 };

  TCM.renderAvatar = function (av, opts) {
    av = av || {};
    opts = opts || {};
    var p = 'av' + ++uid + '_';
    var ex = av.extras || [];
    function has(x) { return ex.indexOf(x) >= 0; }
    var R = rng((av.shirt || '#5b7a8c').length * 7 + (av.age || 30) * 13 + (av.sex === 'F' ? 5 : 0));
    var skinKey = SKIN[av.skin] ? av.skin : 'normal';
    var skin = SKIN[skinKey], lip = LIPS[skinKey];
    var dark = shade(skin, -0.32), deep = shade(skin, -0.5), light = shade(skin, 0.32);
    var hairC = HAIR[av.hair] || HAIR.black;
    var shirt = av.shirt || '#5b7a8c';
    var mood = BROW[av.mood] ? av.mood : 'neutral';
    var female = av.sex === 'F';
    var age = av.age || 35;
    var kx = has('heavy') ? 1.1 : has('thin') ? 0.93 : female ? 0.95 : 1;
    var cls = 'avatar real' + (has('shiver') ? ' is-shiver' : '') + (opts.cls ? ' ' + opts.cls : '');
    var HT = 'translate(120 198) scale(' + (kx * 0.86).toFixed(3) + ' 0.86) translate(-120 -198)';
    var HEAD = 'M120 52 C151 52 175 72 176 110 C177 131 176 146 171 161 C165 181 150 196 133 201 Q120 205 107 201 C90 196 75 181 69 161 C64 146 63 131 64 110 C65 72 89 52 120 52 Z';
    var s = [];
    s.push('<svg class="' + cls + '" viewBox="0 0 240 300" role="img" aria-label="' + TCM.esc(opts.label || 'Patient') + '" xmlns="http://www.w3.org/2000/svg">');
    s.push('<defs>' +
      '<clipPath id="' + p + 'head"><path d="' + HEAD + '"/></clipPath>' +
      '<filter id="' + p + 'b8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>' +
      '<filter id="' + p + 'b4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>' +
      '<filter id="' + p + 'b2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
      '<filter id="' + p + 'b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".6"/></filter>' +
      '<filter id="' + p + 'pores" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0.5 -0.2"/><feComposite in2="SourceAlpha" operator="in"/></filter>' +
      '<filter id="' + p + 'cloth" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves="2" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.15"/><feComposite in2="SourceAlpha" operator="in"/></filter>' +
      '<radialGradient id="' + p + 'skin" cx="46%" cy="42%" r="62%"><stop offset="0" stop-color="' + light + '"/><stop offset=".55" stop-color="' + skin + '"/><stop offset="1" stop-color="' + dark + '"/></radialGradient>' +
      '<linearGradient id="' + p + 'neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + deep + '"/><stop offset=".45" stop-color="' + dark + '"/><stop offset="1" stop-color="' + skin + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'shirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + shade(shirt, -0.45) + '"/><stop offset=".35" stop-color="' + shirt + '"/><stop offset=".6" stop-color="' + shade(shirt, 0.08) + '"/><stop offset="1" stop-color="' + shade(shirt, -0.5) + '"/></linearGradient>' +
      '<radialGradient id="' + p + 'iris" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6b4a30"/><stop offset=".55" stop-color="#3f2716"/><stop offset="1" stop-color="#170d07"/></radialGradient>' +
      '<linearGradient id="' + p + 'sclera" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdbdb0"/><stop offset=".3" stop-color="#f3ede6"/><stop offset=".7" stop-color="#f3ede6"/><stop offset="1" stop-color="#cdbdb0"/></linearGradient>' +
      '<linearGradient id="' + p + 'lipU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + shade(lip, -0.1) + '"/><stop offset="1" stop-color="' + shade(lip, -0.35) + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'lipL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + shade(lip, -0.2) + '"/><stop offset=".45" stop-color="' + shade(lip, 0.08) + '"/><stop offset="1" stop-color="' + shade(lip, -0.15) + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + hairC[1] + '"/><stop offset=".5" stop-color="' + hairC[0] + '"/><stop offset="1" stop-color="' + shade(hairC[0], -0.3) + '"/></linearGradient>' +
      '</defs>');
    s.push('<g class="av-all"><g class="av-breathe">');

    // back hair (long)
    if (av.style === 'long') {
      s.push('<g transform="' + HT + '"><path d="M58 118 Q54 50 120 46 Q186 50 182 118 L192 236 Q160 250 120 246 Q80 250 48 236 Z" fill="url(#' + p + 'hair)"/>');
      for (var bh = 0; bh < 46; bh++) {
        var bx = 56 + R() * 128;
        s.push('<path d="M' + bx.toFixed(1) + ' ' + (80 + R() * 40).toFixed(1) + ' Q' + (bx + (R() - 0.5) * 16).toFixed(1) + ' 170 ' + (bx + (R() - 0.5) * 20).toFixed(1) + ' ' + (220 + R() * 22).toFixed(1) + '" stroke="' + hairC[1] + '" stroke-width="' + (0.5 + R() * 0.8).toFixed(2) + '" opacity="' + (0.15 + R() * 0.3).toFixed(2) + '" fill="none"/>');
      }
      s.push('</g>');
    }
    // shoulders and clothing
    var bw = has('heavy') ? 14 : 0;
    var body = 'M' + (-6 - bw) + ' 300 C' + (-2 - bw) + ' 246 ' + (40 - bw / 2) + ' 224 96 216 Q120 228 144 216 C' + (200 + bw / 2) + ' 224 ' + (242 + bw) + ' 246 ' + (246 + bw) + ' 300 Z';
    s.push('<path d="' + body + '" fill="url(#' + p + 'shirt)"/><path d="' + body + '" fill="#000" filter="url(#' + p + 'cloth)"/>');
    s.push('<path d="M60 262 Q74 250 82 236 M178 262 Q166 250 158 236" stroke="#000" stroke-opacity=".22" stroke-width="5" fill="none" filter="url(#' + p + 'b2)"/>');
    // neck
    s.push('<path d="M99 182 L97 222 Q120 236 143 222 L141 182 Z" fill="url(#' + p + 'neck)"/>');
    s.push('<path d="M92 218 Q120 248 148 218 L148 226 Q120 250 92 226 Z" fill="' + skin + '"/>');
    s.push('<path d="M92 218 L120 246 L148 218" fill="none" stroke="' + shade(shirt, -0.35) + '" stroke-width="3"/>');
    if (has('jacket')) {
      var jk = '#36403a';
      s.push('<path d="M4 300 C10 250 46 222 90 214 L118 270 L98 300 Z" fill="' + jk + '"/><path d="M236 300 C230 250 194 222 150 214 L122 270 L142 300 Z" fill="' + jk + '"/>');
      s.push('<path d="M4 300 C10 250 46 222 90 214 L118 270 L98 300 Z M236 300 C230 250 194 222 150 214 L122 270 L142 300 Z" fill="#000" filter="url(#' + p + 'cloth)"/>');
      s.push('<path d="M90 214 L118 270 M150 214 L122 270" stroke="#1d2420" stroke-width="2"/>');
      s.push('<path d="M90 212 Q120 236 150 212 Q154 200 142 196 Q120 220 98 196 Q86 200 90 212 Z" fill="#8c3d33"/><path d="M90 212 Q120 236 150 212 Q154 200 142 196 Q120 220 98 196 Q86 200 90 212 Z" fill="#000" filter="url(#' + p + 'cloth)"/>');
    }
    // shadow of the jaw on the neck
    s.push('<ellipse cx="120" cy="196" rx="34" ry="12" fill="' + deep + '" opacity=".55" filter="url(#' + p + 'b4)"/>');

    // head group
    s.push('<g class="av-head" transform="' + HT + '">');
    // ears
    [[61, 1], [179, -1]].forEach(function (e) {
      var x = e[0], d = e[1];
      s.push('<path d="M' + (x + d * 4) + ' 118 C' + (x - d * 8) + ' 112 ' + (x - d * 10) + ' 138 ' + (x - d * 4) + ' 150 C' + (x - d * 1) + ' 156 ' + (x + d * 4) + ' 156 ' + (x + d * 6) + ' 150 Z" fill="' + skin + '"/>');
      s.push('<path d="M' + (x + d * 2) + ' 124 C' + (x - d * 4) + ' 124 ' + (x - d * 5) + ' 138 ' + (x - d * 1) + ' 146" stroke="' + deep + '" stroke-width="2" fill="none" opacity=".5" filter="url(#' + p + 'b1)"/>');
    });
    s.push('<path d="' + HEAD + '" fill="url(#' + p + 'skin)"/>');
    s.push('<g clip-path="url(#' + p + 'head)">');
    // modelling: side planes, temples, eye sockets, cheekbones, nose, mouth
    s.push('<ellipse cx="66" cy="140" rx="18" ry="62" fill="' + deep + '" opacity=".45" filter="url(#' + p + 'b8)"/><ellipse cx="174" cy="140" rx="18" ry="62" fill="' + deep + '" opacity=".5" filter="url(#' + p + 'b8)"/>');
    s.push('<ellipse cx="98" cy="128" rx="17" ry="11" fill="' + dark + '" opacity=".5" filter="url(#' + p + 'b4)"/><ellipse cx="142" cy="128" rx="17" ry="11" fill="' + dark + '" opacity=".5" filter="url(#' + p + 'b4)"/>');
    s.push('<ellipse cx="86" cy="162" rx="12" ry="16" fill="' + dark + '" opacity="' + (has('thin') ? 0.55 : 0.28) + '" filter="url(#' + p + 'b8)"/><ellipse cx="154" cy="162" rx="12" ry="16" fill="' + dark + '" opacity="' + (has('thin') ? 0.55 : 0.3) + '" filter="url(#' + p + 'b8)"/>');
    s.push('<ellipse cx="120" cy="84" rx="34" ry="16" fill="' + light + '" opacity=".45" filter="url(#' + p + 'b8)"/>');
    s.push('<ellipse cx="92" cy="146" rx="13" ry="8" fill="' + light + '" opacity=".35" filter="url(#' + p + 'b4)"/><ellipse cx="148" cy="146" rx="13" ry="8" fill="' + light + '" opacity=".28" filter="url(#' + p + 'b4)"/>');
    s.push('<ellipse cx="113" cy="142" rx="4" ry="14" fill="' + dark + '" opacity=".45" filter="url(#' + p + 'b2)"/>');
    s.push('<ellipse cx="121" cy="133" rx="2.6" ry="12" fill="' + light + '" opacity=".55" filter="url(#' + p + 'b2)"/><ellipse cx="121" cy="150" rx="5" ry="3.4" fill="' + light + '" opacity=".6" filter="url(#' + p + 'b2)"/>');
    s.push('<ellipse cx="120" cy="158" rx="11" ry="4" fill="' + dark + '" opacity=".45" filter="url(#' + p + 'b2)"/>');
    s.push('<ellipse cx="120" cy="164" rx="3" ry="5" fill="' + dark + '" opacity=".35" filter="url(#' + p + 'b2)"/>');
    s.push('<ellipse cx="120" cy="183" rx="11" ry="4" fill="' + deep + '" opacity=".45" filter="url(#' + p + 'b2)"/><ellipse cx="120" cy="192" rx="12" ry="5" fill="' + light + '" opacity=".35" filter="url(#' + p + 'b4)"/>');
    s.push('<rect x="120" y="50" width="62" height="160" fill="' + deep + '" opacity=".12" filter="url(#' + p + 'b8)"/>');
    // complexion
    if (skinKey === 'flushed') s.push('<ellipse cx="120" cy="140" rx="54" ry="50" fill="#d8402e" opacity=".22" filter="url(#' + p + 'b8)"/>');
    if (skinKey === 'flushed' || skinKey === 'malar') s.push('<ellipse cx="88" cy="152" rx="15" ry="10" fill="#cf2f2a" opacity="' + (skinKey === 'malar' ? 0.42 : 0.3) + '" filter="url(#' + p + 'b4)"/><ellipse cx="152" cy="152" rx="15" ry="10" fill="#cf2f2a" opacity="' + (skinKey === 'malar' ? 0.42 : 0.3) + '" filter="url(#' + p + 'b4)"/>');
    if (skinKey === 'normal') s.push('<ellipse cx="88" cy="154" rx="14" ry="9" fill="#c9645a" opacity=".16" filter="url(#' + p + 'b4)"/><ellipse cx="152" cy="154" rx="14" ry="9" fill="#c9645a" opacity=".16" filter="url(#' + p + 'b4)"/>');
    if (skinKey === 'sallow') s.push('<rect x="60" y="50" width="120" height="160" fill="#8a7a3a" opacity=".1"/>');
    if (skinKey === 'pale') s.push('<rect x="60" y="50" width="120" height="160" fill="#b8bcc8" opacity=".1"/>');
    if (has('darkCircles') || mood === 'tired') s.push('<ellipse cx="98" cy="140" rx="11" ry="4" fill="#5a3a48" opacity=".32" filter="url(#' + p + 'b2)"/><ellipse cx="142" cy="140" rx="11" ry="4" fill="#5a3a48" opacity=".32" filter="url(#' + p + 'b2)"/>');
    if (has('puffy')) s.push('<path d="M87 138 Q98 146 109 138 M131 138 Q142 146 153 138" stroke="' + deep + '" stroke-width="1.4" fill="none" opacity=".45" filter="url(#' + p + 'b1)"/><ellipse cx="98" cy="141" rx="10" ry="3" fill="' + light + '" opacity=".35" filter="url(#' + p + 'b1)"/><ellipse cx="142" cy="141" rx="10" ry="3" fill="' + light + '" opacity=".35" filter="url(#' + p + 'b1)"/>');
    // age
    if (age >= 45) s.push('<path d="M108 156 Q101 168 104 180 M132 156 Q139 168 136 180" stroke="' + deep + '" stroke-width="1.2" fill="none" opacity=".35" filter="url(#' + p + 'b1)"/>');
    if (age >= 55) s.push('<path d="M98 92 Q120 88 142 92 M102 100 Q120 97 138 100" stroke="' + deep + '" stroke-width=".9" fill="none" opacity=".28" filter="url(#' + p + 'b1)"/><path d="M80 126 l-6 -3 M80 131 l-7 0 M160 126 l6 -3 M160 131 l7 0" stroke="' + deep + '" stroke-width=".8" opacity=".35"/>');
    // skin texture
    s.push('<rect x="60" y="50" width="120" height="160" fill="#000" filter="url(#' + p + 'pores)"/>');
    if (has('sweat')) {
      s.push('<ellipse cx="112" cy="86" rx="22" ry="8" fill="#fff" opacity=".35" filter="url(#' + p + 'b2)"/>');
      for (var sw = 0; sw < 9; sw++) {
        var sx = 84 + R() * 72, sy = 74 + R() * 30;
        s.push('<ellipse cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" rx="1.3" ry="1.8" fill="' + shade(skin, -0.15) + '"/><circle cx="' + (sx - 0.4).toFixed(1) + '" cy="' + (sy - 0.6).toFixed(1) + '" r=".6" fill="#fff" opacity=".9"/>');
      }
    }
    if (has('runny')) s.push('<ellipse cx="120" cy="153" rx="12" ry="6" fill="#c93a32" opacity=".28" filter="url(#' + p + 'b2)"/><ellipse cx="114" cy="160" rx="3" ry="2" fill="#fff" opacity=".5" filter="url(#' + p + 'b1)"/>');
    s.push('</g>');

    // eyebrows: tapered filled shape with a few fine hairs on top
    var bm = BROW[mood];
    var browCol = av.hair === 'grey' ? '#5a544e' : '#241a14';
    [[84, 110], [156, 130]].forEach(function (side) {
      var top = [], bot = [];
      for (var i = 0; i <= 12; i++) {
        var u = i / 12, x = side[0] + (side[1] - side[0]) * u;
        var tt = 1 - u; // 0 at the inner end
        var yIn = 113.5 + bm[0], yArch = 109.5 + bm[1], yOut = 115 + bm[2];
        var y = tt < 0.62 ? yIn + (yArch - yIn) * (tt / 0.62) : yArch + (yOut - yArch) * ((tt - 0.62) / 0.38);
        var th = tt < 0.2 ? 3.4 : 3.4 - (tt - 0.2) * 3.2;
        top.push([x, y - th * 0.55]); bot.push([x, y + th * 0.45]);
      }
      var d = 'M' + top.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' L') + ' L' + bot.reverse().map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' L') + ' Z';
      s.push('<path d="' + d + '" fill="' + browCol + '" opacity=".78" filter="url(#' + p + 'b1)"/>');
      for (var j = 0; j < 9; j++) {
        var q = top[Math.floor(R() * top.length)];
        s.push('<path d="M' + q[0].toFixed(1) + ' ' + (q[1] + 2).toFixed(1) + ' l' + ((side[0] < 120 ? 1 : -1) * (1.5 + R())).toFixed(1) + ' -2.4" stroke="' + browCol + '" stroke-width=".5" opacity=".6"/>');
      }
    });

    // eyes
    s.push('<g class="av-eyes">');
    [98, 142].forEach(function (x, i) {
      var d = i ? -1 : 1;
      var lidDrop = mood === 'tired' ? 3 : 0;
      var eye = 'M' + (x - 12) + ' 129 Q' + (x - 4 * d) + ' ' + (121 + lidDrop) + ' ' + (x + 11 * d === x + 11 ? x + 11 : x + 11) + ' 128 Q' + x + ' 134.5 ' + (x - 12) + ' 129 Z';
      eye = 'M' + (x - 12) + ' 129 Q' + (x - 3) + ' ' + (121 + lidDrop) + ' ' + (x + 12) + ' 128.5 Q' + (x + 1) + ' 135 ' + (x - 12) + ' 129 Z';
      if (i) eye = 'M' + (x + 12) + ' 129 Q' + (x + 3) + ' ' + (121 + lidDrop) + ' ' + (x - 12) + ' 128.5 Q' + (x - 1) + ' 135 ' + (x + 12) + ' 129 Z';
      s.push('<clipPath id="' + p + 'eye' + i + '"><path d="' + eye + '"/></clipPath>');
      s.push('<path d="' + eye + '" fill="url(#' + p + 'sclera)"/>');
      s.push('<g clip-path="url(#' + p + 'eye' + i + ')"><circle cx="' + x + '" cy="128.6" r="5.6" fill="url(#' + p + 'iris)"/><circle cx="' + x + '" cy="128.6" r="5.6" fill="none" stroke="#0d0805" stroke-width=".8"/>' +
        '<circle cx="' + x + '" cy="128.6" r="2.3" fill="#070403"/><ellipse cx="' + x + '" cy="123.5" rx="13" ry="4" fill="#3a2418" opacity=".35" filter="url(#' + p + 'b1)"/></g>');
      s.push('<circle cx="' + (x + 1.8) + '" cy="126.8" r="1.2" fill="#fff" opacity=".9"/>');
      var top = i ? 'M' + (x + 12.5) + ' 129 Q' + (x + 3) + ' ' + (120.5 + lidDrop) + ' ' + (x - 12.5) + ' 128.5' : 'M' + (x - 12.5) + ' 129 Q' + (x - 3) + ' ' + (120.5 + lidDrop) + ' ' + (x + 12.5) + ' 128.5';
      s.push('<path d="' + top + '" stroke="#1a110c" stroke-width="2" fill="none" stroke-linecap="round"/>');
      var crease = i ? 'M' + (x + 11) + ' 124.5 Q' + (x + 2) + ' ' + (117.5 + lidDrop) + ' ' + (x - 11) + ' 124' : 'M' + (x - 11) + ' 124.5 Q' + (x - 2) + ' ' + (117.5 + lidDrop) + ' ' + (x + 11) + ' 124';
      s.push('<path d="' + crease + '" stroke="' + deep + '" stroke-width="1" fill="none" opacity=".4" filter="url(#' + p + 'b1)"/>');
      var low = i ? 'M' + (x + 11) + ' 129.5 Q' + (x - 1) + ' 135.5 ' + (x - 11) + ' 129' : 'M' + (x - 11) + ' 129.5 Q' + (x + 1) + ' 135.5 ' + (x + 11) + ' 129';
      s.push('<path d="' + low + '" stroke="' + deep + '" stroke-width=".8" fill="none" opacity=".45"/>');
    });
    s.push('</g>');
    if (has('glasses')) s.push('<g fill="none"><rect x="83" y="117" width="31" height="23" rx="7" stroke="#2c2c2c" stroke-width="1.4"/><rect x="126" y="117" width="31" height="23" rx="7" stroke="#2c2c2c" stroke-width="1.4"/><path d="M114 125 Q120 121 126 125 M83 123 L66 119 M157 123 L174 119" stroke="#2c2c2c" stroke-width="1.4"/><path d="M88 120 l8 -2 M131 120 l8 -2" stroke="#fff" stroke-width="2" opacity=".5"/></g>');

    // nose: nostrils and alae, no outline
    s.push('<path d="M110 152 Q113 146 117 151 M130 152 Q127 146 123 151" stroke="' + deep + '" stroke-width="1.3" fill="none" opacity=".55" filter="url(#' + p + 'b1)"/>');
    s.push('<ellipse cx="115" cy="154" rx="3" ry="1.6" fill="#4a2a22" opacity=".75" filter="url(#' + p + 'b1)"/><ellipse cx="125" cy="154" rx="3" ry="1.6" fill="#4a2a22" opacity=".75" filter="url(#' + p + 'b1)"/>');

    // mouth
    var cd = CORNER[mood];
    s.push('<g class="av-mouth-shut">' +
      '<path d="M104 ' + (170 + cd) + ' Q111 165 116 166 Q120 167.5 124 166 Q129 165 136 ' + (170 + cd) + ' Q120 172 104 ' + (170 + cd) + ' Z" fill="url(#' + p + 'lipU)"/>' +
      '<path d="M105 ' + (170 + cd) + ' Q120 172 135 ' + (170 + cd) + ' Q129 179 120 179.5 Q111 179 105 ' + (170 + cd) + ' Z" fill="url(#' + p + 'lipL)"/>' +
      '<path d="M103.5 ' + (170 + cd) + ' Q120 172.5 136.5 ' + (170 + cd) + '" stroke="#4a221c" stroke-width="1.1" fill="none" opacity=".85"/>' +
      '<ellipse cx="121" cy="174.5" rx="6" ry="1.5" fill="#fff" opacity=".22" filter="url(#' + p + 'b1)"/></g>');
    s.push('<g class="av-mouth-talk"><path d="M106 170 Q120 165 134 170 Q128 180 120 180 Q112 180 106 170 Z" fill="#3a1714"/><rect x="111" y="168" width="18" height="3" rx="1" fill="#e8e1d5" opacity=".85"/><path d="M106 170 Q120 165 134 170" stroke="url(#' + p + 'lipU)" stroke-width="3" fill="none"/></g>');
    var tg = opts.tongue || '#e2898a';
    s.push('<g class="av-mouth-open"><path d="M103 168 Q120 160 137 168 Q134 186 120 188 Q106 186 103 168 Z" fill="#2a0f0d"/>' +
      '<path d="M109 166 Q120 163 131 166 L131 169 Q120 167 109 169 Z" fill="#ece5d8"/>' +
      '<path d="M108 174 Q107 199 120 203 Q133 199 132 174 Q120 170 108 174 Z" fill="' + tg + '"/><path d="M108 174 Q107 199 120 203 Q133 199 132 174" fill="none" stroke="' + shade(tg, -0.3) + '" stroke-width="1" opacity=".6"/>' +
      '<path d="M120 177 L120 196" stroke="' + shade(tg, -0.3) + '" stroke-width="1" opacity=".45" filter="url(#' + p + 'b1)"/><ellipse cx="115" cy="186" rx="3" ry="6" fill="#fff" opacity=".25" filter="url(#' + p + 'b1)"/>' +
      '<path d="M103 168 Q120 160 137 168" stroke="url(#' + p + 'lipU)" stroke-width="3.5" fill="none"/></g>');

    // hair (front)
    var hairPath;
    if (av.style === 'short') {
      hairPath = 'M63 122 C58 60 92 44 122 45 C156 46 184 62 178 122 C176 104 170 90 160 84 C146 80 132 86 118 82 C102 80 86 86 76 96 C68 104 65 114 63 122 Z';
    } else {
      hairPath = 'M62 128 C56 60 90 44 120 44 C152 44 186 60 178 128 C174 104 168 88 154 80 C140 86 126 84 116 78 C104 88 86 92 74 104 C67 112 64 120 62 128 Z';
    }
    s.push('<path d="' + hairPath + '" fill="url(#' + p + 'hair)"/>');
    if (av.style === 'bun') s.push('<ellipse cx="120" cy="46" rx="22" ry="16" fill="url(#' + p + 'hair)"/>');
    s.push('<clipPath id="' + p + 'hc"><path d="' + hairPath + '"/>' + (av.style === 'bun' ? '<ellipse cx="120" cy="46" rx="22" ry="16"/>' : '') + '</clipPath><g clip-path="url(#' + p + 'hc)">');
    for (var h = 0; h < 120; h++) {
      var ang = (R() * 2 - 1) * 1.4, hx = 120 + Math.sin(ang) * 20, hy = 48 + R() * 8;
      var ex2 = 120 + Math.sin(ang) * (70 + R() * 20), ey2 = 70 + Math.abs(Math.sin(ang)) * 60 + R() * 20;
      s.push('<path d="M' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ' Q' + ((hx + ex2) / 2 + (R() - 0.5) * 14).toFixed(1) + ' ' + ((hy + ey2) / 2 - 6).toFixed(1) + ' ' + ex2.toFixed(1) + ' ' + ey2.toFixed(1) + '" stroke="' + (R() > 0.5 ? hairC[1] : shade(hairC[0], -0.4)) + '" stroke-width="' + (0.4 + R() * 0.7).toFixed(2) + '" opacity="' + (0.25 + R() * 0.45).toFixed(2) + '" fill="none"/>');
    }
    s.push('<ellipse cx="104" cy="60" rx="20" ry="7" fill="#fff" opacity="' + (av.hair === 'grey' ? 0.18 : 0.12) + '" filter="url(#' + p + 'b4)"/></g>');
    s.push('</g>'); // head group
    s.push('</g></g></svg>');
    return s.join('');
  };

  /* Spoken line, shown as a subtitle along the bottom of the stage. */
  TCM.say = function (stage, text, opts) {
    if (!stage) return;
    opts = opts || {};
    var b = stage.querySelector('.say-bubble');
    var av = stage.querySelector('.avatar');
    if (!b) return;
    b.textContent = text;
    b.hidden = false;
    b.className = 'say-bubble' + (opts.tone ? ' tone-' + opts.tone : '');
    if (av && !opts.silent) {
      av.classList.add('talking');
      clearTimeout(av._talkT);
      av._talkT = setTimeout(function () { av.classList.remove('talking'); }, Math.min(2600, 600 + text.length * 28));
    }
    clearTimeout(b._hideT);
    if (opts.hold !== true) b._hideT = setTimeout(function () { b.hidden = true; }, opts.ms || Math.min(7000, 2400 + text.length * 45));
  };
  TCM.avatarPulse = function (stage, cls, ms) {
    var av = stage && stage.querySelector('.avatar');
    if (!av) return;
    av.classList.remove(cls);
    void av.getBoundingClientRect();
    av.classList.add(cls);
    setTimeout(function () { av.classList.remove(cls); }, ms || 900);
  };
})();
