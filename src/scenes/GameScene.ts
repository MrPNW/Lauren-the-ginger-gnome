import Phaser from 'phaser';
import { ENERGY, GAME_HEIGHT, MOVEMENT, TILE, TIME } from '../config';
import { Controls } from '../controls';
import { BOSS, Enemy, SMALL_TALK } from '../objects/Enemy';
import { Player } from '../objects/Player';
import { classifyPixel, findBlobs, roomByKey, type Blob, type Cell, type RoomDef } from '../rooms';
import { Combat } from '../systems/Combat';
import type { EnergyState } from '../systems/Energy';
import { STARTING_SPELL, STARTING_WEAPON } from '../weapons';

interface Person {
  sprite: Phaser.GameObjects.Image;
  line: string;
}

export class GameScene extends Phaser.Scene {
  player!: Player;
  energy!: EnergyState;
  private room!: RoomDef;
  private controls!: Controls;
  private enemies!: Phaser.Physics.Arcade.Group;
  private combat!: Combat;
  private spawn = new Phaser.Math.Vector2();
  private roomWidth = 0;
  private door?: Phaser.Geom.Rectangle;
  private doorLabel?: Phaser.GameObjects.Text;
  private people: Person[] = [];
  private speech?: Phaser.GameObjects.Text;
  private leaving = false;

  constructor() {
    super('Game');
  }

  create(data: { room: string }): void {
    this.room = roomByKey(data.room);
    this.energy = this.registry.get('energy') as EnergyState;
    this.people = [];
    this.door = undefined;
    this.leaving = false;

    const grid = this.readMap();
    this.roomWidth = grid[0].length * TILE;

    this.drawRoom(grid);
    const { solids, platforms } = this.buildCollision(grid);

    this.physics.world.gravity.y = MOVEMENT.gravity;
    this.physics.world.setBounds(0, -TILE * 4, this.roomWidth, GAME_HEIGHT + TILE * 8);
    this.physics.world.setBoundsCollision(true, true, false, false);

    // Lauren starts at the yellow cells.
    const start = findBlobs(grid, 'start')[0] ?? { x: 1, y: 15, w: 1, h: 1 };
    this.spawn.set((start.x + start.w / 2) * TILE, (start.y + start.h) * TILE);
    this.player = new Player(this, this.spawn.x, this.spawn.y);
    this.player.placeFeetAt(this.spawn.x, this.spawn.y);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, solids);
    // Platforms are one-way: Lauren can jump up through them and land on top.
    this.physics.add.collider(this.player, platforms, undefined, (p) =>
      ((p as Player).body as Phaser.Physics.Arcade.Body).velocity.y >= 0);

    this.enemies = this.physics.add.group({ runChildUpdate: true });
    const footOf = (b: Blob) => [(b.x + b.w / 2) * TILE, (b.y + b.h) * TILE] as const;
    for (const b of findBlobs(grid, 'enemy')) this.enemies.add(new Enemy(this, ...footOf(b), SMALL_TALK));
    for (const b of findBlobs(grid, 'boss')) this.enemies.add(new Enemy(this, ...footOf(b), BOSS));
    this.physics.add.collider(this.enemies, solids);
    this.physics.add.collider(this.enemies, platforms);

    findBlobs(grid, 'interaction').forEach((b, i) => {
      const [x, y] = footOf(b);
      const sprite = this.add.image(x, y, 'person').setOrigin(0.5, 1);
      this.people.push({ sprite, line: this.room.lines?.[i] ?? '...' });
    });

    const doorBlob = findBlobs(grid, 'door')[0];
    if (doorBlob) {
      this.door = new Phaser.Geom.Rectangle(doorBlob.x * TILE, doorBlob.y * TILE, doorBlob.w * TILE, doorBlob.h * TILE);
      this.doorLabel = this.add.text(this.door.centerX, this.door.y - 12, '', {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', stroke: '#1d1a24', strokeThickness: 4,
      }).setOrigin(0.5, 1);
    }

