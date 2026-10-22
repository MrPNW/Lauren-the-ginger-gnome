// The art list. Every image the game uses (apart from rooms and Lauren's
// animations, see src/rooms.ts and src/animations.ts) is listed here with its
// size in the game. To use real art, save a transparent PNG at art/<key>.png.
// Anything missing is drawn as a placeholder instead.

export interface ArtEntry {
  key: string;
  width: number;
  height: number;
  description: string;
}

export const ART: ArtEntry[] = [
  { key: 'small_talk', width: 48, height: 48, description: 'Enemy: Small Talk, a walking speech bubble' },
  { key: 'boss', width: 80, height: 160, description: 'Boss (placeholder human, 2 x 4 cells)' },
  { key: 'person', width: 80, height: 160, description: 'Someone to talk to (2 x 4 cells)' },
  { key: 'coffee_mug', width: 28, height: 28, description: 'Thrown coffee mug (flaming)' },
  { key: 'sharp_wits', width: 56, height: 16, description: 'Sharp wits spell beam, pointing right' },
  { key: 'flame', width: 16, height: 16, description: 'Flame particle' },
];
