/* Lab overview: what each station trains, progress so far, and the shared heritage. */
(function () {
  'use strict';
  var TCM = window.TCM;
  var tx = TCM.tx;
  var confirming = false;

  var STATIONS = ['clinic', 'tongue', 'pulse', 'points', 'herbs', 'formulas', 'elements'];

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
        'Train the clinical eye and hand without a patient in the room. See virtual patients from first question to formula, read tongues, feel simulated pulses at three depths, locate acupoints on the body, and build decoctions with a checker that knows the classical incompatibilities.',
        'Rèn con mắt và đôi tay lâm sàng khi chưa có bệnh nhân thật. Khám bệnh nhân ảo từ câu hỏi đầu tiên đến bài thuốc, xem lưỡi, bắt mạch mô phỏng ở ba mức ấn, xác định huyệt trên cơ thể, và kê thang thuốc với công cụ kiểm tra các tương phản, tương úy kinh điển.'
      ) + '</p>');
      h.push('<div class="row"><a class="btn btn-primary" href="#clinic">' + tx('See your first patient', 'Khám bệnh nhân đầu tiên') + '</a><a class="btn" href="#tongue">' + tx('Practise tongue reading', 'Luyện xem lưỡi') + '</a></div>');
      h.push('</div><div class="hero-art"><p class="eyebrow" style="margin-bottom:10px">' + tx('The Four Examinations · 四诊 · Tứ chẩn', 'Tứ chẩn · 四诊 · The Four Examinations') + '</p><div class="four-exams">');
      exams.forEach(function (e) {
        h.push('<a class="exam" href="#' + e[3] + '" style="text-decoration:none;color:inherit"><span class="zh" lang="zh-Hans">' + e[0] + '</span><b>' + e[1] + '</b><small>' + e[2] + '</small></a>');
      });
      h.push('</div><p class="small muted" style="margin-top:10px">' + tx(
        'Every station uses all three naming systems: English, Vietnamese (Hán-Việt) and Chinese with pinyin.',
        'Mọi phần đều dùng ba cách gọi: tiếng Việt (Hán-Việt), chữ Hán kèm pinyin và tiếng Anh.'
      ) + '</p></div></section>');

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

      var r = TCM.$('#reset', el);
      if (r) r.addEventListener('click', function () { confirming = true; TCM.rerender(); });
      var y = TCM.$('#reset-yes', el);
      if (y) y.addEventListener('click', function () { TCM.store.reset(); confirming = false; TCM.rerender(); TCM.toast(tx('Progress cleared', 'Đã xóa tiến độ')); });
      var n = TCM.$('#reset-no', el);
      if (n) n.addEventListener('click', function () { confirming = false; TCM.rerender(); });
    }
  };
})();
