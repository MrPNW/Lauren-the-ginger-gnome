// Weapons and spells. Everyday things that behave like real fantasy gear.
// Add a new one by adding an entry here (and its art to src/art.ts).

export interface WeaponDef {
  id: string;
  name: string;
  kind: 'weapon' | 'spell';
  /** Energy each use costs. */
  energyCost: number;
  damage: number;
  /** Texture key of the projectile. */
  texture: string;
  /** Horizontal speed in px per second. */
  speed: number;
  /** Upward speed at launch; above zero makes it arc like a throw. */
  lift: number;
  /** Whether gravity pulls it down. */
  gravity: boolean;
  /** How long it flies before vanishing, in ms. */
  lifetimeMs: number;
  /** Goes through enemies instead of stopping at the first. */
  pierces: boolean;
  cooldownMs: number;
  /** What happens to an enemy it finishes off. */
  finish: 'incinerate' | 'devastate';
}

export const WEAPONS: Record<string, WeaponDef> = {
  coffeeMug: {
    id: 'coffeeMug',
    name: 'Coffee mug',
    kind: 'weapon',
    energyCost: 6,
    damage: 3,
    texture: 'coffee_mug',
    speed: 260,
    lift: 220,
    gravity: true,
    lifetimeMs: 1400,
    pierces: false,
    cooldownMs: 350,
    finish: 'incinerate',
  },
  sharpWits: {
    id: 'sharpWits',
    name: 'Sharp wits',
    kind: 'spell',
    energyCost: 15,
    damage: 3,
    texture: 'sharp_wits',
    speed: 520,
    lift: 0,
    gravity: false,
    lifetimeMs: 700,
    pierces: true,
    cooldownMs: 600,
    finish: 'devastate',
  },
};

export const STARTING_WEAPON = WEAPONS.coffeeMug;
export const STARTING_SPELL = WEAPONS.sharpWits;
