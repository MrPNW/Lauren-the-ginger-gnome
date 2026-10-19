import Phaser from 'phaser';

// Reads keyboard and gamepad into one simple state each frame.
export interface ControlState {
  left: boolean;
  right: boolean;
  run: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
}

export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private scene: Phaser.Scene;
  private padJumpWasDown = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      left: K.LEFT, right: K.RIGHT, a: K.A, d: K.D,
      up: K.UP, w: K.W, space: K.SPACE, shift: K.SHIFT,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  read(): ControlState {
    const k = this.keys;
    const JD = Phaser.Input.Keyboard.JustDown;
    const pad = this.scene.input.gamepad?.getPad(0);

    let left = k.left.isDown || k.a.isDown;
    let right = k.right.isDown || k.d.isDown;
    let run = k.shift.isDown;
    let jumpHeld = k.space.isDown || k.up.isDown || k.w.isDown;
    let jumpPressed = JD(k.space) || JD(k.up) || JD(k.w);

    if (pad) {
      const x = pad.leftStick.x;
      left ||= pad.left || x < -0.3;
      right ||= pad.right || x > 0.3;
      run ||= pad.B;
      const padJump = pad.A;
      jumpHeld ||= padJump;
      jumpPressed ||= padJump && !this.padJumpWasDown;
      this.padJumpWasDown = padJump;
    }

    return { left, right, run, jumpHeld, jumpPressed };
  }
}
