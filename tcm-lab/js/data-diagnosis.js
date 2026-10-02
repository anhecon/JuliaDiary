/* Diagnostic data: tongue findings (舌诊 / Thiệt chẩn), pulse qualities (脉诊 / Mạch chẩn)
   and the Ten Questions of inquiry (十问 / Thập vấn). */
(function () {
  'use strict';
  var D = window.TCM.data;

  /* ---------------- Tongue ---------------- */
  D.tongue = {
    body: {
      pale: {
        zh: '淡白舌', py: 'Dàn bái shé', vi: 'Lưỡi nhợt', en: 'Pale', fill: '#e8b9b2',
        mean: { en: 'Qi or blood deficiency, or yang deficiency with cold: not enough blood reaches the tongue.', vi: 'Khí huyết hư hoặc dương hư có hàn: huyết không đủ nuôi lưỡi.' }
      },
      lightred: {
        zh: '淡红舌', py: 'Dàn hóng shé', vi: 'Lưỡi hồng nhạt', en: 'Light red (normal)', fill: '#e2898a',
        mean: { en: 'Normal colour; qi and blood are harmonious. In disease it suggests a mild or early condition.', vi: 'Màu bình thường; khí huyết điều hòa. Khi có bệnh thường là bệnh nhẹ hoặc mới mắc.' }
      },
      red: {
        zh: '红舌', py: 'Hóng shé', vi: 'Lưỡi đỏ', en: 'Red', fill: '#d4473f',
        mean: { en: 'Heat. With a coating it points to excess heat; with little or no coating, deficiency heat from yin deficiency.', vi: 'Nhiệt. Có rêu là thực nhiệt; ít hoặc không rêu là hư nhiệt do âm hư.' }
      },
      crimson: {
        zh: '绛舌', py: 'Jiàng shé', vi: 'Lưỡi đỏ thẫm (giáng)', en: 'Crimson (deep red)', fill: '#9f1d2b',
        mean: { en: 'Heat has entered the nutritive or blood level, or there is severe yin deficiency with fire.', vi: 'Nhiệt vào dinh phận, huyết phận, hoặc âm hư hỏa vượng nặng.' }
      },
      purple: {
        zh: '紫舌', py: 'Zǐ shé', vi: 'Lưỡi tím', en: 'Purple', fill: '#8c4c78',
        mean: { en: 'Blood stasis. Pale-purple and moist leans to cold; reddish-purple and dry leans to heat.', vi: 'Huyết ứ. Tím nhạt mà ướt thiên về hàn; tím đỏ mà khô thiên về nhiệt.' }
      }
    },
    shape: {
      normal: { zh: '适中', py: 'Shì zhōng', vi: 'Bình thường', en: 'Normal size', mean: null },
      swollen: {
        zh: '胖大舌', py: 'Pàng dà shé', vi: 'Lưỡi bệu (to)', en: 'Swollen',
        mean: { en: 'Fluids are not being transformed: Spleen or Kidney yang deficiency with damp or phlegm. A swollen red tongue suggests damp-heat.', vi: 'Thủy thấp không được vận hóa: tỳ thận dương hư có thấp, đàm. Lưỡi bệu mà đỏ gợi ý thấp nhiệt.' }
      },
      thin: {
        zh: '瘦薄舌', py: 'Shòu báo shé', vi: 'Lưỡi gầy mỏng', en: 'Thin',
        mean: { en: 'The tongue body is under-nourished: blood deficiency when pale, yin deficiency when red.', vi: 'Thân lưỡi thiếu nuôi dưỡng: nhợt là huyết hư, đỏ là âm hư.' }
      }
    },
    coat: {
      thin_white: {
        zh: '薄白苔', py: 'Báo bái tāi', vi: 'Rêu trắng mỏng', en: 'Thin white coating', col: '#f3f0ea', op: 0.42, grain: 1,
        mean: { en: 'Normal, or an early exterior (often wind-cold) condition that has not yet moved inward.', vi: 'Bình thường, hoặc bệnh ở biểu giai đoạn đầu (thường phong hàn), chưa vào lý.' }
      },
      thick_white: {
        zh: '白厚苔', py: 'Bái hòu tāi', vi: 'Rêu trắng dày', en: 'Thick white coating', col: '#f4f1ea', op: 0.82, grain: 1.4,
        mean: { en: 'Cold-damp or food retention; the pathogen has moved to the interior.', vi: 'Hàn thấp hoặc thực tích; tà đã vào lý.' }
      },
      white_greasy: {
        zh: '白腻苔', py: 'Bái nì tāi', vi: 'Rêu trắng nhớt', en: 'White greasy coating', col: '#efeee4', op: 0.9, grain: 0.5,
        mean: { en: 'Phlegm-damp or cold-damp in the interior. "Greasy" means a fine, sticky film that cannot be scraped off.', vi: 'Đàm thấp hoặc hàn thấp ở lý. “Nhớt” là lớp rêu mịn, dính, cạo không sạch.' }
      },
      thin_yellow: {
        zh: '薄黄苔', py: 'Báo huáng tāi', vi: 'Rêu vàng mỏng', en: 'Thin yellow coating', col: '#e7cf7a', op: 0.5, grain: 1,
        mean: { en: 'Early heat: wind-heat in the exterior or heat starting to move inward.', vi: 'Nhiệt mới phát: phong nhiệt ở biểu hoặc nhiệt bắt đầu vào lý.' }
      },
      thick_yellow: {
        zh: '黄厚苔', py: 'Huáng hòu tāi', vi: 'Rêu vàng dày', en: 'Thick yellow coating', col: '#d9b43f', op: 0.86, grain: 1.5,
        mean: { en: 'Interior excess heat, often in the Stomach and Intestines.', vi: 'Lý thực nhiệt, thường ở vị và trường.' }
      },
      yellow_greasy: {
        zh: '黄腻苔', py: 'Huáng nì tāi', vi: 'Rêu vàng nhớt', en: 'Yellow greasy coating', col: '#d8bb4c', op: 0.9, grain: 0.5,
        mean: { en: 'Damp-heat or phlegm-heat.', vi: 'Thấp nhiệt hoặc đàm nhiệt.' }
      },
      none: {
        zh: '少苔 / 无苔', py: 'Shǎo tāi / wú tāi', vi: 'Ít rêu / không rêu (lưỡi gương)', en: 'Little or no coating (mirror tongue)', col: null, op: 0, grain: 0,
        mean: { en: 'Stomach qi and yin are exhausted; typical of yin deficiency, especially Stomach or Kidney yin.', vi: 'Vị khí, vị âm suy kiệt; điển hình của âm hư, nhất là vị âm, thận âm.' }
      },
      geographic: {
        zh: '花剥苔', py: 'Huā bō tāi', vi: 'Rêu bong từng mảng (bản đồ)', en: 'Peeled in patches (geographic)', col: '#f2eee6', op: 0.6, grain: 1, patches: true,
        mean: { en: 'Stomach qi and yin are damaged; often seen in yin deficiency or after long illness.', vi: 'Vị khí, vị âm bị tổn thương; hay gặp trong âm hư hoặc sau bệnh lâu ngày.' }
      }
    },
    moist: {
      normal: { zh: '润', py: 'Rùn', vi: 'Nhuận (ẩm vừa)', en: 'Moist (normal)', mean: null },
      wet: {
        zh: '滑', py: 'Huá', vi: 'Trơn ướt', en: 'Wet / slippery',
        mean: { en: 'Excess fluids: yang deficiency, cold-damp or fluid retention.', vi: 'Thủy dịch thừa: dương hư, hàn thấp hoặc thủy ẩm đình trệ.' }
      },
      dry: {
        zh: '燥', py: 'Zào', vi: 'Khô', en: 'Dry',
        mean: { en: 'Heat has damaged fluids, or yin and fluids are deficient.', vi: 'Nhiệt làm tổn tân dịch, hoặc âm dịch bất túc.' }
      }
    },
    marks: {
      teeth: {
        zh: '齿痕', py: 'Chǐ hén', vi: 'Dấu răng (vết hằn răng)', en: 'Teeth marks',
        mean: { en: 'Spleen qi deficiency: the swollen tongue presses on the teeth because damp is not transformed.', vi: 'Tỳ khí hư: thấp không được vận hóa, lưỡi bệu ép vào răng.' }
      },
      cracks: {
        zh: '裂纹', py: 'Liè wén', vi: 'Vết nứt', en: 'Cracks',
        mean: { en: 'Yin or fluid deficiency (red tongue) or blood deficiency (pale tongue). A single central crack relates to the Stomach.', vi: 'Âm hư, tân dịch hư (lưỡi đỏ) hoặc huyết hư (lưỡi nhợt). Vết nứt giữa lưỡi liên quan đến vị.' }
      },
      redTip: {
        zh: '舌尖红', py: 'Shé jiān hóng', vi: 'Đầu lưỡi đỏ', en: 'Red tip',
        mean: { en: 'Heart fire, or heat in the upper burner (e.g. early wind-heat). The tip maps to the Heart and Lung.', vi: 'Tâm hỏa, hoặc nhiệt ở thượng tiêu (như phong nhiệt giai đoạn đầu). Đầu lưỡi ứng với tâm, phế.' }
      },
      redSides: {
        zh: '舌边红', py: 'Shé biān hóng', vi: 'Rìa lưỡi đỏ', en: 'Red sides',
        mean: { en: 'Liver or Gallbladder heat. The sides of the tongue map to the Liver and Gallbladder.', vi: 'Can đởm có nhiệt. Hai rìa lưỡi ứng với can, đởm.' }
      },
      spots: {
        zh: '瘀点', py: 'Yū diǎn', vi: 'Điểm ứ huyết', en: 'Stasis spots',
        mean: { en: 'Blood stasis in the area the spots map to.', vi: 'Huyết ứ tại vùng tương ứng.' }
      }
    }
  };

  /* Preset tongues for the quiz. answer = pattern id. */
  D.tonguePresets = [
    { answer: 'sp_qi_def', t: { body: 'pale', shape: 'swollen', coat: 'thin_white', moist: 'normal', teeth: true },
      why: { en: 'Pale and swollen with teeth marks: the Spleen is not transforming fluids and qi is weak.', vi: 'Nhợt, bệu, có dấu răng: tỳ không vận hóa thủy thấp, khí hư.' } },
    { answer: 'yin_def', t: { body: 'red', shape: 'thin', coat: 'none', moist: 'dry', cracks: true },
      why: { en: 'Red, thin, cracked and without coating: yin and fluids are depleted and deficiency heat rises.', vi: 'Đỏ, gầy, nứt, không rêu: âm dịch hao tổn, hư nhiệt bốc lên.' } },
    { answer: 'damp_heat', t: { body: 'red', shape: 'normal', coat: 'yellow_greasy', moist: 'normal' },
      why: { en: 'Red body with a yellow greasy coating: heat (yellow, red) combined with damp (greasy).', vi: 'Lưỡi đỏ, rêu vàng nhớt: nhiệt (vàng, đỏ) kết hợp thấp (nhớt).' } },
    { answer: 'blood_stasis', t: { body: 'purple', shape: 'normal', coat: 'thin_white', moist: 'normal', spots: true },
      why: { en: 'Purple body with dark spots: blood is not moving freely.', vi: 'Lưỡi tím có điểm ứ: huyết lưu thông không thông suốt.' } },
    { answer: 'blood_def', t: { body: 'pale', shape: 'thin', coat: 'thin_white', moist: 'normal' },
      why: { en: 'Pale and thin, not swollen: the body lacks blood rather than having excess fluid.', vi: 'Nhợt và gầy, không bệu: thiếu huyết chứ không phải thừa thủy thấp.' } },
    { answer: 'ht_fire', t: { body: 'lightred', shape: 'normal', coat: 'thin_yellow', moist: 'normal', redTip: true },
      why: { en: 'The red is concentrated at the tip, the Heart area, with a thin yellow coat.', vi: 'Đỏ tập trung ở đầu lưỡi (vùng tâm), rêu vàng mỏng.' } },
    { answer: 'lv_fire', t: { body: 'red', shape: 'normal', coat: 'thick_yellow', moist: 'dry', redSides: true },
      why: { en: 'Red sides (Liver–Gallbladder area) with a dry yellow coat: excess fire in the Liver.', vi: 'Rìa lưỡi đỏ (vùng can đởm), rêu vàng khô: can hỏa thực.' } },
    { answer: 'yang_def', t: { body: 'pale', shape: 'swollen', coat: 'thin_white', moist: 'wet', teeth: true },
      why: { en: 'Pale, swollen and wet: yang is too weak to warm and move fluids.', vi: 'Nhợt, bệu, ướt: dương hư không ôn hóa được thủy dịch.' } },
    { answer: 'phlegm_damp', t: { body: 'lightred', shape: 'swollen', coat: 'white_greasy', moist: 'normal' },
      why: { en: 'Swollen with a thick white greasy coat and no strong heat or cold signs: phlegm-damp.', vi: 'Bệu, rêu trắng dày nhớt, không có dấu hiệu hàn nhiệt rõ: đàm thấp.' } },
    { answer: 'normal', t: { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal' },
      why: { en: 'Light red, supple, with a thin white coating that is evenly moist: "淡红舌，薄白苔".', vi: 'Hồng nhạt, mềm mại, rêu trắng mỏng, ẩm vừa: “lưỡi hồng nhạt, rêu trắng mỏng”.' } },
    { answer: 'excess_heat', t: { body: 'red', shape: 'normal', coat: 'thick_yellow', moist: 'dry' },
      why: { en: 'Red with a thick, dry yellow coating: strong interior heat drying the fluids.', vi: 'Đỏ, rêu vàng dày khô: lý nhiệt thịnh làm khô tân dịch.' } },
    { answer: 'yin_def', t: { body: 'red', shape: 'normal', coat: 'geographic', moist: 'dry' },
      why: { en: 'Red with patchy peeled coating: Stomach yin is damaged.', vi: 'Đỏ, rêu bong từng mảng: vị âm bị tổn thương.' } }
  ];

  /* ---------------- Pulse ---------------- */
  /* Modifiers compose in order on top of the normal pulse. depth: 0 = superficial, 1 = deep. */
  D.pulseBase = {
    rate: 72, depth: 0.5, spread: 0.3, amp: 1, width: 1, smooth: 0, tension: 0, tight: 0,
    rough: 0, flood: 0, skip: 0, jitter: 0.02
  };
  D.pulses = {
    normal: {
      zh: '平脉', py: 'Píng mài', vi: 'Mạch bình (hòa hoãn)', en: 'Normal (harmonious)', mod: {},
      feel: { en: 'Even and gentle, 4–5 beats per breath, felt best at the middle level. It has "spirit, Stomach qi and root".', vi: 'Đều, hòa hoãn, 4–5 nhịp mỗi hơi thở, rõ nhất ở mức trung. Có “thần, vị khí và căn”.' },
      mean: { en: 'Health.', vi: 'Người khỏe.' }
    },
    floating: {
      zh: '浮脉', py: 'Fú mài', vi: 'Mạch Phù', en: 'Floating', mod: { depth: 0.12, spread: 0.26 },
      feel: { en: 'Felt with light touch and weaker with heavy pressure, "like wood floating on water".', vi: 'Đặt nhẹ tay đã thấy, ấn mạnh thì yếu đi, “như gỗ nổi trên mặt nước”.' },
      mean: { en: 'Exterior patterns. Floating and forceless can also signal deficiency.', vi: 'Bệnh ở biểu. Phù mà vô lực cũng có thể là hư chứng.' }
    },
    deep: {
      zh: '沉脉', py: 'Chén mài', vi: 'Mạch Trầm', en: 'Deep', mod: { depth: 0.88, spread: 0.2 },
      feel: { en: 'Only felt with heavy pressure, "like a stone sinking in water".', vi: 'Phải ấn mạnh mới thấy, “như hòn đá chìm dưới nước”.' },
      mean: { en: 'Interior patterns: forceful for interior excess, forceless for interior deficiency.', vi: 'Bệnh ở lý: có lực là lý thực, vô lực là lý hư.' }
    },
    slow: {
      zh: '迟脉', py: 'Chí mài', vi: 'Mạch Trì', en: 'Slow', mod: { rate: 52 },
      feel: { en: 'Fewer than 4 beats per breath (below about 60 per minute).', vi: 'Dưới 4 nhịp mỗi hơi thở (dưới khoảng 60 lần/phút).' },
      mean: { en: 'Cold. Forceful for cold accumulation, forceless for yang deficiency.', vi: 'Hàn. Có lực là thực hàn, vô lực là dương hư.' }
    },
    rapid: {
      zh: '数脉', py: 'Shuò mài', vi: 'Mạch Sác', en: 'Rapid', mod: { rate: 104 },
      feel: { en: 'More than 5 beats per breath (above about 90 per minute).', vi: 'Trên 5 nhịp mỗi hơi thở (trên khoảng 90 lần/phút).' },
      mean: { en: 'Heat. Forceful for excess heat, thin and rapid for deficiency heat.', vi: 'Nhiệt. Có lực là thực nhiệt, tế sác là hư nhiệt.' }
    },
    slippery: {
      zh: '滑脉', py: 'Huá mài', vi: 'Mạch Hoạt', en: 'Slippery', mod: { smooth: 1, amp: 1.1, width: 1.1 },
      feel: { en: 'Smooth and flowing, "like pearls rolling on a plate".', vi: 'Trơn tru, lưu lợi, “như hạt châu lăn trên đĩa”.' },
      mean: { en: 'Phlegm, damp, food retention or excess heat. Also normal in pregnancy.', vi: 'Đàm, thấp, thực tích hoặc thực nhiệt. Cũng là mạch bình thường khi có thai.' }
    },
    wiry: {
      zh: '弦脉', py: 'Xián mài', vi: 'Mạch Huyền', en: 'Wiry', mod: { tension: 1, width: 0.8 },
      feel: { en: 'Long, straight and taut, "like pressing the string of a zither".', vi: 'Dài, thẳng, căng, “như ấn lên dây đàn”.' },
      mean: { en: 'Liver and Gallbladder disorders, pain, or phlegm-fluids.', vi: 'Bệnh can đởm, chứng đau, hoặc đàm ẩm.' }
    },
    thin: {
      zh: '细脉', py: 'Xì mài', vi: 'Mạch Tế', en: 'Thin (thready)', mod: { width: 0.42, amp: 0.55 },
      feel: { en: 'Fine like a thread, yet clearly felt.', vi: 'Nhỏ như sợi chỉ nhưng vẫn rõ ràng dưới tay.' },
      mean: { en: 'Blood or yin deficiency; sometimes damp.', vi: 'Huyết hư, âm hư; đôi khi do thấp.' }
    },
    deficient: {
      zh: '虚脉', py: 'Xū mài', vi: 'Mạch Hư', en: 'Deficient (forceless)', mod: { amp: 0.42, depth: 0.32, spread: 0.3, width: 1.15 },
      feel: { en: 'Soft and empty at all three levels; fades under heavy pressure.', vi: 'Mềm, trống ở cả ba bộ; ấn mạnh thì mất.' },
      mean: { en: 'Qi and blood deficiency.', vi: 'Khí huyết hư.' }
    },
    excess: {
      zh: '实脉', py: 'Shí mài', vi: 'Mạch Thực', en: 'Excess (forceful)', mod: { amp: 1.45, spread: 0.65, width: 1.25 },
      feel: { en: 'Strong and full at every level of pressure.', vi: 'Mạnh, đầy ở mọi mức ấn.' },
      mean: { en: 'Excess patterns: strong pathogen meeting strong upright qi.', vi: 'Thực chứng: tà thịnh mà chính khí chưa suy.' }
    },
    choppy: {
      zh: '涩脉', py: 'Sè mài', vi: 'Mạch Sáp', en: 'Choppy', mod: { rough: 1, amp: 0.7, width: 0.7, jitter: 0.12 },
      feel: { en: 'Rough and uneven in force and rhythm, "like a knife scraping bamboo".', vi: 'Rít, không đều về lực và nhịp, “như dao cạo tre”.' },
      mean: { en: 'Blood stasis, or depleted blood and essence.', vi: 'Huyết ứ, hoặc tinh huyết hao tổn.' }
    },
    tight: {
      zh: '紧脉', py: 'Jǐn mài', vi: 'Mạch Khẩn', en: 'Tight', mod: { tight: 1, amp: 1.2 },
      feel: { en: 'Tense and forceful, snapping against the finger "like a twisted rope".', vi: 'Căng, có lực, bật vào tay “như sợi dây thừng xoắn”.' },
      mean: { en: 'Cold, pain, or food retention.', vi: 'Hàn, chứng đau, hoặc thực tích.' }
    },
    flooding: {
      zh: '洪脉', py: 'Hóng mài', vi: 'Mạch Hồng', en: 'Flooding', mod: { flood: 1, amp: 1.65, width: 1.6, depth: 0.32, spread: 0.4 },
      feel: { en: 'Broad and large, arriving with force and leaving weaker, "like surging waves".', vi: 'To, rộng, đến mạnh đi yếu, “như sóng cuộn”.' },
      mean: { en: 'Blazing heat at the qi level.', vi: 'Nhiệt thịnh ở khí phận.' }
    },
    knotted: {
      zh: '结脉', py: 'Jié mài', vi: 'Mạch Kết', en: 'Knotted', mod: { rate: 56, skip: 0.18 },
      feel: { en: 'Slow, with pauses at irregular intervals.', vi: 'Chậm, thỉnh thoảng ngừng một nhịp, không theo quy luật.' },
      mean: { en: 'Cold, stagnation of qi and blood, or phlegm.', vi: 'Hàn, khí huyết ứ trệ, hoặc đàm.' }
    },
    soggy: {
      zh: '濡脉', py: 'Rú mài', vi: 'Mạch Nhu', en: 'Soggy (soft)', mod: { depth: 0.1, spread: 0.2, amp: 0.48, width: 0.5 },
      feel: { en: 'Floating, thin and soft, like cotton floating on water.', vi: 'Phù, tế, mềm, như bông nổi trên nước.' },
      mean: { en: 'Damp, or deficiency.', vi: 'Thấp, hoặc hư chứng.' }
    }
  };

  /* Pulse positions (寸关尺 / Thốn – Quan – Xích). */
  D.pulsePositions = {
    cun: { zh: '寸', vi: 'Thốn', en: 'Cun (distal)' },
    guan: { zh: '关', vi: 'Quan', en: 'Guan (middle)' },
    chi: { zh: '尺', vi: 'Xích', en: 'Chi (proximal)' },
    left: {
      cun: { zh: '心', vi: 'Tâm (Tâm bào)', en: 'Heart (Pericardium)' },
      guan: { zh: '肝', vi: 'Can (Đởm)', en: 'Liver (Gallbladder)' },
      chi: { zh: '肾阴', vi: 'Thận âm (Bàng quang)', en: 'Kidney yin (Bladder)' }
    },
    right: {
      cun: { zh: '肺', vi: 'Phế', en: 'Lung' },
      guan: { zh: '脾', vi: 'Tỳ (Vị)', en: 'Spleen (Stomach)' },
      chi: { zh: '肾阳 · 命门', vi: 'Thận dương (Mệnh môn)', en: 'Kidney yang (Mingmen)' }
    }
  };

  /* ---------------- Inquiry: the Ten Questions ---------------- */
  D.questions = [
    { id: 'hanre', zh: '问寒热', en: 'Chills and fever', vi: 'Hỏi hàn nhiệt (lạnh, sốt)' },
    { id: 'sweat', zh: '问汗', en: 'Sweating', vi: 'Hỏi mồ hôi' },
    { id: 'head', zh: '问头身', en: 'Head and body', vi: 'Hỏi đầu, thân mình' },
    { id: 'pain', zh: '问疼痛', en: 'Pain', vi: 'Hỏi đau' },
    { id: 'stool', zh: '问大便', en: 'Bowel movements', vi: 'Hỏi đại tiện' },
    { id: 'urine', zh: '问小便', en: 'Urination', vi: 'Hỏi tiểu tiện' },
    { id: 'appetite', zh: '问饮食口味', en: 'Appetite and taste', vi: 'Hỏi ăn uống, vị giác' },
    { id: 'thirst', zh: '问口渴', en: 'Thirst and drinking', vi: 'Hỏi khát, uống nước' },
    { id: 'sleep', zh: '问睡眠', en: 'Sleep', vi: 'Hỏi giấc ngủ' },
    { id: 'chest', zh: '问胸腹', en: 'Chest and abdomen', vi: 'Hỏi ngực, bụng' },
    { id: 'emotion', zh: '问情志', en: 'Mood and emotions', vi: 'Hỏi tình chí' },
    { id: 'ears_eyes', zh: '问耳目', en: 'Ears and eyes', vi: 'Hỏi tai, mắt' },
    { id: 'menses', zh: '问经带胎产', en: 'Menstruation and pregnancy', vi: 'Hỏi kinh nguyệt, thai sản' },
    { id: 'history', zh: '问病史', en: 'Onset and history', vi: 'Hỏi bệnh sử' }
  ];
})();
