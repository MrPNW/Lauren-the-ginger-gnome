// The art list. Every image the game uses is listed here with its final size.
// To use real art, save a transparent PNG at art/<key>.png with the
// same size. Anything missing is drawn as a placeholder instead.

export interface ArtEntry {
  key: string;
  width: number;
  height: number;
  description: string;
}

export const ART: ArtEntry[] = [
  { key: 'lauren', width: 32, height: 48, description: 'Lauren standing, facing right' },
  { key: 'ground', width: 32, height: 32, description: 'Ground tile (top surface)' },
  { key: 'dirt', width: 32, height: 32, description: 'Ground tile (below the surface)' },
  { key: 'platform', width: 32, height: 16, description: 'Floating platform tile' },
  { key: 'small_talk', width: 32, height: 32, description: 'Enemy: Small Talk, a walking speech bubble' },
  { key: 'coffee_mug', width: 14, height: 14, description: 'Thrown coffee mug (flaming)' },
  { key: 'sharp_wits', width: 28, height: 8, description: 'Sharp wits spell beam' },
  { key: 'flame', width: 8, height: 8, description: 'Flame particle' },
  { key: 'background', width: 640, height: 360, description: 'Sky / far background, scrolls slowly' },
];
