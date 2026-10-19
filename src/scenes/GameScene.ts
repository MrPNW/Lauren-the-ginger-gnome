import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, MOVEMENT, TILE } from '../config';
import { Controls } from '../controls';
import { TEST_LEVEL } from '../level';
import { Player } from '../objects/Player';

export class GameScene extends Phaser.Scene {
  player!: Player;
  private controls!: Controls;
  private spawn = new Phaser.Math.Vector2(64, 64);
  private worldHeight = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    const rows = TEST_LEVEL;
    const worldWidth = rows[0].length * TILE;
    this.worldHeight = rows.length * TILE;

    this.add.image(0, 0, 'background').setOrigin(0).setScrollFactor(0.15, 0)
      .setDisplaySize(GAME_WIDTH * 1.2, GAME_HEIGHT);

    const solids = this.physics.add.staticGroup();
    const platforms = this.physics.add.staticGroup();

    rows.forEach((row, ty) => {
      [...row].forEach((ch, tx) => {
        const x = tx * TILE;
        const y = ty * TILE;
        if (ch === '#') {
          const at = (dx: number, dy: number) => rows[ty + dy]?.[tx + dx] === '#';
          const tile = solids.create(x + TILE / 2, y + TILE / 2, at(0, -1) ? 'dirt' : 'ground');
          // Only faces that touch open air collide, so Lauren can't snag on
          // the seams between neighbouring tiles.
          const check = (tile.body as Phaser.Physics.Arcade.StaticBody).checkCollision;
          check.up = !at(0, -1);
          check.down = !at(0, 1);
          check.left = !at(-1, 0);
          check.right = !at(1, 0);
        } else if (ch === '=') {
          platforms.create(x + TILE / 2, y + 8, 'platform');
        } else if (ch === 'P') {
          this.spawn.set(x + TILE / 2, y + TILE - 24);
        }
      });
    });

    this.physics.world.gravity.y = MOVEMENT.gravity;
    this.physics.world.setBounds(0, -TILE * 4, worldWidth, this.worldHeight + TILE * 8);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.player = new Player(this, this.spawn.x, this.spawn.y);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, solids);
    // Platforms are one-way: Lauren can jump up through them and land on top.
    this.physics.add.collider(this.player, platforms, undefined, (p) => {
      const body = (p as Player).body as Phaser.Physics.Arcade.Body;
      return body.velocity.y >= 0;
    });

    this.cameras.main.setBounds(0, 0, worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(80, 60);
    this.cameras.main.setBackgroundColor('#7fb6e0');

    this.controls = new Controls(this);

    this.add.text(8, 8, 'Move: arrows / A D   Run: Shift   Jump: Space (hold for higher)', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1d1a24',
      backgroundColor: '#ffffffaa', padding: { x: 4, y: 2 },
    }).setScrollFactor(0);
  }

  update(time: number): void {
    this.player.update(time, this.controls.read());

    // Fell into a gap: back to the start.
    if (this.player.y > this.worldHeight + TILE * 2) {
      this.player.respawn(this.spawn.x, this.spawn.y);
    }
  }
}
