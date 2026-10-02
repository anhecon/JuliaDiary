/* Wrist exam: drag the index, middle and ring fingers onto cun, guan and chi.
   new TCM.WristExam(host, { side, preplace, engine, onChange }) */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx;

  var SLOTS = { chi: 152, guan: 226, cun: 300 };
  var CORRECT = { index: 'cun', middle: 'guan', ring: 'chi' };
  var HOME = { index: 112, middle: 72, ring: 32 };
  function arteryY(x) { return 132 - (x - 20) * 6 / 310; }

  function WristExam(host, opts) {
    this.host = host;
    this.o = opts || {};
    this.side = this.o.side || 'left';
    this.place = { index: null, middle: null, ring: null };
    this.pos = {};
    if (this.o.preplace) this.place = { index: 'cun', middle: 'guan', ring: 'chi' };
    this.press = 0.5;
    this.build();
  }

  WristExam.prototype.fingerXY = function (f) {
    var slot = this.place[f];
    if (slot) return [SLOTS[slot], arteryY(SLOTS[slot])];
    return [HOME[f], 96];
  };

  WristExam.prototype.build = function () {
    var self = this;
    var names = {
      index: tx('Index', 'Trỏ'), middle: tx('Middle', 'Giữa'), ring: tx('Ring', 'Áp út')
    };
    var s = '<svg class="wrist-exam" viewBox="0 0 420 262" role="img" aria-label="' + tx('Wrist: place three fingers on the radial artery', 'Cổ tay: đặt ba ngón tay lên động mạch quay') + '">';
    s += '<text x="16" y="14" font-size="10" style="fill:var(--ink-soft)">' + tx('Drag your fingers onto the wrist', 'Kéo ngón tay đặt lên cổ tay') + '</text>';
    s += '<path d="M10 116 L332 108 Q352 106 362 98 L414 90 L416 200 L362 196 Q350 190 332 190 L10 190 Z" style="fill:var(--skin);stroke:var(--skin-line)" stroke-width="1.5"/>';
    s += '<path d="M206 112 Q226 102 246 112 Q232 118 214 118 Z" style="fill:var(--skin-line)" opacity=".55"/>';
    s += '<path d="M336 110 L336 190" style="stroke:var(--skin-detail)" stroke-dasharray="3 3"/>';
    s += '<path class="we-artery" d="M20 132 L330 126" stroke="#c0574f" stroke-width="4" stroke-linecap="round" opacity=".55"/>';
    s += '<text x="398" y="84" text-anchor="end" font-size="10" style="fill:var(--ink-soft)">' + tx('hand', 'bàn tay') + ' →</text>';
    s += '<text x="20" y="206" font-size="10" style="fill:var(--ink-soft)">← ' + tx('elbow', 'khuỷu tay') + '</text>';
    s += '<text x="336" y="206" text-anchor="middle" font-size="10" style="fill:var(--ink-soft)">' + tx('wrist crease', 'lằn chỉ cổ tay') + '</text>';
    s += '<text x="226" y="206" text-anchor="middle" font-size="10" style="fill:var(--ink-soft)">' + tx('radial styloid', 'mỏm trâm quay') + '</text>';
    ['chi', 'guan', 'cun'].forEach(function (k) {
      var x = SLOTS[k], y = arteryY(x);
      s += '<g class="we-slot" data-slot="' + k + '"><circle cx="' + x + '" cy="' + y + '" r="16" class="we-target"/>' +
        '<circle class="we-ripple" cx="' + x + '" cy="' + y + '" r="10"/>' +
        '<text class="we-org-zh" x="' + x + '" y="230" text-anchor="middle" font-size="15" font-family="Noto Serif SC, serif" style="fill:var(--cinnabar)"></text>' +
        '<text class="we-org" x="' + x + '" y="247" text-anchor="middle" font-size="10" style="fill:var(--ink)"></text></g>';
    });
    ['ring', 'middle', 'index'].forEach(function (f) {
      s += '<g class="we-finger" data-f="' + f + '" tabindex="0" role="button" aria-label="' + names[f] + '">' +
        '<rect x="-15" y="-86" width="30" height="86" rx="14" class="we-skin"/>' +
        '<rect x="-10" y="-25" width="20" height="18" rx="7" class="we-nail"/>' +
        '<text x="0" y="-50" text-anchor="middle" font-size="10" font-weight="600" class="we-lbl">' + names[f] + '</text></g>';
    });
    s += '</svg>';
    this.host.innerHTML = s;
    this.svg = this.host.querySelector('svg');
    this.fingers = {};
    TCM.$$('.we-finger', this.svg).forEach(function (g) { self.fingers[g.getAttribute('data-f')] = g; self.bindDrag(g); });
    this.layout();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  };

  WristExam.prototype.status = function () {
    var placed = 0, wrong = [];
    for (var f in this.place) {
      if (this.place[f]) placed++;
      if (this.place[f] && this.place[f] !== CORRECT[f]) wrong.push(f);
    }
    return { placed: placed, correct: placed === 3 && !wrong.length, wrong: wrong };
  };

  WristExam.prototype.layout = function () {
    var st = this.status();
    var side = D.pulsePositions[this.side];
    var self = this;
    TCM.$$('.we-slot', this.svg).forEach(function (g) {
      var k = g.getAttribute('data-slot');
      var occupied = null;
      for (var f in self.place) if (self.place[f] === k) occupied = f;
      g.classList.toggle('is-filled', !!occupied);
      g.classList.toggle('is-right', !!occupied && CORRECT[occupied] === k);
      g.querySelector('.we-org-zh').textContent = occupied ? side[k].zh : '';
      g.querySelector('.we-org').textContent = occupied ? TCM.nmText(side[k]).split(' (')[0] : '';
    });
    if (this.o.engine) this.o.engine.contact = st.correct;
    if (this.o.onChange) this.o.onChange(st);
  };

  WristExam.prototype.bindDrag = function (g) {
    var self = this, f = g.getAttribute('data-f'), drag = null;
    g.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { g.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      var p = TCM.figure.toSvg(self.svg, e);
      if (!p) return;
      var cur = self.fingerXY(f);
      drag = { dx: cur[0] - p[0], dy: cur[1] - p[1] };
      self.place[f] = null;
      g.classList.add('is-drag');
    });
    g.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = TCM.figure.toSvg(self.svg, e);
      if (!p) return;
      self.pos[f] = [p[0] + drag.dx, p[1] + drag.dy];
    });
    function end() {
      if (!drag) return;
      drag = null;
      g.classList.remove('is-drag');
      var p = self.pos[f];
      delete self.pos[f];
      if (p) {
        var best = null, bd = 40;
        for (var k in SLOTS) {
          var d = Math.abs(SLOTS[k] - p[0]);
          if (d < bd && Math.abs(arteryY(SLOTS[k]) - p[1]) < 60) { bd = d; best = k; }
        }
        if (best) {
          for (var other in self.place) if (self.place[other] === best) self.place[other] = null;
          self.place[f] = best;
        }
      }
      self.layout();
    }
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
    // keyboard: Enter cycles the finger through home → chi → guan → cun
    g.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      var order = [null, 'chi', 'guan', 'cun'];
      var next = order[(order.indexOf(self.place[f]) + 1) % order.length];
      for (var other in self.place) if (next && self.place[other] === next) self.place[other] = null;
      self.place[f] = next;
      self.layout();
    });
  };

  WristExam.prototype.setPressure = function (p) { this.press = p; };
  WristExam.prototype.setSide = function (side) { this.side = side; this.layout(); };

  WristExam.prototype.loop = function () {
    if (!this.svg.isConnected) return;
    var e = this.o.engine;
    var v = e ? e.lastCur * e.lastFelt : 0;
    for (var f in this.fingers) {
      var xy = this.pos[f] || this.fingerXY(f);
      var onSlot = !!this.place[f] && !this.pos[f];
      var y = xy[1] + (onSlot ? this.press * 9 - v * 6 : 0);
      this.fingers[f].setAttribute('transform', 'translate(' + xy[0].toFixed(1) + ' ' + y.toFixed(1) + ')');
      this.fingers[f].classList.toggle('is-pressing', onSlot && this.press > 0.6);
    }
    var rip = TCM.$$('.we-slot.is-filled .we-ripple', this.svg);
    rip.forEach(function (c) { c.setAttribute('r', (8 + v * 16).toFixed(1)); c.style.opacity = Math.min(0.85, v * 0.9).toFixed(2); });
    requestAnimationFrame(this.loop);
  };

  TCM.WristExam = WristExam;
})();
