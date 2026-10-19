# Lauren the Ginger Gnome

A sidescroller about a too-small ginger gnome with a limited amount of energy each day.

**Play it:** https://mrpnw.github.io/Lauren-the-ginger-gnome/ (updates automatically from `main`)

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | Arrow keys or A / D | Left stick or d-pad |
| Run | Hold Shift | Hold B |
| Jump (hold for higher) | Space, W or Up | A |
| Burst (borrow energy from tomorrow) | L | Right trigger |

## Energy and days

Lauren starts each day with 100 energy. Walking, running and jumping use it up, and the clock
keeps ticking. A burst borrows energy from tomorrow. When the bar is empty you choose:

- **Energy of next day**: keep going, tomorrow starts emptier
- **Cry**: 1 hour passes, a little energy comes back
- **Sleep**: 8 hours pass and a new day starts, minus whatever you borrowed

All the numbers are in `src/config.ts` (`ENERGY` and `TIME`).

## Adding art

Drawings go in [`art/`](art/README.md) as PNGs named after the art list in `src/art.ts`.
Anything missing is drawn as a placeholder.

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
| `src/level.ts` | The test level, drawn as text |
| `src/objects/Player.ts` | Lauren's movement |
| `src/systems/Energy.ts` | Energy, clock and day rules (tested in `Energy.test.ts`) |
| `src/scenes/` | Loading and the game itself |
