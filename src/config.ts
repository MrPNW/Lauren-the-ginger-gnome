// Screen size, scaled to fit the window. Matches the room drawings:
// one screen is 1280 x 720 px, a grid of 32 x 18 cells of 40 px.
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TILE = 40;

// Movement tuning. Change these numbers and refresh to feel the difference.
export const MOVEMENT = {
  gravity: 1800,
  walkSpeed: 230,
  runSpeed: 370,
  acceleration: 2400,
  drag: 2800,
  // About 4 cells high: twice Lauren's height.
  jumpVelocity: 800,
  maxFallSpeed: 1400,
  // Letting go of jump early cuts upward speed by this factor (short hop).
  jumpCutMultiplier: 0.45,
  // Grace period to still jump after walking off a ledge.
  coyoteMs: 100,
  // A jump pressed this long before landing still counts.
  jumpBufferMs: 120,
};

// Energy and time. All starting values, meant to be tuned by playing.
export const ENERGY = {
  max: 100,
  // Per second of movement.
  walkPerSecond: 0.6,
  runPerSecond: 1.8,
  jump: 2,
  // Burst: borrow this much from tomorrow at any time.
  burstAmount: 25,
  // "Energy of next day" when the bar is empty.
  borrowAmount: 50,
  // Crying gives back only this much.
  cryEnergy: 10,
};

export const TIME = {
  // Game minutes that pass per real second.
  minutesPerSecond: 1,
  // Day 1 starts at this time (minutes after midnight): 07:00.
  startMinutes: 7 * 60,
  cryMinutes: 60,
  sleepMinutes: 8 * 60,
};
