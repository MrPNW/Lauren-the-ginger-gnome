import Phaser from 'phaser';
import type { ArtEntry } from './art';

// Draws a simple stand-in for an art entry that has no PNG yet.
export function drawPlaceholder(scene: Phaser.Scene, entry: ArtEntry): void {
  const { key, width: w, height: h } = entry;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  switch (key) {
    case 'lauren':
      // Red pointy hat, ginger hair, face, green tunic.
      g.fillStyle(0xd23b3b).fillTriangle(w / 2, 0, 4, 18, w - 4, 18);
      g.fillStyle(0xe8742a).fillRect(3, 16, w - 6, 10);
      g.fillStyle(0xf5cba7).fillRect(7, 18, w - 14, 10);
      g.fillStyle(0x222222).fillRect(w - 12, 21, 3, 3);
      g.fillStyle(0x4e8a4a).fillRect(6, 28, w - 12, 14);
      g.fillStyle(0x5a3a22).fillRect(7, 42, 7, 6).fillRect(w - 14, 42, 7, 6);
      break;
    case 'ground':
      g.fillStyle(0x6b4a2f).fillRect(0, 0, w, h);
      g.fillStyle(0x5fa04e).fillRect(0, 0, w, 8);
      g.lineStyle(1, 0x3f2c1c).strokeRect(0.5, 0.5, w - 1, h - 1);
      break;
    case 'dirt':
      g.fillStyle(0x5c3f28).fillRect(0, 0, w, h);
      g.lineStyle(1, 0x3f2c1c).strokeRect(0.5, 0.5, w - 1, h - 1);
      break;
    case 'platform':
      g.fillStyle(0x8a6d4b).fillRect(0, 0, w, h);
      g.lineStyle(1, 0x4a3725).strokeRect(0.5, 0.5, w - 1, h - 1);
      break;
    case 'background':
      g.fillGradientStyle(0x7fb6e0, 0x7fb6e0, 0xe7d3b8, 0xe7d3b8, 1).fillRect(0, 0, w, h);
      g.fillStyle(0xffffff, 0.7).fillEllipse(120, 70, 110, 30).fillEllipse(420, 50, 140, 34);
      g.fillStyle(0x9fb39a).fillTriangle(0, h, 160, 170, 320, h).fillTriangle(260, h, 470, 150, 640, h);
      break;
    default:
      g.fillStyle(0xff00ff).fillRect(0, 0, w, h);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}
