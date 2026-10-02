/* Foundational vocabulary: syndrome patterns, treatment principles, the Eight Principles,
   Five Phases correspondences, the horary (organ) clock and the channel list. */
(function () {
  'use strict';
  var D = (window.TCM.data = window.TCM.data || {});

  D.patterns = {
    normal: { zh: '平人', py: 'Píng rén', vi: 'Bình thường (người khỏe)', en: 'Healthy / no pattern' },
    wind_cold: { zh: '风寒束表', py: 'Fēng hán shù biǎo', vi: 'Phong hàn thúc biểu', en: 'Wind-cold fettering the exterior' },
    wind_heat: { zh: '风热犯表', py: 'Fēng rè fàn biǎo', vi: 'Phong nhiệt phạm biểu', en: 'Wind-heat invading the exterior' },
    ying_wei: { zh: '营卫不和', py: 'Yíng wèi bù hé', vi: 'Dinh vệ bất hòa (biểu hư)', en: 'Nutritive–defensive disharmony (exterior deficiency)' },
    shaoyang: { zh: '少阳证', py: 'Shàoyáng zhèng', vi: 'Chứng Thiếu dương', en: 'Shaoyang (half-exterior, half-interior) pattern' },
    yangming_heat: { zh: '阳明气分热盛', py: 'Yángmíng qìfèn rè shèng', vi: 'Dương minh khí phận nhiệt thịnh', en: 'Yangming qi-level blazing heat' },
    excess_heat: { zh: '里实热', py: 'Lǐ shí rè', vi: 'Lý thực nhiệt', en: 'Interior excess heat' },
    fire_toxin: { zh: '三焦火毒', py: 'Sān jiāo huǒ dú', vi: 'Hỏa độc tam tiêu', en: 'Fire toxin in the three burners' },
    sp_qi_def: { zh: '脾气虚', py: 'Pí qì xū', vi: 'Tỳ khí hư', en: 'Spleen qi deficiency' },
    sp_qi_sink: { zh: '中气下陷', py: 'Zhōng qì xià xiàn', vi: 'Trung khí hạ hãm', en: 'Sinking of middle qi' },
    sp_yang_def: { zh: '脾胃虚寒', py: 'Pí wèi xū hán', vi: 'Tỳ vị hư hàn (Tỳ dương hư)', en: 'Spleen–stomach deficiency cold (spleen yang deficiency)' },
    lv_qi_stag: { zh: '肝郁脾虚', py: 'Gān yù pí xū', vi: 'Can uất tỳ hư', en: 'Liver qi stagnation with spleen deficiency' },
    lv_fire: { zh: '肝火上炎', py: 'Gān huǒ shàng yán', vi: 'Can hỏa thượng viêm', en: 'Liver fire blazing upward' },
    ht_fire: { zh: '心火上炎', py: 'Xīn huǒ shàng yán', vi: 'Tâm hỏa thượng viêm', en: 'Heart fire blazing upward' },
    ki_yin_def: { zh: '肾阴虚', py: 'Shèn yīn xū', vi: 'Thận âm hư', en: 'Kidney yin deficiency' },
    ki_yang_def: { zh: '肾阳虚', py: 'Shèn yáng xū', vi: 'Thận dương hư', en: 'Kidney yang deficiency' },
    yin_def: { zh: '阴虚', py: 'Yīn xū', vi: 'Âm hư', en: 'Yin deficiency' },
    yang_def: { zh: '阳虚', py: 'Yáng xū', vi: 'Dương hư', en: 'Yang deficiency' },
    qi_yin_def: { zh: '气阴两虚', py: 'Qì yīn liǎng xū', vi: 'Khí âm lưỡng hư', en: 'Dual deficiency of qi and yin' },
    blood_def: { zh: '血虚', py: 'Xuè xū', vi: 'Huyết hư', en: 'Blood deficiency' },
    blood_stasis: { zh: '血瘀', py: 'Xuè yū', vi: 'Huyết ứ', en: 'Blood stasis' },
    phlegm_damp: { zh: '痰湿阻肺', py: 'Tán shī zǔ fèi', vi: 'Đàm thấp trở phế', en: 'Phlegm-damp obstructing the Lung' },
    damp_heat: { zh: '湿热', py: 'Shī rè', vi: 'Thấp nhiệt', en: 'Damp-heat' },
    lv_blood_def_insomnia: {
      zh: '肝血不足，虚热扰神', py: 'Gān xuè bùzú, xū rè rǎo shén',
      vi: 'Can huyết bất túc, hư nhiệt nhiễu thần', en: 'Liver blood deficiency with deficiency heat disturbing the spirit'
    }
  };

  D.principles = {
    acrid_warm: { zh: '辛温解表', py: 'Xīn wēn jiě biǎo', vi: 'Tân ôn giải biểu', en: 'Release the exterior with acrid-warm herbs' },
    acrid_cool: { zh: '辛凉解表', py: 'Xīn liáng jiě biǎo', vi: 'Tân lương giải biểu', en: 'Release the exterior with acrid-cool herbs' },
    harmonize_yw: { zh: '解肌发表，调和营卫', py: 'Jiě jī fā biǎo, tiáohé yíng wèi', vi: 'Giải cơ phát biểu, điều hòa dinh vệ', en: 'Release the muscle layer and harmonize nutritive and defensive qi' },
    harmonize_shaoyang: { zh: '和解少阳', py: 'Héjiě shàoyáng', vi: 'Hòa giải thiếu dương', en: 'Harmonize shaoyang' },
    clear_qi_heat: { zh: '清热生津', py: 'Qīng rè shēng jīn', vi: 'Thanh nhiệt sinh tân', en: 'Clear qi-level heat and generate fluids' },
    clear_heat_toxin: { zh: '泻火解毒', py: 'Xiè huǒ jiě dú', vi: 'Tả hỏa giải độc', en: 'Drain fire and resolve toxicity' },
    tonify_sp_qi: { zh: '益气健脾', py: 'Yì qì jiàn pí', vi: 'Ích khí kiện tỳ', en: 'Augment qi and strengthen the Spleen' },
    raise_yang: { zh: '补中益气，升阳举陷', py: 'Bǔ zhōng yì qì, shēng yáng jǔ xiàn', vi: 'Bổ trung ích khí, thăng dương cử hãm', en: 'Tonify the middle, raise sunken yang' },
    warm_middle: { zh: '温中祛寒，补气健脾', py: 'Wēn zhōng qū hán, bǔ qì jiàn pí', vi: 'Ôn trung khu hàn, bổ khí kiện tỳ', en: 'Warm the middle, dispel cold, tonify Spleen qi' },
    soothe_lv: { zh: '疏肝解郁，养血健脾', py: 'Shū gān jiě yù, yǎng xuè jiàn pí', vi: 'Sơ can giải uất, dưỡng huyết kiện tỳ', en: 'Spread Liver qi, nourish blood, strengthen the Spleen' },
    nourish_ki_yin: { zh: '滋补肾阴', py: 'Zī bǔ shèn yīn', vi: 'Tư bổ thận âm', en: 'Enrich and tonify Kidney yin' },
    warm_ki_yang: { zh: '温补肾阳', py: 'Wēn bǔ shèn yáng', vi: 'Ôn bổ thận dương', en: 'Warm and tonify Kidney yang' },
    dry_damp_phlegm: { zh: '燥湿化痰，理气和中', py: 'Zào shī huà tán, lǐ qì hé zhōng', vi: 'Táo thấp hóa đàm, lý khí hòa trung', en: 'Dry damp, transform phlegm, regulate qi and harmonize the middle' },
    tonify_blood: { zh: '补血调血', py: 'Bǔ xuè tiáo xuè', vi: 'Bổ huyết điều huyết', en: 'Tonify and regulate blood' },
    nourish_blood_calm: { zh: '养血安神，清热除烦', py: 'Yǎng xuè ān shén, qīng rè chú fán', vi: 'Dưỡng huyết an thần, thanh nhiệt trừ phiền', en: 'Nourish blood, calm the spirit, clear heat and relieve restlessness' },
    tonify_qi_yin: { zh: '益气生津，敛阴止汗', py: 'Yì qì shēng jīn, liǎn yīn zhǐ hàn', vi: 'Ích khí sinh tân, liễm âm chỉ hãn', en: 'Augment qi, generate fluids, preserve yin' },
    invig_blood: { zh: '活血化瘀', py: 'Huó xuè huà yū', vi: 'Hoạt huyết hóa ứ', en: 'Invigorate blood and dispel stasis' }
  };

  /* Eight Principles (八纲 / Bát cương), arranged as three decision axes. */
  D.axes = [
    {
      id: 'location', zh: '表里', py: 'Biǎo lǐ', vi: 'Biểu – Lý', en: 'Exterior – Interior',
      opts: {
        exterior: { zh: '表', vi: 'Biểu', en: 'Exterior' },
        half: { zh: '半表半里', vi: 'Bán biểu bán lý', en: 'Half-exterior, half-interior' },
        interior: { zh: '里', vi: 'Lý', en: 'Interior' }
      }
    },
    {
      id: 'nature', zh: '寒热', py: 'Hán rè', vi: 'Hàn – Nhiệt', en: 'Cold – Heat',
      opts: {
        cold: { zh: '寒', vi: 'Hàn', en: 'Cold' },
        neutral: { zh: '寒热不显/错杂', vi: 'Hàn nhiệt không rõ / thác tạp', en: 'Neither marked / mixed' },
        heat: { zh: '热', vi: 'Nhiệt', en: 'Heat' }
      }
    },
    {
      id: 'strength', zh: '虚实', py: 'Xū shí', vi: 'Hư – Thực', en: 'Deficiency – Excess',
      opts: {
        deficiency: { zh: '虚', vi: 'Hư', en: 'Deficiency' },
        mixed: { zh: '虚实夹杂', vi: 'Hư thực thác tạp', en: 'Mixed deficiency and excess' },
        excess: { zh: '实', vi: 'Thực', en: 'Excess' }
      }
    }
  ];

  /* Five Phases (五行 / Ngũ hành). Order follows the generating cycle. */
  D.elements = [
    {
      id: 'wood', zh: '木', vi: 'Mộc', en: 'Wood', py: 'Mù', color: '#3f8a57',
      rows: {
        zang: { zh: '肝', vi: 'Can', en: 'Liver' }, fu: { zh: '胆', vi: 'Đởm', en: 'Gallbladder' },
        sense: { zh: '目', vi: 'Mắt', en: 'Eyes' }, tissue: { zh: '筋', vi: 'Cân (gân)', en: 'Sinews' },
        emotion: { zh: '怒', vi: 'Nộ (giận)', en: 'Anger' }, colour: { zh: '青', vi: 'Xanh', en: 'Green-blue' },
        taste: { zh: '酸', vi: 'Chua', en: 'Sour' }, season: { zh: '春', vi: 'Xuân', en: 'Spring' },
        climate: { zh: '风', vi: 'Phong', en: 'Wind' }, direction: { zh: '东', vi: 'Đông', en: 'East' },
        sound: { zh: '呼', vi: 'Hô (la)', en: 'Shouting' }
      }
    },
    {
      id: 'fire', zh: '火', vi: 'Hỏa', en: 'Fire', py: 'Huǒ', color: '#c2412f',
      rows: {
        zang: { zh: '心', vi: 'Tâm', en: 'Heart' }, fu: { zh: '小肠', vi: 'Tiểu trường', en: 'Small Intestine' },
        sense: { zh: '舌', vi: 'Lưỡi', en: 'Tongue' }, tissue: { zh: '脉', vi: 'Mạch', en: 'Blood vessels' },
        emotion: { zh: '喜', vi: 'Hỷ (mừng)', en: 'Joy' }, colour: { zh: '赤', vi: 'Đỏ', en: 'Red' },
        taste: { zh: '苦', vi: 'Đắng', en: 'Bitter' }, season: { zh: '夏', vi: 'Hạ', en: 'Summer' },
        climate: { zh: '热', vi: 'Nhiệt', en: 'Heat' }, direction: { zh: '南', vi: 'Nam', en: 'South' },
        sound: { zh: '笑', vi: 'Tiếu (cười)', en: 'Laughing' }
      }
    },
    {
      id: 'earth', zh: '土', vi: 'Thổ', en: 'Earth', py: 'Tǔ', color: '#b98a2a',
      rows: {
        zang: { zh: '脾', vi: 'Tỳ', en: 'Spleen' }, fu: { zh: '胃', vi: 'Vị', en: 'Stomach' },
        sense: { zh: '口', vi: 'Miệng (môi)', en: 'Mouth & lips' }, tissue: { zh: '肉', vi: 'Cơ nhục', en: 'Flesh & muscles' },
        emotion: { zh: '思', vi: 'Tư (lo nghĩ)', en: 'Pensiveness' }, colour: { zh: '黄', vi: 'Vàng', en: 'Yellow' },
        taste: { zh: '甘', vi: 'Ngọt', en: 'Sweet' }, season: { zh: '长夏', vi: 'Trưởng hạ', en: 'Late summer' },
        climate: { zh: '湿', vi: 'Thấp', en: 'Dampness' }, direction: { zh: '中', vi: 'Trung ương', en: 'Centre' },
        sound: { zh: '歌', vi: 'Ca (hát)', en: 'Singing' }
      }
    },
    {
      id: 'metal', zh: '金', vi: 'Kim', en: 'Metal', py: 'Jīn', color: '#8a8f96',
      rows: {
        zang: { zh: '肺', vi: 'Phế', en: 'Lung' }, fu: { zh: '大肠', vi: 'Đại trường', en: 'Large Intestine' },
        sense: { zh: '鼻', vi: 'Mũi', en: 'Nose' }, tissue: { zh: '皮毛', vi: 'Bì mao (da lông)', en: 'Skin & body hair' },
        emotion: { zh: '悲', vi: 'Bi (buồn)', en: 'Grief' }, colour: { zh: '白', vi: 'Trắng', en: 'White' },
        taste: { zh: '辛', vi: 'Cay', en: 'Pungent' }, season: { zh: '秋', vi: 'Thu', en: 'Autumn' },
        climate: { zh: '燥', vi: 'Táo', en: 'Dryness' }, direction: { zh: '西', vi: 'Tây', en: 'West' },
        sound: { zh: '哭', vi: 'Khốc (khóc)', en: 'Weeping' }
      }
    },
    {
      id: 'water', zh: '水', vi: 'Thủy', en: 'Water', py: 'Shuǐ', color: '#2f5f8a',
      rows: {
        zang: { zh: '肾', vi: 'Thận', en: 'Kidney' }, fu: { zh: '膀胱', vi: 'Bàng quang', en: 'Bladder' },
        sense: { zh: '耳', vi: 'Tai', en: 'Ears' }, tissue: { zh: '骨', vi: 'Cốt (xương)', en: 'Bones' },
        emotion: { zh: '恐', vi: 'Khủng (sợ)', en: 'Fear' }, colour: { zh: '黑', vi: 'Đen', en: 'Black' },
        taste: { zh: '咸', vi: 'Mặn', en: 'Salty' }, season: { zh: '冬', vi: 'Đông', en: 'Winter' },
        climate: { zh: '寒', vi: 'Hàn', en: 'Cold' }, direction: { zh: '北', vi: 'Bắc', en: 'North' },
        sound: { zh: '呻', vi: 'Thân (rên)', en: 'Groaning' }
      }
    }
  ];
  D.elementRows = [
    ['zang', { en: 'Yin organ (zang)', vi: 'Tạng' }],
    ['fu', { en: 'Yang organ (fu)', vi: 'Phủ' }],
    ['sense', { en: 'Sense organ', vi: 'Khiếu' }],
    ['tissue', { en: 'Tissue', vi: 'Thể (mô)' }],
    ['emotion', { en: 'Emotion', vi: 'Chí (tình chí)' }],
    ['colour', { en: 'Colour', vi: 'Sắc' }],
    ['taste', { en: 'Taste', vi: 'Vị' }],
    ['season', { en: 'Season', vi: 'Mùa' }],
    ['climate', { en: 'Climate', vi: 'Khí hậu' }],
    ['direction', { en: 'Direction', vi: 'Phương' }],
    ['sound', { en: 'Voice sound', vi: 'Âm thanh' }]
  ];

  /* Horary clock (子午流注 / Tý ngọ lưu chú): two-hour peak of each channel. */
  D.organClock = [
    { start: 3, ch: 'LU', zh: '肺', vi: 'Phế', en: 'Lung', branch: '寅', bvi: 'Dần' },
    { start: 5, ch: 'LI', zh: '大肠', vi: 'Đại trường', en: 'Large Intestine', branch: '卯', bvi: 'Mão' },
    { start: 7, ch: 'ST', zh: '胃', vi: 'Vị', en: 'Stomach', branch: '辰', bvi: 'Thìn' },
    { start: 9, ch: 'SP', zh: '脾', vi: 'Tỳ', en: 'Spleen', branch: '巳', bvi: 'Tỵ' },
    { start: 11, ch: 'HT', zh: '心', vi: 'Tâm', en: 'Heart', branch: '午', bvi: 'Ngọ' },
    { start: 13, ch: 'SI', zh: '小肠', vi: 'Tiểu trường', en: 'Small Intestine', branch: '未', bvi: 'Mùi' },
    { start: 15, ch: 'BL', zh: '膀胱', vi: 'Bàng quang', en: 'Bladder', branch: '申', bvi: 'Thân' },
    { start: 17, ch: 'KI', zh: '肾', vi: 'Thận', en: 'Kidney', branch: '酉', bvi: 'Dậu' },
    { start: 19, ch: 'PC', zh: '心包', vi: 'Tâm bào', en: 'Pericardium', branch: '戌', bvi: 'Tuất' },
    { start: 21, ch: 'TE', zh: '三焦', vi: 'Tam tiêu', en: 'Triple Energizer', branch: '亥', bvi: 'Hợi' },
    { start: 23, ch: 'GB', zh: '胆', vi: 'Đởm', en: 'Gallbladder', branch: '子', bvi: 'Tý' },
    { start: 1, ch: 'LR', zh: '肝', vi: 'Can', en: 'Liver', branch: '丑', bvi: 'Sửu' }
  ];

  D.channels = {
    LU: { zh: '手太阴肺经', vi: 'Thủ thái âm Phế kinh', en: 'Lung channel' },
    LI: { zh: '手阳明大肠经', vi: 'Thủ dương minh Đại trường kinh', en: 'Large Intestine channel' },
    ST: { zh: '足阳明胃经', vi: 'Túc dương minh Vị kinh', en: 'Stomach channel' },
    SP: { zh: '足太阴脾经', vi: 'Túc thái âm Tỳ kinh', en: 'Spleen channel' },
    HT: { zh: '手少阴心经', vi: 'Thủ thiếu âm Tâm kinh', en: 'Heart channel' },
    BL: { zh: '足太阳膀胱经', vi: 'Túc thái dương Bàng quang kinh', en: 'Bladder channel' },
    KI: { zh: '足少阴肾经', vi: 'Túc thiếu âm Thận kinh', en: 'Kidney channel' },
    PC: { zh: '手厥阴心包经', vi: 'Thủ quyết âm Tâm bào kinh', en: 'Pericardium channel' },
    TE: { zh: '手少阳三焦经', vi: 'Thủ thiếu dương Tam tiêu kinh', en: 'Triple Energizer channel' },
    GB: { zh: '足少阳胆经', vi: 'Túc thiếu dương Đởm kinh', en: 'Gallbladder channel' },
    LR: { zh: '足厥阴肝经', vi: 'Túc quyết âm Can kinh', en: 'Liver channel' },
    GV: { zh: '督脉', vi: 'Mạch Đốc', en: 'Governing Vessel' },
    CV: { zh: '任脉', vi: 'Mạch Nhâm', en: 'Conception Vessel' },
    EX: { zh: '经外奇穴', vi: 'Huyệt ngoài kinh', en: 'Extra points' }
  };

  /* Organ abbreviations used for herb channel tropism (归经 / quy kinh). */
  D.organs = {
    LU: { zh: '肺', vi: 'Phế', en: 'Lung' }, LI: { zh: '大肠', vi: 'Đại trường', en: 'Large Int.' },
    ST: { zh: '胃', vi: 'Vị', en: 'Stomach' }, SP: { zh: '脾', vi: 'Tỳ', en: 'Spleen' },
    HT: { zh: '心', vi: 'Tâm', en: 'Heart' }, SI: { zh: '小肠', vi: 'Tiểu trường', en: 'Small Int.' },
    BL: { zh: '膀胱', vi: 'Bàng quang', en: 'Bladder' }, KI: { zh: '肾', vi: 'Thận', en: 'Kidney' },
    PC: { zh: '心包', vi: 'Tâm bào', en: 'Pericardium' }, TE: { zh: '三焦', vi: 'Tam tiêu', en: 'Triple Energizer' },
    GB: { zh: '胆', vi: 'Đởm', en: 'Gallbladder' }, LR: { zh: '肝', vi: 'Can', en: 'Liver' }
  };
})();
