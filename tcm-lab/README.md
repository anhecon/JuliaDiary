# Y Học Cổ Truyền Practice Lab

A virtual practice lab for Vietnamese and Chinese traditional medicine (Y học cổ truyền / 中医). It runs entirely in the browser as static files, so GitHub Pages can serve it. It needs no build step, no server and no dependencies. Every screen works in English and Tiếng Việt, and terms carry Chinese characters and pinyin throughout.

Open `tcm-lab/index.html` in a browser, or visit `/tcm-lab/` on the published site.

## Stations

| Station | What you do |
| --- | --- |
| **Virtual clinic** (诊 · Phòng khám ảo) | Illustrated patients in a consulting room: they shiver, sweat, sigh, cough and wince. Examine them with tools. **Inspect** zooms in on the face. **Tongue** makes the patient stick out their tongue so you can sweep a magnifier over it. **Listen** shows a voice and cough waveform. **Ask** is a chat through the Ten Questions. **Temperature** uses a thermometer and touch. **Pulse** means dragging three fingers onto cun, guan and chi and varying the pressure. **Abdomen** lets you press regions and watch the patient react. Findings stamp the four exams (望闻问切) onto a written case record. You then set the Eight Principles on a yin–yang dial, pick the pattern, method and formula, and place needles by tapping the body. The 100-point review links straight to needling your points and filling your prescription. |
| **Treatment room** (针 · Phòng thủ thuật) | Needling on a live tissue cross-section of skin, fat, muscle and the deep structure (bone, pleura and lung, artery, spinal canal or bowel). Choose needle length and angle, clean the skin, hold to insert, twirl or lift and thrust until the de qi (得气) meter fills, retain for 20 minutes, then withdraw. Going too deep over the chest, neck or spine triggers the matching incident. Moxibustion moves a smouldering stick to keep the skin in the warm band without blistering. Needles stay standing in the body figure. |
| **Herbal pharmacy** (秤 · Nhà thuốc) | Open drawers in a medicine cabinet (百子柜), scoop herbs onto a steelyard that tips until it balances, and tip each herb onto paper. Then divide and wrap the packets, and decoct one on a charcoal stove. You set the water, use high or low heat, and add herbs in the right order (先煎 first, 后下 later), reducing to one bowl. The decoction is scored. |
| **Tongue reading** (舌 · Thiệt chẩn) | Build a tongue (colour, shape, coating, moisture, marks), read each sign with an organ-map overlay, and identify 12 classic presentations. |
| **Pulse lab** (脉 · Mạch chẩn) | 15 qualities felt through your fingers on the wrist at three depths, with a live waveform, vessel gauge and heartbeat sound. Includes an identification drill and a finger-placement drill. |
| **Acupoints** (穴 · Huyệt vị) | 36 points on front and back figures, with a click-to-locate drill scored in cun. |
| **Materia medica** (药 · Dược liệu) | 66 herbs (thuốc Bắc and thuốc Nam) with flashcards. |
| **Formula workshop** (方 · Phương tễ) | 16 classical formulas, a decoction builder that checks the 18 antagonisms and 19 fears, and a rebuild drill. |
| **Five Phases** (行 · Ngũ hành) | Animated generating and controlling cycles, a disease-spread simulator (overacting, insulting, mother–child), the horary clock and a quiz. |

Scores are saved in the visitor's browser (`localStorage`) and nothing is sent anywhere.

## Files

```
tcm-lab/
  index.html              page shell
  css/lab.css             styles (light and dark themes)
  js/core.js              language, storage and DOM helpers
  js/data-*.js            content: patterns, tongue and pulse, points, herbs and formulas, cases
  js/tongue-render.js     SVG tongue generator and tongue reader
  js/pulse-engine.js      canvas pulse simulator
  js/body-figure.js       front and back body figures
  js/avatar.js            illustrated, animated patients
  js/wrist-exam.js        draggable three-finger pulse taking
  js/icons.js             tool icons
  js/data-visual.js       patient looks, bedside findings, needling depths, herb looks, decoction rules
  js/mod-*.js             one file per station
  js/app.js               router and navigation
```

To add a case, append an object to `D.cases` in `js/data-cases.js`. Every pattern, principle, formula, point and pulse it references must exist in the other data files.

## Disclaimer

This is a learning aid. It is not medical advice, a diagnosis or a prescription. Doses are typical textbook ranges, included for study only. Herbs (several here are toxic) and acupuncture can cause harm. Real treatment needs a licensed practitioner, and anyone who is pregnant, taking medication or seriously unwell should see a qualified clinician.