    this.speech = this.add.text(0, 0, '', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#1d1a24', backgroundColor: '#ffffff',
      padding: { x: 10, y: 6 }, wordWrap: { width: 420 },
    }).setOrigin(0.5, 1).setVisible(false).setDepth(10);

    this.cameras.main.setBounds(0, 0, this.roomWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 120);
    this.cameras.main.fadeIn(300);

    this.controls = new Controls(this);
    this.combat = new Combat(this, this.player, this.energy, this.enemies, solids);
    this.events.on('enemy-defeated', () => this.updateDoorLabel());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off('enemy-defeated'));

    this.add.text(12, GAME_HEIGHT - 10,
      `Move: arrows/A D   Run: Shift   Jump: Space   ${STARTING_WEAPON.name}: J (${STARTING_WEAPON.energyCost})   ` +
      `${STARTING_SPELL.name}: K (${STARTING_SPELL.energyCost})   Burst: L   Door/talk: E`, {
        fontFamily: 'monospace', fontSize: '16px', color: '#1d1a24',
        backgroundColor: '#ffffffaa', padding: { x: 6, y: 3 },
      }).setOrigin(0, 1).setScrollFactor(0).setDepth(20);

    this.add.text(this.cameras.main.width / 2, 16, this.room.name, {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#ffffff', stroke: '#1d1a24', strokeThickness: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);

    this.updateDoorLabel();
  }

  update(time: number, delta: number): void {
    if (this.leaving) return;
    const c = this.controls.read();
    this.player.tired = this.energy.energy / this.energy.max < 0.2;
    const jumped = this.player.update(time, c);
    if (c.weaponPressed) this.combat.use(STARTING_WEAPON, time);
    if (c.spellPressed) this.combat.use(STARTING_SPELL, time);
    this.useEnergy(c.run, jumped, c.burstPressed, delta / 1000);
    this.updateInteractions(c.usePressed);

    // Fell out of the room: back to the start.
    if (this.player.y > GAME_HEIGHT + TILE * 2) this.player.placeFeetAt(this.spawn.x, this.spawn.y);
  }

  // ---- Building the room from its drawings ----

  /** Reads the object map into a grid of cells (one per 40 px). */
  private readMap(): Cell[][] {
    const key = `room_${this.room.key}_map`;
    if (!this.textures.exists(key)) throw new Error(`Missing object map art/rooms/${this.room.key}_map.png`);
    const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
    const cols = Math.floor(src.width / TILE);
    const rows = Math.floor(src.height / TILE);
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(src, 0, 0);
    const px = ctx.getImageData(0, 0, src.width, src.height).data;

    const grid: Cell[][] = [];
    for (let y = 0; y < rows; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < cols; x++) {
        // The centre pixel of each cell decides what it is.
        const i = ((y * TILE + TILE / 2) * src.width + (x * TILE + TILE / 2)) * 4;
        row.push(classifyPixel(px[i], px[i + 1], px[i + 2], px[i + 3]));
      }
      grid.push(row);
    }
    return grid;
  }

  /** Back pane, then the room drawing on top. Placeholders where art is missing. */
  private drawRoom(grid: Cell[][]): void {
    const w = this.roomWidth;
    const back = `room_${this.room.key}_back`;
    const front = `room_${this.room.key}`;

    // Placeholders are drawn once into textures (cheaper than redrawing every frame).
    if (!this.textures.exists(back)) {
      const tex = this.textures.createCanvas(back, w, GAME_HEIGHT)!;
      const ctx = tex.getContext();
      const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      sky.addColorStop(0, '#7fb6e0');
      sky.addColorStop(1, '#e7d3b8');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, GAME_HEIGHT);
      tex.refresh();
    }
    this.add.image(0, 0, back).setOrigin(0);

    if (!this.textures.exists(front)) this.drawPlaceholderRoom(grid, front);
    this.add.image(0, 0, front).setOrigin(0);
  }

  /** Placeholder room drawing: the map's solids, platforms and door. */
  private drawPlaceholderRoom(grid: Cell[][], key: string): void {
    const g = this.make.graphics({}, false);
    grid.forEach((row, ty) => row.forEach((cell, tx) => {
      const x = tx * TILE, y = ty * TILE;
      if (cell === 'solid') g.fillStyle(0x4a3a2e).fillRect(x, y, TILE, TILE).lineStyle(1, 0x2e241c).strokeRect(x, y, TILE, TILE);
      if (cell === 'platform') g.fillStyle(0x8a6d4b).fillRect(x, y, TILE, 12);
    }));
    for (const d of findBlobs(grid, 'door')) {
      g.fillStyle(0x8b5e3c).fillRect(d.x * TILE, d.y * TILE, d.w * TILE, d.h * TILE);
      g.lineStyle(4, 0x3c2814).strokeRect(d.x * TILE, d.y * TILE, d.w * TILE, d.h * TILE);
      g.fillStyle(0xe6c850).fillCircle((d.x + d.w) * TILE - 18, (d.y + d.h * 0.55) * TILE, 6);
    }
    g.generateTexture(key, this.roomWidth, GAME_HEIGHT);
    g.destroy();
  }

  /** One invisible static body per solid cell, and a thin one per platform cell. */
  private buildCollision(grid: Cell[][]) {
    const solids = this.physics.add.staticGroup();
    const platforms = this.physics.add.staticGroup();
    const isSolid = (x: number, y: number) => grid[y]?.[x] === 'solid';

    grid.forEach((row, ty) => row.forEach((cell, tx) => {
      if (cell === 'solid') {
        const zone = this.add.zone(tx * TILE + TILE / 2, ty * TILE + TILE / 2, TILE, TILE);
        solids.add(zone);
        // Only faces that touch open air collide, so Lauren can't snag on
        // the seams between neighbouring cells.
        const check = (zone.body as Phaser.Physics.Arcade.StaticBody).checkCollision;
        check.up = !isSolid(tx, ty - 1);
        check.down = !isSolid(tx, ty + 1);
        check.left = !isSolid(tx - 1, ty);
        check.right = !isSolid(tx + 1, ty);
      } else if (cell === 'platform') {
        platforms.add(this.add.zone(tx * TILE + TILE / 2, ty * TILE + 6, TILE, 12));
      }
    }));
    return { solids, platforms };
  }

  // ---- Doors and people ----

  private get bossAlive(): boolean {
    return this.enemies.getChildren().some((e) => (e as Enemy).isBoss && (e as Enemy).alive);
  }

  private updateDoorLabel(): void {
    this.setDoorLabel(this.bossAlive ? 'Locked: beat the boss first' : '');
  }

  /** Shows text above the door, kept inside the room. */
  private setDoorLabel(text: string): void {
    if (!this.doorLabel || !this.door) return;
    this.doorLabel.setText(text);
    const half = this.doorLabel.width / 2 + 12;
    this.doorLabel.setX(Phaser.Math.Clamp(this.door.centerX, half, this.roomWidth - half));
  }

  private updateInteractions(usePressed: boolean): void {
    const feet = new Phaser.Geom.Point(this.player.x, this.player.y);
    const near = (r: Phaser.Geom.Rectangle) => Phaser.Geom.Rectangle.Contains(r, feet.x, feet.y);

    // Talking: stand next to someone and press E.
    const person = this.people.find((p) => Math.abs(p.sprite.x - this.player.x) < 70);
    if (!person) this.speech?.setVisible(false);
    else if (usePressed) {
      this.speech!.setText(person.line).setPosition(person.sprite.x, person.sprite.y - person.sprite.height - 8).setVisible(true);
      return;
    }

    if (this.door && near(this.door)) {
      if (this.bossAlive) return;
      this.setDoorLabel(this.room.next ? 'E: go through' : 'E: the end (for now)');
      if (usePressed) this.leaveRoom();
    } else if (!this.bossAlive) {
      this.setDoorLabel('');
    }
  }

  private leaveRoom(): void {
    this.leaving = true;
    this.player.setAcceleration(0, 0).setVelocity(0, 0);
    this.cameras.main.fadeOut(300);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.room.next) this.scene.restart({ room: this.room.next });
      else this.showTheEnd();
    });
  }

  private showTheEnd(): void {
    const cam = this.cameras.main;
    cam.resetFX();
    this.add.rectangle(cam.scrollX, 0, cam.width, cam.height, 0x1d1a24).setOrigin(0).setDepth(30);
    this.add.text(cam.scrollX + cam.width / 2, cam.height / 2,
      `Lauren made it.\nDay ${this.energy.day}, ${this.energy.clock}.\n\nTo be continued...`, {
        fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff', align: 'center',
      }).setOrigin(0.5).setDepth(31);
  }

  // ---- Energy ----

  // Every action costs energy, and the clock keeps ticking.
  private useEnergy(running: boolean, jumped: boolean, burst: boolean, seconds: number): void {
    const e = this.energy;
    e.passTime(TIME.minutesPerSecond * seconds);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const moving = Math.abs(body.velocity.x) > 10;
    if (moving) e.spend((running ? ENERGY.runPerSecond : ENERGY.walkPerSecond) * seconds);
    if (jumped) e.spend(ENERGY.jump);

    if (burst && e.burst()) this.game.events.emit('burst');

    if (e.isEmpty) {
      this.player.setAcceleration(0, 0).setVelocityX(0);
      this.scene.launch('OutOfEnergy');
      this.scene.pause();
    }
  }
}
