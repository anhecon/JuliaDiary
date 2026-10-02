"""Synthesises the 20 s score for the boat scene: plucked guzheng, a xiao flute
melody (the companion in the boat is playing it), a low drone and river ambience.
Everything is in D major pentatonic. Writes music.wav next to this file."""
import os
import wave

import numpy as np

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(8)

NOTE = {'A2': 110.0, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'A3': 220.0, 'B3': 246.94,
        'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'A4': 440.0, 'B4': 493.88,
        'D5': 587.33, 'E5': 659.26, 'F#5': 739.99, 'A5': 880.0, 'B5': 987.77, 'D6': 1174.66}


def place(buf, start, sig):
    i = int(start * SR)
    j = min(N, i + len(sig))
    if i < N:
        buf[i:j] += sig[:j - i]


def guzheng(freq, vel=1.0, length=3.2, bend=0.0):
    t = np.arange(int(length * SR)) / SR
    # gentle press-vibrato (吟揉) that blooms after the attack
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - 0.35) * 2, 0, 1)
    f = freq * vib * (1 + bend * np.clip(t / 0.25, 0, 1))
    phase = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros_like(t)
    for h in range(1, 11):
        amp = np.sin(np.pi * h * 0.18) / h ** 1.1
        out += amp * np.exp(-t * (0.9 + 0.55 * h)) * np.sin(h * phase)
    out *= np.clip(t / 0.004, 0, 1)
    return 0.22 * vel * out


def xiao(freq, length, vel=1.0):
    t = np.arange(int(length * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 4.8 * t) * np.clip((t - 0.3) / 0.6, 0, 1)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    tone = np.sin(phase) + 0.18 * np.sin(2 * phase) + 0.06 * np.sin(3 * phase)
    breath = rng.standard_normal(len(t))
    breath = np.convolve(breath, np.ones(6) / 6, mode='same') - np.convolve(breath, np.ones(60) / 60, mode='same')
    env = np.clip(t / 0.14, 0, 1) * np.clip((length - t) / 0.3, 0, 1)
    swell = 0.85 + 0.15 * np.sin(np.pi * np.clip(t / length, 0, 1))
    return 0.13 * vel * env * swell * (tone + 0.35 * breath)


def roll(start, names, gap=0.09, vel=0.8):
    for k, n in enumerate(names):
        place(mix, start + k * gap, guzheng(NOTE[n], vel * (0.85 + 0.15 * (k == len(names) - 1))))


mix = np.zeros(N)

# -- guzheng opening, as the boat glides in
roll(0.5, ['D3', 'A3', 'D4'], 0.12, 0.7)
for t0, n, v in [(1.6, 'D4', .8), (1.85, 'E4', .7), (2.1, 'F#4', .75), (2.6, 'A4', .95),
                 (3.7, 'B4', .8), (4.0, 'A4', .7), (4.5, 'F#4', .8), (5.4, 'E4', .7), (5.9, 'D4', .85)]:
    place(mix, t0, guzheng(NOTE[n], v))

# -- the xiao enters when he raises the flute
for t0, n, d in [(5.6, 'A4', 1.9), (7.5, 'B4', 0.8), (8.3, 'D5', 1.9), (10.2, 'B4', 0.7),
                 (10.9, 'A4', 1.1), (12.0, 'F#4', 1.5), (13.5, 'E4', 0.9), (14.4, 'F#4', 0.7),
                 (15.1, 'A4', 1.3), (16.4, 'D4', 2.8)]:
    place(mix, t0, xiao(NOTE[n], d + 0.15))

# -- sparse guzheng accompaniment underneath
for t0, chord in [(7.4, ['D3', 'A3', 'D4', 'F#4']), (9.6, ['B3', 'D4', 'F#4']),
                  (11.8, ['A3', 'D4', 'E4']), (13.9, ['D3', 'A3', 'D4', 'F#4'])]:
    roll(t0, chord, 0.11, 0.45)

# -- closing glissando up the scale and a final ringing chord
gliss = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6']
for k, n in enumerate(gliss):
    place(mix, 16.2 + k * 0.045, guzheng(NOTE[n], 0.35 + 0.03 * k, 2.5))
roll(17.0, ['D3', 'A3', 'D4', 'A4', 'D5'], 0.07, 0.75)

# -- low drone on D/A, swelling slowly
t = np.arange(N) / SR
drone = (np.sin(2 * np.pi * NOTE['D3'] / 2 * t) + 0.5 * np.sin(2 * np.pi * NOTE['A2'] * t + 1)
         + 0.25 * np.sin(2 * np.pi * NOTE['D3'] * t * 1.002))
mix += 0.035 * drone * (0.6 + 0.4 * np.sin(2 * np.pi * t / 9))

# -- river ambience: soft lapping water
noise = rng.standard_normal(N)
water = np.convolve(noise, np.ones(40) / 40, mode='same')
lap = 0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t) * np.sin(2 * np.pi * 0.13 * t + 1)
mix += 0.12 * water * (0.4 + 0.6 * lap)

# -- hall reverb (convolution with a decaying noise tail)
ir_len = int(2.6 * SR)
ir_t = np.arange(ir_len) / SR
ir = rng.standard_normal(ir_len) * np.exp(-ir_t * 2.4)
ir = np.convolve(ir, np.ones(8) / 8, mode='same')
ir /= np.sqrt(np.sum(ir ** 2))
size = 1 << int(np.ceil(np.log2(N + ir_len)))
wet = np.fft.irfft(np.fft.rfft(mix, size) * np.fft.rfft(ir, size), size)[:N]
out = 0.75 * mix + 0.35 * wet

# stereo: slight decorrelation between channels
delay = int(0.011 * SR)
left = out
right = np.concatenate([np.zeros(delay), out[:-delay]]) * 0.6 + out * 0.4
stereo = np.stack([left, right], axis=1)

fade = np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 1.6, 0, 1)
stereo *= fade[:, None]
stereo /= np.max(np.abs(stereo)) / 0.89

pcm = (stereo * 32767).astype(np.int16)
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.wav')
with wave.open(path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', path)
