# Art

Drop finished drawings here as transparent PNGs. Anything that isn't here yet
is drawn as a placeholder, so art can arrive one file at a time. Templates for
everything are in [`templates/`](../templates).

## Rooms (`art/rooms/`)

Each room is three PNGs on a 40 px grid, 720 px tall and 1280 px wide per screen
(rooms can be 1 to 3 screens wide). The rooms and their order are in `src/rooms.ts`.

| File | What it is |
| --- | --- |
| `<room>_map.png` | Object map: flat colours on whole cells (see `templates/rooms/map_legend.png`). Required. |
| `<room>.png` | What the player sees. Leave windows transparent. |
| `<room>_back.png` | Back pane, only seen through the windows. |

Map colours: black `#000000` solid, blue `#0000FF` platform, green `#00FF00` door,
yellow `#FFFF00` Lauren's start, red `#FF0000` enemy, magenta `#FF00FF` boss
(the door stays locked until it's beaten), orange `#FF8000` someone to talk to.
The game reads the centre of each cell, so edges don't need to be precise.

Sizes: Lauren is 1 x 2 cells, human enemies 2 x 4 cells, doors 3 x 5 cells.

The current maps are placeholders made by `tools/make_placeholder_rooms.py`.

## Lauren (`art/lauren_<name>.png`)

One PNG strip per animation, frames side by side, each frame 160 x 192 px
(drawn at double size, shown at half). Draw her facing right with her feet on
the red line of the template; the game mirrors her for walking left. The list of
animations, frame counts and speeds is in `src/animations.ts` and
`templates/character/lauren_animations.png`.

## Everything else (`art/<key>.png`)

| File | Size (px) | What it is |
| --- | --- | --- |
| `small_talk.png` | 48 x 48 | Enemy: Small Talk, a walking speech bubble |
| `boss.png` | 80 x 160 | Boss (placeholder until each room has its own) |
| `person.png` | 80 x 160 | Someone to talk to |
| `coffee_mug.png` | 28 x 28 | Thrown coffee mug (flaming) |
| `sharp_wits.png` | 56 x 16 | Sharp wits spell beam, pointing right |
| `flame.png` | 16 x 16 | Flame particle |
