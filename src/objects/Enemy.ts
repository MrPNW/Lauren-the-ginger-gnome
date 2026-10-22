import Phaser from 'phaser';

export interface EnemyKind {
  texture: string;
  health: number;
  /** Energy Lauren loses when she bumps into it. */
  contactDrain: number;
  speed: number;
  isBoss: boolean;
}

export const SMALL_TALK: EnemyKind = { texture: 'small_talk', health: 3, contactDrain: 8, speed: 65, isBoss: false };
// Placeholder boss until each room gets its own (like the coffee machine dude).
export const BOSS: EnemyKind = { texture: 'boss', health: 15, contactDrain: 15, speed: 50, isBoss: true };

// Patrols back and forth and drains Lauren's energy if she bumps into it.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  readonly contactDrain: number;
  readonly isBoss: boolean;
  private speed: number;
  private dir = -1;

  constructor(scene: Phaser.Scene, x: number, feetY: number, kind: EnemyKind) {
    super(scene, x, feetY, kind.texture);
    this.setOrigin(0.5, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.health = kind.health;
    this.contactDrain = kind.contactDrain;
    this.isBoss = kind.isBoss;
    this.speed = kind.speed;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.8, this.height * 0.95).setOffset(this.width * 0.1, this.height * 0.05);
  }

  get alive(): boolean {
    return this.health > 0 && this.active;
  }

  update(): void {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Turn around at walls and at ledges.
    if (body.blocked.left) this.dir = 1;
    if (body.blocked.right) this.dir = -1;
    if (body.blocked.down && !this.groundAhead()) this.dir *= -1;
    this.setVelocityX(this.speed * this.dir);
    this.setFlipX(this.dir > 0);
  }

  /** Walk away from a point (used after bumping into Lauren). */
  walkAwayFrom(x: number): void {
    this.dir = x < this.x ? 1 : -1;
  }

  hit(damage: number): boolean {
    this.health -= damage;
    if (this.health > 0) {
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => this.clearTint());
      return false;
    }
    return true;
  }

  private groundAhead(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const x = this.dir > 0 ? body.right + 2 : body.left - 2;
    const y = body.bottom + 4;
    const hits = this.scene.physics.overlapRect(x, y, 2, 2, false, true);
    return hits.length > 0;
  }
}
