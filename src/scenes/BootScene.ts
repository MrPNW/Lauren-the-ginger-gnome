import Phaser from 'phaser';
import { ART } from '../art';
import { drawPlaceholder } from '../placeholders';

// Every PNG in the art/ folder, found at build time. Only files that exist are
// loaded; anything on the art list without a file gets a placeholder.
const artFiles = import.meta.glob('/art/*.png', {
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
  }

  create(): void {
    for (const entry of ART) {
      if (!this.textures.exists(entry.key)) drawPlaceholder(this, entry);
    }
    this.scene.start('Game');
  }
}
