// Screen size: a small pixel canvas scaled up to fit the window.
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const TILE = 32;

// Movement tuning. Change these numbers and refresh to feel the difference.
export const MOVEMENT = {
  gravity: 1100,
  walkSpeed: 140,
  runSpeed: 220,
  acceleration: 1400,
  drag: 1600,
  jumpVelocity: 520,
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
