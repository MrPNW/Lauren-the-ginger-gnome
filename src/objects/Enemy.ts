import Phaser from 'phaser';

// Small Talk: a speech bubble that patrols back and forth and drains Lauren's
// energy if she bumps into it.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  health = 3;
  readonly contactDrain = 8;
  private speed = 40;
  private dir = -1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'small_talk');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setSize(26, 30).setOffset(3, 2);
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
