import Phaser from 'phaser';

// Reads keyboard and gamepad into one simple state each frame.
export interface ControlState {
  left: boolean;
  right: boolean;
  run: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;
  burstPressed: boolean;
  weaponPressed: boolean;
  spellPressed: boolean;
}

export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private scene: Phaser.Scene;
  private padJumpWasDown = false;
  private padBurstWasDown = false;
  private padWeaponWasDown = false;
  private padSpellWasDown = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      left: K.LEFT, right: K.RIGHT, a: K.A, d: K.D,
      up: K.UP, w: K.W, space: K.SPACE, shift: K.SHIFT, burst: K.L,
      weapon: K.J, spell: K.K,
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
    let burstPressed = JD(k.burst);
    let weaponPressed = JD(k.weapon);
    let spellPressed = JD(k.spell);

    if (pad) {
      const x = pad.leftStick.x;
      left ||= pad.left || x < -0.3;
      right ||= pad.right || x > 0.3;
      run ||= pad.B;
      const padJump = pad.A;
      jumpHeld ||= padJump;
      jumpPressed ||= padJump && !this.padJumpWasDown;
      this.padJumpWasDown = padJump;
      const padBurst = pad.R2 > 0.5;
      burstPressed ||= padBurst && !this.padBurstWasDown;
      this.padBurstWasDown = padBurst;
      weaponPressed ||= pad.X && !this.padWeaponWasDown;
      this.padWeaponWasDown = pad.X;
      spellPressed ||= pad.Y && !this.padSpellWasDown;
      this.padSpellWasDown = pad.Y;
    }

    return { left, right, run, jumpHeld, jumpPressed, burstPressed, weaponPressed, spellPressed };
  }
}
