// Renders scene.html frame by frame with headless Chromium and encodes it with ffmpeg.
// Usage: NODE_PATH=<dir containing playwright> node render.cjs [out.mp4] [fps]
//        node render.cjs --stills 0,5,10   (writes still-<t>.png for quick previews)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const stillsIdx = args.indexOf('--stills');
const here = __dirname;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file://' + path.join(here, 'scene.html') + '?render');
  await page.evaluate(() => window.sceneReady);
  const grab = (t) => page.evaluate((t) => {
    window.renderAt(t);
    return document.getElementById('c').toDataURL('image/png').split(',')[1];
  }, t);

  if (stillsIdx >= 0) {
    for (const t of args[stillsIdx + 1].split(',').map(Number)) {
      fs.writeFileSync(path.join(here, `still-${t}.png`), Buffer.from(await grab(t), 'base64'));
    }
    await browser.close();
    return;
  }

  const out = args[0] || path.join(here, 'wuxia-boat.mp4');
  const fps = Number(args[1] || 30);
  const dur = await page.evaluate(() => window.DUR);
  const audio = path.join(here, 'music.wav');
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    ...(fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-shortest', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(dur * fps);
  for (let i = 0; i < frames; i++) {
    const buf = Buffer.from(await grab(i / fps), 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
