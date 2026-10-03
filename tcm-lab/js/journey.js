/* Patient journey (Hành trình bệnh nhân): one patient walks from the consulting room to the
   treatment room to the pharmacy and comes back three days later. What happens at the
   follow-up is computed from what was done in each room: diagnosis → choice of formula
   and points → quality of needling, dispensing and decoction → outcome. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;
  function c(en, vi) { return { en: en, vi: vi }; }

  /* ---------- follow-up lines ---------- */
  D.followup = {
    c_wind_cold: { better: c('I sweated a little that first evening, the chills went and the aches are gone.', 'Tối hôm đầu tôi ra được chút mồ hôi, hết rét, hết đau nhức người.'), worse: c('I am still shivering and aching all over, and now the cough is worse.', 'Tôi vẫn rét run, đau mỏi khắp người, giờ còn ho nhiều hơn.') },
    c_wind_heat: { better: c('The fever is down and my throat is much less sore.', 'Hạ sốt rồi, họng đỡ đau nhiều.'), worse: c('The fever went higher and my throat is swollen; swallowing hurts.', 'Sốt cao hơn, họng sưng, nuốt rất đau.') },
    c_sp_qi: { better: c('My appetite is back, less bloating, and my stools are formed again.', 'Ăn ngon hơn, bụng bớt đầy, đi ngoài đã thành khuôn.'), worse: c('More bloated, food sits heavy, looser stools, and I am exhausted.', 'Bụng càng đầy, ăn không tiêu, phân lỏng hơn, rất mệt.') },
    c_liver_qi: { better: c('Less irritable, the tightness under my ribs has eased, and I fall asleep more easily.', 'Đỡ cáu gắt, mạng sườn hết tức, dễ ngủ hơn.'), worse: c('The pressure under my ribs is worse, I snap at everyone, and I feel bloated.', 'Ngực sườn càng tức, dễ nổi nóng, bụng đầy.') },
    c_kidney_yin: { better: c('Night sweats are much less, fewer afternoon flushes, my back aches less.', 'Mồ hôi trộm ít hẳn, chiều bớt bốc hỏa, lưng đỡ mỏi.'), worse: c('I feel hotter inside, drenched at night, I cannot sleep and my mouth is parched.', 'Nóng trong người hơn, đêm mồ hôi ướt đẫm, mất ngủ, miệng khô.') },
    c_sp_yang: { better: c('My stomach feels warm, the dull ache has gone and my hands and feet are less cold.', 'Bụng ấm hơn, hết đau âm ỉ, tay chân bớt lạnh.'), worse: c('The stomach pain is worse, my stools are watery and I feel chilled to the bone.', 'Đau bụng nhiều hơn, đi ngoài lỏng, lạnh run.') },
    c_yangming: { better: c('The fever has broken, I am much less thirsty and feel comfortable.', 'Hết sốt, bớt khát, người dễ chịu.'), worse: c('Still a very high fever and raging thirst, and I feel restless and foggy.', 'Vẫn sốt rất cao, khát dữ dội, lơ mơ, bứt rứt.') },
    c_phlegm: { better: c('Much less phlegm, my chest feels lighter and my head clearer.', 'Đờm ít hẳn, ngực nhẹ nhõm, đầu bớt nặng.'), worse: c('More phlegm than ever, a tight chest and nausea.', 'Đờm càng nhiều, tức ngực, buồn nôn.') },
    c_blood_def: { better: c('Less dizzy, sleeping better, and my colour is coming back.', 'Bớt chóng mặt, ngủ ngon hơn, da hồng hào hơn.'), worse: c('Still dizzy with palpitations, and more tired.', 'Vẫn chóng mặt, hồi hộp, mệt hơn.') },
    c_insomnia: { better: c('I sleep five or six hours now and the restlessness at night has settled.', 'Giờ tôi ngủ được 5–6 tiếng, đêm bớt bứt rứt.'), worse: c('Still awake all night, restless, heart racing.', 'Vẫn thức trắng, bứt rứt, tim đập nhanh.') },
    c_shaoyang: { better: c('The waves of chills and heat have stopped, the bitter taste is gone and I can eat.', 'Hết lúc nóng lúc lạnh, miệng hết đắng, ăn được.'), worse: c('Still alternating chills and heat, a bitter mouth and more nausea.', 'Vẫn rét nóng xen kẽ, đắng miệng, buồn nôn nhiều hơn.') }
  };
  var WHY = {
    heat: c('After the medicine I felt hot and flushed, very thirsty, and got mouth ulcers.', 'Uống thuốc vào tôi thấy nóng bừng, khát nước, nhiệt miệng.'),
    cold: c('The medicine made my stomach cold and crampy, and my stools went loose.', 'Uống thuốc vào thấy lạnh bụng, đau quặn, đi ngoài lỏng.'),
    trap: c('I feel full and heavy, as if the illness is stuck inside.', 'Thấy đầy tức, nặng nề, bệnh như không chịu lui.'),
    drain: c('I sweated a lot and feel even more drained.', 'Ra nhiều mồ hôi, càng mệt lả.'),
    aconite: c('After the medicine my lips and tongue went numb and my heart raced. I had to go to the emergency room.', 'Uống thuốc xong tê môi, tê lưỡi, tim đập loạn, tôi phải đi cấp cứu.'),
    burnt: c('The medicine smelled burnt and did nothing.', 'Thuốc có mùi khét, uống không thấy tác dụng gì.'),
    preg: c('That evening I had cramping in my belly and had to see an obstetrician.', 'Tối hôm đó bụng tôi co thắt, phải đi khám sản khoa.'),
    moxaHeat: c('After the moxa I felt even hotter inside.', 'Sau khi cứu ngải tôi thấy nóng trong người hơn.'),
    faint: c('I felt faint during the needling, but I was fine after lying down.', 'Lúc châm kim tôi bị choáng, nằm nghỉ một lúc thì ổn.'),
    hematoma: c('There is a bruise where one needle went in.', 'Chỗ một cây kim có vết bầm tím.')
  };

  var J = { active: null, pending: null };
  TCM.journey = J;
  var STAGES = [
    ['clinic', '诊', { en: 'Consulting room', vi: 'Phòng chẩn bệnh' }],
    ['treat', '针', { en: 'Treatment room', vi: 'Phòng thủ thuật' }],
    ['pharmacy', '药', { en: 'Pharmacy', vi: 'Nhà thuốc' }],
    ['followup', '复', { en: 'Follow-up (day 3)', vi: 'Tái khám (ngày 3)' }]
  ];
  var ROOM_OF = { clinic: 'clinic', treat: 'treat', pharmacy: 'pharmacy', followup: 'clinic' };

  J.start = function (caseId) {
    J.active = { caseId: caseId, stage: 'clinic', clinic: null, treat: null, pharm: null, events: [], outcome: null, transfer: null };
    J.pending = { from: 'wait', to: 'clinic', next: 'clinic', caption: tx('The patient is called in from the waiting hall.', 'Bệnh nhân được mời từ sảnh chờ vào phòng khám.') };
    location.hash = 'transit';
  };
  J.isFor = function (caseId) { return !!(J.active && J.active.caseId === caseId); };
  J.end = function () { J.active = null; };
  J.event = function (type, detail) { if (J.active) J.active.events.push({ type: type, detail: detail || null, stage: J.active.stage }); };
  J.patient = function () { return J.active ? D.caseById[J.active.caseId] : null; };

  /* Move the patient to the next room via the floor plan. */
  J.move = function (stage) {
    var a = J.active;
    if (!a) return;
    var from = ROOM_OF[a.stage] || 'clinic';
    var k = J.patient();
    var cap = {
      treat: tx(k.patient.name + ' carries the treatment order to the treatment room.', k.patient.name + ' mang phiếu chỉ định sang phòng thủ thuật.'),
      pharmacy: tx(k.patient.name + ' takes the prescription to the pharmacy.', k.patient.name + ' cầm đơn thuốc sang nhà thuốc.'),
      followup: tx(k.patient.name + ' goes home with the medicine. Three days later, the follow-up visit.', k.patient.name + ' mang thuốc về nhà. Ba ngày sau, bệnh nhân quay lại tái khám.')
    }[stage];
    a.stage = stage;
    J.pending = stage === 'followup' ? { from: from, to: 'exit', next: 'followup', caption: cap, days: true } : { from: from, to: ROOM_OF[stage], next: stage, caption: cap };
    location.hash = 'transit';
  };
  J.transfer = function (type) {
    var a = J.active;
    if (!a) return;
    a.transfer = type;
    a.stage = 'followup';
    J.pending = { from: 'treat', to: 'exit', next: 'followup', caption: tx('Emergency transfer: the patient is taken to hospital by ambulance.', 'Chuyển cấp cứu: bệnh nhân được đưa đến bệnh viện bằng xe cứu thương.'), emergency: true };
    location.hash = 'transit';
  };

  /* Journey header shown in each room. */
  J.bar = function () {
    var a = J.active;
    if (!a) return '';
    var k = J.patient(), v = D.caseVisual[k.id] || { av: {} };
    var av = {}; for (var x in v.av) av[x] = v.av[x]; av.sex = k.patient.sex; av.age = k.patient.age;
    var idx = STAGES.map(function (q) { return q[0]; }).indexOf(a.stage);
    var docs = '';
    if (a.clinic) {
      docs += '<span class="doc-chip" title="' + TCM.esc(a.clinic.points.join(', ')) + '"><b lang="zh-Hans">针</b> ' + tx('Treatment order: ', 'Phiếu chỉ định: ') + '<span class="mono">' + (a.clinic.points.join(', ') || '—') + '</span></span>';
      docs += '<span class="doc-chip"><b lang="zh-Hans">方</b> ' + tx('Prescription: ', 'Đơn thuốc: ') + TCM.esc(TCM.nmText(D.formulaById[a.clinic.formula], 'py')) + '</span>';
    }
    return '<div class="journey-bar"><span class="jb-face">' + TCM.renderAvatar(av, { label: k.patient.name }) + '</span>' +
      '<div class="jb-main"><div class="jb-top"><b>' + TCM.esc(k.patient.name) + '</b><span class="muted small">' + k.patient.age + ' · ' + TCM.esc(L(k.patient.note)) + '</span>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="jb-leave">' + tx('Leave journey', 'Rời hành trình') + '</button></div>' +
      '<ol class="jb-steps">' + STAGES.map(function (q, i) {
        return '<li class="' + (i < idx ? 'done' : i === idx ? 'now' : '') + '"><span lang="zh-Hans">' + q[1] + '</span>' + TCM.esc(L(q[2])) + '</li>';
      }).join('') + '</ol>' + (docs ? '<div class="jb-docs">' + docs + '</div>' : '') + '</div></div>';
  };
  J.wireBar = function (root) {
    var b = TCM.$('#jb-leave', root);
    if (b) b.addEventListener('click', function () { J.end(); TCM.rerender(); });
  };

  /* ---------- the causal model ---------- */
  function profile(fid) {
    var f = D.formulaById[fid], tot = 0, temp = 0, g = { tonic: 0, ext: 0, clear: 0, warm: 0 };
    f.herbs.forEach(function (r) {
      var h = D.herbById[r[0]], d = r[2];
      tot += d; temp += D.natures[h.nat].v * d;
      if (/^t_|astringe/.test(h.cat)) g.tonic += d;
      if (/^ext_/.test(h.cat)) g.ext += d;
      if (/clear_heat|purge/.test(h.cat)) g.clear += d;
      if (h.cat === 'warm_int') g.warm += d;
    });
    for (var k in g) g[k] /= tot;
    return { temp: temp / tot, g: g };
  }
  J.herbFit = function (k, fid) {
    var dx = k.dx;
    if (!fid) return { fit: 0, why: [] };
    if (fid === dx.formula) return { fit: 1, why: ['match'] };
    if (dx.formulaAlt.indexOf(fid) >= 0) return { fit: 0.6, why: ['alt'] };
    var pr = profile(fid), fit = 0.1, why = [];
    var nat = dx.nature[0], str = dx.strength[0], loc = dx.location[0];
    if (nat === 'cold') { if (pr.temp > 0.4) fit += 0.25; if (pr.temp < -0.3) { fit -= 0.55; why.push('cold'); } }
    if (nat === 'heat') { if (pr.temp < -0.4) fit += 0.25; if (pr.temp > 0.3) { fit -= 0.55; why.push('heat'); } }
    if (nat === 'neutral' && Math.abs(pr.temp) > 1.2) { fit -= 0.2; why.push(pr.temp > 0 ? 'heat' : 'cold'); }
    if (str === 'deficiency') { if (pr.g.tonic > 0.4) fit += 0.2; if (pr.g.ext + pr.g.clear > 0.5) { fit -= 0.3; why.push('drain'); } }
    if (str === 'excess' && pr.g.tonic > 0.5) { fit -= 0.35; why.push('trap'); }
    if (loc === 'exterior') { if (pr.g.ext > 0.4) fit += 0.2; else if (pr.g.ext < 0.15) fit -= 0.1; }
    if (loc === 'interior' && pr.g.ext > 0.5) fit -= 0.15;
    return { fit: Math.max(-0.8, Math.min(0.5, fit)), why: why };
  };

  J.compute = function () {
    var a = J.active, k = J.patient(), dx = k.dx;
    var S0 = 62, parts = [], notes = [];
    if (a.transfer) {
      a.outcome = { transfer: a.transfer, S0: S0, S1: null, cat: 'transfer', parts: [], notes: [] };
      return a.outcome;
    }
    var acute = /c_wind_cold|c_wind_heat|c_shaoyang/.test(k.id);
    var natural = acute ? 10 : 2;
    parts.push({ key: 'natural', label: tx('Natural course (3 days)', 'Diễn biến tự nhiên (3 ngày)'), d: natural });

    // herbs
    var cl = a.clinic || {}, ph = a.pharm;
    var hf = J.herbFit(k, cl.formula);
    var prep = 0, prepWhy = [];
    if (ph && ph.decoct) {
      var dc = ph.decoct;
      if (dc.burnt) { prep = 0; prepWhy.push(L(WHY.burnt)); notes.push('burnt'); }
      else {
        prep = 0.4 + 0.6 * dc.total / 100;
        prep *= 1 - Math.min(0.5, (ph.weighErr || 0) * 2);
        var kind = D.formulaDecoction[cl.formula] || 'standard';
        if (dc.flags.laterFail.length) prep *= kind === 'exterior' ? 0.75 : 0.9;
        if (dc.flags.firstFail.some(function (x) { return x !== 'fu_zi'; })) prep *= 0.85;
        if (dc.flags.simmerOff) prep *= 0.85;
      }
      if (dc.flags.firstFail.indexOf('fu_zi') >= 0) { notes.push('aconite'); }
    } else prepWhy.push(tx('The prescription was never filled.', 'Đơn thuốc chưa được bốc.'));
    var herb = 30 * hf.fit * prep;
    parts.push({ key: 'herb', label: tx('Herbal formula', 'Bài thuốc'), d: herb, fit: hf.fit, prep: prep });
    hf.why.forEach(function (w) { if (WHY[w]) notes.push(w); });

    // acupuncture and moxa
    var acu = 0, tr = a.treat || { points: {} };
    var fragile = dx.strength.indexOf('deficiency') >= 0;
    Object.keys(tr.points || {}).forEach(function (id) {
      var r = tr.points[id];
      var w = dx.points.indexOf(id) >= 0 ? 6 : dx.pointsOk.indexOf(id) >= 0 ? 3 : 0;
      if (r.needle && !r.incident) {
        var f = (r.deqi ? 1 : 0.3) * (r.retained ? 1 : 0.6);
        if (fragile) f *= r.over <= 1.5 ? 1.1 : 0.7; else f *= r.over >= 2 ? 1.2 : 0.9;
        acu += w * f;
      }
      if (r.moxa && r.moxaDone) {
        if (dx.nature.indexOf('heat') >= 0) { acu -= 4; if (notes.indexOf('moxaHeat') < 0) notes.push('moxaHeat'); }
        else acu += w ? 4 : 1;
      }
    });
    acu = Math.max(-8, Math.min(18, acu));
    parts.push({ key: 'acu', label: tx('Acupuncture and moxibustion', 'Châm cứu'), d: acu });

    // adverse events
    var adverse = 0;
    a.events.forEach(function (e) {
      if (e.type === 'faint') { adverse += 2; if (notes.indexOf('faint') < 0) notes.push('faint'); }
      if (e.type === 'hematoma') { adverse += 2; if (notes.indexOf('hematoma') < 0) notes.push('hematoma'); }
      if (e.type === 'preg') { adverse += 18; if (notes.indexOf('preg') < 0) notes.push('preg'); }
    });
    if (notes.indexOf('aconite') >= 0) adverse += 25;
    parts.push({ key: 'adverse', label: tx('Complications', 'Tai biến'), d: -adverse });

    var S1 = Math.round(Math.max(5, Math.min(100, S0 - natural - herb - acu + adverse)));
    var cat = S1 <= 22 ? 'much' : S1 <= 40 ? 'better' : S1 <= 56 ? 'same' : 'worse';
    a.outcome = { S0: S0, S1: S1, cat: cat, parts: parts, notes: notes, hf: hf, prepWhy: prepWhy };
    return a.outcome;
  };

  /* Patient's appearance, tongue and pulse at follow-up. */
  J.after = function (k, o) {
    var v = D.caseVisual[k.id] || { av: {} };
    var av = {}; for (var x in v.av) av[x] = v.av[x];
    av.extras = (v.av.extras || []).slice();
    av.sex = k.patient.sex; av.age = k.patient.age;
    var t = {}; for (var y in k.tongue) t[y] = k.tongue[y];
    var pulse = k.pulse.slice();
    var drop = ['shiver', 'runny', 'sweat', 'jacket'];
    if (o.cat === 'much' || o.cat === 'better') {
      av.extras = av.extras.filter(function (e) { return drop.indexOf(e) < 0; });
      if (o.cat === 'much') { av.skin = 'normal'; av.mood = 'neutral'; t = { body: 'lightred', shape: k.tongue.shape === 'swollen' ? 'swollen' : 'normal', coat: 'thin_white', moist: 'normal', teeth: k.tongue.teeth && k.tongue.shape === 'swollen' }; pulse = ['normal']; }
      else { av.mood = 'neutral'; if (av.skin === 'flushed') av.skin = 'normal'; t.redTip = false; if (t.coat === 'thick_yellow' || t.coat === 'yellow_greasy') t.coat = 'thin_yellow'; if (t.coat === 'thick_white' || t.coat === 'white_greasy') t.coat = 'thin_white'; pulse = pulse.slice(0, 1); }
    }
    if (o.cat === 'worse' || o.cat === 'transfer') {
      av.mood = 'worried';
      if (o.notes.indexOf('heat') >= 0 || o.notes.indexOf('moxaHeat') >= 0) { av.skin = 'flushed'; av.extras.push('sweat'); t.body = 'red'; t.coat = 'thick_yellow'; t.moist = 'dry'; if (pulse.indexOf('rapid') < 0) pulse.push('rapid'); pulse = pulse.filter(function (q) { return q !== 'slow'; }).slice(-2); }
      else if (o.notes.indexOf('cold') >= 0) { av.skin = 'pale'; av.extras.push('jacket'); t.body = 'pale'; t.moist = 'wet'; t.coat = 'thick_white'; pulse = ['deep', 'slow']; }
      else if (o.notes.indexOf('aconite') >= 0) { av.skin = 'pale'; av.extras.push('sweat'); pulse = ['knotted']; }
    }
    return { av: av, tongue: t, pulse: pulse };
  };

  function statement(k, o) {
    var fu = D.followup[k.id] || {};
    var lines = [];
    if (o.cat === 'much') lines.push(tx('Doctor, I feel so much better. ', 'Thưa bác sĩ, tôi đỡ nhiều lắm rồi. ') + L(fu.better));
    else if (o.cat === 'better') lines.push(tx('It is a bit better. ', 'Có đỡ hơn một chút. ') + L(fu.better).replace(/\.$/, '') + tx(', though not completely.', ', nhưng chưa hết hẳn.'));
    else if (o.cat === 'same') lines.push(tx('Honestly, not much has changed. ', 'Thật lòng thì không thay đổi mấy. ') + L(k.cc));
    else lines.push(tx('I am worse, doctor. ', 'Tôi nặng hơn rồi bác sĩ ạ. ') + L(fu.worse));
    o.notes.forEach(function (n) { if (WHY[n]) lines.push(L(WHY[n])); });
    return lines;
  }

  /* ---------- transit module: walking on the floor plan ---------- */
  TCM.modules.transit = {
    han: '行', hidden: true,
    title: { en: 'Moving', vi: 'Di chuyển' }, sub: { en: '', vi: '' },
    render: function (el) {
      var pnd = J.pending;
      if (!pnd || !J.active) { location.hash = 'home'; return; }
      var k = J.patient();
      el.innerHTML = '<div class="page">' + J.bar() + '<div class="panel stack transit"><p class="eyebrow">' + tx('Clinic floor plan', 'Sơ đồ phòng khám') + '</p>' +
        '<div class="fp-host">' + TCM.floorPlan(pnd.from, pnd.to, { initial: k.patient.name.split(' ').pop() }) + '</div>' +
        '<p class="transit-cap">' + TCM.esc(pnd.caption) + '</p>' +
        (pnd.days ? '<div class="calendar" id="tr-cal"><span class="cal-m">' + tx('Day', 'Ngày') + '</span><b id="tr-day">1</b></div>' : '') +
        '<div class="row"><button type="button" class="btn btn-primary" id="tr-go" disabled>' + tx('Continue', 'Tiếp tục') + '</button></div></div></div>';
      J.wireBar(el);
      var go = TCM.$('#tr-go', el);
      function finish() {
        go.disabled = false;
        go.addEventListener('click', function () { J.pending = null; location.hash = pnd.next; });
      }
      TCM.walk(TCM.$('.fp-host', el), 2200, function () {
        if (!pnd.days) { finish(); return; }
        var d = 1, day = TCM.$('#tr-day', el);
        var iv = setInterval(function () {
          if (!day.isConnected) { clearInterval(iv); return; }
          d++; day.textContent = d;
          if (d >= 3) { clearInterval(iv); TCM.$('.fp-host', el).innerHTML = TCM.floorPlan('wait', 'clinic', { initial: k.patient.name.split(' ').pop() }); TCM.walk(TCM.$('.fp-host', el), 1800, finish); }
        }, 650);
      });
    }
  };

  /* ---------- follow-up and causal report ---------- */
  function waterfall(o) {
    var W = 470, H = 250, x0 = 34, bw = 56, gap = 10, top = 22, scaleY = (H - 70) / 100;
    function y(v) { return top + (100 - v) * scaleY; }
    var s = '<svg class="waterfall" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + tx('How each room changed the severity', 'Mỗi phòng đã làm thay đổi mức độ bệnh thế nào') + '">';
    [0, 25, 50, 75, 100].forEach(function (g) { s += '<path d="M' + x0 + ' ' + y(g) + 'H' + (W - 10) + '" style="stroke:var(--line)"/><text x="' + (x0 - 6) + '" y="' + (y(g) + 3) + '" text-anchor="end" font-size="10" style="fill:var(--ink-soft)">' + g + '</text>'; });
    var cur = o.S0, x = x0 + 10;
    s += '<rect x="' + x + '" y="' + y(cur) + '" width="' + bw + '" height="' + (y(0) - y(cur)) + '" style="fill:var(--ink-soft)" opacity=".55"/><text x="' + (x + bw / 2) + '" y="' + (H - 22) + '" text-anchor="middle" font-size="10" style="fill:var(--ink)">' + tx('Day 0', 'Ngày 0') + '</text><text x="' + (x + bw / 2) + '" y="' + (y(cur) - 5) + '" text-anchor="middle" font-size="11" style="fill:var(--ink)" font-weight="600">' + cur + '</text>';
    x += bw + gap;
    o.parts.forEach(function (p) {
      var next = Math.max(5, Math.min(100, cur - p.d));
      var good = next <= cur;
      s += '<rect x="' + x + '" y="' + y(Math.max(cur, next)) + '" width="' + bw + '" height="' + Math.max(1.5, Math.abs(y(cur) - y(next))) + '" style="fill:' + (good ? 'var(--good)' : 'var(--bad)') + '"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (y(Math.max(cur, next)) - 5) + '" text-anchor="middle" font-size="11" style="fill:var(--ink)" font-weight="600">' + (p.d >= 0 ? '−' : '+') + Math.abs(Math.round(p.d)) + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (H - 32) + '" text-anchor="middle" font-size="11" style="fill:var(--ink)">' + TCM.esc({ natural: tx('Time', 'Thời gian'), herb: tx('Herbs', 'Thuốc'), acu: tx('Needles', 'Châm cứu'), adverse: tx('Harm', 'Tai biến') }[p.key]) + '</text>';
      cur = next; x += bw + gap;
    });
    s += '<rect x="' + x + '" y="' + y(o.S1) + '" width="' + bw + '" height="' + (y(0) - y(o.S1)) + '" style="fill:var(--jade)"/><text x="' + (x + bw / 2) + '" y="' + (y(o.S1) - 5) + '" text-anchor="middle" font-size="11" style="fill:var(--ink)" font-weight="600">' + o.S1 + '</text><text x="' + (x + bw / 2) + '" y="' + (H - 22) + '" text-anchor="middle" font-size="10" style="fill:var(--ink)">' + tx('Day 3', 'Ngày 3') + '</text>';
    s += '<text x="' + x0 + '" y="' + (H - 8) + '" font-size="10.5" style="fill:var(--ink-soft)">' + tx('Severity score (100 = worst). Green bars lowered it, red bars raised it.', 'Điểm mức độ bệnh (100 = nặng nhất). Cột xanh làm giảm, cột đỏ làm tăng.') + '</text>';
    return s + '</svg>';
  }

  function chain(k, a, o) {
    function node(label, sub, lvl) { return '<div class="cn cn-' + lvl + '"><b>' + label + '</b><span>' + sub + '</span></div>'; }
    var cl = a.clinic || {}, dx = k.dx;
    var dxOk = cl.pattern === dx.pattern;
    var fit = o.hf ? o.hf.fit : 0;
    var ph = a.pharm || {}, dc = ph.decoct;
    var tr = a.treat || { points: {} };
    var rec = Object.keys(tr.points).filter(function (id) { return dx.points.indexOf(id) >= 0 && tr.points[id].needle && tr.points[id].deqi; });
    var herbPart = o.parts.filter(function (p) { return p.key === 'herb'; })[0] || { d: 0 };
    var acuPart = o.parts.filter(function (p) { return p.key === 'acu'; })[0] || { d: 0 };
    var row1 = node(tx('Diagnosis', 'Chẩn đoán'), TCM.esc(cl.pattern ? TCM.nmText(D.patterns[cl.pattern]) : '—'), dxOk ? 'ok' : 'bad') + '<i>→</i>' +
      node(tx('Formula', 'Bài thuốc'), TCM.esc(cl.formula ? TCM.nmText(D.formulaById[cl.formula], 'py') : '—') + ' · ' + tx('fit ', 'độ phù hợp ') + Math.round(fit * 100) + '%', fit >= 0.9 ? 'ok' : fit > 0 ? 'mid' : 'bad') + '<i>→</i>' +
      node(tx('Weighing & decoction', 'Bốc & sắc thuốc'), dc ? (dc.burnt ? tx('burnt', 'bị cháy') : dc.total + '/100') : tx('not done', 'chưa làm'), dc && !dc.burnt && dc.total >= 70 ? 'ok' : dc && !dc.burnt ? 'mid' : 'bad') + '<i>→</i>' +
      node(tx('Herbal effect', 'Hiệu quả thuốc'), tx('severity ', 'mức độ bệnh ') + (herbPart.d >= 0 ? '−' : '+') + Math.abs(Math.round(herbPart.d)), herbPart.d >= 12 ? 'ok' : herbPart.d > 0 ? 'mid' : 'bad');
    var row2 = node(tx('Point selection', 'Chọn huyệt'), '<span class="mono">' + (cl.points || []).join(', ') + '</span>', (cl.points || []).filter(function (p) { return dx.points.indexOf(p) >= 0; }).length >= 2 ? 'ok' : 'mid') + '<i>→</i>' +
      node(tx('Needling technique', 'Kỹ thuật châm'), rec.length + ' ' + tx('key points with de qi', 'huyệt chính đắc khí') + (a.events.some(function (e) { return e.type === 'faint'; }) ? ' · ' + tx('fainting', 'vựng châm') : ''), rec.length >= 2 ? 'ok' : rec.length ? 'mid' : 'bad') + '<i>→</i>' +
      node(tx('Acupuncture effect', 'Hiệu quả châm'), tx('severity ', 'mức độ bệnh ') + (acuPart.d >= 0 ? '−' : '+') + Math.abs(Math.round(acuPart.d)), acuPart.d >= 8 ? 'ok' : acuPart.d > 0 ? 'mid' : 'bad');
    return '<div class="causal"><div class="cn-row">' + row1 + '</div><div class="cn-row">' + row2 + '</div></div>';
  }

  function reasons(k, a, o) {
    var out = [], dx = k.dx, cl = a.clinic || {};
    if (cl.pattern && cl.pattern !== dx.pattern) out.push(tx('The pattern was ', 'Chứng thật sự là ') + TCM.nmText(D.patterns[dx.pattern]) + tx(', not ', ', không phải ') + TCM.nmText(D.patterns[cl.pattern]) + tx('. Every later choice inherited this.', '. Mọi lựa chọn sau đó đều kế thừa sai lệch này.'));
    if (o.hf) {
      if (o.hf.why.indexOf('heat') >= 0) out.push(tx('The formula was warming for a heat pattern: heat was added to heat.', 'Bài thuốc tính ôn dùng cho chứng nhiệt: lấy nhiệt chồng lên nhiệt.'));
      if (o.hf.why.indexOf('cold') >= 0) out.push(tx('The formula was cooling for a cold pattern: cold was added to cold.', 'Bài thuốc tính hàn lương dùng cho chứng hàn: lấy hàn chồng lên hàn.'));
      if (o.hf.why.indexOf('trap') >= 0) out.push(tx('Tonics given to an excess pattern "close the door with the thief inside" (闭门留寇).', 'Dùng thuốc bổ cho thực chứng là “đóng cửa giữ giặc” (bế môn lưu khấu).'));
      if (o.hf.why.indexOf('drain') >= 0) out.push(tx('Dispersing or clearing herbs further drained a deficient patient.', 'Thuốc phát tán, thanh tả làm người hư càng hư.'));
    }
    var dc = a.pharm && a.pharm.decoct;
    if (dc) {
      if (dc.burnt) out.push(tx('The decoction boiled dry, so the herbs had no effect at all.', 'Ấm thuốc cạn khô, thuốc hoàn toàn mất tác dụng.'));
      if (dc.flags.firstFail.indexOf('fu_zi') >= 0) out.push(tx('Fù Zǐ was not boiled first long enough, leaving toxic aconitine: the cause of the numbness and palpitations.', 'Phụ tử không được sắc trước đủ lâu nên còn độc tố aconitin: nguyên nhân gây tê môi, hồi hộp.'));
      if (dc.flags.laterFail.length) out.push(tx('Aromatic herbs were boiled too long and lost their volatile oils.', 'Các vị thơm bị sắc quá lâu nên mất tinh dầu.'));
      if (dc.flags.simmerOff) out.push(tx('The simmer time was wrong for this type of formula.', 'Thời gian sắc không phù hợp với loại bài thuốc này.'));
    }
    if (a.events.some(function (e) { return e.type === 'preg'; })) out.push(tx('A point forbidden in pregnancy was needled.', 'Đã châm huyệt cấm châm khi có thai.'));
    if (a.events.some(function (e) { return e.type === 'faint'; })) out.push(tx('A deficient patient was over-stimulated and fainted (晕针). Deficiency calls for gentle, reinforcing technique.', 'Người hư bị kích thích quá mạnh nên vựng châm (晕针). Hư chứng cần thủ thuật nhẹ nhàng, bổ pháp.'));
    if (o.notes.indexOf('moxaHeat') >= 0) out.push(tx('Moxa was applied to a heat pattern.', 'Đã cứu ngải cho chứng nhiệt.'));
    return out;
  }

  TCM.modules.followup = {
    han: '复', hidden: true,
    title: { en: 'Follow-up', vi: 'Tái khám' }, sub: { en: '', vi: '' },
    render: function (el) {
      var a = J.active;
      if (!a) { location.hash = 'clinic'; return; }
      var k = J.patient();
      var o = a.outcome || J.compute();
      var af = J.after(k, o);
      var h = '<div class="page">' + J.bar();
      if (o.cat === 'transfer') {
        var deep = D.deepTypes[a.transfer] || {};
        h += '<div class="panel stack"><h2>' + tx('Emergency transfer', 'Chuyển viện cấp cứu') + '</h2><div class="callout callout-bad"><b>' + TCM.esc(L(deep.hit || c('A serious needling complication.', 'Tai biến châm cứu nghiêm trọng.'))) + '</b><span>' +
          tx('The treatment stopped here and the patient was sent to hospital. In real practice this is reported as a serious adverse event.', 'Việc điều trị dừng tại đây và bệnh nhân được chuyển viện. Trong thực tế đây là sự cố y khoa nghiêm trọng cần báo cáo.') + '</span></div>' +
          '<p>' + tx('The herbs were never dispensed and the patient’s original illness is untreated.', 'Bệnh nhân chưa được bốc thuốc và bệnh ban đầu vẫn chưa được điều trị.') + '</p></div>';
      } else {
        var lines = statement(k, o);
        var catLbl = { much: tx('Much better', 'Đỡ nhiều'), better: tx('Somewhat better', 'Đỡ một phần'), same: tx('Unchanged', 'Không đổi'), worse: tx('Worse', 'Nặng hơn') }[o.cat];
        h += '<div class="clinic-grid"><div class="stack"><div class="room"><div class="room-stage" id="fu-stage">' + TCM.scene('clinic') +
          TCM.renderAvatar(af.av, { label: k.patient.name, tongue: D.tongue.body[af.tongue.body].fill }) + TCM.scene('clinic-fg') + '<div class="say-bubble" hidden></div></div></div>' +
          '<div class="panel stack"><p class="eyebrow">' + tx('Day 3 · the patient reports', 'Ngày 3 · bệnh nhân kể') + '</p>' + lines.map(function (x) { return '<p class="quote">“' + TCM.esc(x) + '”</p>'; }).join('') +
          '<div class="row"><span class="chip ' + (o.cat === 'much' ? 'chip-good' : o.cat === 'better' ? 'chip-good' : o.cat === 'same' ? 'chip-warn' : 'chip-bad') + '">' + catLbl + '</span><span class="small muted">' + tx('Severity ', 'Mức độ ') + o.S0 + ' → ' + o.S1 + '</span></div></div>' +
          '<div class="cols-2"><div class="panel stack"><p class="eyebrow">' + tx('Tongue today', 'Lưỡi hôm nay') + '</p><div class="tongue-stage">' + TCM.renderTongue(Object.assign({ seed: 5 }, af.tongue)) + '</div></div>' +
          '<div class="panel stack"><p class="eyebrow">' + tx('Pulse today', 'Mạch hôm nay') + '</p><div class="monitor"><canvas id="fu-canvas"></canvas></div><p class="small muted">' + af.pulse.map(function (q) { return TCM.esc(TCM.nmText(D.pulses[q])); }).join(' + ') + '</p></div></div></div>' +
          '<div class="stack"><div class="panel stack"><h3>' + tx('What caused this outcome', 'Nguyên nhân dẫn đến kết quả này') + '</h3>' + waterfall(o) + chain(k, a, o) +
          '<ul class="why-list">' + reasons(k, a, o).map(function (r) { return '<li>' + TCM.esc(r) + '</li>'; }).join('') + '</ul></div>';
        if (a.clinic && a.clinic.result) {
          h += '<div class="panel stack"><h4>' + tx('Your consultation, graded now that you know the outcome', 'Bài khám của bạn, chấm điểm khi đã biết kết quả') + '</h4>' +
            a.clinic.result.parts.map(function (p) { return '<div class="result-row"><div class="stack" style="gap:2px"><b>' + p.label + '</b><span class="small muted">' + tx('Expected: ', 'Đáp án: ') + TCM.esc(p.note) + '</span></div><span class="pts">' + p.pts + ' / ' + p.max + '</span></div>'; }).join('') +
            '<p>' + TCM.esc(L(k.teach)) + '</p></div>';
        }
        h += '</div></div>';
      }
      h += '<div class="row"><button type="button" class="btn btn-primary" id="fu-new">' + tx('Next patient', 'Bệnh nhân tiếp theo') + '</button><button type="button" class="btn" id="fu-again">' + tx('Treat this patient again from the start', 'Điều trị lại bệnh nhân này từ đầu') + '</button></div>' + TCM.disclaimer() + '</div>';
      el.innerHTML = h;
      J.wireBar(el);
      if (!a.scored) {
        a.scored = true;
        TCM.store.record('journey', o.cat === 'much' || o.cat === 'better');
        if (o.S1 != null) TCM.store.setCase('J_' + k.id, Math.max(0, 100 - o.S1));
      }
      var cv = TCM.$('#fu-canvas', el);
      if (cv) {
        var eng = new TCM.PulseEngine(cv);
        eng.set(TCM.composePulse(af.pulse)); eng.setPressure(TCM.composePulse(af.pulse).depth); eng.start();
      }
      var stg = TCM.$('#fu-stage', el);
      if (stg && o.cat !== 'transfer') setTimeout(function () { TCM.say(stg, statement(k, o)[0]); }, 400);
      TCM.$('#fu-new', el).addEventListener('click', function () {
        var i = D.cases.indexOf(k);
        var nk = D.cases[(i + 1) % D.cases.length];
        if (TCM.clinicReset) TCM.clinicReset(nk.id);
        J.start(nk.id);
      });
      TCM.$('#fu-again', el).addEventListener('click', function () { if (TCM.clinicReset) TCM.clinicReset(k.id); J.start(k.id); });
    }
  };
})();
