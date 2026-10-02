/* Pulse simulator. new TCM.PulseEngine(canvas) draws a scrolling waveform plus a depth gauge
   showing where the vessel sits and where the examiner's finger is pressing. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;

  function gauss(x, m, s) { var z = (x - m) / s; return Math.exp(-0.5 * z * z); }
  function smoothstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* Compose quality ids (e.g. ['floating', 'tight']) into one parameter set. */
  TCM.composePulse = function (ids) {
    var P = {};
    var base = D.pulseBase;
    for (var k in base) P[k] = base[k];
    (ids || []).forEach(function (id) {
      var q = D.pulses[id];
      if (!q) return;
      var m = q.mod;
      for (var key in m) {
        if (key === 'amp' || key === 'width') P[key] = P[key] * m[key];
        else P[key] = m[key];
      }
    });
    P.amp = Math.min(P.amp, 1.8);
    return P;
  };

  /* Felt strength at pressure p (0 light … 1 heavy). */
  TCM.pulseStrength = function (P, p) {
    return P.amp * gauss(p, P.depth, P.spread);
  };

  function wave(ph, P, seed) {
    if (ph < 0 || ph >= 1) return 0;
    var y;
    if (P.tension > 0.5) {
      y = smoothstep(0.03, 0.1, ph) * (1 - smoothstep(0.34, 0.66, ph)) * 0.92 + 0.1 * gauss(ph, 0.5, 0.05);
    } else if (P.flood > 0.5) {
      y = gauss(ph, 0.1, 0.045) + 0.16 * gauss(ph, 0.3, 0.08);
    } else if (P.smooth > 0.5) {
      y = (gauss(ph, 0.16, 0.085) + 0.55 * gauss(ph, 0.37, 0.09)) / 1.12;
    } else if (P.tight > 0.5) {
      y = gauss(ph, 0.11, 0.035) + 0.14 * Math.sin(ph * Math.PI * 2 * 9) * gauss(ph, 0.2, 0.08) + 0.22 * gauss(ph, 0.37, 0.06);
    } else {
      y = gauss(ph, 0.13, 0.055) + 0.33 * gauss(ph, 0.38, 0.07);
    }
    if (P.rough > 0.5) {
      y += 0.09 * Math.sin(ph * 61 + seed) * Math.sin(ph * 23 + seed * 2.3) * (ph < 0.55 ? 1 : 0.3);
    }
    return y;
  }

  function Engine(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.P = TCM.composePulse([]);
    this.pressure = 0.5;
    this.sound = false;
    this.contact = true;
    this.lastCur = 0;
    this.lastFelt = 0;
    this.beats = [];
    this.t0 = performance.now() / 1000;
    this.window = 4;
    this.running = false;
    this.labels = { light: 'Light', mid: 'Middle', deep: 'Deep' };
    this._loop = this.loop.bind(this);
    this.resize();
  }
  Engine.prototype.set = function (P) {
    this.P = P;
    // keep beats already drawn, regenerate future ones
    var now = this.now();
    this.beats = this.beats.filter(function (b) { return b.t < now; });
  };
  Engine.prototype.setPressure = function (p) { this.pressure = p; };
  Engine.prototype.setSound = function (on) {
    this.sound = on;
    if (on && !this.audio) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.audio = new AC();
      } catch (e) { this.audio = null; }
    }
    if (this.audio && this.audio.state === 'suspended') this.audio.resume();
  };
  Engine.prototype.now = function () { return performance.now() / 1000 - this.t0; };
  Engine.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = this.c.getBoundingClientRect();
    var w = Math.max(280, Math.round(r.width || 600)), h = Math.max(150, Math.round(r.height || 190));
    this.c.width = w * dpr;
    this.c.height = h * dpr;
    this.w = w; this.h = h;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  Engine.prototype.extend = function (until) {
    var P = this.P;
    var last = this.beats.length ? this.beats[this.beats.length - 1] : null;
    var t = last ? last.t + last.dur : this.now() - this.window;
    while (t < until) {
      var dur = (60 / P.rate) * (1 + (Math.random() * 2 - 1) * P.jitter);
      var skip = P.skip > 0 && Math.random() < P.skip && !(last && last.skip);
      var amp = P.rough > 0.5 ? 0.62 + Math.random() * 0.38 : 0.96 + Math.random() * 0.08;
      var b = { t: t, dur: dur, amp: skip ? 0 : amp, skip: skip, seed: Math.random() * 10, played: false };
      if (skip) b.dur = dur * 1.0;
      this.beats.push(b);
      last = b;
      t += b.dur;
    }
    var cutoff = this.now() - this.window - 2;
    while (this.beats.length && this.beats[0].t + this.beats[0].dur < cutoff) this.beats.shift();
  };
  Engine.prototype.valueAt = function (t) {
    for (var i = this.beats.length - 1; i >= 0; i--) {
      var b = this.beats[i];
      if (b.t <= t) {
        if (t - b.t >= b.dur) return 0;
        return b.amp * wave((t - b.t) / b.dur, this.P, b.seed);
      }
    }
    return 0;
  };
  Engine.prototype.thump = function (strength) {
    if (!this.audio || !this.sound) return;
    var a = this.audio, t = a.currentTime;
    var o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(78, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.002, Math.min(0.7, strength * 0.6)), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + 0.18);
  };
  Engine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this._loop);
  };
  Engine.prototype.stop = function () {
    this.running = false;
    if (this.audio) { try { this.audio.close(); } catch (e) { /* ignore */ } this.audio = null; }
  };
  Engine.prototype.loop = function () {
    if (!this.running) return;
    if (!this.c.isConnected) { this.stop(); return; }
    if (!document.hidden) this.draw();
    requestAnimationFrame(this._loop);
  };
  Engine.prototype.draw = function () {
    var ctx = this.ctx, w = this.w, h = this.h, P = this.P;
    var now = this.now();
    this.extend(now + 2);
    var felt = this.contact ? TCM.pulseStrength(P, this.pressure) : 0;
    var gaugeW = Math.min(150, Math.max(104, w * 0.24));
    var plotW = w - gaugeW - 12;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(120, 200, 165, 0.12)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= plotW; gx += plotW / 8) { ctx.beginPath(); ctx.moveTo(gx, 8); ctx.lineTo(gx, h - 10); ctx.stroke(); }
    for (var gy = 8; gy <= h - 10; gy += (h - 18) / 5) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(plotW, gy); ctx.stroke(); }

    // trace
    var base = h - 26, scale = (h - 50) * 0.62;
    ctx.beginPath();
    for (var x = 0; x <= plotW; x += 1.5) {
      var t = now - this.window + (x / plotW) * this.window;
      var y = base - this.valueAt(t) * felt * scale;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = felt < 0.06 ? 'rgba(160, 200, 185, 0.35)' : '#7fe0b4';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    // leading dot
    var cur = this.valueAt(now);
    this.lastCur = cur;
    this.lastFelt = felt;
    ctx.fillStyle = '#d9fff0';
    ctx.beginPath(); ctx.arc(plotW, base - cur * felt * scale, 3, 0, Math.PI * 2); ctx.fill();

    // beat sound
    for (var i = 0; i < this.beats.length; i++) {
      var b = this.beats[i];
      if (!b.played && b.t <= now) {
        b.played = true;
        if (!b.skip && now - b.t < 0.2 && felt > 0.06) this.thump(felt * b.amp);
      }
    }

    // gauge: skin surface at top, bone at bottom
    var gx0 = plotW + 12, top = 14, bottom = h - 14, gh = bottom - top;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(gx0, top, gaugeW, gh);
    ctx.strokeStyle = 'rgba(191, 232, 212, 0.5)';
    ctx.beginPath(); ctx.moveTo(gx0, top); ctx.lineTo(gx0 + gaugeW, top); ctx.stroke();
    ctx.fillStyle = 'rgba(191, 232, 212, 0.18)';
    ctx.fillRect(gx0, bottom - 4, gaugeW, 4);
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(191, 232, 212, 0.7)';
    var lv = [this.labels.light, this.labels.mid, this.labels.deep];
    for (var l = 0; l < 3; l++) {
      var ly = top + gh * (0.17 + l * 0.33);
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(191, 232, 212, 0.18)';
      ctx.beginPath(); ctx.moveTo(gx0, ly); ctx.lineTo(gx0 + gaugeW, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(lv[l], gx0 + 4, ly - 3);
    }
    var vy = top + gh * (0.12 + P.depth * 0.76);
    var r0 = 5 + 9 * Math.min(1.7, P.width);
    var vr = r0 * (1 + 0.22 * cur);
    var vx = gx0 + gaugeW * 0.62;
    // finger
    var fy = top + gh * this.pressure * 0.94;
    ctx.fillStyle = 'rgba(233, 211, 191, 0.9)';
    ctx.beginPath();
    ctx.moveTo(vx - 18, top - 8); ctx.lineTo(vx + 18, top - 8); ctx.lineTo(vx + 18, fy - 6);
    ctx.quadraticCurveTo(vx + 18, fy + 4, vx, fy + 4); ctx.quadraticCurveTo(vx - 18, fy + 4, vx - 18, fy - 6);
    ctx.closePath(); ctx.fill();
    // vessel
    ctx.fillStyle = 'rgba(229, 96, 88, ' + (0.35 + 0.5 * Math.min(1, P.amp)) + ')';
    ctx.beginPath(); ctx.ellipse(vx, vy, vr * 1.35, vr, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 190, 180, 0.8)';
    ctx.lineWidth = P.tension > 0.5 || P.tight > 0.5 ? 2.4 : 1.2;
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  TCM.PulseEngine = Engine;
})();
