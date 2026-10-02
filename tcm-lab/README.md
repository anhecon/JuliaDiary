# Y Học Cổ Truyền Practice Lab

A virtual practice lab for Vietnamese and Chinese traditional medicine (Y học cổ truyền / 中医). It runs entirely in the browser as static files, so GitHub Pages can serve it. It needs no build step, no server and no dependencies. Every screen works in English and Tiếng Việt, and terms carry Chinese characters and pinyin throughout.

Open `tcm-lab/index.html` in a browser, or visit `/tcm-lab/` on the published site.

## Stations

| Station | What you practise |
| --- | --- |
| **Virtual clinic** (诊 · Phòng khám ảo) | 11 patients worked through the Four Examinations: look and listen, ask the Ten Questions, palpate the pulse. Then choose the Eight Principles, the pattern, the treatment principle, a classical formula and acupoints. You get a 100-point review with teaching notes, and points that are unsafe for the patient (for example in pregnancy) cost you marks. |
| **Tongue reading** (舌 · Thiệt chẩn) | A procedurally drawn tongue. Set body colour, shape, coating, moisture, teeth marks, cracks, a red tip or sides and stasis spots, and read what each sign means, with an organ-map overlay. A quiz covers 12 classic presentations. |
| **Pulse lab** (脉 · Mạch chẩn) | 15 pulse qualities. Each can be felt at light, medium and heavy finger pressure, with a live waveform, a gauge showing vessel depth and an optional heartbeat sound. Qualities can be combined (e.g. floating + tight). Includes an identification drill and the cun–guan–chi map of both wrists. |
| **Acupoints** (穴 · Huyệt vị) | 36 core points on front and back figures, each with location, actions, indications and safety notes. A click-to-locate drill scores you in cun. |
| **Materia medica** (药 · Dược liệu) | 66 herbs, thuốc Bắc and thuốc Nam, with nature, flavour, channels, dose range, cautions, toxicity and pregnancy flags, and the formulas each appears in. Search works without diacritics. Includes flashcards. |
| **Formula workshop** (方 · Phương tễ) | 16 classical formulas with Quân–Thần–Tá–Sứ (君臣佐使) roles. The decoction builder checks the 18 antagonisms (十八反) and 19 fears (十九畏), pregnancy risks, toxicity and dose, shows the formula's thermal balance, flavour and channel profile, and finds the closest classical formula. Includes a rebuild-the-formula drill. |
| **Five Phases** (行 · Ngũ hành) | Interactive generating and controlling cycles with full correspondences, the horary organ clock (子午流注) and a quiz. |

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
  js/mod-*.js             one file per station
  js/app.js               router and navigation
```

To add a case, append an object to `D.cases` in `js/data-cases.js`. Every pattern, principle, formula, point and pulse it references must exist in the other data files.

## Disclaimer

This is a learning aid. It is not medical advice, a diagnosis or a prescription. Doses are typical textbook ranges, included for study only. Herbs (several here are toxic) and acupuncture can cause harm. Real treatment needs a licensed practitioner, and anyone who is pregnant, taking medication or seriously unwell should see a qualified clinician.
