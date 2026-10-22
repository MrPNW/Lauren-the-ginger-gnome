import Phaser from 'phaser';
import { LAUREN_ANIMS, LAUREN_FRAME, laurenTextureKey, type AnimDef } from './animations';
import type { ArtEntry } from './art';

type Ctx = CanvasRenderingContext2D;

function canvas(scene: Phaser.Scene, key: string, w: number, h: number): [Phaser.Textures.CanvasTexture, Ctx] {
  const tex = scene.textures.createCanvas(key, w, h)!;
  return [tex, tex.getContext()];
}

const circle = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };

// Draws a simple stand-in for an art entry that has no PNG yet.
export function drawPlaceholder(scene: Phaser.Scene, entry: ArtEntry): void {
  const { key, width: w, height: h } = entry;
  const [tex, c] = canvas(scene, key, w, h);

  switch (key) {
    case 'small_talk': {
      // A speech bubble on little legs, with "..." inside.
      c.fillStyle = '#ffffff';
      c.strokeStyle = '#1d1a24';
      c.lineWidth = 2;
      c.beginPath(); c.roundRect(2, 2, w - 4, h * 0.6, 10); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(12, h * 0.6); c.lineTo(22, h * 0.6); c.lineTo(14, h * 0.75); c.fill();
      c.fillStyle = '#1d1a24';
      for (const x of [w * 0.3, w * 0.5, w * 0.7]) circle(c, x, h * 0.32, 3);
      c.fillRect(w * 0.32, h * 0.8, 4, h * 0.2); c.fillRect(w * 0.6, h * 0.8, 4, h * 0.2);
      break;
    }
    case 'boss':
    case 'person': {
      // A tall grey (boss) or blue (person) human shape with a label.
      const body = key === 'boss' ? '#6b6b7a' : '#4f7fb3';
      c.fillStyle = '#f0c8a0'; circle(c, w / 2, 22, 18);
      c.fillStyle = body; c.beginPath(); c.roundRect(12, 44, w - 24, 76, 10); c.fill();
      c.fillStyle = '#2b2b33'; c.fillRect(18, 118, 18, 42); c.fillRect(w - 36, 118, 18, 42);
      c.fillStyle = '#ffffff'; c.font = 'bold 13px sans-serif'; c.textAlign = 'center';
      c.fillText(key === 'boss' ? 'BOSS' : 'PERSON', w / 2, 86);
      break;
    }
    case 'coffee_mug':
      c.fillStyle = '#ff7a1a'; circle(c, w * 0.35, h * 0.2, w * 0.2); circle(c, w * 0.6, h * 0.15, w * 0.2);
      c.fillStyle = '#f2efe8'; c.fillRect(w * 0.08, h * 0.3, w * 0.62, h * 0.65);
      c.strokeStyle = '#f2efe8'; c.lineWidth = 4; c.beginPath(); c.arc(w * 0.78, h * 0.6, w * 0.16, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#6b3e1f'; c.fillRect(w * 0.14, h * 0.36, w * 0.5, h * 0.12);
      break;
    case 'sharp_wits':
      c.fillStyle = 'rgba(143, 211, 255, 0.5)'; c.fillRect(0, 2, w - 12, h - 4);
      c.fillStyle = '#e8f7ff'; c.fillRect(8, h / 2 - 2, w - 20, 4);
      c.beginPath(); c.moveTo(w - 16, 0); c.lineTo(w, h / 2); c.lineTo(w - 16, h); c.fill();
      break;
    case 'flame':
      c.fillStyle = '#ffb347'; circle(c, w / 2, h / 2, w / 2);
      c.fillStyle = '#fff1a8'; circle(c, w / 2, h / 2, w / 4);
      break;
    default:
      c.fillStyle = '#ff00ff'; c.fillRect(0, 0, w, h);
  }
  tex.refresh();
}

// ---- Lauren ----

interface Pose {
  bob?: number;
  legL?: number; // forward/back offset of each foot
  legR?: number;
  tuck?: number; // lift both feet (jumping)
  arm?: 'down' | 'forward' | 'up' | 'cast';
  eyes?: 'open' | 'closed' | 'x' | 'sad';
  tear?: boolean;
  droop?: number; // tired hat droop
  zzz?: boolean;
}

function drawLauren(c: Ctx, ox: number, p: Pose): void {
  const { x: bx, y: by, width: bw, height: bh } = LAUREN_FRAME.body;
  const cx = ox + bx + bw / 2;
  const top = by + (p.bob ?? 0);
  const feet = by + bh;

  // Legs and boots.
  c.fillStyle = '#5a3a22';
  const tuck = p.tuck ?? 0;
  c.fillRect(cx - 26 + (p.legL ?? 0), feet - 28 - tuck, 20, 28);
  c.fillRect(cx + 6 + (p.legR ?? 0), feet - 28 - tuck, 20, 28);
  // Tunic.
  c.fillStyle = '#4e8a4a';
  c.beginPath(); c.roundRect(cx - 34, top + 76, 68, 60 - Math.max(0, p.bob ?? 0), 10); c.fill();
  // Arm.
  c.fillStyle = '#f5cba7';
  const arm = p.arm ?? 'down';
  if (arm === 'down') c.fillRect(cx + 22, top + 86, 12, 34);
  if (arm === 'forward') c.fillRect(cx + 22, top + 86, 40, 12);
  if (arm === 'up') { c.fillRect(cx - 40, top + 60, 12, 34); c.fillRect(cx + 28, top + 60, 12, 34); }
  if (arm === 'cast') {
    c.fillRect(cx + 22, top + 84, 36, 12);
    c.fillStyle = 'rgba(143, 211, 255, 0.8)'; circle(c, cx + 64, top + 90, 10);
  }
  // Hair and face.
  c.fillStyle = '#e8742a';
  c.beginPath(); c.roundRect(cx - 38, top + 36, 76, 34, 12); c.fill();
  c.fillStyle = '#f5cba7';
  c.beginPath(); c.roundRect(cx - 26, top + 42, 52, 36, 10); c.fill();
  // Eyes (facing right).
  c.fillStyle = '#222222';
  const eyes = p.eyes ?? 'open';
  if (eyes === 'open') { c.fillRect(cx + 8, top + 52, 6, 8); }
  if (eyes === 'closed' || eyes === 'sad') { c.fillRect(cx + 5, top + 57, 12, 3); }
  if (eyes === 'x') { c.font = 'bold 16px sans-serif'; c.fillText('x', cx + 5, top + 62); }
  if (p.tear) { c.fillStyle = '#5fb6ff'; circle(c, cx + 14, top + 70, 4); }
  // Hat (droops when tired).
  c.fillStyle = '#d23b3b';
  const droop = p.droop ?? 0;
  c.beginPath(); c.moveTo(cx - 40, top + 40); c.lineTo(cx + 40, top + 40); c.lineTo(cx + droop, top - 0 + Math.abs(droop) * 0.3); c.closePath(); c.fill();
  if (p.zzz) { c.fillStyle = '#1d1a24'; c.font = 'bold 20px sans-serif'; c.fillText('z', cx + 36, top + 20); }
}

function posesFor(anim: AnimDef): Pose[] {
  const n = anim.frames;
  const range = (f: (i: number) => Pose) => Array.from({ length: n }, (_, i) => f(i));
  const swing = (i: number, amt: number) => Math.round(Math.sin((i / n) * Math.PI * 2) * amt);
  switch (anim.key) {
    case 'idle': return range((i) => ({ bob: i % 3 === 1 ? 2 : 0, eyes: i === 4 ? 'closed' : 'open' }));
    case 'walk': return range((i) => ({ legL: swing(i, 10), legR: -swing(i, 10), bob: Math.abs(swing(i, 3)) }));
    case 'run': return range((i) => ({ legL: swing(i, 18), legR: -swing(i, 18), bob: Math.abs(swing(i, 5)), arm: 'forward' }));
    case 'jump': return range((i) => ({ bob: i === 0 ? 8 : 0, tuck: i === 0 ? 0 : 10, arm: i === 2 ? 'up' : 'down' }));
    case 'fall': return range((i) => ({ arm: 'up', tuck: 4 + i * 2 }));
    case 'throw': return range((i) => ({ arm: i < 2 ? 'down' : 'forward', bob: i === 1 ? 2 : 0 }));
    case 'cast': return range((i) => ({ arm: i === 0 ? 'down' : 'cast' }));
    case 'hurt': return range(() => ({ eyes: 'x', bob: 4 }));
    case 'tired': return range((i) => ({ eyes: i % 3 === 2 ? 'closed' : 'sad', droop: 18, bob: 6 }));
    case 'cry': return range((i) => ({ eyes: 'sad', tear: i % 2 === 0, droop: 12, bob: i % 2 ? 4 : 2 }));
    case 'sleep': return range((i) => ({ eyes: 'closed', droop: 24, bob: 10, zzz: i % 2 === 0 }));
    default: return range(() => ({}));
  }
}

/** Placeholder frame strips for any of Lauren's animations without a PNG. */
export function drawLaurenPlaceholders(scene: Phaser.Scene): void {
  const { width: fw, height: fh } = LAUREN_FRAME;
  for (const anim of LAUREN_ANIMS) {
    const key = laurenTextureKey(anim.key);
    if (scene.textures.exists(key)) continue;
    const [tex, c] = canvas(scene, key, fw * anim.frames, fh);
    posesFor(anim).forEach((pose, i) => {
      drawLauren(c, i * fw, pose);
      tex.add(i, 0, i * fw, 0, fw, fh);
    });
    tex.refresh();
  }
}
