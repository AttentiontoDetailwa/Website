#!/usr/bin/env python3
"""Regenerate the responsive image set in assets/.

Every photo on the site is served through <picture> with a srcset of widths, so
a phone pulls a 400px file where it used to pull a 900px one. This script is
what builds that set: point it at the full-size masters (the unsuffixed .jpg
and .png files) and it writes assets/NAME-WIDTH.webp and NAME-WIDTH.jpg beside
them.

Run it after replacing any master — a new photo of Ava, a fresh Google map, new
job photos:

    python3 tools-resize-images.py

Nothing else in the project needs a build step, and this is not one either: the
site works from the files already in assets/. This just saves doing it by hand.
"""
from PIL import Image
import glob, os, re

WEBP_Q, JPEG_Q = 72, 78          # q~80 was the old set; 72 is ~27% smaller, no visible change
STEPS = [400, 640, 900, 1280]

masters = [f for f in glob.glob('assets/*.jpg') + glob.glob('assets/*.png')
           if not re.search(r'-\d+\.(jpg|png)$', f)
           and not os.path.basename(f).startswith(('icon-', 'apple-touch'))]

for m in sorted(masters):
    stem = re.sub(r'\.(jpg|png)$', '', m)
    im = Image.open(m).convert('RGB')
    w0, h0 = im.size
    widths = sorted({w for w in STEPS if w < w0} | {w0})
    for w in widths:
        r = im.resize((w, round(h0 * w / w0)), Image.LANCZOS)
        r.save(f'{stem}-{w}.webp', 'WEBP', quality=WEBP_Q, method=6)
        r.save(f'{stem}-{w}.jpg', 'JPEG', quality=JPEG_Q, optimize=True, progressive=True)
    print(f'{os.path.basename(stem):22} {w0}x{h0} -> {widths}')
