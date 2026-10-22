import Phaser from 'phaser';
import { LAUREN_ANIMS, LAUREN_FRAME, laurenTextureKey } from '../animations';
import { ART } from '../art';
import { ENERGY, TIME } from '../config';
import { drawLaurenPlaceholders, drawPlaceholder } from '../placeholders';
import { FIRST_ROOM, ROOMS } from '../rooms';
import { EnergyState } from '../systems/Energy';

// Every PNG in art/ and art/rooms/, found at build time. Only files that exist
// are loaded; anything missing gets a placeholder.
const artFiles = import.meta.glob('/art/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    for (const entry of ART) {
      const url = artFiles[`/art/${entry.key}.png`];
      if (url) this.load.image(entry.key, url);
    }
    for (const anim of LAUREN_ANIMS) {
      const key = laurenTextureKey(anim.key);
      const url = artFiles[`/art/${key}.png`];
      if (url) this.load.spritesheet(key, url, { frameWidth: LAUREN_FRAME.width, frameHeight: LAUREN_FRAME.height });
    }
    for (const room of ROOMS) {
      for (const suffix of ['', '_back', '_map']) {
        const url = artFiles[`/art/rooms/${room.key}${suffix}.png`];
        if (url) this.load.image(`room_${room.key}${suffix}`, url);
      }
    }
  }

  create(): void {
    for (const entry of ART) {
      if (!this.textures.exists(entry.key)) drawPlaceholder(this, entry);
    }
    drawLaurenPlaceholders(this);
    for (const anim of LAUREN_ANIMS) {
      const key = laurenTextureKey(anim.key);
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: anim.frames - 1 }),
        frameRate: anim.fps,
        repeat: anim.loop ? -1 : 0,
      });
    }

    // Energy and the clock carry over from room to room.
    this.registry.set('energy', new EnergyState(ENERGY, TIME));
    this.scene.start('Game', { room: FIRST_ROOM });
    this.scene.launch('Hud');
  }
}
