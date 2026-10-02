# 月下扁舟 · A Boat Beneath the Moon

A 20-second animated short (`wuxia-boat.mp4`, 1280×720, 30 fps, with sound).
At dusk, a wuxia swordswoman in white and crimson poles a small canopied boat
down a misty river between ink-wash karst peaks. Her companion sits facing her
and plays a xiao flute. Sky lanterns rise, lotus lanterns drift on the water and
peach blossoms fall. The film closes on 江湖路远 与君同舟:
*"However far the rivers run, I will row with you."*

- `scene.html`: the whole scene as a deterministic canvas animation. Open it in a browser to watch it loop live.
- `music.py`: synthesizes the original score (guzheng, xiao, drone and water ambience in D pentatonic) to `music.wav`.
- `render.cjs`: captures the scene frame by frame with headless Chromium (Playwright) and encodes it with ffmpeg.

To rebuild the video:

```sh
python3 music.py
node render.cjs wuxia-boat.mp4 30     # needs playwright + ffmpeg
```
