import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { OutOfEnergyScene } from './scenes/OutOfEnergyScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: false,
  backgroundColor: '#1d1a24',
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { gamepad: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, GameScene, HudScene, OutOfEnergyScene],
});

// Handy for debugging from the browser console.
(window as unknown as { __game: Phaser.Game }).__game = game;
