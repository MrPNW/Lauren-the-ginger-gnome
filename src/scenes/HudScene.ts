import Phaser from 'phaser';
import { GAME_HEIGHT as SCREEN_H, GAME_WIDTH as SCREEN_W } from '../config';

// Laid out on a half-size canvas and shown at 2x zoom.
const GAME_WIDTH = SCREEN_W / 2;
const GAME_HEIGHT = SCREEN_H / 2;
import type { EnergyState } from '../systems/Energy';

const BAR_X = 10;
const BAR_Y = 10;
const BAR_W = 140;
const BAR_H = 12;

// Energy bar, debt and clock, drawn on top of the game.
export class HudScene extends Phaser.Scene {
  private bar!: Phaser.GameObjects.Graphics;
  private energyText!: Phaser.GameObjects.Text;
  private debtText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  private burstFlash = 0;

  constructor() {
    super('Hud');
  }

  create(): void {
    this.cameras.main.setZoom(2).centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    const style = { fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', stroke: '#1d1a24', strokeThickness: 3 };
    this.bar = this.add.graphics();
    this.energyText = this.add.text(BAR_X + BAR_W + 6, BAR_Y, '', style);
    this.debtText = this.add.text(BAR_X, BAR_Y + BAR_H + 3, '', { ...style, color: '#ff9a9a' });
    this.clockText = this.add.text(GAME_WIDTH - 10, BAR_Y, '', {
      ...style, fontSize: '12px', color: '#1d1a24', strokeThickness: 0, backgroundColor: '#ffffffcc', padding: { x: 4, y: 2 },
    }).setOrigin(1, 0);

    this.game.events.on('burst', () => (this.burstFlash = 1), this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off('burst', undefined, this));
  }

  update(_time: number, delta: number): void {
    const s = this.registry.get('energy') as EnergyState | undefined;
    if (!s) return;

    const frac = s.energy / s.max;
    const debtFrac = Math.min(1, s.debt / s.max);
    const color = frac > 0.5 ? 0x5fa04e : frac > 0.2 ? 0xe0a030 : 0xd23b3b;

    this.bar.clear();
    this.bar.fillStyle(0x1d1a24, 0.6).fillRect(BAR_X - 2, BAR_Y - 2, BAR_W + 4, BAR_H + 4);
    this.bar.fillStyle(0xffffff, 0.25).fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
    this.bar.fillStyle(color).fillRect(BAR_X, BAR_Y, BAR_W * frac, BAR_H);
    if (this.burstFlash > 0) {
      this.bar.fillStyle(0xffffff, this.burstFlash * 0.8).fillRect(BAR_X, BAR_Y, BAR_W * frac, BAR_H);
      this.burstFlash = Math.max(0, this.burstFlash - delta / 300);
    }

    this.energyText.setText(`${Math.ceil(s.energy)}`);
    this.debtText.setText(debtFrac > 0 ? `Borrowed from tomorrow: ${Math.round(s.debt)}` : '');
    this.clockText.setText(`Day ${s.day}  ${s.clock}`);
  }
}
