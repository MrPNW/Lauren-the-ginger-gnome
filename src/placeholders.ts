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
    case 'small_talk':
      // A speech bubble on little legs, with "..." inside.
      g.fillStyle(0xffffff).fillRoundedRect(1, 1, w - 2, 20, 6);
      g.fillTriangle(8, 20, 14, 20, 9, 25);
      g.lineStyle(1, 0x1d1a24).strokeRoundedRect(1.5, 1.5, w - 3, 19, 6);
      g.fillStyle(0x1d1a24).fillCircle(10, 11, 2).fillCircle(16, 11, 2).fillCircle(22, 11, 2);
      g.fillStyle(0x1d1a24).fillRect(10, 26, 3, 6).fillRect(19, 26, 3, 6);
      break;
    case 'coffee_mug':
      g.fillStyle(0xff7a1a).fillCircle(5, 3, 3).fillCircle(9, 2, 3);
      g.fillStyle(0xf2efe8).fillRect(1, 4, 9, 9);
      g.lineStyle(2, 0xf2efe8).strokeCircle(11, 8, 2.5);
      g.fillStyle(0x6b3e1f).fillRect(2, 5, 7, 2);
      break;
    case 'sharp_wits':
      g.fillStyle(0x8fd3ff, 0.5).fillRect(0, 1, w - 6, h - 2);
      g.fillStyle(0xe8f7ff).fillRect(4, 3, w - 10, 2);
      g.fillStyle(0xe8f7ff).fillTriangle(w - 8, 0, w, h / 2, w - 8, h);
      break;
    case 'flame':
      g.fillStyle(0xffb347).fillCircle(w / 2, h / 2, w / 2);
      g.fillStyle(0xfff1a8).fillCircle(w / 2, h / 2, w / 4);
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
