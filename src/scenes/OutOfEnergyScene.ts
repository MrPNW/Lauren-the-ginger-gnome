import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { EnergyState } from '../systems/Energy';

interface Choice {
  label: string;
  detail: string;
  enabled: (s: EnergyState) => boolean;
  apply: (s: EnergyState) => string;
}

const CHOICES: Choice[] = [
  {
    label: 'Energy of next day',
    detail: 'Keep going now. Tomorrow starts emptier.',
    enabled: (s) => s.debt < s.max,
    apply: (s) => (s.borrowFromTomorrow(), 'Borrowed from tomorrow. Future Lauren will deal with it.'),
  },
  {
    label: 'Cry',
    detail: '1 hour passes. A little energy comes back.',
    enabled: () => true,
    apply: (s) => (s.cry(), 'One hour of crying later...'),
  },
  {
    label: 'Sleep',
    detail: '8 hours pass. A new day begins.',
    enabled: () => true,
    apply: (s) => (s.sleep(), `8 hours later... Day ${s.day}.`),
  },
];

// The menu that appears when Lauren runs out of energy.
export class OutOfEnergyScene extends Phaser.Scene {
  private index = 0;
  private rows: Phaser.GameObjects.Text[] = [];
  private details: Phaser.GameObjects.Text[] = [];
  private chosen = false;
  private padWasDown = { up: false, down: false, ok: false };

  constructor() {
    super('OutOfEnergy');
  }

  create(): void {
    const s = this.registry.get('energy') as EnergyState;
    this.index = CHOICES.findIndex((c) => c.enabled(s));
    this.chosen = false;
    this.rows = [];
    this.details = [];

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1d1a24, 0.75).setOrigin(0);
    this.add.text(GAME_WIDTH / 2, 70, 'Out of energy', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 98, 'What now, Lauren?', {
      fontFamily: 'monospace', fontSize: '12px', color: '#c9c3d6',
    }).setOrigin(0.5);

    CHOICES.forEach((c, i) => {
      const y = 150 + i * 52;
      const row = this.add.text(GAME_WIDTH / 2, y, c.label, {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const detail = this.add.text(GAME_WIDTH / 2, y + 18, c.detail, {
        fontFamily: 'monospace', fontSize: '10px', color: '#c9c3d6',
      }).setOrigin(0.5);
      row.on('pointerover', () => c.enabled(s) && this.select(i));
      row.on('pointerdown', () => c.enabled(s) && this.choose(i));
      this.rows.push(row);
      this.details.push(detail);
    });

    const K = Phaser.Input.Keyboard.KeyCodes;
    const kb = this.input.keyboard!;
    kb.on('keydown', (e: KeyboardEvent) => {
      if ([K.UP, K.W].includes(e.keyCode)) this.move(-1);
      if ([K.DOWN, K.S].includes(e.keyCode)) this.move(1);
      if ([K.ENTER, K.SPACE].includes(e.keyCode)) this.choose(this.index);
    });

    this.refresh();
  }

  update(): void {
    const pad = this.input.gamepad?.getPad(0);
    if (!pad) return;
    const up = pad.up || pad.leftStick.y < -0.5;
    const down = pad.down || pad.leftStick.y > 0.5;
    const ok = pad.A;
    if (up && !this.padWasDown.up) this.move(-1);
    if (down && !this.padWasDown.down) this.move(1);
    if (ok && !this.padWasDown.ok) this.choose(this.index);
    this.padWasDown = { up, down, ok };
  }

  private move(dir: number): void {
    const s = this.registry.get('energy') as EnergyState;
    let i = this.index;
    for (let n = 0; n < CHOICES.length; n++) {
      i = (i + dir + CHOICES.length) % CHOICES.length;
      if (CHOICES[i].enabled(s)) break;
    }
    this.select(i);
  }

  private select(i: number): void {
    this.index = i;
    this.refresh();
  }

  private refresh(): void {
    const s = this.registry.get('energy') as EnergyState;
    this.rows.forEach((row, i) => {
      const on = CHOICES[i].enabled(s);
      row.setText(i === this.index ? `> ${CHOICES[i].label} <` : CHOICES[i].label);
      row.setColor(!on ? '#6b6478' : i === this.index ? '#ffcf5a' : '#ffffff');
      this.details[i].setText(on ? CHOICES[i].detail : 'Tomorrow has nothing left to give.');
    });
  }

  private choose(i: number): void {
    if (this.chosen) return;
    const s = this.registry.get('energy') as EnergyState;
    if (!CHOICES[i].enabled(s)) return;
    this.chosen = true;
    const message = CHOICES[i].apply(s);

    // Fade to black with a caption, then back to the game.
    this.children.removeAll(true);
    const cover = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1).setOrigin(0).setAlpha(0);
    const caption = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', align: 'center',
      wordWrap: { width: GAME_WIDTH - 80 },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.chain({
      tweens: [
        { targets: [cover, caption], alpha: 1, duration: 400 },
        { targets: [cover, caption], alpha: 0, duration: 400, delay: 1200 },
      ],
      onComplete: () => {
        this.scene.resume('Game');
        this.scene.stop();
      },
    });
  }
}
