import Phaser from 'phaser';
import type { Enemy } from '../objects/Enemy';
import type { Player } from '../objects/Player';
import type { WeaponDef } from '../weapons';
import type { EnergyState } from './Energy';

const INCINERATE_LINES = ['Incinerated.', 'Decaf? Never.', 'Well, that escalated.', 'Hot take.'];
const DEVASTATE_LINES = ['Devastated.', 'No comeback.', 'Speechless.', 'Ouch. Accurate.'];

// Throwing, casting, hitting enemies and getting hit.
export class Combat {
  private projectiles: Phaser.Physics.Arcade.Group;
  private readyAt = new Map<string, number>();
  private invulnerableUntil = 0;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private energy: EnergyState,
    enemies: Phaser.Physics.Arcade.Group,
    solids: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.projectiles = scene.physics.add.group({ allowGravity: true });

    // Projectiles break on walls and floors.
    scene.physics.add.collider(this.projectiles, solids, (proj) => this.breakProjectile(proj as Phaser.Physics.Arcade.Image));

    scene.physics.add.overlap(this.projectiles, enemies, (proj, enemy) =>
      this.onProjectileHit(proj as Phaser.Physics.Arcade.Image, enemy as Enemy));

    scene.physics.add.overlap(player, enemies, (_p, enemy) => this.onTouchEnemy(enemy as Enemy));
  }

  /** Uses a weapon or spell if it's off cooldown. Returns true if it fired. */
  use(def: WeaponDef, time: number): boolean {
    if (time < (this.readyAt.get(def.id) ?? 0)) return false;
    this.readyAt.set(def.id, time + def.cooldownMs);
    this.energy.spend(def.energyCost);

    const dir = this.player.flipX ? -1 : 1;
    const proj = this.projectiles.create(this.player.x + dir * 14, this.player.y - 6, def.texture) as Phaser.Physics.Arcade.Image;
    const body = proj.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(def.gravity);
    proj.setVelocity(def.speed * dir, -def.lift);
    proj.setFlipX(dir < 0);
    proj.setData('def', def);
    proj.setData('hitIds', new Set<Enemy>());
    if (def.gravity) proj.setAngularVelocity(540 * dir);

    if (def.id === 'coffeeMug') this.trailFlames(proj);
    this.scene.time.delayedCall(def.lifetimeMs, () => proj.active && this.breakProjectile(proj));
    return true;
  }

  private onProjectileHit(proj: Phaser.Physics.Arcade.Image, enemy: Enemy): void {
    if (!proj.active || !enemy.alive) return;
    const def = proj.getData('def') as WeaponDef;
    const hit = proj.getData('hitIds') as Set<Enemy>;
    if (hit.has(enemy)) return;
    hit.add(enemy);

    if (enemy.hit(def.damage)) this.defeat(enemy, def.finish);
    if (!def.pierces) this.breakProjectile(proj);
  }

  private onTouchEnemy(enemy: Enemy): void {
    const now = this.scene.time.now;
    if (!enemy.alive || now < this.invulnerableUntil) return;
    this.invulnerableUntil = now + 1000;
    this.energy.spend(enemy.contactDrain);
    enemy.walkAwayFrom(this.player.x);

    // Knock Lauren back and make her blink while she can't be hit again.
    const away = this.player.x < enemy.x ? -1 : 1;
    this.player.setVelocity(away * 220, -200);
    this.scene.tweens.add({ targets: this.player, alpha: 0.3, duration: 100, yoyo: true, repeat: 4,
      onComplete: () => this.player.setAlpha(1) });
    this.popup(this.player.x, this.player.y - 30, `-${enemy.contactDrain} energy`, '#d23b3b');
  }

  private defeat(enemy: Enemy, finish: WeaponDef['finish']): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    const lines = finish === 'incinerate' ? INCINERATE_LINES : DEVASTATE_LINES;
    this.popup(enemy.x, enemy.y - 24, Phaser.Utils.Array.GetRandom(lines), finish === 'incinerate' ? '#ff7a1a' : '#8fd3ff');

    if (finish === 'incinerate') {
      // Burst into flames, char black, crumble to nothing.
      const flames = this.scene.add.particles(enemy.x, enemy.y, 'flame', {
        speed: { min: 20, max: 90 }, angle: { min: 200, max: 340 }, lifespan: 600,
        scale: { start: 1.4, end: 0 }, quantity: 3, frequency: 30, gravityY: -120,
      });
      enemy.setTint(0x2a1a10);
      this.scene.tweens.add({ targets: enemy, scaleY: 0.1, alpha: 0, duration: 700, delay: 150,
        onComplete: () => { enemy.destroy(); flames.stop(); this.scene.time.delayedCall(700, () => flames.destroy()); } });
    } else {
      // Knocked flat and off the screen, emotionally.
      enemy.setTint(0x8fd3ff);
      this.scene.tweens.add({ targets: enemy, angle: 90 * (Math.random() < 0.5 ? -1 : 1), y: enemy.y + 8, alpha: 0,
        duration: 600, onComplete: () => enemy.destroy() });
    }
  }

  private breakProjectile(proj: Phaser.Physics.Arcade.Image): void {
    if (!proj.active) return;
    const def = proj.getData('def') as WeaponDef;
    if (def.id === 'coffeeMug') {
      const splash = this.scene.add.particles(proj.x, proj.y, 'flame', {
        speed: { min: 30, max: 100 }, lifespan: 300, scale: { start: 1, end: 0 }, emitting: false,
      });
      splash.explode(8);
      this.scene.time.delayedCall(400, () => splash.destroy());
    }
    proj.destroy();
  }

  private trailFlames(proj: Phaser.Physics.Arcade.Image): void {
    const trail = this.scene.add.particles(0, 0, 'flame', {
      follow: proj, lifespan: 250, scale: { start: 0.8, end: 0 }, frequency: 25, speed: 10,
    });
    proj.once(Phaser.GameObjects.Events.DESTROY, () => {
      trail.stop();
      this.scene.time.delayedCall(300, () => trail.destroy());
    });
  }

  private popup(x: number, y: number, text: string, color: string): void {
    const t = this.scene.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '11px', color, stroke: '#1d1a24', strokeThickness: 3,
    }).setOrigin(0.5);
    this.scene.tweens.add({ targets: t, y: y - 24, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }
}
