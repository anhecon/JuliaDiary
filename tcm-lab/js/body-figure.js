/* Front and back body figures in a 300×640 viewBox, standing in the anatomical position
   (palms forward, thumbs out). Used by the acupoint module. */
(function () {
  'use strict';
  var TCM = window.TCM;

  // Right half of the silhouette (viewer's right), from the neck down to the crotch.
  var HALF = [
    [163, 90], [164, 110], [184, 119], [207, 125], [221, 137], [227, 158], [230, 198], [232, 232],
    [237, 264], [241, 298], [244, 318], [249, 326], [253, 341], [248, 346], [247, 362], [245, 384],
    [240, 394], [233, 392], [230, 376], [229, 338], [228, 320], [224, 292], [219, 262], [215, 234],
    [211, 200], [205, 168], [197, 176], [192, 206], [188, 240], [196, 276], [202, 302], [201, 344],
    [196, 390], [193, 428], [194, 456], [197, 490], [192, 530], [186, 566], [182, 586], [186, 600],
    [189, 612], [180, 619], [163, 618], [157, 608], [158, 588], [160, 566], [163, 522], [162, 480],
    [160, 456], [160, 424], [157, 372], [154, 336], [150, 322]
  ];

  function catmull(pts) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    var n = pts.length;
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
    }
    return d + ' Z';
  }
  var left = HALF.slice(0, -1).map(function (p) { return [300 - p[0], p[1]]; }).reverse();
  var OUTLINE = catmull(HALF.concat(left.slice(0, -1)));

  function mirror(d) { return '<path class="fig-detail" d="' + d + '"/><path class="fig-detail" d="' + d + '" transform="translate(300 0) scale(-1 1)"/>'; }

  function front() {
    return [
      '<ellipse class="fig-body" cx="119" cy="61" rx="5" ry="9"/><ellipse class="fig-body" cx="181" cy="61" rx="5" ry="9"/>',
      '<path class="fig-body" d="' + OUTLINE + '"/>',
      '<ellipse class="fig-body" cx="150" cy="57" rx="30" ry="38"/>',
      // face
      '<path class="fig-detail" d="M134 50 q6 -3 12 0 M154 50 q6 -3 12 0"/>',
      '<ellipse class="fig-dot" cx="140" cy="57" rx="2.6" ry="1.6"/><ellipse class="fig-dot" cx="160" cy="57" rx="2.6" ry="1.6"/>',
      '<path class="fig-detail" d="M150 58 L148 68 Q150 71 153 69 M143 80 Q150 83 157 80"/>',
      // clavicles, chest, navel, groin
      mirror('M153 120 Q172 116 199 125'),
      '<circle class="fig-dot" cx="167.5" cy="180" r="2"/><circle class="fig-dot" cx="132.5" cy="180" r="2"/>',
      '<path class="fig-detail" d="M150 132 L150 194"/>',
      '<ellipse class="fig-dot" cx="150" cy="255" rx="2.4" ry="3"/>',
      mirror('M196 288 Q176 304 157 316'),
      // elbow and wrist creases
      mirror('M218 234 q6 2 12 0'), mirror('M229 320 l14 -1'),
      // knees and ankles
      '<ellipse class="fig-detail" cx="177" cy="440" rx="11" ry="13"/><ellipse class="fig-detail" cx="123" cy="440" rx="11" ry="13"/>',
      mirror('M159 584 q3 -4 6 0'), mirror('M180 582 q2 -4 4 0'),
      mirror('M166 616 l0 -4 M172 618 l0 -4 M178 618 l0 -3')
    ].join('');
  }
  function back() {
    var spine = [];
    // C7 at y 118; thoracic ~9.5 px apart, lumbar ~12 px apart
    for (var i = 0; i < 12; i++) spine.push(128 + i * 9.5);
    for (var j = 0; j < 5; j++) spine.push(245 + j * 12);
    var ticks = '<circle class="fig-dot" cx="150" cy="118" r="2.4"/>' + spine.map(function (y) {
      return '<circle class="fig-dot" cx="150" cy="' + y + '" r="1.5"/>';
    }).join('');
    return [
      '<ellipse class="fig-body" cx="119" cy="61" rx="5" ry="9"/><ellipse class="fig-body" cx="181" cy="61" rx="5" ry="9"/>',
      '<path class="fig-body" d="' + OUTLINE + '"/>',
      '<ellipse class="fig-body" cx="150" cy="57" rx="30" ry="38"/>',
      '<path d="M121 52 Q122 20 150 19 Q178 20 179 52 Q178 80 168 86 Q150 92 132 86 Q122 80 121 52 Z" fill="var(--skin-detail)" opacity=".55"/>',
      ticks,
      // scapulae
      mirror('M181 134 L180 186 Q192 168 203 146'),
      // iliac crest and buttocks
      mirror('M154 284 Q175 276 193 268'),
      mirror('M152 300 L152 336 Q176 344 198 334'),
      // elbow, wrist, knuckles
      mirror('M222 230 q3 4 6 0'), mirror('M229 319 l14 -1'), mirror('M236 380 l6 0'),
      // knee crease, calves, heels
      mirror('M165 446 q12 3 25 0'),
      mirror('M166 470 Q170 500 176 512 M188 470 Q184 500 177 512'),
      mirror('M166 590 Q170 606 178 606')
    ].join('');
  }

  /* Soft modelling of the body forms so the figure reads as an anatomical illustration. */
  var fid = 0;
  function shading(view) {
    var p = 'bf' + ++fid;
    var D2 = '#5a3420', L2 = '#fff4e8';
    function e(x, y, rx, ry, col, op, mir) {
      var t = '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + col + '" opacity="' + op + '"/>';
      if (mir !== false && Math.abs(x - 150) > 1) t += '<ellipse cx="' + (300 - x) + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + col + '" opacity="' + op + '"/>';
      return t;
    }
    var sh = '';
    // limbs and torso edges (cylindrical falloff)
    sh += e(196, 230, 9, 70, D2, 0.32) + e(228, 190, 5, 60, D2, 0.3) + e(212, 200, 4, 40, D2, 0.22) + e(242, 290, 4, 34, D2, 0.28);
    sh += e(200, 360, 6, 60, D2, 0.3) + e(158, 380, 5, 70, D2, 0.28) + e(194, 520, 5, 60, D2, 0.28) + e(162, 520, 4, 50, D2, 0.22);
    sh += e(150, 60, 30, 38, 'none', 0) + e(176, 70, 6, 30, D2, 0.28);
    if (view === 'back') {
      sh += e(178, 160, 22, 26, L2, 0.22) + e(166, 245, 8, 40, L2, 0.18) + e(150, 220, 3, 90, D2, 0.22, false);
      sh += e(176, 330, 22, 22, L2, 0.18) + e(176, 360, 22, 6, D2, 0.25) + e(176, 480, 12, 30, L2, 0.18);
    } else {
      sh += e(170, 162, 22, 16, L2, 0.25) + e(168, 192, 20, 5, D2, 0.28) + e(150, 238, 2.5, 50, D2, 0.2, false);
      sh += e(168, 232, 10, 22, L2, 0.12) + e(178, 380, 14, 50, L2, 0.18) + e(177, 470, 8, 30, L2, 0.15) + e(212, 140, 12, 12, L2, 0.25);
    }
    sh += e(150, 40, 22, 14, L2, 0.25, false);
    return '<defs><clipPath id="' + p + 'c"><path d="' + OUTLINE + '"/><ellipse cx="150" cy="57" rx="30" ry="38"/></clipPath>' +
      '<filter id="' + p + 'b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="' + p + 't" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="1" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 0.35 0 0 0 0 0.2 0 0 0 0 0.12 0 0 0 0.35 -0.12"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>' +
      '<g clip-path="url(#' + p + 'c)" pointer-events="none"><g filter="url(#' + p + 'b)">' + sh + '</g><rect width="300" height="640" fill="#000" filter="url(#' + p + 't)"/></g>';
  }

  TCM.figure = {
    svg: function (view, inner, label) {
      return '<svg viewBox="0 0 300 640" role="img" aria-label="' + TCM.esc(label || view) + '" xmlns="http://www.w3.org/2000/svg">' +
        (view === 'back' ? back() : front()) + shading(view) + '<g class="pts">' + (inner || '') + '</g></svg>';
    },
    /* All screen positions of a point: both sides for bilateral points. */
    positions: function (pt) {
      var x = pt.xy[0], y = pt.xy[1];
      if (Math.abs(x - 150) < 0.5) return [[x, y]];
      return [[x, y], [300 - x, y]];
    },
    /* Nearest point (within maxD units) to a click on a figure of the given view. */
    nearest: function (svg, evt, view, maxD, filter) {
      var q = this.toSvg(svg, evt);
      if (!q) return null;
      var best = null, bd = maxD || 14, self = this;
      TCM.data.points.forEach(function (pt) {
        if (pt.view !== view || (filter && !filter(pt))) return;
        self.positions(pt).forEach(function (xy) {
          var d = Math.hypot(xy[0] - q[0], xy[1] - q[1]);
          if (d < bd) { bd = d; best = pt.id; }
        });
      });
      return best;
    },
    /* Wire a figure so a tap selects the nearest point; points stay keyboard-focusable. */
    onPick: function (svg, view, fn, filter) {
      var self = this;
      svg.style.cursor = 'pointer';
      svg.addEventListener('click', function (e) { var id = self.nearest(svg, e, view, 14, filter); if (id) fn(id); });
      TCM.$$('.pt', svg).forEach(function (g) {
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(g.getAttribute('data-id') || g.getAttribute('data-pt')); } });
      });
    },
    toSvg: function (svg, evt) {
      var p = svg.createSVGPoint();
      p.x = evt.clientX; p.y = evt.clientY;
      var m = svg.getScreenCTM();
      if (!m) return null;
      var r = p.matrixTransform(m.inverse());
      return [r.x, r.y];
    }
  };
})();
