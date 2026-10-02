/* Data for the hands-on simulations: patient appearance and bedside findings,
   needling parameters for each point, herb appearance and decoction rules. */
(function () {
  'use strict';
  var D = window.TCM.data;
  function c(en, vi) { return { en: en, vi: vi }; }

  /* ---------- patients: look, temperature, touch, abdominal palpation ---------- */
  var SOFT = c('Soft, no tenderness.', 'Mềm, ấn không đau.');
  D.caseVisual = {
    c_wind_cold: {
      av: { skin: 'pale', mood: 'tired', hair: 'black', style: 'short', shirt: '#4f6d8a', extras: ['shiver', 'jacket', 'runny'] },
      temp: 37.8, touch: c('Forehead slightly warm, but he says he is freezing. Skin dry, no sweat.', 'Trán hơi ấm nhưng bệnh nhân kêu rét. Da khô, không mồ hôi.'),
      abd: {}
    },
    c_wind_heat: {
      av: { skin: 'flushed', mood: 'worried', hair: 'black', style: 'long', shirt: '#b5677a', extras: ['sweat'] },
      temp: 38.3, touch: c('Skin warm and a little damp.', 'Da ấm, hơi ẩm.'),
      abd: { lower: { t: c('Uterus palpable at the level of the navel, consistent with 20 weeks of pregnancy. Examine gently.', 'Sờ thấy đáy tử cung ngang rốn, phù hợp thai 20 tuần. Khám nhẹ nhàng.'), r: 'none' } }
    },
    c_sp_qi: {
      av: { skin: 'sallow', mood: 'tired', hair: 'black', style: 'bun', shirt: '#8a7a5a', extras: ['puffy'] },
      temp: 36.5, touch: c('Hands slightly cool. Skin moist from light sweating.', 'Bàn tay hơi lạnh. Da hơi ẩm mồ hôi.'),
      abd: {
        epi: { t: c('Soft and slightly distended. Pressing feels comfortable to her.', 'Mềm, hơi chướng. Ấn vào bệnh nhân thấy dễ chịu.'), r: 'relief' },
        umb: { t: c('Soft, with gurgling bowel sounds.', 'Mềm, nghe tiếng óc ách trong ruột.'), r: 'none' }
      }
    },
    c_liver_qi: {
      av: { skin: 'sallow', mood: 'tense', hair: 'black', style: 'long', shirt: '#2f5d62', extras: [] },
      temp: 36.7, touch: c('Hands normal temperature; shoulders very tight.', 'Tay ấm bình thường; vai gáy rất căng.'),
      abd: {
        rhyp: { t: c('Distension and discomfort below the right rib margin.', 'Đầy tức, khó chịu dưới bờ sườn phải.'), r: 'tender' },
        lhyp: { t: c('Distension and discomfort below the left rib margin.', 'Đầy tức, khó chịu dưới bờ sườn trái.'), r: 'tender' }
      }
    },
    c_kidney_yin: {
      av: { skin: 'malar', mood: 'worried', hair: 'grey', style: 'bun', shirt: '#6b5b7a', extras: ['glasses', 'thin'] },
      temp: 37.2, touch: c('Palms and soles hot to the touch. Lower back tender to firm pressure.', 'Lòng bàn tay, bàn chân nóng. Ấn mạnh vùng thắt lưng thì đau mỏi.'),
      abd: {}
    },
    c_sp_yang: {
      av: { skin: 'pale', mood: 'tired', hair: 'grey', style: 'short', shirt: '#6d6a4f', extras: ['jacket', 'puffy'] },
      temp: 36.2, touch: c('Hands and feet cold. Abdomen cool to the touch.', 'Tay chân lạnh. Bụng sờ thấy lạnh.'),
      abd: {
        epi: { t: c('Cool to the touch. The dull ache eases when you press.', 'Sờ thấy lạnh. Ấn vào thì cơn đau âm ỉ dịu đi.'), r: 'relief' },
        umb: { t: c('Cool, soft, slight gurgling.', 'Lạnh, mềm, hơi óc ách.'), r: 'relief' }
      }
    },
    c_yangming: {
      av: { skin: 'flushed', mood: 'restless', hair: 'black', style: 'short', shirt: '#c9c3b5', extras: ['sweat'] },
      temp: 39.5, touch: c('Burning hot skin, drenched in sweat.', 'Da nóng bỏng, đẫm mồ hôi.'),
      abd: { epi: { t: c('Soft. No fullness, no hardness, no pain on pressure.', 'Mềm. Không đầy, không cứng, ấn không đau.'), r: 'none' } }
    },
    c_phlegm: {
      av: { skin: 'normal', mood: 'neutral', hair: 'black', style: 'short', shirt: '#8a3b2e', extras: ['heavy'] },
      temp: 36.8, touch: c('Skin slightly clammy.', 'Da hơi nhớp.'),
      abd: {
        epi: { t: c('Full, soft and flabby; a splashing sound when you jostle it (振水音).', 'Đầy, mềm nhão; lắc nghe tiếng óc ách (chấn thủy âm).'), r: 'full' },
        umb: { t: c('Soft and flabby.', 'Mềm nhão.'), r: 'none' }
      }
    },
    c_blood_def: {
      av: { skin: 'pale', mood: 'tired', hair: 'black', style: 'long', shirt: '#9bb7c9', extras: [] },
      temp: 36.5, touch: c('Skin dry; nails pale and brittle.', 'Da khô; móng tay nhợt, dễ gãy.'),
      abd: { lower: { t: c('Soft. Uterus not palpable (four months after delivery).', 'Mềm. Không sờ thấy tử cung (sau sinh bốn tháng).'), r: 'none' } }
    },
    c_insomnia: {
      av: { skin: 'normal', mood: 'tired', hair: 'grey', style: 'short', shirt: '#3d4a5c', extras: ['glasses', 'darkCircles'] },
      temp: 36.9, touch: c('Palms slightly warm and damp.', 'Lòng bàn tay hơi ấm, ẩm.'),
      abd: {}
    },
    c_shaoyang: {
      av: { skin: 'sallow', mood: 'worried', hair: 'black', style: 'bun', shirt: '#7a8a6a', extras: [] },
      temp: 37.6, touch: c('Warm one moment, she says she is chilly the next.', 'Lúc sờ thấy ấm, bệnh nhân lại kêu ớn lạnh.'),
      abd: {
        rhyp: { t: c('Fullness and discomfort below the ribs (胸胁苦满).', 'Đầy tức khó chịu dưới sườn (hung hiếp khổ mãn).'), r: 'tender' },
        lhyp: { t: c('Fullness below the left ribs.', 'Đầy tức dưới sườn trái.'), r: 'tender' }
      }
    }
  };
  D.abdZones = [
    { id: 'rhyp', zh: '右胁下', vi: 'Hạ sườn phải', en: 'Right below the ribs' },
    { id: 'epi', zh: '心下 · 胃脘', vi: 'Thượng vị', en: 'Epigastrium' },
    { id: 'lhyp', zh: '左胁下', vi: 'Hạ sườn trái', en: 'Left below the ribs' },
    { id: 'umb', zh: '脐周', vi: 'Quanh rốn', en: 'Around the navel' },
    { id: 'lower', zh: '小腹', vi: 'Bụng dưới', en: 'Lower abdomen' }
  ];
  D.abdSoft = SOFT;

  /* ---------- needling: angle, depth (cun along the needle), deep structure (vertical cun) ---------- */
  function N(a, d, t, at, moxa) { return { a: a, d: d, deep: { t: t, at: at }, moxa: !!moxa }; }
  D.needling = {
    LU1: N(['obl'], [0.5, 0.8], 'lung', 0.9), LU7: N(['trans', 'obl'], [0.3, 0.5], 'bone', 0.4),
    LI4: N(['perp'], [0.5, 1], 'bone', 1.3, 1), LI11: N(['perp'], [1, 1.5], 'bone', 2, 1), LI20: N(['obl', 'trans'], [0.3, 0.5], 'bone', 0.4),
    ST25: N(['perp'], [1, 1.5], 'organ', 2.2, 1), ST36: N(['perp'], [1, 1.5], 'bone', 2.2, 1), ST40: N(['perp'], [1, 1.5], 'bone', 2, 1),
    SP6: N(['perp'], [1, 1.5], 'bone', 1.8, 1), SP9: N(['perp'], [1, 2], 'bone', 2.4, 1), SP10: N(['perp'], [1, 1.5], 'bone', 2.2, 1),
    HT7: N(['perp'], [0.3, 0.5], 'artery', 0.7), PC6: N(['perp'], [0.5, 1], 'bone', 1.3), TE5: N(['perp'], [0.5, 1], 'bone', 1.3, 1),
    BL13: N(['obl'], [0.5, 0.8], 'lung', 0.9, 1), BL15: N(['obl'], [0.5, 0.8], 'lung', 0.9), BL18: N(['obl'], [0.5, 0.8], 'lung', 0.9, 1),
    BL20: N(['obl'], [0.5, 0.8], 'lung', 1, 1), BL23: N(['perp'], [1, 1.5], 'organ', 2.2, 1), BL40: N(['perp'], [1, 1.5], 'artery', 1.7),
    BL57: N(['perp'], [1, 2], 'bone', 2.6, 1), BL60: N(['perp'], [0.5, 0.8], 'bone', 1), KI3: N(['perp'], [0.5, 1], 'bone', 1.2, 1),
    GB20: N(['obl'], [0.8, 1.2], 'medulla', 1.3), GB21: N(['perp'], [0.5, 0.8], 'lung', 0.9), GB34: N(['perp'], [1, 1.5], 'bone', 2, 1),
    LR3: N(['perp'], [0.5, 0.8], 'bone', 1), GV4: N(['perp'], [0.5, 1], 'spine', 1.3, 1), GV14: N(['obl'], [0.5, 1], 'spine', 1.2, 1),
    GV20: N(['trans'], [0.5, 0.8], 'bone', 0.25, 1), CV4: N(['perp'], [1, 1.5], 'organ', 2.2, 1), CV6: N(['perp'], [1, 1.5], 'organ', 2.2, 1),
    CV12: N(['perp'], [1, 1.5], 'organ', 2, 1), CV17: N(['trans'], [0.3, 0.5], 'bone', 0.25, 1), 'EX-HN3': N(['trans'], [0.3, 0.5], 'bone', 0.2),
    'EX-HN5': N(['perp', 'obl'], [0.3, 0.5], 'bone', 0.6)
  };
  D.angles = {
    perp: { deg: 90, zh: '直刺', vi: 'Châm thẳng (90°)', en: 'Perpendicular (90°)' },
    obl: { deg: 45, zh: '斜刺', vi: 'Châm xiên (45°)', en: 'Oblique (45°)' },
    trans: { deg: 15, zh: '平刺', vi: 'Châm luồn kim (15°)', en: 'Transverse (15°)' }
  };
  D.deepTypes = {
    bone: { en: 'bone', vi: 'xương', col: '#efe7d4', hit: c('The needle tip hits bone: a sharp ache. Back off a little.', 'Mũi kim chạm xương: đau buốt. Rút lui kim một chút.'), serious: false },
    lung: { en: 'pleura and lung', vi: 'màng phổi và phổi', col: '#f2b8c0', hit: c('You have passed the pleura: risk of pneumothorax. Sudden chest pain and breathlessness. Withdraw at once and monitor the patient.', 'Kim đã qua màng phổi: nguy cơ tràn khí màng phổi. Đau ngực đột ngột, khó thở. Rút kim ngay và theo dõi bệnh nhân.'), serious: true },
    artery: { en: 'artery', vi: 'động mạch', col: '#c0392b', hit: c('You have punctured the artery: bleeding and a haematoma. Withdraw and press firmly.', 'Kim chọc vào động mạch: chảy máu, tụ máu. Rút kim và ấn chặt.'), serious: true },
    spine: { en: 'spinal canal', vi: 'ống sống', col: '#d9c7e8', hit: c('Electric shock sensation down the limbs: the tip is near the spinal cord. Withdraw immediately.', 'Cảm giác điện giật lan xuống chân tay: mũi kim gần tủy sống. Rút kim ngay lập tức.'), serious: true },
    medulla: { en: 'brainstem', vi: 'hành tủy', col: '#d9c7e8', hit: c('Too deep and too medial at the base of the skull: danger to the medulla. Withdraw immediately.', 'Quá sâu, quá vào trong ở đáy sọ: nguy hiểm cho hành tủy. Rút kim ngay lập tức.'), serious: true },
    organ: { en: 'abdominal organs', vi: 'tạng trong ổ bụng', col: '#e8a98c', hit: c('You have entered the peritoneal cavity: risk of injuring the bowel or bladder. Withdraw.', 'Kim đã vào ổ phúc mạc: nguy cơ tổn thương ruột, bàng quang. Rút kim.'), serious: true }
  };

  /* ---------- herbs: appearance and decoction method ---------- */
  D.herbLook = {
    ren_shen: ['#e6cf9c', 'root'], huang_qi: ['#e8cf7a', 'slice'], bai_zhu: ['#d9b98a', 'slice'], shan_yao: ['#f1ece0', 'slice'],
    gan_cao: ['#e2bf55', 'slice'], da_zao: ['#9b2a1e', 'berry'], jing_mi: ['#f4f1e8', 'seed'], dang_gui: ['#a8743f', 'slice'],
    shu_di: ['#2b1b17', 'chunk'], bai_shao: ['#f0e6d4', 'slice'], he_shou_wu: ['#5a2d22', 'chunk'], gou_qi_zi: ['#d6372a', 'berry'],
    mai_dong: ['#efe2b8', 'seed'], mo_han_lian: ['#3e5a35', 'leaf'], wu_wei_zi: ['#6b1f25', 'berry'], shan_zhu_yu: ['#8e2f2a', 'chunk'],
    chi_shi_zhi: ['#b5533c', 'mineral'], ma_huang: ['#7f9a4a', 'stem'], gui_zhi: ['#9a6a3d', 'stem'], sheng_jiang: ['#e2c47c', 'slice'],
    zi_su_ye: ['#6b3b6e', 'leaf'], jing_jie: ['#7b8a52', 'stem'], xi_xin: ['#7a6346', 'root'], bo_he: ['#5f8f4f', 'leaf'],
    niu_bang_zi: ['#6e6252', 'seed'], sheng_ma: ['#4d3a2c', 'chunk'], ge_gen: ['#e9ddc2', 'slice'], chai_hu: ['#8b6b45', 'root'],
    jin_yin_hua: ['#e8d68c', 'flower'], lian_qiao: ['#a37c4b', 'seed'], shi_gao: ['#f6f4ef', 'mineral'], zhi_mu: ['#c9a46a', 'slice'],
    huang_lian: ['#c9a227', 'root'], huang_qin: ['#d8b452', 'slice'], huang_bai: ['#d9b93a', 'bark'], zhi_zi: ['#c8562a', 'berry'],
    mu_dan_pi: ['#a07a63', 'bark'], yu_xing_cao: ['#5d7a43', 'leaf'], ji_xue_cao: ['#4f8a3c', 'leaf'], da_huang: ['#9b5b2c', 'chunk'],
    gan_sui: ['#e8d9b0', 'root'], fu_ling: ['#f2ede2', 'chunk'], ze_xie: ['#efe6cf', 'slice'], sha_ren: ['#7d6046', 'seed'],
    chen_pi: ['#c9762d', 'bark'], mu_xiang: ['#9c7b55', 'slice'], fu_zi: ['#6d5440', 'slice'], gan_jiang: ['#e0c88f', 'slice'],
    rou_gui: ['#7a3e22', 'bark'], ding_xiang: ['#5b3420', 'seed'], chuan_xiong: ['#b8925c', 'slice'], dan_shen: ['#8a2a1f', 'root'],
    tao_ren: ['#c99a6b', 'seed'], hong_hua: ['#d8461e', 'flower'], yi_mu_cao: ['#6f8a4a', 'stem'], yu_jin: ['#c49a3a', 'slice'],
    wu_ling_zhi: ['#4a3a30', 'chunk'], ai_ye: ['#8fa080', 'leaf'], ban_xia: ['#e6dcc4', 'seed'], xing_ren: ['#c58f5a', 'seed'],
    jie_geng: ['#efe5cf', 'slice'], chuan_bei_mu: ['#f3efe3', 'seed'], gua_lou: ['#d39a3c', 'chunk'], hai_zao: ['#3a3b2a', 'stem'],
    suan_zao_ren: ['#8b3b26', 'seed'], li_lu: ['#4b4038', 'root']
  };
  /* 先煎 decoct first, 后下 add near the end. Everything else is decocted normally. */
  D.herbPrep = {
    shi_gao: 'first', fu_zi: 'first', chi_shi_zhi: 'first',
    bo_he: 'later', sha_ren: 'later', mu_xiang: 'later', rou_gui: 'later', yu_xing_cao: 'later', ding_xiang: 'later'
  };
  D.prepNames = {
    first: { zh: '先煎', vi: 'Sắc trước', en: 'Decoct first' },
    later: { zh: '后下', vi: 'Cho vào sau', en: 'Add near the end' },
    normal: { zh: '同煎', vi: 'Sắc cùng', en: 'Decoct together' }
  };
  /* Simmer time (minutes after the main herbs go in) by formula type. */
  D.decoction = {
    exterior: { min: 15, max: 25, water: 2, en: 'Exterior-releasing: short, brisk decoction to keep the aromatic, dispersing qi.', vi: 'Thuốc giải biểu: sắc nhanh, lửa vừa để giữ khí thơm, tính phát tán.' },
    tonic: { min: 40, max: 60, water: 4, en: 'Tonics: long, gentle simmer to draw out the rich, heavy substance.', vi: 'Thuốc bổ: sắc lâu, lửa nhỏ để chiết hết chất bổ đậm đặc.' },
    standard: { min: 25, max: 35, water: 3, en: 'Standard decoction.', vi: 'Sắc thông thường.' }
  };
  D.formulaDecoction = {
    ma_huang_tang: 'exterior', gui_zhi_tang: 'exterior', yin_qiao_san: 'exterior',
    si_jun_zi_tang: 'tonic', bu_zhong_yi_qi_tang: 'tonic', li_zhong_wan: 'tonic', si_wu_tang: 'tonic',
    liu_wei_di_huang_wan: 'tonic', jin_gui_shen_qi_wan: 'tonic', sheng_mai_san: 'tonic', suan_zao_ren_tang: 'tonic'
  };
})();
