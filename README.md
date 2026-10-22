# Lauren the Ginger Gnome

A sidescroller about a too-small ginger gnome with a limited amount of energy each day.

**Play it:** https://mrpnw.github.io/Lauren-the-ginger-gnome/ (updates automatically from `main`)

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | Arrow keys or A / D | Left stick or d-pad |
| Run | Hold Shift | Hold B |
| Jump (hold for higher) | Space, W or Up | A |
| Throw coffee mug (weapon) | J | X |
| Cast sharp wits (spell) | K | Y |
| Burst (borrow energy from tomorrow) | L | Right trigger |
| Go through a door / talk | E | D-pad up |

## Energy and days

Lauren starts each day with 100 energy. Walking, running and jumping use it up, and the clock
keeps ticking. A burst borrows energy from tomorrow. When the bar is empty you choose:

- **Energy of next day**: keep going, tomorrow starts emptier
- **Cry**: 1 hour passes, a little energy comes back
- **Sleep**: 8 hours pass and a new day starts, minus whatever you borrowed

All the numbers are in `src/config.ts` (`ENERGY` and `TIME`).

## Weapons, spells and enemies

- **Coffee mug** (6 energy): thrown in an arc, trailing fire. Incinerates what it hits.
- **Sharp wits** (15 energy): a fast beam that goes straight through every enemy in its way.
- **Small Talk**: a speech bubble on legs that patrols and drains 8 energy if you bump into it.

Weapons and spells are entries in `src/weapons.ts`, so adding one is mostly data.

## Rooms

The game is a series of rooms (`src/rooms.ts`): home, the street, the office. Each room is
left through its door, which stays locked while a boss is still standing. Rooms are built
from drawings: see [`art/README.md`](art/README.md).

## Adding art

Drawings go in [`art/`](art/README.md) as PNGs; templates are in `templates/`.
Anything missing is drawn as a placeholder. To regenerate the templates or placeholder
room maps: `python3 tools/make_templates.py` and `python3 tools/make_placeholder_rooms.py`.

## Running it locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```sh
npm install
npm run dev      # opens a local version that reloads as you edit
npm test         # runs the rule tests
npm run build    # checks types and builds the site into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/config.ts` | Screen size, movement, energy and time tuning |
| `src/art.ts` | The art list |
| `src/rooms.ts` | The rooms, their order and what people say |
| `src/animations.ts` | Lauren's animations: frames and speeds |
| `src/objects/Player.ts` | Lauren's movement |
| `src/systems/Energy.ts` | Energy, clock and day rules (tested in `Energy.test.ts`) |
| `src/weapons.ts` | Weapons and spells |
| `src/systems/Combat.ts` | Throwing, casting, hits and getting hurt |
| `src/objects/Enemy.ts` | Small Talk and the placeholder boss |
| `src/scenes/` | Loading and the game itself |
