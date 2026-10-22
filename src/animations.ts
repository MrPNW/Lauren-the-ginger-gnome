// Lauren's animations. Each one is a single PNG strip of frames side by side,
// saved as art/lauren_<key>.png. Draw her facing right; the game mirrors her
// when she walks left. Anything missing gets placeholder frames.

/**
 * Frame size in the PNG. Frames are drawn at double size and shown at half,
 * so in the game a frame is 80 x 96 px and Lauren herself 40 x 80 px.
 */
export const LAUREN_FRAME = {
  width: 160,
  height: 192,
  scale: 0.5,
  // Where her feet touch the ground, from the top of the frame.
  feetY: 184,
  // Her body inside the frame (for collisions), in frame pixels.
  body: { x: 40, y: 24, width: 80, height: 160 },
};

export interface AnimDef {
  key: string;
  frames: number;
  /** Drawings per second. 12 is the standard; slow loops use fewer. */
  fps: number;
  loop: boolean;
  description: string;
}

export const LAUREN_ANIMS: AnimDef[] = [
  { key: 'idle', frames: 6, fps: 6, loop: true, description: 'Standing still, breathing, a blink' },
  { key: 'walk', frames: 8, fps: 12, loop: true, description: 'Walking cycle' },
  { key: 'run', frames: 8, fps: 12, loop: true, description: 'Running cycle' },
  { key: 'jump', frames: 3, fps: 12, loop: false, description: 'Crouch, push off, rising' },
  { key: 'fall', frames: 2, fps: 8, loop: true, description: 'Falling (top of the jump and down)' },
  { key: 'throw', frames: 4, fps: 12, loop: false, description: 'Throwing the coffee mug' },
  { key: 'cast', frames: 4, fps: 12, loop: false, description: 'Casting a spell (sharp wits)' },
  { key: 'hurt', frames: 2, fps: 12, loop: false, description: 'Getting hit' },
  { key: 'tired', frames: 6, fps: 6, loop: true, description: 'Standing still with almost no energy left' },
  { key: 'cry', frames: 6, fps: 8, loop: true, description: 'Crying (for the cry choice, used later)' },
  { key: 'sleep', frames: 4, fps: 4, loop: true, description: 'Sleeping (for the sleep choice, used later)' },
];

export const laurenTextureKey = (anim: string) => `lauren_${anim}`;
