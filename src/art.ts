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
  { key: 'background', width: 640, height: 360, description: 'Sky / far background, scrolls slowly' },
];
