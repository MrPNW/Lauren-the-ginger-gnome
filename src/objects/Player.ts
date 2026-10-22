import Phaser from 'phaser';
import { LAUREN_ANIMS, LAUREN_FRAME, laurenTextureKey } from '../animations';
import { MOVEMENT } from '../config';
import type { ControlState } from '../controls';

type Action = 'throw' | 'cast' | 'hurt';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lastGroundedAt = -Infinity;
  private jumpPressedAt = -Infinity;
  private jumping = false;
  private action: Action | null = null;
  private actionUntil = 0;
  /** Set by the game each frame; below 20% Lauren looks tired. */
  tired = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, laurenTextureKey('idle'), 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(LAUREN_FRAME.scale);

    // Body size and offset are in frame pixels; Phaser scales them with the sprite.
    const b = LAUREN_FRAME.body;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(b.width - 12, b.height - 8).setOffset(b.x + 6, b.y + 8);
    body.setMaxVelocityY(MOVEMENT.maxFallSpeed);
    this.setDragX(MOVEMENT.drag);
    this.play(laurenTextureKey('idle'));
  }

  respawn(x: number, y: number): void {
    (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
    this.setAcceleration(0, 0);
    this.jumping = false;
  }

  /** Places Lauren so her feet stand at (x, feetY). */
  placeFeetAt(x: number, feetY: number): void {
    const centreToFeet = (LAUREN_FRAME.feetY - LAUREN_FRAME.height / 2) * LAUREN_FRAME.scale;
    this.respawn(x, feetY - centreToFeet - 1);
  }

  /** Plays a one-off animation such as throwing; movement continues underneath. */
  playAction(action: Action): void {
    const def = LAUREN_ANIMS.find((a) => a.key === action)!;
    this.action = action;
    this.actionUntil = this.scene.time.now + (def.frames / def.fps) * 1000;
    this.play(laurenTextureKey(action), true);
  }

  /** Moves Lauren for this frame. Returns true if she jumped. */
  update(time: number, c: ControlState): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;
    const maxSpeed = c.run ? MOVEMENT.runSpeed : MOVEMENT.walkSpeed;

    // Walking and running.
    if (c.left === c.right) {
      this.setAccelerationX(0);
    } else {
      const dir = c.left ? -1 : 1;
      this.setAccelerationX(dir * MOVEMENT.acceleration);
      this.setFlipX(dir < 0);
    }
    body.setMaxVelocityX(maxSpeed);

    // Jumping, with coyote time and jump buffering.
    if (onGround) {
      this.lastGroundedAt = time;
      if (body.velocity.y >= 0) this.jumping = false;
    }
    if (c.jumpPressed) this.jumpPressedAt = time;

    let jumped = false;
    const canJump = time - this.lastGroundedAt <= MOVEMENT.coyoteMs && !this.jumping;
    const wantsJump = time - this.jumpPressedAt <= MOVEMENT.jumpBufferMs;
    if (canJump && wantsJump) {
      this.setVelocityY(-MOVEMENT.jumpVelocity);
      this.jumping = true;
      this.jumpPressedAt = -Infinity;
      jumped = true;
    }

    // Short hop: letting go early cuts the jump.
    if (this.jumping && !c.jumpHeld && body.velocity.y < 0) {
      this.setVelocityY(body.velocity.y * MOVEMENT.jumpCutMultiplier);
      this.jumping = false;
    }

    this.animate(time, onGround, c.run);
    return jumped;
  }

  private animate(time: number, onGround: boolean, running: boolean): void {
    if (this.action && time < this.actionUntil) return;
    this.action = null;

    const body = this.body as Phaser.Physics.Arcade.Body;
    let anim: string;
    if (!onGround) {
      anim = body.velocity.y < 0 ? 'jump' : 'fall';
    } else if (Math.abs(body.velocity.x) > 20) {
      anim = running ? 'run' : 'walk';
    } else {
      anim = this.tired ? 'tired' : 'idle';
    }
    this.play(laurenTextureKey(anim), true);
  }
}
