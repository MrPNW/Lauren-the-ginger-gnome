"""Makes the drawing templates in templates/: room grids, a size reference,
the object map legend and one sheet per Lauren animation.

Run: python3 tools/make_templates.py   (needs Pillow)
"""
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
out = ROOT / 'templates' / 'rooms'
out.mkdir(parents=True, exist_ok=True)
CELL = 40; H = 720; SCREEN = 1280
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = ImageFont.truetype(F, 14); small = ImageFont.truetype(F, 11); big = ImageFont.truetype(FB, 20)

def grid(w, bg=None):
    im = Image.new('RGBA', (w, H), bg or (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for x in range(0, w + 1, CELL):
        major = x % (CELL * 4) == 0
        screen = x % SCREEN == 0
        col = (40, 90, 200, 230) if screen else (60, 120, 220, 150) if major else (60, 120, 220, 60)
        d.line([(x, 0), (x, H)], fill=col, width=3 if screen else 1)
    for y in range(0, H + 1, CELL):
        major = y % (CELL * 4) == 0
        col = (60, 120, 220, 150) if major else (60, 120, 220, 60)
        d.line([(0, y), (w, y)], fill=col, width=1)
    for c in range(w // CELL):
        d.text((c * CELL + 3, 2), str(c), fill=(60, 120, 220, 170), font=small)
    for r in range(H // CELL):
        d.text((3, r * CELL + 14), str(r), fill=(60, 120, 220, 170), font=small)
    return im

for n in (1, 2, 3):
    grid(SCREEN * n).save(out / f'room_grid_{n}screen{"s" if n > 1 else ""}.png')

# Reference sheet: sizes on the grid.
im = grid(SCREEN, (255, 255, 255, 255))
d = ImageDraw.Draw(im)
floor = 16 * CELL
d.rectangle([0, floor, SCREEN, H], fill=(40, 40, 40, 255))
d.text((8, floor + 12), 'Floor (example): rows 16-17', fill='white', font=font)
def label(x, y, t): d.text((x, y), t, fill=(30, 30, 30), font=font, anchor='mm')
# Lauren 1x2 cells
lx = 4 * CELL
d.rectangle([lx, floor - 2 * CELL, lx + CELL, floor], fill=(232, 116, 42))
label(lx + CELL / 2, floor - 2 * CELL - 30, 'Lauren'); label(lx + CELL / 2, floor - 2 * CELL - 14, '1 x 2 cells (40 x 80 px)')
# Human 2x4 cells
hx = 8 * CELL
d.rectangle([hx, floor - 4 * CELL, hx + 2 * CELL, floor], fill=(120, 120, 160))
label(hx + CELL, floor - 4 * CELL - 30, 'Human enemy'); label(hx + CELL, floor - 4 * CELL - 14, '2 x 4 cells (80 x 160 px)')
# Door 3x5 cells
dx = 14 * CELL
d.rectangle([dx, floor - 5 * CELL, dx + 3 * CELL, floor], fill=(139, 94, 60), outline=(60, 40, 20), width=3)
d.ellipse([dx + 3 * CELL - 22, floor - 2.6 * CELL, dx + 3 * CELL - 12, floor - 2.6 * CELL + 10], fill=(230, 200, 80))
label(dx + 1.5 * CELL, floor - 5 * CELL - 30, 'Door'); label(dx + 1.5 * CELL, floor - 5 * CELL - 14, '3 x 5 cells (120 x 200 px)')
# Window: transparent hole showing back pane
wx, wy = 21 * CELL, 6 * CELL
d.rectangle([wx, wy, wx + 4 * CELL, wy + 3 * CELL], fill=(170, 210, 240), outline=(80, 80, 80), width=4)
d.line([(wx + 2 * CELL, wy), (wx + 2 * CELL, wy + 3 * CELL)], fill=(80, 80, 80), width=4)
label(wx + 2 * CELL, wy - 30, 'Window'); label(wx + 2 * CELL, wy - 14, 'leave transparent: back pane shows through')
# Platform
px = 27 * CELL
d.rectangle([px, 12 * CELL, px + 4 * CELL, 12 * CELL + 12], fill=(139, 109, 75))
label(px + 2 * CELL, 12 * CELL - 14, 'Platform (jump up through)')
d.text((24, 40), 'Room reference: 1 screen = 1280 x 720 px = 32 x 18 cells of 40 px', fill=(20, 20, 20), font=big)
im.convert('RGB').save(out / 'room_reference.png')

# Map legend.
legend = [
    ('#000000', 'Solid: walls, floor, ceiling'),
    ('#0000FF', 'Platform: jump up through, stand on top'),
    ('#00FF00', 'Door: the exit to the next room'),
    ('#FFFF00', 'Lauren starts here'),
    ('#FF0000', 'Enemy: paint the cells where it stands'),
    ('#FF00FF', 'Boss: the door stays locked until it is beaten'),
    ('#FF8000', 'Interaction (person to talk to, object to use)'),
]
L = Image.new('RGB', (760, 70 + 56 * len(legend)), 'white')
d = ImageDraw.Draw(L)
d.text((20, 18), 'Object map colours (paint whole 40 px cells)', fill='black', font=big)
for i, (hexc, text) in enumerate(legend):
    y = 70 + i * 56
    d.rectangle([20, y, 20 + 40, y + 40], fill=hexc, outline='black')
    d.text((76, y + 4), text, fill='black', font=font)
    d.text((76, y + 22), hexc, fill=(100, 100, 100), font=small)
L.save(out / 'map_legend.png')


# ---- Lauren's animation sheets ----
# Frame size and the animation list are read from src/animations.ts so the
# templates always match the game.
src = (ROOT / 'src' / 'animations.ts').read_text()
FW = int(re.search(r'width: (\d+),\n  height', src).group(1))
FH = int(re.search(r'height: (\d+),\n  scale', src).group(1))
FEET = int(re.search(r'feetY: (\d+)', src).group(1))
bx, by, bw, bh = map(int, re.search(r'body: \{ x: (\d+), y: (\d+), width: (\d+), height: (\d+) \}', src).groups())
anims = [dict(key=k, frames=int(f), fps=int(r), desc=d) for k, f, r, d in
         re.findall(r"key: '(\w+)', frames: (\d+), fps: (\d+), loop: \w+, description: '([^']*)'", src)]

cdir = ROOT / 'templates' / 'character'
cdir.mkdir(parents=True, exist_ok=True)
tiny = ImageFont.truetype(F, 10)
for a in anims:
    sheet = Image.new('RGBA', (FW * a['frames'], FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(sheet)
    for i in range(a['frames']):
        x0 = i * FW
        d.rectangle([x0, 0, x0 + FW - 1, FH - 1], outline=(60, 120, 220, 160))
        # Body box (where Lauren fits) and centre line.
        for yy in range(by, by + bh, 8):
            d.line([(x0 + bx, yy), (x0 + bx, yy + 4)], fill=(60, 120, 220, 110))
            d.line([(x0 + bx + bw, yy), (x0 + bx + bw, yy + 4)], fill=(60, 120, 220, 110))
        d.line([(x0 + bx, by), (x0 + bx + bw, by)], fill=(60, 120, 220, 110))
        d.line([(x0 + FW // 2, 14), (x0 + FW // 2, FH)], fill=(60, 120, 220, 50))
        # Ground line where her feet go.
        d.line([(x0, FEET), (x0 + FW, FEET)], fill=(220, 60, 60, 200), width=2)
        d.text((x0 + 4, 2), f"{a['key']} {i + 1}/{a['frames']}", fill=(60, 120, 220, 220), font=tiny)
    sheet.save(cdir / f"lauren_{a['key']}_template.png")

# Overview sheet.
rows = len(anims)
ov = Image.new('RGB', (1080, 120 + rows * 34), 'white')
d = ImageDraw.Draw(ov)
d.text((20, 16), "Lauren's animations: one PNG strip per row, frames side by side", fill='black', font=big)
d.text((20, 46), f'Frame {FW} x {FH} px (shown at half size). Draw facing right; the game mirrors her for left.', fill=(60, 60, 60), font=font)
d.text((20, 66), f'Feet on the red line ({FEET} px down). Save as art/lauren_<name>.png.', fill=(60, 60, 60), font=font)
y = 100
d.text((20, y), 'File', fill='black', font=font); d.text((260, y), 'Frames', fill='black', font=font)
d.text((330, y), 'Strip width', fill='black', font=font)
d.text((450, y), 'Speed', fill='black', font=font); d.text((540, y), 'What', fill='black', font=font)
for a in anims:
    y += 34
    d.text((20, y), f"lauren_{a['key']}.png", fill='black', font=font)
    d.text((260, y), str(a['frames']), fill='black', font=font)
    d.text((330, y), f"{a['frames'] * FW} px", fill=(90, 90, 90), font=font)
    d.text((450, y), f"{a['fps']} fps", fill='black', font=font)
    d.text((540, y), a['desc'], fill='black', font=font)
ov.save(cdir / 'lauren_animations.png')
print('templates written to', ROOT / 'templates')
