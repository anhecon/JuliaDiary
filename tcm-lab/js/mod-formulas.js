/* Formula workshop (方剂 / Phương tễ): classical formulas, a decoction builder with
   incompatibility and safety checks, and a rebuild-the-formula drill. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var D = TCM.data;
  var tx = TCM.tx, L = TCM.L;

  var st = {
    mode: 'classical', sel: 'si_jun_zi_tang', pregnant: false, search: '',
    pot: [['ren_shen', 'Q', 9], ['bai_zhu', 'T', 9], ['fu_ling', 'Ta', 9], ['gan_cao', 'S', 6]],
    ch: null
  };
  var ROLE_KEYS = ['Q', 'T', 'Ta', 'S'];

  TCM.pot = {
    add: function (id) {
      if (st.pot.some(function (r) { return r[0] === id; })) return false;
      var h = D.herbById[id];
      st.pot.push([id, st.pot.length ? 'Ta' : 'Q', Math.round((h.dose[0] + h.dose[1]) / 2)]);
      return true;
    }
  };
  TCM.openFormula = function (id) {
    st.sel = id; st.mode = 'classical';
    if (location.hash === '#formulas') TCM.rerender(); else location.hash = 'formulas';
  };

  function herbName(id) { var h = D.herbById[id]; return TCM.nm(h, { enMain: 'py' }); }
  function roleTag(r) { var o = D.roles[r]; return '<span class="' + o.cls + '"><b>' + TCM.esc(L(o)) + '</b> <span class="zh" lang="zh-Hans">' + o.zh + '</span></span>'; }

  /* ---------- analysis shared by classical view and builder ---------- */
  function analyse(rows, pregnant) {
    var total = 0, heat = 0, fl = {}, mer = {}, warnings = [];
    rows.forEach(function (r) {
      var h = D.herbById[r[0]], dose = Math.max(0, Number(r[2]) || 0);
      total += dose;
      heat += D.natures[h.nat].v * dose;
      h.fl.forEach(function (f) { fl[f] = (fl[f] || 0) + dose / h.fl.length; });
      h.mer.forEach(function (m) { mer[m] = (mer[m] || 0) + 1; });
    });
    var ids = rows.map(function (r) { return r[0]; });
    function both(p) { return ids.indexOf(p[0]) >= 0 && ids.indexOf(p[1]) >= 0; }
    D.antagonisms.filter(both).forEach(function (p) {
      warnings.push({ lvl: 'bad', text: tx('18 antagonisms (十八反): ', 'Thập bát phản (十八反): ') + TCM.nmText(D.herbById[p[0]], 'py') + ' + ' + TCM.nmText(D.herbById[p[1]], 'py') + tx('. Traditionally never combined.', '. Theo truyền thống không được phối hợp.') });
    });
    D.fears.filter(both).forEach(function (p) {
      warnings.push({ lvl: 'bad', text: tx('19 fears (十九畏): ', 'Thập cửu úy (十九畏): ') + TCM.nmText(D.herbById[p[0]], 'py') + ' + ' + TCM.nmText(D.herbById[p[1]], 'py') + tx('. Traditionally avoided together.', '. Theo truyền thống tránh dùng chung.') });
    });
    rows.forEach(function (r) {
      var h = D.herbById[r[0]], dose = Number(r[2]) || 0, n = TCM.nmText(h, 'py');
      if (h.preg === 'contra') warnings.push({ lvl: pregnant ? 'bad' : 'warn', text: n + tx(': forbidden in pregnancy.', ': cấm dùng khi có thai.') });
      else if (h.preg === 'caution' && pregnant) warnings.push({ lvl: 'warn', text: n + tx(': use with caution in pregnancy.', ': thận trọng khi có thai.') });
      if (h.tox) warnings.push({ lvl: 'warn', text: n + tx(': toxic; preparation and dose must be controlled.', ': có độc; phải kiểm soát cách bào chế và liều lượng.') });
      if (dose > h.dose[1]) warnings.push({ lvl: 'warn', text: n + tx(': ' + dose + ' g is above the usual ' + h.dose[0] + '–' + h.dose[1] + ' g.', ': ' + dose + ' g vượt liều thường dùng ' + h.dose[0] + '–' + h.dose[1] + ' g.') });
      if (dose > 0 && dose < h.dose[0]) warnings.push({ lvl: 'info', text: n + tx(': ' + dose + ' g is below the usual range.', ': ' + dose + ' g thấp hơn liều thường dùng.') });
    });
    if (rows.length && !rows.some(function (r) { return r[1] === 'Q'; })) warnings.push({ lvl: 'info', text: tx('No chief (君) assigned: every formula needs a herb that addresses the main pattern.', 'Chưa có vị Quân (君): bài thuốc cần một vị chủ trị chứng chính.') });
    if (pregnant && !warnings.some(function (w) { return w.lvl === 'bad'; })) warnings.push({ lvl: 'info', text: tx('No herb here is on the classic pregnancy-forbidden list, but any herbal treatment in pregnancy needs a qualified practitioner.', 'Không có vị nào trong danh sách cấm dùng khi có thai, nhưng mọi điều trị bằng thuốc khi mang thai đều cần thầy thuốc có chuyên môn.') });
    var temp = total ? heat / total : 0;
    // closest classical formula by herb overlap
    var best = null;
    D.formulas.forEach(function (f) {
      var fids = f.herbs.map(function (x) { return x[0]; });
      var inter = fids.filter(function (x) { return ids.indexOf(x) >= 0; }).length;
      var uni = fids.length + ids.length - inter;
      var j = uni ? inter / uni : 0;
      if (!best || j > best.j) best = { f: f, j: j };
    });
    return { total: total, temp: temp, fl: fl, mer: mer, warnings: warnings, best: best };
  }

  function tempWord(v) {
    if (v >= 1.6) return tx('hot', 'nhiệt');
    if (v >= 0.5) return tx('warming', 'thiên ôn');
    if (v > -0.5) return tx('balanced', 'bình hòa');
    if (v > -1.6) return tx('cooling', 'thiên lương');
    return tx('cold', 'hàn');
  }

  function analysisHtml(a, showMatch) {
    var h = '<div class="stack"><div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Overall temperature', 'Tính chung của bài') + '</span>' +
      '<div class="thermo" role="img" aria-label="' + tempWord(a.temp) + '"><i style="left:' + ((a.temp + 3) / 6 * 100).toFixed(1) + '%"></i></div>' +
      '<div class="pressure-scale small"><span>' + tx('Cold 寒', 'Hàn 寒') + '</span><span><b>' + tempWord(a.temp) + '</b> <span class="mono">(' + (a.temp >= 0 ? '+' : '') + a.temp.toFixed(2) + ')</span></span><span>' + tx('Hot 热', 'Nhiệt 热') + '</span></div></div>';
    var fk = Object.keys(a.fl).sort(function (x, y) { return a.fl[y] - a.fl[x]; });
    if (fk.length) {
      h += '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Flavour balance (by dose)', 'Cơ cấu vị (theo liều)') + '</span><div class="bars">' + fk.map(function (f) {
        var pct = a.total ? Math.round(100 * a.fl[f] / a.total) : 0;
        return '<div class="bar"><span>' + TCM.esc(L(D.flavors[f])) + ' <span class="zh" lang="zh-Hans">' + D.flavors[f].zh + '</span></span><span class="meter"><span style="width:' + pct + '%"></span></span><span class="mono">' + pct + '%</span></div>';
      }).join('') + '</div></div>';
    }
    var mk = Object.keys(a.mer).sort(function (x, y) { return a.mer[y] - a.mer[x]; }).slice(0, 6);
    if (mk.length) {
      var mx = a.mer[mk[0]];
      h += '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Channels reached (number of herbs)', 'Quy kinh (số vị thuốc)') + '</span><div class="bars">' + mk.map(function (m) {
        return '<div class="bar"><span>' + TCM.esc(L(D.organs[m])) + '</span><span class="meter"><span style="width:' + Math.round(100 * a.mer[m] / mx) + '%"></span></span><span class="mono">' + a.mer[m] + '</span></div>';
      }).join('') + '</div></div>';
    }
    if (a.warnings.length) {
      h += '<div class="stack" style="gap:6px"><span class="eyebrow">' + tx('Safety and structure checks', 'Kiểm tra an toàn và cấu trúc') + '</span>' + a.warnings.map(function (w) {
        return '<div class="callout callout-' + (w.lvl === 'bad' ? 'bad' : w.lvl === 'warn' ? 'warn' : 'info') + '"><span>' + TCM.esc(w.text) + '</span></div>';
      }).join('') + '</div>';
    } else {
      h += '<div class="callout callout-good"><span>' + tx('No classical incompatibilities, pregnancy or dose flags.', 'Không có tương phản, tương úy, cảnh báo thai sản hay liều lượng.') + '</span></div>';
    }
    if (showMatch && a.best && a.best.j > 0) {
      h += '<div class="callout callout-info"><span class="eyebrow">' + tx('Closest classical formula', 'Bài cổ phương gần nhất') + '</span><span><button type="button" class="chip" data-f="' + a.best.f.id + '">' + TCM.esc(TCM.nmText(a.best.f, 'py')) + ' <span class="zh" lang="zh-Hans">' + a.best.f.zh + '</span></button> <span class="mono small">' + Math.round(a.best.j * 100) + tx('% herb overlap', '% trùng vị') + '</span></span></div>';
    }
    return h + '</div>';
  }

  /* ---------- classical formulas ---------- */
  function renderClassical(el) {
    var f = D.formulaById[st.sel] || D.formulas[0];
    var a = analyse(f.herbs, false);
    el.innerHTML = '<div class="split"><div class="stack"><div class="case-list">' + D.formulas.map(function (x) {
      return '<button type="button" class="case-card" data-sel="' + x.id + '"' + (x.id === f.id ? ' style="border-color:var(--jade);box-shadow:inset 0 0 0 1px var(--jade)"' : '') + '>' +
        '<span class="who">' + TCM.nm(x, { enMain: 'py' }) + '</span><span class="cc">' + TCM.esc(TCM.nmText(D.patterns[x.pattern])) + '</span>' +
        '<span class="foot"><span class="small muted">' + x.herbs.length + tx(' herbs', ' vị') + '</span></span></button>';
    }).join('') + '</div></div>' +
      '<div class="stack sticky-detail"><div class="panel formula-card"><div class="row" style="gap:14px;align-items:flex-start"><span class="detail-han" lang="zh-Hans" style="font-size:2rem">' + f.zh + '</span><div class="stack" style="gap:2px"><h3>' + TCM.esc(TCM.store.lang() === 'vi' ? f.vi : f.py) + '</h3><span class="small muted">' + TCM.esc(TCM.store.lang() === 'vi' ? f.py + ' · ' + f.en : f.vi + ' · ' + f.en) + '</span></div></div>' +
      '<dl class="kv"><dt>' + tx('Source', 'Xuất xứ') + '</dt><dd>' + TCM.esc(L(f.src)) + ' <span class="zh" lang="zh-Hans">' + f.src.zh + '</span></dd>' +
      '<dt>' + tx('Pattern', 'Chứng') + '</dt><dd>' + TCM.nm(D.patterns[f.pattern]) + '</dd>' +
      '<dt>' + tx('Method', 'Pháp trị') + '</dt><dd>' + TCM.nm(D.principles[f.principle]) + '</dd></dl>' +
      '<div class="table-wrap"><table class="grid-table role-table"><thead><tr><th>' + tx('Role', 'Vai trò') + '</th><th>' + tx('Herb', 'Vị thuốc') + '</th><th>' + tx('Dose', 'Liều') + '</th><th>' + tx('Nature', 'Tính') + '</th></tr></thead><tbody>' +
      f.herbs.map(function (r) {
        var h = D.herbById[r[0]];
        return '<tr><td>' + roleTag(r[1]) + '</td><td><button type="button" class="chip" data-h="' + h.id + '">' + herbName(h.id) + '</button></td><td class="mono">' + r[2] + ' g</td><td>' + TCM.esc(L(D.natures[h.nat])) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small">' + TCM.esc(L(f.note)) + '</p>' +
      '<div class="row"><button type="button" class="btn btn-primary btn-sm" id="fm-load">' + tx('Open in decoction builder', 'Mở trong phần kê thang') + '</button><button type="button" class="btn btn-sm" id="fm-drill">' + tx('Drill this formula', 'Luyện bài này') + '</button></div></div>' +
      '<div class="panel">' + analysisHtml(a, false) + '</div></div></div>';
    TCM.$$('[data-sel]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        st.sel = b.getAttribute('data-sel');
        renderClassical(el);
        if (window.matchMedia('(max-width: 1020px)').matches) { var d = TCM.$('.sticky-detail', el); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
    TCM.$$('[data-h]', el).forEach(function (b) { b.addEventListener('click', function () { TCM.openHerb(b.getAttribute('data-h')); }); });
    TCM.$('#fm-load', el).addEventListener('click', function () {
      st.pot = f.herbs.map(function (r) { return r.slice(); });
      st.mode = 'builder';
      TCM.rerender();
    });
    TCM.$('#fm-drill', el).addEventListener('click', function () { newChallenge(f.id); st.mode = 'challenge'; TCM.rerender(); });
  }

  /* ---------- builder ---------- */
  function renderBuilder(el) {
    var a = analyse(st.pot, st.pregnant);
    var q = TCM.norm(st.search);
    var sugg = q ? D.herbs.filter(function (h) {
      return TCM.norm([h.zh, h.py, h.vi, h.en, h.lat].join(' ')).indexOf(q) >= 0;
    }).slice(0, 8) : [];
    el.innerHTML = '<div class="split"><div class="stack"><div class="panel stack">' +
      '<div class="row" style="justify-content:space-between"><h3>' + tx('Decoction', 'Thang thuốc') + ' <span class="zh" lang="zh-Hans" style="color:var(--cinnabar)">汤</span></h3>' +
      '<label class="row small"><input type="checkbox" id="fm-preg"' + (st.pregnant ? ' checked' : '') + '> ' + tx('Patient is pregnant', 'Bệnh nhân đang mang thai') + '</label></div>' +
      '<div class="field"><label for="fm-search">' + tx('Add a herb', 'Thêm vị thuốc') + '</label><input class="input" id="fm-search" type="search" autocomplete="off" value="' + TCM.esc(st.search) + '" placeholder="' + tx('Type a name: huang qi, hoàng kỳ, 黄芪…', 'Gõ tên: hoàng kỳ, huang qi, 黄芪…') + '"></div>' +
      (sugg.length ? '<div class="row">' + sugg.map(function (h) { return '<button type="button" class="chip" data-add="' + h.id + '">+ ' + herbName(h.id) + '</button>'; }).join('') + '</div>' : (q ? '<p class="small muted">' + tx('No herb by that name in the library.', 'Không có vị thuốc tên này trong thư viện.') + '</p>' : '')) +
      (st.pot.length ? '<div class="pot">' + st.pot.map(function (r, i) {
        return '<div class="pot-row"><span>' + herbName(r[0]) + '</span>' +
          '<select class="input" data-role="' + i + '" aria-label="' + tx('Role', 'Vai trò') + '">' + ROLE_KEYS.map(function (k) { return '<option value="' + k + '"' + (r[1] === k ? ' selected' : '') + '>' + D.roles[k].zh + ' ' + TCM.esc(L(D.roles[k])) + '</option>'; }).join('') + '</select>' +
          '<input class="input mono" type="number" min="0" max="120" step="0.5" value="' + r[2] + '" data-dose="' + i + '" aria-label="' + tx('Dose in grams', 'Liều (gam)') + '">' +
          '<button type="button" class="btn btn-sm btn-ghost" data-rm="' + i + '" aria-label="' + tx('Remove', 'Bỏ') + '">×</button></div>';
      }).join('') + '</div>' : '<p class="muted small">' + tx('The pot is empty. Add herbs above, or load a classical formula.', 'Thang đang trống. Thêm vị thuốc ở trên, hoặc mở một bài cổ phương.') + '</p>') +
      '<div class="row"><span class="small muted">' + tx('Total', 'Tổng') + ' <b class="mono">' + a.total + ' g</b> · ' + st.pot.length + tx(' herbs', ' vị') + '</span>' +
      (st.pot.length ? '<button type="button" class="btn btn-sm btn-ghost" id="fm-clear">' + tx('Empty the pot', 'Đổ bỏ thang') + '</button>' : '') + '</div>' +
      '<p class="small muted">' + tx('Try adding Gān Suì or Hǎi Zǎo to a formula with Gān Cǎo, or Fù Zǐ with Bàn Xià, to see the classical incompatibility checks.', 'Thử thêm Cam toại hoặc Hải tảo vào bài có Cam thảo, hoặc Phụ tử với Bán hạ, để xem cảnh báo tương phản kinh điển.') + '</p>' +
      '</div></div><div class="stack sticky-detail"><div class="panel">' + analysisHtml(a, true) + '</div></div></div>';

    var s = TCM.$('#fm-search', el);
    s.addEventListener('input', function () {
      st.search = s.value;
      var pos = s.selectionStart;
      renderBuilder(el);
      var ns = TCM.$('#fm-search', el);
      ns.focus();
      try { ns.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
    });
    TCM.$('#fm-preg', el).addEventListener('change', function (e) { st.pregnant = e.target.checked; renderBuilder(el); });
    TCM.$$('[data-add]', el).forEach(function (b) { b.addEventListener('click', function () { TCM.pot.add(b.getAttribute('data-add')); st.search = ''; renderBuilder(el); }); });
    TCM.$$('[data-role]', el).forEach(function (sel) { sel.addEventListener('change', function () { st.pot[+sel.getAttribute('data-role')][1] = sel.value; renderBuilder(el); }); });
    TCM.$$('[data-dose]', el).forEach(function (inp) {
      inp.addEventListener('change', function () { st.pot[+inp.getAttribute('data-dose')][2] = Math.max(0, Number(inp.value) || 0); renderBuilder(el); });
    });
    TCM.$$('[data-rm]', el).forEach(function (b) { b.addEventListener('click', function () { st.pot.splice(+b.getAttribute('data-rm'), 1); renderBuilder(el); }); });
    var cl = TCM.$('#fm-clear', el);
    if (cl) cl.addEventListener('click', function () { st.pot = []; renderBuilder(el); });
    TCM.$$('[data-f]', el).forEach(function (b) { b.addEventListener('click', function () { TCM.openFormula(b.getAttribute('data-f')); }); });
  }

  /* ---------- rebuild challenge ---------- */
  function newChallenge(id) {
    var f = id ? D.formulaById[id] : TCM.pick(D.formulas.filter(function (x) { return !st.ch || x.id !== st.ch.id; }));
    var fids = f.herbs.map(function (r) { return r[0]; });
    var cats = fids.map(function (x) { return D.herbById[x].cat; });
    var near = D.herbs.filter(function (h) { return fids.indexOf(h.id) < 0 && h.cat !== 'emetic' && cats.indexOf(h.cat) >= 0; }).map(function (h) { return h.id; });
    var far = D.herbs.filter(function (h) { return fids.indexOf(h.id) < 0 && h.cat !== 'emetic' && near.indexOf(h.id) < 0; }).map(function (h) { return h.id; });
    var extra = TCM.sample(near, Math.min(near.length, 4));
    extra = extra.concat(TCM.sample(far, Math.max(0, 12 - fids.length - extra.length)));
    st.ch = { id: f.id, pool: TCM.shuffle(fids.concat(extra)), picked: [], chief: null, stage: 'pick' };
  }

  function renderChallenge(el) {
    if (!st.ch) newChallenge();
    var c = st.ch, f = D.formulaById[c.id];
    var fids = f.herbs.map(function (r) { return r[0]; });
    var chiefs = f.herbs.filter(function (r) { return r[1] === 'Q'; }).map(function (r) { return r[0]; });
    var s = TCM.store.stat('formulas');
    var checked = c.stage === 'done';
    var h = '<div class="split"><div class="panel stack"><p class="eyebrow">' + tx('Rebuild the formula', 'Dựng lại bài thuốc') + '</p>' +
      '<div class="row" style="gap:14px"><span class="detail-han" lang="zh-Hans" style="font-size:2rem">' + f.zh + '</span><div><h3>' + TCM.esc(TCM.store.lang() === 'vi' ? f.vi : f.py) + '</h3><span class="small muted">' + TCM.esc(f.en) + '</span></div></div>' +
      '<dl class="kv"><dt>' + tx('Treats', 'Chủ trị') + '</dt><dd>' + TCM.nm(D.patterns[f.pattern]) + '</dd><dt>' + tx('Herbs', 'Số vị') + '</dt><dd class="mono">' + fids.length + '</dd></dl>' +
      '<p class="small muted">' + (c.stage === 'pick' ? tx('Select every herb in the formula, then check.', 'Chọn đủ các vị trong bài rồi kiểm tra.') : c.stage === 'chief' ? tx('Right herbs. Now tap the chief (君 Quân).', 'Đúng các vị. Giờ hãy chọn vị Quân (君).') : '') + '</p>' +
      '<div class="row">' + c.pool.map(function (id) {
        var on = c.picked.indexOf(id) >= 0, cls = 'chip';
        if (checked || c.stage === 'chief') {
          if (fids.indexOf(id) >= 0 && on) cls += ' chip-good';
          else if (on) cls += ' chip-bad';
          else if (fids.indexOf(id) >= 0) cls += ' chip-warn';
        }
        if (c.stage === 'chief' && c.chief === id) cls += '';
        return '<button type="button" class="' + cls + '" data-p="' + id + '" aria-pressed="' + (c.stage === 'chief' ? c.chief === id : on) + '"' + (checked ? ' disabled' : '') + '>' + herbName(id) + '</button>';
      }).join('') + '</div>';
    if (c.stage === 'pick') h += '<div class="row"><button type="button" class="btn btn-primary" id="ch-check"' + (c.picked.length ? '' : ' disabled') + '>' + tx('Check herbs', 'Kiểm tra') + '</button></div>';
    if (checked) {
      var ok = c.result;
      h += '<div class="callout ' + (ok ? 'callout-good' : 'callout-bad') + '"><b>' + (ok ? tx('Correct, chief included.', 'Chính xác, chọn đúng cả vị Quân.') : c.why) + '</b><span>' + tx('Green: correct. Amber: missed. Red: not in this formula.', 'Xanh: đúng. Vàng: bỏ sót. Đỏ: không có trong bài.') + '</span></div>' +
        '<div class="row"><button type="button" class="btn btn-primary" id="ch-next">' + tx('Next formula', 'Bài tiếp theo') + '</button><button type="button" class="btn" id="ch-view">' + tx('Study this formula', 'Xem bài này') + '</button></div>';
    }
    h += '<p class="small muted">' + tx('Score this device: ', 'Điểm trên thiết bị này: ') + '<span class="mono">' + s.c + ' / ' + s.n + '</span></p></div>';
    if (checked) {
      h += '<div class="panel stack"><h4>' + tx('Composition', 'Thành phần') + '</h4><div class="table-wrap"><table class="grid-table role-table"><tbody>' +
        f.herbs.map(function (r) { return '<tr><td>' + roleTag(r[1]) + '</td><td>' + herbName(r[0]) + '</td><td class="mono">' + r[2] + ' g</td></tr>'; }).join('') +
        '</tbody></table></div><p class="small">' + TCM.esc(L(f.note)) + '</p></div>';
    } else {
      h += '<div class="panel stack"><h4>' + tx('The four roles', 'Bốn vai trò') + ' · 君臣佐使</h4><dl class="kv">' +
        '<dt>' + roleTag('Q') + '</dt><dd class="small">' + tx('Treats the main pattern or symptom.', 'Trị chứng hoặc triệu chứng chính.') + '</dd>' +
        '<dt>' + roleTag('T') + '</dt><dd class="small">' + tx('Strengthens the chief or treats a secondary pattern.', 'Hỗ trợ vị Quân hoặc trị chứng kèm theo.') + '</dd>' +
        '<dt>' + roleTag('Ta') + '</dt><dd class="small">' + tx('Treats accompanying symptoms, or moderates the toxicity or harshness of the chief and deputy.', 'Trị triệu chứng phụ, hoặc giảm độc tính, tính mãnh liệt của Quân, Thần.') + '</dd>' +
        '<dt>' + roleTag('S') + '</dt><dd class="small">' + tx('Guides the formula to a channel or harmonises all the herbs.', 'Dẫn thuốc vào kinh hoặc điều hòa các vị.') + '</dd></dl></div>';
    }
    h += '</div>';
    el.innerHTML = h;

    TCM.$$('[data-p]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-p');
        if (c.stage === 'pick') {
          var i = c.picked.indexOf(id);
          if (i >= 0) c.picked.splice(i, 1); else c.picked.push(id);
        } else if (c.stage === 'chief') {
          if (c.picked.indexOf(id) < 0) return;
          c.chief = id;
          c.stage = 'done';
          c.result = chiefs.indexOf(id) >= 0;
          c.why = c.result ? '' : tx('Right herbs, but the chief is ', 'Đúng các vị, nhưng vị Quân là ') + chiefs.map(function (x) { return TCM.nmText(D.herbById[x], 'py'); }).join(' + ') + '.';
          TCM.store.record('formulas', c.result);
        }
        renderChallenge(el);
      });
    });
    var ck = TCM.$('#ch-check', el);
    if (ck) ck.addEventListener('click', function () {
      var exact = c.picked.length === fids.length && c.picked.every(function (x) { return fids.indexOf(x) >= 0; });
      if (exact) c.stage = 'chief';
      else {
        c.stage = 'done';
        c.result = false;
        var missed = fids.filter(function (x) { return c.picked.indexOf(x) < 0; }).length;
        var wrong = c.picked.filter(function (x) { return fids.indexOf(x) < 0; }).length;
        c.why = tx('Not yet: ' + missed + ' missed, ' + wrong + ' extra.', 'Chưa đúng: thiếu ' + missed + ' vị, thừa ' + wrong + ' vị.');
        TCM.store.record('formulas', false);
      }
      renderChallenge(el);
    });
    var nx = TCM.$('#ch-next', el);
    if (nx) nx.addEventListener('click', function () { newChallenge(); renderChallenge(el); });
    var vw = TCM.$('#ch-view', el);
    if (vw) vw.addEventListener('click', function () { TCM.openFormula(c.id); });
  }

  TCM.modules.formulas = {
    han: '方',
    title: { en: 'Formula workshop', vi: 'Phương tễ' },
    sub: { en: 'Phương tễ · 方剂', vi: 'Bài thuốc · 方剂' },
    blurb: { en: 'Sixteen classical formulas with chief–deputy–assistant–envoy roles, a decoction builder that flags incompatibilities and pregnancy risks, and a rebuild drill.', vi: 'Mười sáu bài cổ phương với vai trò Quân – Thần – Tá – Sứ, công cụ kê thang cảnh báo tương kỵ và nguy cơ khi có thai, cùng bài luyện dựng lại bài thuốc.' },
    render: function (el) {
      el.innerHTML = '<div class="page">' + TCM.pageHead('方', tx('Formula workshop', 'Phương tễ'),
        tx('A formula is a team: the chief (君) treats the main pattern, the deputy (臣) supports it, assistants (佐) treat side issues or temper harshness, and the envoy (使) guides and harmonises.',
          'Bài thuốc là một tập thể: Quân (君) trị chứng chính, Thần (臣) hỗ trợ, Tá (佐) trị chứng phụ hoặc chế bớt tính mãnh liệt, Sứ (使) dẫn thuốc và điều hòa.')) +
        '<div class="tabs" role="tablist">' + [['classical', tx('Classical formulas', 'Bài cổ phương')], ['builder', tx('Decoction builder', 'Kê thang thuốc')], ['challenge', tx('Rebuild drill', 'Luyện dựng bài')]].map(function (t) {
          return '<button type="button" class="tab" role="tab" data-mode="' + t[0] + '" aria-selected="' + (st.mode === t[0]) + '">' + t[1] + '</button>';
        }).join('') + '</div><div id="fm-body"></div>' + TCM.disclaimer() + '</div>';
      TCM.$$('[data-mode]', el).forEach(function (b) { b.addEventListener('click', function () { st.mode = b.getAttribute('data-mode'); TCM.rerender(); }); });
      var body = TCM.$('#fm-body', el);
      if (st.mode === 'builder') renderBuilder(body);
      else if (st.mode === 'challenge') renderChallenge(body);
      else renderClassical(body);
    }
  };
})();
