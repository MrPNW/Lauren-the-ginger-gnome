import Phaser from 'phaser';
import { MOVEMENT } from '../config';
import type { ControlState } from '../controls';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lastGroundedAt = -Infinity;
  private jumpPressedAt = -Infinity;
  private jumping = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'lauren');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width - 8, this.height - 4).setOffset(4, 4);
    body.setMaxVelocityY(900);
    this.setDragX(MOVEMENT.drag);
  }

  respawn(x: number, y: number): void {
    (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
    this.setAcceleration(0, 0);
    this.jumping = false;
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
    return jumped;
  }
}
