/* Lab overview: what each station trains, progress so far, and the shared heritage. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var tx = TCM.tx;
  var confirming = false;

  var STATIONS = ['clinic', 'treat', 'pharmacy', 'tongue', 'pulse', 'points', 'herbs', 'formulas', 'elements'];

  function progressFor(id) {
    if (id === 'clinic') {
      var cases = TCM.data.cases, done = 0, sum = 0;
      cases.forEach(function (k) { var b = TCM.store.caseBest(k.id); if (b != null) { done++; sum += b; } });
      return {
        pct: Math.round((100 * done) / cases.length),
        text: done ? tx(done + ' of ' + cases.length + ' patients seen · average ' + Math.round(sum / done), 'Đã khám ' + done + '/' + cases.length + ' bệnh nhân · điểm TB ' + Math.round(sum / done)) : tx('No patients seen yet', 'Chưa khám bệnh nhân nào')
      };
    }
    var s = TCM.store.stat(id);
    return {
      pct: TCM.pct(s),
      text: s.n ? tx(s.c + ' / ' + s.n + ' correct', 'Đúng ' + s.c + ' / ' + s.n) : tx('Not practised yet', 'Chưa luyện tập')
    };
  }

  function roomBg() {
    return '<svg class="room-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="300" style="fill:var(--surface-2)"/>' +
      '<rect x="40" y="30" width="62" height="118" rx="3" style="fill:var(--surface);stroke:var(--line)"/><text x="71" y="74" text-anchor="middle" font-size="24" font-family="Noto Serif SC, serif" font-weight="700" style="fill:var(--ink)" opacity=".7">仁</text><text x="71" y="106" text-anchor="middle" font-size="24" font-family="Noto Serif SC, serif" font-weight="700" style="fill:var(--ink)" opacity=".7">心</text>' +
      '<g opacity=".5"><rect x="290" y="30" width="80" height="170" rx="3" style="fill:var(--surface);stroke:var(--line)"/><path d="M290 72h80M290 114h80M290 156h80M330 30v170" style="stroke:var(--line)"/></g>' +
      '<rect x="0" y="262" width="400" height="38" style="fill:var(--bronze)" opacity=".3"/></svg>';
  }

  TCM.modules.home = {
    han: '堂',
    title: { en: 'Overview', vi: 'Tổng quan' },
    sub: { en: 'Start here', vi: 'Bắt đầu từ đây' },
    render: function (el) {
      var exams = [
        ['望', tx('Inspection', 'Vọng chẩn'), tx('look: spirit, colour, tongue', 'nhìn: thần, sắc, lưỡi'), 'tongue'],
        ['闻', tx('Listening & smelling', 'Văn chẩn'), tx('voice, breath, odour', 'tiếng nói, hơi thở, mùi'), 'clinic'],
        ['问', tx('Inquiry', 'Vấn chẩn'), tx('the Ten Questions', 'thập vấn'), 'clinic'],
        ['切', tx('Palpation', 'Thiết chẩn'), tx('pulse and body', 'bắt mạch, sờ nắn'), 'pulse']
      ];
      var h = [];
      h.push('<div class="page">');
      h.push('<section class="hero"><div class="stack">');
      h.push('<p class="eyebrow">' + tx('Vietnamese & Chinese traditional medicine', 'Y học cổ truyền Việt Nam & Trung Hoa') + '</p>');
      h.push('<h1>' + tx('Traditional Medicine Practice Lab', 'Phòng thực hành Y học cổ truyền') + '<span class="zh" lang="zh-Hans">中医 · 东医 实训室</span></h1>');
      h.push('<p class="lede muted" style="max-width:62ch">' + tx(
        'Practise with your hands, not just your memory. Examine illustrated patients with real tools: magnify the tongue, chat through the Ten Questions, place three fingers on the wrist and press for the pulse, palpate the abdomen. Then needle and moxa the points on a live tissue cross-section, and weigh and decoct your formula in the herbal pharmacy.',
        'Thực hành bằng đôi tay, không chỉ bằng trí nhớ. Khám bệnh nhân minh họa với dụng cụ thật: soi lưỡi bằng kính lúp, hỏi bệnh theo thập vấn, đặt ba ngón tay bắt mạch, sờ nắn bụng. Rồi châm cứu trên mặt cắt mô sống động, cân và sắc bài thuốc của bạn ở nhà thuốc.'
      ) + '</p>');
      h.push('<div class="row"><a class="btn btn-primary" href="#clinic">' + tx('Open the clinic', 'Vào phòng khám') + '</a><a class="btn" href="#treat">' + TCM.icon('needle', 16) + ' ' + tx('Treatment room', 'Phòng thủ thuật') + '</a><a class="btn" href="#pharmacy">' + TCM.icon('scale', 16) + ' ' + tx('Herbal pharmacy', 'Nhà thuốc') + '</a></div>');
      h.push('<div class="four-exams" style="margin-top:6px">');
      exams.forEach(function (e) {
        h.push('<a class="exam" href="#' + e[3] + '" style="text-decoration:none;color:inherit"><span class="zh" lang="zh-Hans">' + e[0] + '</span><b>' + e[1] + '</b><small>' + e[2] + '</small></a>');
      });
      h.push('</div></div>');
      var waiting = TCM.data.cases.filter(function (k) { return TCM.store.caseBest(k.id) == null; });
      if (waiting.length < 3) waiting = TCM.data.cases.slice();
      var three = waiting.slice(0, 3);
      h.push('<div class="hero-room">' + roomBg() + '<span class="chip tag">' + tx('Waiting room · ', 'Phòng chờ · ') + waiting.length + tx(' patients', ' bệnh nhân') + '</span><div class="queue">' +
        three.map(function (k) {
          var v = TCM.data.caseVisual[k.id] || { av: {} };
          var av = {}; for (var x in v.av) av[x] = v.av[x]; av.sex = k.patient.sex;
          return '<a href="#clinic" data-open="' + k.id + '" title="' + TCM.esc(k.patient.name + ': ' + TCM.L(k.cc)) + '">' + TCM.renderAvatar(av, { label: k.patient.name }) + '</a>';
        }).join('') + '</div></div></section>');

      h.push('<section class="stack"><h2>' + tx('Practice stations', 'Các trạm thực hành') + '</h2><div class="mod-grid">');
      STATIONS.forEach(function (id) {
        var m = TCM.modules[id];
        if (!m) return;
        var p = progressFor(id);
        h.push('<a class="mod-card" href="#' + id + '"><span class="glyph" lang="zh-Hans">' + m.han + '</span><span><h3>' + TCM.L(m.title) + '</h3><p>' + TCM.L(m.blurb) + '</p>' +
          '<span class="prog"><span class="meter" aria-hidden="true"><span style="width:' + p.pct + '%"></span></span><span>' + p.text + '</span></span></span></a>');
      });
      h.push('</div><div class="row">');
      if (confirming) {
        h.push('<span class="small">' + tx('Clear all scores and case results on this device?', 'Xóa toàn bộ điểm và kết quả ca bệnh trên thiết bị này?') + '</span><button type="button" class="btn btn-sm" id="reset-yes">' + tx('Clear progress', 'Xóa tiến độ') + '</button><button type="button" class="btn btn-sm btn-ghost" id="reset-no">' + tx('Keep it', 'Giữ lại') + '</button>');
      } else {
        h.push('<button type="button" class="btn btn-sm btn-ghost" id="reset">' + tx('Reset progress', 'Đặt lại tiến độ') + '</button><span class="small muted">' + tx('Progress is saved in this browser only.', 'Tiến độ chỉ lưu trong trình duyệt này.') + '</span>');
      }
      h.push('</div></section>');

      h.push('<section class="stack"><h2>' + tx('One body of knowledge, two traditions', 'Một nền y học, hai dòng chảy') + '</h2><div class="heritage">');
      h.push('<div class="panel"><h4>' + tx('Thuốc Bắc and Thuốc Nam', 'Thuốc Bắc và Thuốc Nam') + '</h4><p>' + tx(
        'Vietnamese practice draws on Chinese classical materia medica (thuốc Bắc, "northern medicine") and on local herbs (thuốc Nam, "southern medicine"). Herbs tagged Nam in the lab are widely grown or used in Vietnamese folk practice.',
        'Y học Việt Nam dùng cả dược liệu kinh điển Trung Hoa (thuốc Bắc) và cây thuốc bản địa (thuốc Nam). Các vị gắn nhãn “Nam” trong phòng thực hành là những vị được trồng hoặc dùng phổ biến trong dân gian Việt Nam.'
      ) + '</p></div>');
      h.push('<div class="panel"><h4>' + tx('Tuệ Tĩnh (14th century)', 'Tuệ Tĩnh (thế kỷ XIV)') + '</h4><p>' + tx(
        'Monk-physician who wrote Nam dược thần hiệu and taught "Nam dược trị Nam nhân": southern medicines for southern people, using what grows locally.',
        'Thiền sư, thầy thuốc, tác giả Nam dược thần hiệu, với tư tưởng “Nam dược trị Nam nhân”: dùng thuốc nam chữa bệnh cho người nam, lấy cây cỏ tại chỗ.'
      ) + '</p></div>');
      h.push('<div class="panel"><h4>' + tx('Hải Thượng Lãn Ông (1720–1791)', 'Hải Thượng Lãn Ông (1720–1791)') + '</h4><p>' + tx(
        'Lê Hữu Trác wrote Hải Thượng Y Tông Tâm Lĩnh, a 28-volume synthesis of Chinese classics and Vietnamese experience that still anchors Vietnamese traditional medical training.',
        'Lê Hữu Trác soạn Hải Thượng Y Tông Tâm Lĩnh gồm 28 tập, tổng hợp kinh điển Trung Hoa và kinh nghiệm Việt Nam, đến nay vẫn là nền tảng đào tạo y học cổ truyền.'
      ) + '</p></div>');
      h.push('</div></section>');
      h.push(TCM.disclaimer());
      h.push('</div>');
      el.innerHTML = h.join('');

      TCM.$$('[data-open]', el).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); TCM.openCase(a.getAttribute('data-open')); }); });
      var r = TCM.$('#reset', el);
      if (r) r.addEventListener('click', function () { confirming = true; TCM.rerender(); });
      var y = TCM.$('#reset-yes', el);
      if (y) y.addEventListener('click', function () { TCM.store.reset(); confirming = false; TCM.rerender(); TCM.toast(tx('Progress cleared', 'Đã xóa tiến độ')); });
      var n = TCM.$('#reset-no', el);
      if (n) n.addEventListener('click', function () { confirming = false; TCM.rerender(); });
    }
  };
})();
