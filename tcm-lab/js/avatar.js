/* Illustrated patient. TCM.renderAvatar(av, opts) returns an SVG string.
   av: { sex, age, skin, mood, hair, style, shirt, extras[] }, opts.tongue = tongue body colour.
   Animation states are CSS classes on the <svg>: talking, open (tongue out), wince, cough. */
(function () {
  'use strict';
  var TCM = window.TCM;

  var SKIN = { normal: '#e7c2a0', pale: '#efdccd', sallow: '#d9bf86', flushed: '#eab096', malar: '#e7c2a0' };
  var HAIR = { black: '#2a2220', grey: '#a29d95' };
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }

  var BROWS = {
    neutral: ['M86 113 Q98 108 110 112', 'M130 112 Q142 108 154 113'],
    tired: ['M86 116 Q98 111 110 113', 'M130 113 Q142 111 154 116'],
    tense: ['M86 109 Q99 110 111 116', 'M129 116 Q141 110 154 109'],
    worried: ['M86 116 Q98 110 110 107', 'M130 107 Q142 110 154 116'],
    restless: ['M86 110 Q99 110 111 115', 'M129 115 Q141 110 154 110']
  };
  var MOUTH = {
    neutral: 'M106 166 Q120 171 134 166',
    tired: 'M107 168 Q120 166 133 168',
    tense: 'M108 167 L132 167',
    worried: 'M106 169 Q120 163 134 169',
    restless: 'M104 169 Q120 162 136 169'
  };

  TCM.renderAvatar = function (av, opts) {
    av = av || {};
    opts = opts || {};
    var ex = av.extras || [];
    function has(x) { return ex.indexOf(x) >= 0; }
    var skin = SKIN[av.skin] || SKIN.normal;
    var line = shade(skin, -0.32);
    var hair = HAIR[av.hair] || HAIR.black;
    var shirt = av.shirt || '#5b7a8c';
    var mood = BROWS[av.mood] ? av.mood : 'neutral';
    var female = av.sex === 'F';
    var rx = has('heavy') ? 62 : has('thin') ? 51 : 56;
    var cls = 'avatar' + (has('shiver') ? ' is-shiver' : '') + (opts.cls ? ' ' + opts.cls : '');
    var s = [];
    s.push('<svg class="' + cls + '" viewBox="0 0 240 300" role="img" aria-label="' + TCM.esc(opts.label || 'Patient') + '" xmlns="http://www.w3.org/2000/svg">');
    s.push('<g class="av-all"><g class="av-breathe">');
    // long hair behind the head
    if (av.style === 'long') s.push('<path d="M60 120 Q58 52 120 50 Q182 52 180 120 L186 228 Q150 240 120 236 Q90 240 54 228 Z" fill="' + hair + '"/>');
    // body
    var bw = has('heavy') ? 14 : 0;
    s.push('<path d="M' + (14 - bw) + ' 300 C' + (16 - bw) + ' 244 ' + (56 - bw / 2) + ' 216 96 207 L144 207 C' + (184 + bw / 2) + ' 216 ' + (224 + bw) + ' 244 ' + (226 + bw) + ' 300 Z" fill="' + shirt + '"/>');
    s.push('<rect x="101" y="168" width="38" height="46" rx="12" fill="' + skin + '"/>');
    s.push('<path d="M101 196 Q120 206 139 196 L139 214 L101 214 Z" fill="' + line + '" opacity=".25"/>');
    s.push('<path d="M96 207 L120 238 L144 207" fill="' + skin + '" stroke="' + shade(shirt, -0.25) + '" stroke-width="2"/>');
    if (has('jacket')) {
      var jk = '#3f4a3c';
      s.push('<path d="M10 300 C14 246 52 214 92 204 L118 262 L100 300 Z" fill="' + jk + '"/><path d="M230 300 C226 246 188 214 148 204 L122 262 L140 300 Z" fill="' + jk + '"/>');
      s.push('<path d="M92 206 Q120 226 148 206 Q150 196 140 194 Q120 214 100 194 Q90 196 92 206 Z" fill="#a84a3a"/>');
    }
    // head
    s.push('<g class="av-head">');
    s.push('<ellipse cx="' + (120 - rx - 2) + '" cy="135" rx="9" ry="14" fill="' + skin + '" stroke="' + line + '" stroke-width="1"/>');
    s.push('<ellipse cx="' + (120 + rx + 2) + '" cy="135" rx="9" ry="14" fill="' + skin + '" stroke="' + line + '" stroke-width="1"/>');
    s.push('<ellipse cx="120" cy="125" rx="' + rx + '" ry="66" fill="' + skin + '" stroke="' + line + '" stroke-width="1.2"/>');
    if (has('heavy')) s.push('<path d="M92 184 Q120 198 148 184" stroke="' + line + '" stroke-width="1.2" fill="none" opacity=".6"/>');
    // complexion overlays
    if (av.skin === 'flushed') s.push('<ellipse cx="120" cy="140" rx="' + (rx - 6) + '" ry="46" fill="#e0533f" opacity=".22"/>');
    if (av.skin === 'malar' || av.skin === 'flushed') {
      s.push('<ellipse cx="92" cy="150" rx="13" ry="8" fill="#d83a3a" opacity="' + (av.skin === 'malar' ? '.42' : '.3') + '"/><ellipse cx="148" cy="150" rx="13" ry="8" fill="#d83a3a" opacity="' + (av.skin === 'malar' ? '.42' : '.3') + '"/>');
    } else if (av.skin === 'normal') {
      s.push('<ellipse cx="92" cy="152" rx="11" ry="6" fill="#d9786b" opacity=".18"/><ellipse cx="148" cy="152" rx="11" ry="6" fill="#d9786b" opacity=".18"/>');
    }
    if (av.skin === 'sallow') s.push('<ellipse cx="120" cy="130" rx="' + (rx - 4) + '" ry="58" fill="#b59a3a" opacity=".12"/>');
    // hair
    if (av.style === 'short') {
      s.push('<path d="M' + (120 - rx - 1) + ' 120 Q' + (120 - rx) + ' 54 120 55 Q' + (120 + rx) + ' 54 ' + (120 + rx + 1) + ' 120 Q' + (120 + rx - 6) + ' 88 150 82 Q120 92 96 82 Q' + (120 - rx + 6) + ' 88 ' + (120 - rx - 1) + ' 120 Z" fill="' + hair + '"/>');
    } else {
      s.push('<path d="M' + (120 - rx - 1) + ' 126 Q' + (120 - rx - 2) + ' 54 120 54 Q' + (120 + rx + 2) + ' 54 ' + (120 + rx + 1) + ' 126 Q' + (120 + rx - 4) + ' 92 132 84 Q118 98 100 90 Q' + (120 - rx + 4) + ' 96 ' + (120 - rx - 1) + ' 126 Z" fill="' + hair + '"/>');
      if (av.style === 'bun') s.push('<circle cx="120" cy="50" r="18" fill="' + hair + '"/>');
    }
    // brows and eyes
    s.push('<path d="' + BROWS[mood][0] + '" stroke="' + shade(hair, av.hair === 'grey' ? -0.35 : 0) + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>');
    s.push('<path d="' + BROWS[mood][1] + '" stroke="' + shade(hair, av.hair === 'grey' ? -0.35 : 0) + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>');
    if (has('darkCircles') || mood === 'tired') s.push('<path d="M89 137 Q98 142 107 137 M133 137 Q142 142 151 137" stroke="#7a5a6a" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/>');
    if (has('puffy')) s.push('<path d="M88 136 Q98 144 108 136 M132 136 Q142 144 152 136" stroke="' + line + '" stroke-width="1.4" fill="none" opacity=".7"/>');
    s.push('<g class="av-eyes">');
    [98, 142].forEach(function (x) {
      s.push('<ellipse cx="' + x + '" cy="128" rx="9" ry="6.2" fill="#fbf8f2"/><circle cx="' + x + '" cy="128.5" r="4.4" fill="#3a2a22"/><circle cx="' + (x + 1.4) + '" cy="127" r="1.3" fill="#fff"/>');
      if (mood === 'tired') s.push('<path d="M' + (x - 10) + ' 128 Q' + x + ' 119 ' + (x + 10) + ' 128 L' + (x + 10) + ' 120 L' + (x - 10) + ' 120 Z" fill="' + skin + '"/>');
      s.push('<path d="M' + (x - 9.5) + ' 127 Q' + x + ' ' + (mood === 'tired' ? 125 : 120.5) + ' ' + (x + 9.5) + ' 127" stroke="' + shade(line, -0.25) + '" stroke-width="1.6" fill="none"/>');
    });
    s.push('</g>');
    if (has('glasses')) s.push('<g fill="none" stroke="#3b3b3b" stroke-width="2"><circle cx="98" cy="128" r="14"/><circle cx="142" cy="128" r="14"/><path d="M112 127 Q120 123 128 127 M84 126 L' + (120 - rx) + ' 122 M156 126 L' + (120 + rx) + ' 122"/></g>');
    // nose
    s.push('<path d="M120 132 Q117 146 113 151 Q120 156 127 151" stroke="' + line + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>');
    if (has('runny')) s.push('<ellipse cx="120" cy="150" rx="8" ry="5" fill="#d8504a" opacity=".45"/><path d="M114 155 q-1 5 1 8" stroke="#bfe0f0" stroke-width="2" fill="none" stroke-linecap="round"/>');
    // mouths
    s.push('<path class="av-mouth-shut" d="' + MOUTH[mood] + '" stroke="#8a4a42" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
    s.push('<ellipse class="av-mouth-talk" cx="120" cy="167" rx="9" ry="5" fill="#5a2228"/>');
    var tg = opts.tongue || '#e2898a';
    s.push('<g class="av-mouth-open"><ellipse cx="120" cy="168" rx="17" ry="12" fill="#3a1418"/><rect x="108" y="157" width="24" height="5" rx="2" fill="#f5f1e8"/>' +
      '<path d="M107 168 Q106 194 120 198 Q134 194 133 168 Z" fill="' + tg + '" stroke="' + shade(tg, -0.25) + '" stroke-width="1"/><path d="M120 172 L120 190" stroke="' + shade(tg, -0.25) + '" stroke-width="1" opacity=".6"/></g>');
    // sweat
    if (has('sweat')) {
      s.push('<g class="av-sweat"><path d="M74 104 q-4 7 0 10 q4 -3 0 -10 Z" fill="#9fd3ee"/><path class="d2" d="M166 112 q-4 7 0 10 q4 -3 0 -10 Z" fill="#9fd3ee"/><path class="d3" d="M150 82 q-3 6 0 8 q3 -2 0 -8 Z" fill="#9fd3ee"/></g>');
    }
    s.push('</g></g></g></svg>');
    return s.join('');
  };

  /* Speech bubble over an avatar stage. stage must contain .say-bubble and an .avatar svg. */
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
    if (opts.hold !== true) b._hideT = setTimeout(function () { b.hidden = true; }, opts.ms || Math.min(7000, 2200 + text.length * 45));
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
