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
