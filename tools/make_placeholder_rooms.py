"""Draws the placeholder object maps in art/rooms/. Replace them with your own.

Run: python3 tools/make_placeholder_rooms.py   (needs Pillow)
"""
from pathlib import Path
from PIL import Image

CELL = 40
ROWS = 18
COLOURS = {
    '#': (0, 0, 0),        # solid
    '=': (0, 0, 255),      # platform
    'D': (0, 255, 0),      # door
    'S': (255, 255, 0),    # Lauren's start
    'E': (255, 0, 0),      # enemy
    'B': (255, 0, 255),    # boss
    'I': (255, 128, 0),    # interaction
}


def room(cols):
    return [['.'] * cols for _ in range(ROWS)]


def fill(g, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            g[y][x] = ch


def box(g, ceiling=True):
    cols = len(g[0])
    fill(g, 0, 16, cols - 1, 17, '#')
    fill(g, 0, 0, 0, 17, '#')
    fill(g, cols - 1, 0, cols - 1, 17, '#')
    if ceiling:
        fill(g, 0, 0, cols - 1, 0, '#')


def save(g, name):
    img = Image.new('RGBA', (len(g[0]) * CELL, ROWS * CELL), (0, 0, 0, 0))
    for y, row in enumerate(g):
        for x, ch in enumerate(row):
            if ch in COLOURS:
                img.paste(COLOURS[ch] + (255,), (x * CELL, y * CELL, (x + 1) * CELL, (y + 1) * CELL))
    out = Path(__file__).resolve().parent.parent / 'art' / 'rooms' / f'{name}_map.png'
    img.save(out)
    print('wrote', out)


# Home: one screen. A mirror to talk to, a shelf, the front door.
g = room(32)
box(g)
fill(g, 3, 14, 3, 15, 'S')
fill(g, 8, 12, 9, 15, 'I')
fill(g, 13, 11, 17, 11, '=')
fill(g, 27, 11, 29, 15, 'D')
save(g, 'home')

# The street: two screens. Small Talk on the pavement, a gap, platforms.
g = room(64)
box(g, ceiling=False)
fill(g, 20, 16, 22, 17, '.')
fill(g, 2, 14, 2, 15, 'S')
fill(g, 12, 15, 12, 15, 'E')
fill(g, 30, 15, 30, 15, 'E')
fill(g, 46, 15, 46, 15, 'E')
fill(g, 24, 12, 27, 12, '=')
fill(g, 36, 10, 39, 10, '=')
fill(g, 33, 14, 35, 15, '#')
fill(g, 59, 11, 61, 15, 'D')
save(g, 'street')

# The office: one screen. A colleague, Small Talk, the boss before the door.
g = room(32)
box(g)
fill(g, 2, 14, 2, 15, 'S')
fill(g, 6, 12, 7, 15, 'I')
fill(g, 10, 11, 13, 11, '=')
fill(g, 13, 15, 13, 15, 'E')
fill(g, 20, 12, 21, 15, 'B')
fill(g, 27, 11, 29, 15, 'D')
save(g, 'office')
