# Lauren the Ginger Gnome

A sidescroller about a too-small ginger gnome with a limited amount of energy each day.

**Play it:** https://mrpnw.github.io/Lauren-the-ginger-gnome/ (updates automatically from `main`)

## Controls

| Action | Keyboard | Gamepad |
| --- | --- | --- |
| Move | Arrow keys or A / D | Left stick or d-pad |
| Run | Hold Shift | Hold B |
| Jump (hold for higher) | Space, W or Up | A |

## Adding art

Drawings go in [`art/`](art/README.md) as PNGs named after the art list in `src/art.ts`.
Anything missing is drawn as a placeholder.

## Running it locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```sh
npm install
npm run dev      # opens a local version that reloads as you edit
npm run build    # checks types and builds the site into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/config.ts` | Screen size and movement tuning (speed, jump height) |
| `src/art.ts` | The art list |
| `src/level.ts` | The test level, drawn as text |
| `src/objects/Player.ts` | Lauren's movement |
| `src/scenes/` | Loading and the game itself |
