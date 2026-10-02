/* Virtual clinic cases. Each patient is examined with the Four Examinations (四诊 / Tứ chẩn):
   inspection (望 Vọng), listening & smelling (闻 Văn), inquiry (问 Vấn) and palpation (切 Thiết).
   Patients are fictional teaching cases. */
(function () {
  'use strict';
  var D = window.TCM.data;
  function c(en, vi) { return { en: en, vi: vi }; }

  D.caseDefaultAnswer = c('Nothing unusual there.', 'Không có gì đặc biệt.');

  D.cases = [
    {
      id: 'c_wind_cold', level: 1,
      patient: { name: 'Anh Tuấn', age: 28, sex: 'M', note: c('delivery rider', 'nhân viên giao hàng') },
      cc: c('Got soaked in the rain yesterday; now chills, headache and aching all over.', 'Hôm qua bị mắc mưa ướt sũng; nay sợ lạnh, đau đầu, đau mỏi khắp người.'),
      look: c('Alert. Huddled in a jacket although the room is warm. Complexion slightly pale. Clear, watery nasal discharge.', 'Tỉnh táo. Co ro trong áo khoác dù phòng ấm. Sắc mặt hơi nhợt. Chảy nước mũi trong.'),
      tongue: { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal' },
      listen: c('Nasal voice. Occasional cough with a little thin white sputum. No unusual odour.', 'Giọng nói nghẹt mũi. Thỉnh thoảng ho, ít đờm trắng loãng. Không có mùi lạ.'),
      pulse: ['floating', 'tight'],
      palp: c('Skin dry with no sweat; forehead slightly warm. Abdomen soft, no tenderness.', 'Da khô, không có mồ hôi; trán hơi ấm. Bụng mềm, không đau khi ấn.'),
      ans: {
        hanre: c('I feel very cold and can’t get warm even under blankets. Slight fever, 37.8 °C.', 'Tôi sợ lạnh lắm, đắp chăn vẫn không ấm. Sốt nhẹ 37,8 °C.'),
        sweat: c('No sweating at all.', 'Hoàn toàn không ra mồ hôi.'),
        head: c('Headache at the back of my head and my neck is stiff. My whole body aches.', 'Đau đầu vùng gáy, cứng cổ gáy. Toàn thân đau mỏi.'),
        pain: c('Aching in my muscles and joints all over.', 'Đau nhức cơ và các khớp khắp người.'),
        appetite: c('Appetite slightly down.', 'Ăn hơi kém.'),
        thirst: c('Not thirsty; I’d rather have something hot.', 'Không khát; thích uống nước nóng.'),
        sleep: c('Slept badly because of the aches.', 'Ngủ kém vì đau mỏi.'),
        chest: c('A bit of tightness in the chest when I cough.', 'Hơi tức ngực khi ho.'),
        urine: c('Clear, normal amount.', 'Nước tiểu trong, lượng bình thường.'),
        history: c('It started last night after I rode home soaked in the rain.', 'Bắt đầu từ tối qua sau khi chạy xe về nhà bị ướt mưa.')
      },
      key: ['hanre', 'sweat', 'head', 'thirst'],
      dx: {
        location: ['exterior'], nature: ['cold'], strength: ['excess'],
        pattern: 'wind_cold', principle: 'acrid_warm', formula: 'ma_huang_tang', formulaAlt: [],
        points: ['LU7', 'LI4', 'GB20', 'BL13'], pointsOk: ['GV14', 'TE5'], pointsAvoid: []
      },
      teach: c('Strong chills with mild fever, no sweating, body aches and a floating, tight pulse are the classic picture of wind-cold exterior excess (太阳伤寒). Because there is no sweating, Má Huáng Tāng is chosen over Guì Zhī Tāng, which is for wind-cold with sweating.', 'Sợ lạnh nhiều sốt ít, không mồ hôi, đau mỏi người, mạch phù khẩn là hình ảnh điển hình của phong hàn biểu thực (Thái dương thương hàn). Vì không có mồ hôi nên chọn Ma hoàng thang chứ không dùng Quế chi thang (dành cho phong hàn có mồ hôi).')
    },
    {
      id: 'c_wind_heat', level: 2, preg: true,
      patient: { name: 'Chị Thu Hà', age: 31, sex: 'F', note: c('teacher, 20 weeks pregnant', 'giáo viên, đang mang thai 20 tuần') },
      cc: c('Sore throat and fever since yesterday.', 'Đau họng và sốt từ hôm qua.'),
      look: c('Face slightly flushed. Throat red and swollen. Thick yellowish nasal discharge.', 'Mặt hơi đỏ. Họng đỏ, sưng. Nước mũi đặc hơi vàng.'),
      tongue: { body: 'lightred', shape: 'normal', coat: 'thin_yellow', moist: 'normal', redTip: true },
      listen: c('Slightly hoarse voice. Dry cough.', 'Giọng hơi khàn. Ho khan.'),
      pulse: ['floating', 'rapid'],
      palp: c('Skin warm and slightly moist. Abdomen consistent with 20 weeks of pregnancy.', 'Da ấm, hơi ẩm. Bụng phù hợp thai 20 tuần.'),
      ans: {
        hanre: c('Fever of 38.3 °C. Only a slight dislike of wind.', 'Sốt 38,3 °C. Chỉ hơi sợ gió.'),
        sweat: c('A little sweating.', 'Có ra ít mồ hôi.'),
        head: c('Mild headache at the forehead.', 'Đau đầu nhẹ vùng trán.'),
        pain: c('My throat is sore, worse when I swallow.', 'Đau họng, nuốt vào càng đau.'),
        stool: c('A bit dry.', 'Phân hơi khô.'),
        urine: c('Slightly yellow.', 'Nước tiểu hơi vàng.'),
        thirst: c('Thirsty, I want cool water.', 'Khát, muốn uống nước mát.'),
        emotion: c('I’m worried about the baby.', 'Tôi lo cho em bé.'),
        menses: c('I’m 20 weeks pregnant; the pregnancy has been normal so far.', 'Tôi đang mang thai 20 tuần; thai kỳ bình thường.'),
        history: c('My son’s classmate had a cold last week. It began yesterday morning.', 'Bạn cùng lớp của con trai tôi bị cảm tuần trước. Tôi bắt đầu bị từ sáng hôm qua.')
      },
      key: ['hanre', 'thirst', 'pain', 'menses'],
      dx: {
        location: ['exterior'], nature: ['heat'], strength: ['excess'],
        pattern: 'wind_heat', principle: 'acrid_cool', formula: 'yin_qiao_san', formulaAlt: [],
        points: ['LI11', 'GB20', 'GV14', 'LU7'], pointsOk: ['TE5'], pointsAvoid: ['LI4', 'SP6', 'GB21', 'BL60']
      },
      teach: c('Fever stronger than chills, sore red throat, thirst, a red tip with thin yellow coat and a floating, rapid pulse indicate wind-heat. Asking about pregnancy changes the plan: LI4, SP6, GB21 and BL60 are traditionally forbidden in pregnancy. In real practice, fever in pregnancy also needs medical assessment, and any herbs must be chosen by a qualified practitioner.', 'Sốt nhiều sợ lạnh ít, họng đỏ đau, khát, đầu lưỡi đỏ rêu vàng mỏng, mạch phù sác là phong nhiệt. Hỏi về thai sản làm thay đổi phác đồ: Hợp cốc, Tam âm giao, Kiên tỉnh, Côn lôn theo truyền thống cấm châm khi có thai. Thực tế, sốt khi mang thai cần được khám y khoa, và thuốc phải do thầy thuốc có chuyên môn lựa chọn.')
    },
    {
      id: 'c_sp_qi', level: 1,
      patient: { name: 'Chị Mai', age: 46, sex: 'F', note: c('accountant', 'kế toán') },
      cc: c('Tired all the time, bloated after meals and loose stools for six months.', 'Mệt mỏi suốt, ăn xong đầy bụng, phân lỏng đã sáu tháng.'),
      look: c('Low spirits, speaks little. Sallow, dull yellow complexion. Slightly puffy eyelids.', 'Tinh thần mệt mỏi, ít nói. Sắc mặt vàng úa, không tươi. Mí mắt hơi phù.'),
      tongue: { body: 'pale', shape: 'swollen', coat: 'thin_white', moist: 'normal', teeth: true },
      listen: c('Weak, low voice. Short of breath when climbing stairs.', 'Giọng nói nhỏ, yếu. Leo cầu thang thì hụt hơi.'),
      pulse: ['deficient'],
      palp: c('Abdomen soft, slightly distended, feels better with pressure. Hands slightly cool.', 'Bụng mềm, hơi chướng, ấn vào dễ chịu. Bàn tay hơi lạnh.'),
      ans: {
        hanre: c('No fever. My hands are a little cool sometimes.', 'Không sốt. Đôi khi tay hơi lạnh.'),
        sweat: c('I sweat easily with very little effort.', 'Làm việc nhẹ cũng dễ ra mồ hôi.'),
        head: c('My arms and legs feel heavy and tired.', 'Tay chân nặng nề, mỏi mệt.'),
        stool: c('Loose and unformed, twice a day, worse after greasy food.', 'Phân lỏng, nát, ngày hai lần, ăn đồ dầu mỡ thì nặng hơn.'),
        appetite: c('Poor appetite. I get full quickly and bloated after eating.', 'Ăn kém. Ăn nhanh no, ăn xong đầy bụng.'),
        thirst: c('Not thirsty.', 'Không khát.'),
        sleep: c('Very sleepy after meals.', 'Ăn xong rất buồn ngủ.'),
        chest: c('Bloating in the abdomen after meals, better when I rest.', 'Bụng đầy sau ăn, nghỉ ngơi thì đỡ.'),
        emotion: c('I worry a lot about work.', 'Tôi hay lo nghĩ chuyện công việc.'),
        menses: c('Regular, but the blood is pale and quite heavy.', 'Đều, nhưng máu kinh nhạt màu và hơi nhiều.'),
        history: c('Long hours, irregular meals, often eating at my desk.', 'Làm việc nhiều giờ, ăn uống thất thường, hay ăn tại bàn làm việc.')
      },
      key: ['appetite', 'stool', 'chest', 'sweat'],
      dx: {
        location: ['interior'], nature: ['neutral'], strength: ['deficiency'],
        pattern: 'sp_qi_def', principle: 'tonify_sp_qi', formula: 'si_jun_zi_tang', formulaAlt: ['bu_zhong_yi_qi_tang'],
        points: ['ST36', 'CV12', 'BL20', 'SP6'], pointsOk: ['CV6', 'SP9'], pointsAvoid: []
      },
      teach: c('Fatigue, poor appetite, bloating after meals, loose stools, a weak voice, a pale swollen tongue with teeth marks and a forceless pulse all point to Spleen qi deficiency. Worry (思) and irregular eating are classic causes. Sì Jūnzǐ Tāng is the base formula; Bǔ Zhōng Yì Qì Tāng fits better when qi is also sinking (prolapse, chronic diarrhoea).', 'Mệt mỏi, kém ăn, đầy bụng sau ăn, phân lỏng, tiếng nói yếu, lưỡi nhợt bệu có dấu răng và mạch hư đều chỉ ra tỳ khí hư. Lo nghĩ (tư) và ăn uống thất thường là nguyên nhân kinh điển. Tứ quân tử thang là bài cơ bản; Bổ trung ích khí thang phù hợp hơn khi có khí hạ hãm (sa giáng, tiêu chảy kéo dài).')
    },
    {
      id: 'c_liver_qi', level: 2,
      patient: { name: 'Chị Ngọc Anh', age: 34, sex: 'F', note: c('marketing manager', 'trưởng phòng marketing') },
      cc: c('Irritable, sighing a lot, distension under the ribs and sore breasts before periods.', 'Dễ cáu, hay thở dài, đầy tức mạng sườn, căng tức vú trước kỳ kinh.'),
      look: c('Tense expression, sighs often during the interview. Complexion slightly sallow.', 'Nét mặt căng thẳng, thở dài nhiều lần khi được hỏi bệnh. Sắc mặt hơi vàng.'),
      tongue: { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal' },
      listen: c('Frequent sighing. Voice normal.', 'Hay thở dài. Giọng nói bình thường.'),
      pulse: ['wiry', 'thin'],
      palp: c('Mild distension and discomfort below both rib margins. Abdomen otherwise soft.', 'Đầy tức nhẹ dưới hai bờ sườn. Bụng mềm.'),
      ans: {
        hanre: c('No fever or chills.', 'Không sốt, không sợ lạnh.'),
        head: c('Tension headaches at the temples when I’m stressed; sometimes dizzy.', 'Đau căng hai bên thái dương khi căng thẳng; đôi khi chóng mặt.'),
        pain: c('A distending pain in both sides of my ribs that moves around and gets worse with stress.', 'Đau tức hai bên mạng sườn, đau chạy chỗ này chỗ kia, căng thẳng thì nặng hơn.'),
        stool: c('It alternates between constipation and loose stools, especially when stressed.', 'Lúc táo lúc lỏng, nhất là khi căng thẳng.'),
        appetite: c('My appetite is down; mouth a little dry.', 'Ăn kém; miệng hơi khô.'),
        sleep: c('Hard to fall asleep when work is stressful.', 'Khó vào giấc khi công việc căng thẳng.'),
        chest: c('Chest feels oppressed; sighing makes it better.', 'Ngực bứt rứt, thở dài thì dễ chịu hơn.'),
        emotion: c('I’m irritable and lose my temper easily; mood is low.', 'Tôi dễ cáu, dễ nổi nóng; tâm trạng buồn bực.'),
        ears_eyes: c('My eyes feel dry.', 'Mắt hay bị khô.'),
        menses: c('Cycle is irregular. Breasts get swollen and sore and I’m irritable before periods; some cramps.', 'Chu kỳ không đều. Trước kỳ kinh vú căng đau, dễ cáu; có đau bụng kinh nhẹ.'),
        history: c('It has got worse over the past year with a new job.', 'Nặng dần trong một năm qua từ khi đổi việc mới.')
      },
      key: ['emotion', 'pain', 'menses', 'chest'],
      dx: {
        location: ['interior'], nature: ['neutral'], strength: ['mixed', 'excess'],
        pattern: 'lv_qi_stag', principle: 'soothe_lv', formula: 'xiao_yao_san', formulaAlt: ['xiao_chai_hu_tang'],
        points: ['LR3', 'LI4', 'PC6', 'SP6', 'GB34'], pointsOk: ['BL18', 'ST36', 'CV17'], pointsAvoid: []
      },
      teach: c('Emotional strain, sighing, wandering flank pain, premenstrual breast distension and a wiry pulse indicate Liver qi stagnation. The poor appetite, alternating stools, dry eyes and thin pulse show the Spleen and Liver blood are also weak, so this is mixed excess and deficiency: the picture of Xiāoyáo Sǎn. LI4 with LR3 ("Four Gates") moves qi throughout the body.', 'Căng thẳng tình chí, hay thở dài, đau mạng sườn chạy, căng vú trước kỳ kinh, mạch huyền là can khí uất kết. Kém ăn, đại tiện lúc táo lúc lỏng, khô mắt, mạch tế cho thấy tỳ hư và can huyết cũng bất túc, nên đây là hư thực thác tạp: chứng của Tiêu dao tán. Hợp cốc phối Thái xung (“Tứ quan”) giúp khí lưu thông toàn thân.')
    },
    {
      id: 'c_kidney_yin', level: 2,
      patient: { name: 'Bà Hương', age: 56, sex: 'F', note: c('retired teacher', 'giáo viên nghỉ hưu') },
      cc: c('Night sweats, hot flushes in the afternoon and an aching lower back.', 'Mồ hôi trộm, bốc hỏa về chiều, đau mỏi lưng.'),
      look: c('Slim build. Cheeks flushed red in the afternoon. Lips slightly dry.', 'Người gầy. Hai gò má đỏ về chiều. Môi hơi khô.'),
      tongue: { body: 'red', shape: 'thin', coat: 'none', moist: 'dry', cracks: true },
      listen: c('Voice normal. Throat sounds dry.', 'Giọng nói bình thường. Họng có vẻ khô.'),
      pulse: ['thin', 'rapid'],
      palp: c('Palms and soles feel hot to the touch. Lower back tender to firm pressure.', 'Lòng bàn tay, bàn chân nóng. Vùng thắt lưng ấn mạnh thì đau mỏi.'),
      ans: {
        hanre: c('I feel hot in the afternoon and evening; my palms and soles burn. No chills.', 'Chiều tối thấy nóng trong người; lòng bàn tay, bàn chân nóng rát. Không sợ lạnh.'),
        sweat: c('Night sweats: I wake up drenched.', 'Mồ hôi trộm: tỉnh dậy ướt đẫm.'),
        head: c('Some dizziness.', 'Hơi chóng mặt.'),
        pain: c('A dull ache in my lower back and knees, better when I rest.', 'Đau âm ỉ vùng thắt lưng và gối, nghỉ ngơi thì đỡ.'),
        stool: c('Dry and small.', 'Phân khô, ít.'),
        urine: c('Scanty and dark yellow.', 'Nước tiểu ít, vàng sẫm.'),
        thirst: c('My mouth and throat are dry at night; I sip water.', 'Đêm khô miệng, khô họng; uống từng ngụm nhỏ.'),
        sleep: c('I wake often, feel restless and have a lot of dreams.', 'Hay tỉnh giấc, bứt rứt, mơ nhiều.'),
        emotion: c('A bit anxious.', 'Hơi lo âu.'),
        ears_eyes: c('High-pitched ringing in my ears that came on gradually.', 'Ù tai tiếng rít cao, xuất hiện từ từ.'),
        menses: c('Menopause at 50.', 'Mãn kinh năm 50 tuổi.'),
        history: c('It has crept up over about three years.', 'Tăng dần trong khoảng ba năm nay.')
      },
      key: ['hanre', 'sweat', 'pain', 'ears_eyes'],
      dx: {
        location: ['interior'], nature: ['heat'], strength: ['deficiency'],
        pattern: 'ki_yin_def', principle: 'nourish_ki_yin', formula: 'liu_wei_di_huang_wan', formulaAlt: [],
        points: ['KI3', 'SP6', 'BL23', 'HT7'], pointsOk: ['CV4', 'EX-HN3'], pointsAvoid: []
      },
      teach: c('Afternoon heat, "five-centre heat", night sweats, malar flush, lower back and knee aching, gradual high-pitched tinnitus, a red peeled cracked tongue and a thin rapid pulse are Kidney yin deficiency with deficiency heat. The heat is real but comes from lack of yin, so the strategy is to nourish rather than to purge heat.', 'Nóng về chiều, “ngũ tâm phiền nhiệt”, mồ hôi trộm, gò má đỏ, đau mỏi lưng gối, ù tai tiếng cao xuất hiện từ từ, lưỡi đỏ không rêu có vết nứt, mạch tế sác là thận âm hư sinh nội nhiệt. Nhiệt có thật nhưng do âm thiếu, nên phép trị là tư âm chứ không phải tả nhiệt.')
    },
    {
      id: 'c_sp_yang', level: 2,
      patient: { name: 'Ông Bảy', age: 62, sex: 'M', note: c('rice farmer', 'nông dân trồng lúa') },
      cc: c('Dull stomach pain for years, better with warmth and pressure; cold hands and feet.', 'Đau âm ỉ vùng dạ dày nhiều năm, chườm ấm và ấn vào thì đỡ; tay chân lạnh.'),
      look: c('Pale complexion, slightly puffy. Wearing several layers. Moves slowly.', 'Sắc mặt nhợt, hơi phù. Mặc nhiều lớp áo. Đi lại chậm chạp.'),
      tongue: { body: 'pale', shape: 'swollen', coat: 'thin_white', moist: 'wet', teeth: true },
      listen: c('Weak voice. No unusual odour.', 'Tiếng nói yếu. Không có mùi lạ.'),
      pulse: ['deep', 'slow', 'deficient'],
      palp: c('Abdomen feels cool; pain eases with pressure. Hands and feet cold.', 'Bụng lạnh khi sờ; ấn vào thì bớt đau. Tay chân lạnh.'),
      ans: {
        hanre: c('I always feel cold, especially my hands and feet. No fever.', 'Lúc nào cũng thấy lạnh, nhất là tay chân. Không sốt.'),
        sweat: c('No unusual sweating.', 'Không ra mồ hôi bất thường.'),
        head: c('I just feel tired.', 'Chỉ thấy mệt.'),
        pain: c('A dull, constant ache in the upper abdomen. A hot water bottle, warm food and pressing on it help; cold drinks make it worse.', 'Đau âm ỉ liên tục vùng thượng vị. Chườm nóng, ăn đồ ấm, ấn vào thì đỡ; uống nước lạnh thì nặng hơn.'),
        stool: c('Loose, sometimes with undigested food.', 'Phân lỏng, đôi khi còn thức ăn chưa tiêu.'),
        urine: c('Clear and plentiful.', 'Nước tiểu trong, nhiều.'),
        appetite: c('Poor appetite; I only want warm food.', 'Ăn kém; chỉ thích đồ ăn nóng.'),
        thirst: c('Not thirsty. I like hot tea.', 'Không khát. Thích uống trà nóng.'),
        chest: c('A cold, bloated feeling in the stomach area.', 'Vùng bụng trên đầy và có cảm giác lạnh.'),
        history: c('Years of drinking iced water and eating cold rice out in the fields.', 'Nhiều năm uống nước đá, ăn cơm nguội ngoài đồng.')
      },
      key: ['pain', 'hanre', 'thirst', 'stool'],
      dx: {
        location: ['interior'], nature: ['cold'], strength: ['deficiency'],
        pattern: 'sp_yang_def', principle: 'warm_middle', formula: 'li_zhong_wan', formulaAlt: ['si_jun_zi_tang'],
        points: ['CV12', 'ST36', 'BL20', 'CV6'], pointsOk: ['CV4', 'GV4', 'SP6'], pointsAvoid: []
      },
      teach: c('Pain that is dull and relieved by warmth and pressure is deficiency cold (虚寒). With cold limbs, undigested food in the stool, no thirst, a pale wet swollen tongue and a deep, slow, weak pulse, this is Spleen yang deficiency. Lǐ Zhōng Wán uses Gān Jiāng as chief to warm the middle. Moxibustion on CV12, ST36 and CV6 suits this pattern well.', 'Đau âm ỉ, chườm ấm và ấn vào thì đỡ là hư hàn. Kèm chân tay lạnh, phân sống, không khát, lưỡi nhợt bệu ướt và mạch trầm trì vô lực là tỳ dương hư. Lý trung hoàn dùng Can khương làm quân để ôn trung. Cứu Trung quản, Túc tam lý, Khí hải rất hợp chứng này.')
    },
    {
      id: 'c_yangming', level: 2,
      patient: { name: 'Minh', age: 22, sex: 'M', note: c('university student', 'sinh viên') },
      cc: c('High fever for two days, sweating heavily and very thirsty.', 'Sốt cao hai ngày, ra nhiều mồ hôi, rất khát.'),
      look: c('Face flushed red, restless, throws off the blanket.', 'Mặt đỏ bừng, bứt rứt, hất chăn ra.'),
      tongue: { body: 'red', shape: 'normal', coat: 'thick_yellow', moist: 'dry' },
      listen: c('Loud voice, rapid breathing.', 'Tiếng nói to, thở nhanh.'),
      pulse: ['flooding', 'rapid'],
      palp: c('Skin very hot and wet with sweat. Abdomen soft, no fullness or tenderness.', 'Da rất nóng, ướt mồ hôi. Bụng mềm, không đầy, không đau khi ấn.'),
      ans: {
        hanre: c('High fever, 39.5 °C. I feel hot, not cold at all.', 'Sốt cao 39,5 °C. Thấy nóng, không hề sợ lạnh.'),
        sweat: c('Sweating a lot, but the fever doesn’t break.', 'Ra mồ hôi rất nhiều nhưng không hạ sốt.'),
        head: c('Headache.', 'Đau đầu.'),
        stool: c('No bowel movement for two days, but my belly doesn’t feel full.', 'Hai ngày chưa đi ngoài, nhưng bụng không đầy.'),
        urine: c('Dark and scanty.', 'Nước tiểu sẫm màu, ít.'),
        appetite: c('No appetite.', 'Không muốn ăn.'),
        thirst: c('Extremely thirsty; I want lots of cold water.', 'Khát dữ dội; muốn uống thật nhiều nước lạnh.'),
        sleep: c('Restless, can’t settle.', 'Bứt rứt, nằm không yên.'),
        emotion: c('Irritable.', 'Bực bội.'),
        history: c('It started as a cold four days ago. The chills went away and then the fever shot up.', 'Bắt đầu như cảm lạnh từ bốn ngày trước. Hết sợ lạnh rồi sốt tăng vọt.')
      },
      key: ['hanre', 'sweat', 'thirst', 'history'],
      dx: {
        location: ['interior'], nature: ['heat'], strength: ['excess'],
        pattern: 'yangming_heat', principle: 'clear_qi_heat', formula: 'bai_hu_tang', formulaAlt: [],
        points: ['LI11', 'LI4', 'GV14'], pointsOk: ['ST36', 'PC6'], pointsAvoid: []
      },
      teach: c('The "four bigs" (big fever, big sweat, big thirst, big flooding pulse) after the chills have gone mean the pathogen has passed from the exterior into the yangming qi level. The abdomen is soft, so there is no constipation-type accumulation that would call for purging. In real life, a persistent fever of 39.5 °C needs medical assessment.', '“Tứ đại” (sốt cao, mồ hôi nhiều, khát nhiều, mạch hồng đại) sau khi hết sợ lạnh cho thấy tà đã từ biểu vào khí phận dương minh. Bụng mềm, không có thực tích táo kết nên không cần tả hạ. Thực tế, sốt 39,5 °C kéo dài cần được khám y khoa.')
    },
    {
      id: 'c_phlegm', level: 1,
      patient: { name: 'Ông Dũng', age: 48, sex: 'M', note: c('restaurant owner', 'chủ nhà hàng') },
      cc: c('Long-standing cough with lots of white phlegm and a stuffy chest.', 'Ho lâu ngày, nhiều đờm trắng, tức ngực.'),
      look: c('Overweight, puffy face. Coughs up white sputum easily during the visit.', 'Thừa cân, mặt phù. Trong lúc khám khạc ra đờm trắng dễ dàng.'),
      tongue: { body: 'lightred', shape: 'swollen', coat: 'white_greasy', moist: 'normal' },
      listen: c('Rattling of phlegm in the throat. Cough is loose and productive.', 'Có tiếng đờm khò khè trong họng. Ho có đờm, dễ khạc.'),
      pulse: ['slippery'],
      palp: c('Abdomen soft and flabby, slight fullness in the epigastrium.', 'Bụng mềm, nhão, hơi đầy vùng thượng vị.'),
      ans: {
        hanre: c('No chills or fever.', 'Không sợ lạnh, không sốt.'),
        head: c('My head feels heavy and foggy, as if wrapped in a cloth.', 'Đầu nặng, mơ hồ như có khăn quấn.'),
        stool: c('Sticky and a bit loose.', 'Phân dính, hơi nát.'),
        appetite: c('Poor appetite and some nausea in the mornings.', 'Ăn kém, buổi sáng hay buồn nôn.'),
        thirst: c('Not thirsty.', 'Không khát.'),
        sleep: c('I’m sleepy all the time and I snore.', 'Lúc nào cũng buồn ngủ, ngủ ngáy.'),
        chest: c('Chest feels stuffy and full; the upper belly too.', 'Ngực bứt rứt, đầy tức; bụng trên cũng đầy.'),
        history: c('Lots of fried food and beer with customers. It’s worse in the rainy season.', 'Hay ăn đồ chiên rán, uống bia với khách. Mùa mưa thì nặng hơn.')
      },
      key: ['chest', 'appetite', 'head', 'thirst'],
      dx: {
        location: ['interior'], nature: ['neutral', 'cold'], strength: ['excess', 'mixed'],
        pattern: 'phlegm_damp', principle: 'dry_damp_phlegm', formula: 'er_chen_tang', formulaAlt: [],
        points: ['ST40', 'CV12', 'BL13', 'SP9'], pointsOk: ['LU7', 'ST36', 'CV17', 'PC6'], pointsAvoid: []
      },
      teach: c('Copious white sputum that is easy to cough up, chest and epigastric fullness, a heavy head, a swollen tongue with a white greasy coating and a slippery pulse indicate phlegm-damp. "The Spleen produces phlegm; the Lung stores it" (脾为生痰之源，肺为贮痰之器). Rich food and a damp climate feed it. ST40 is the main point for phlegm.', 'Đờm trắng nhiều dễ khạc, đầy tức ngực và thượng vị, đầu nặng, lưỡi bệu rêu trắng nhớt, mạch hoạt là đàm thấp. “Tỳ là nguồn sinh đàm, phế là nơi chứa đàm”. Ăn nhiều đồ béo ngọt và khí hậu ẩm thấp làm bệnh nặng thêm. Phong long là huyệt chủ yếu để hóa đàm.')
    },
    {
      id: 'c_blood_def', level: 1,
      patient: { name: 'Chị Linh', age: 30, sex: 'F', note: c('4 months after childbirth, breastfeeding', 'sau sinh 4 tháng, đang cho con bú') },
      cc: c('Dizzy, palpitations and pale since giving birth.', 'Chóng mặt, hồi hộp, da xanh xao từ sau sinh.'),
      look: c('Pale, lustreless face. Pale lips and nail beds. Dry, thinning hair.', 'Sắc mặt nhợt, không tươi nhuận. Môi và móng tay nhợt. Tóc khô, rụng.'),
      tongue: { body: 'pale', shape: 'thin', coat: 'thin_white', moist: 'normal' },
      listen: c('Soft voice.', 'Giọng nói nhỏ nhẹ.'),
      pulse: ['thin'],
      palp: c('Skin dry. Abdomen soft.', 'Da khô. Bụng mềm.'),
      ans: {
        head: c('Dizzy when I stand up, and my vision blurs.', 'Đứng dậy thì chóng mặt, mắt hoa.'),
        pain: c('My fingers go numb sometimes.', 'Thỉnh thoảng tê các ngón tay.'),
        stool: c('Dry stools.', 'Phân khô.'),
        appetite: c('Fair.', 'Ăn tạm được.'),
        sleep: c('Hard to fall asleep, and I dream a lot.', 'Khó ngủ, mơ nhiều.'),
        chest: c('Palpitations, especially when tired.', 'Hồi hộp, nhất là khi mệt.'),
        emotion: c('Easily startled and a bit low.', 'Dễ giật mình, hơi buồn.'),
        ears_eyes: c('Blurred vision, dry eyes, floaters.', 'Nhìn mờ, khô mắt, có ruồi bay trước mắt.'),
        menses: c('Periods have just come back: scanty and pale.', 'Kinh nguyệt mới có lại: ít và nhạt màu.'),
        history: c('I lost a lot of blood during the delivery.', 'Khi sinh tôi mất máu khá nhiều.')
      },
      key: ['head', 'menses', 'history', 'ears_eyes'],
      dx: {
        location: ['interior'], nature: ['neutral'], strength: ['deficiency'],
        pattern: 'blood_def', principle: 'tonify_blood', formula: 'si_wu_tang', formulaAlt: [],
        points: ['SP6', 'ST36', 'BL20', 'BL18'], pointsOk: ['SP10', 'CV4', 'CV6', 'HT7'], pointsAvoid: []
      },
      teach: c('Heavy blood loss at childbirth followed by pallor of face, lips and nails, dizziness, blurred vision, numbness, palpitations, scanty pale periods, a pale thin tongue and a thin pulse: blood deficiency. The Spleen makes blood and the Liver stores it, so their back-shu points are added. Breastfeeding also uses blood, so the diet and rest matter as much as the formula.', 'Mất máu nhiều khi sinh, sau đó mặt, môi, móng nhợt, chóng mặt, hoa mắt, tê tay, hồi hộp, kinh ít nhạt, lưỡi nhợt gầy, mạch tế: huyết hư. Tỳ sinh huyết, can tàng huyết nên dùng thêm Tỳ du, Can du. Cho con bú cũng hao huyết, nên ăn uống, nghỉ ngơi quan trọng không kém bài thuốc.')
    },
    {
      id: 'c_insomnia', level: 3,
      patient: { name: 'Ông Phúc', age: 52, sex: 'M', note: c('researcher', 'nhà nghiên cứu') },
      cc: c('Can’t sleep for six months; restless and irritable at night.', 'Mất ngủ sáu tháng nay; đêm bứt rứt, khó chịu.'),
      look: c('Tired, dark circles under the eyes. Complexion slightly dull.', 'Mệt mỏi, quầng thâm dưới mắt. Sắc mặt hơi xỉn.'),
      tongue: { body: 'red', shape: 'thin', coat: 'thin_white', moist: 'dry' },
      listen: c('Voice normal. Speaks quickly.', 'Giọng nói bình thường. Nói nhanh.'),
      pulse: ['wiry', 'thin'],
      palp: c('Abdomen soft. Palms slightly warm.', 'Bụng mềm. Lòng bàn tay hơi ấm.'),
      ans: {
        hanre: c('I feel a bit warm at night.', 'Đêm thấy hơi nóng trong người.'),
        sweat: c('Some sweating at night.', 'Đêm có ra ít mồ hôi.'),
        head: c('Dizzy and foggy in the daytime.', 'Ban ngày chóng mặt, đầu óc mơ hồ.'),
        thirst: c('Dry mouth and throat.', 'Khô miệng, khô họng.'),
        sleep: c('I lie awake restless, can’t settle; when I do sleep I wake around 1 to 3 a.m.', 'Nằm trằn trọc không yên; nếu ngủ được thì hay tỉnh lúc 1–3 giờ sáng.'),
        chest: c('Palpitations at night.', 'Đêm hay hồi hộp.'),
        emotion: c('A vague, empty restlessness and irritability, worse at night.', 'Bứt rứt, khó chịu mơ hồ trong lòng, về đêm nặng hơn.'),
        ears_eyes: c('Dry, tired eyes.', 'Mắt khô, mỏi.'),
        history: c('Six months of overwork and worry about a grant deadline.', 'Sáu tháng làm việc quá sức và lo lắng về hạn nộp đề tài.')
      },
      key: ['sleep', 'emotion', 'sweat', 'thirst'],
      dx: {
        location: ['interior'], nature: ['heat'], strength: ['deficiency'],
        pattern: 'lv_blood_def_insomnia', principle: 'nourish_blood_calm', formula: 'suan_zao_ren_tang', formulaAlt: ['liu_wei_di_huang_wan'],
        points: ['HT7', 'SP6', 'EX-HN3', 'BL18'], pointsOk: ['BL15', 'PC6', 'GV20', 'KI3'], pointsAvoid: []
      },
      teach: c('Restless insomnia, "deficiency irritability", palpitations, dizziness, dry mouth and throat, mild night sweating, waking during Liver time (1–3 a.m.), a red thin tongue and a wiry thin pulse: Liver blood is insufficient and the resulting deficiency heat disturbs the spirit. Suān Zǎo Rén nourishes Liver blood to calm the spirit, while Zhī Mǔ clears the deficiency heat.', 'Mất ngủ bứt rứt, “hư phiền”, hồi hộp, chóng mặt, khô miệng họng, mồ hôi trộm nhẹ, hay tỉnh vào giờ can (1–3 giờ sáng), lưỡi đỏ gầy, mạch huyền tế: can huyết bất túc, hư nhiệt nội sinh nhiễu tâm thần. Toan táo nhân dưỡng can huyết để an thần, Tri mẫu thanh hư nhiệt.')
    },
    {
      id: 'c_shaoyang', level: 3,
      patient: { name: 'Chị Trang', age: 38, sex: 'F', note: c('shop owner', 'chủ cửa hàng') },
      cc: c('Waves of chills then heat for five days after a cold, with a bitter taste.', 'Lúc rét lúc nóng năm ngày nay sau một đợt cảm, miệng đắng.'),
      look: c('Looks unwell and low in spirits. Complexion slightly greenish-sallow.', 'Vẻ mệt, tinh thần uể oải. Sắc mặt hơi xanh vàng.'),
      tongue: { body: 'lightred', shape: 'normal', coat: 'thin_white', moist: 'normal' },
      listen: c('Voice quiet. Occasional dry retching.', 'Tiếng nói nhỏ. Thỉnh thoảng nôn khan.'),
      pulse: ['wiry'],
      palp: c('Fullness and discomfort under the rib margins (胸胁苦满).', 'Đầy tức, khó chịu dưới hai bờ sườn (hung hiếp khổ mãn).'),
      ans: {
        hanre: c('Chills come, then heat comes, back and forth all day.', 'Rét rồi lại nóng, cứ luân phiên suốt ngày.'),
        head: c('Dizziness.', 'Chóng mặt.'),
        pain: c('A full, uncomfortable feeling in my flanks.', 'Cảm giác đầy, khó chịu ở hai bên sườn.'),
        appetite: c('I don’t want to eat; bitter taste in my mouth and I feel nauseous.', 'Không muốn ăn; miệng đắng, buồn nôn.'),
        thirst: c('Dry throat.', 'Họng khô.'),
        chest: c('Fullness in the chest and under the ribs.', 'Đầy tức ngực và dưới sườn.'),
        emotion: c('Irritable and low.', 'Bực bội, buồn chán.'),
        ears_eyes: c('Eyes feel dazzled.', 'Mắt hoa.'),
        menses: c('Normal; not pregnant.', 'Bình thường; không có thai.'),
        history: c('I had a cold a week ago that never cleared properly.', 'Tuần trước bị cảm mà không khỏi hẳn.')
      },
      key: ['hanre', 'appetite', 'chest', 'history'],
      dx: {
        location: ['half'], nature: ['neutral', 'heat'], strength: ['excess', 'mixed'],
        pattern: 'shaoyang', principle: 'harmonize_shaoyang', formula: 'xiao_chai_hu_tang', formulaAlt: [],
        points: ['TE5', 'GB34', 'PC6', 'LR3'], pointsOk: ['GB20', 'GV14', 'BL18'], pointsAvoid: []
      },
      teach: c('Alternating chills and fever, a bitter taste, dry throat, dazzled vision, fullness of chest and flanks, no wish to eat, nausea and a wiry pulse are the shaoyang signs from the Shānghán Lùn. The pathogen sits between exterior and interior, so it can be neither sweated out nor purged: the method is to harmonise.', 'Hàn nhiệt vãng lai, miệng đắng, họng khô, mắt hoa, đầy tức ngực sườn, không muốn ăn, buồn nôn, mạch huyền là chứng thiếu dương trong Thương hàn luận. Tà ở giữa biểu và lý nên không thể phát hãn hay tả hạ: phép trị là hòa giải.')
    }
  ];
  D.caseById = {};
  D.cases.forEach(function (k) { D.caseById[k.id] = k; });
})();
