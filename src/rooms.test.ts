import { describe, expect, it } from 'vitest';
import { classifyPixel, findBlobs, type Cell } from './rooms';

describe('classifyPixel', () => {
  it('reads the legend colours', () => {
    expect(classifyPixel(0, 0, 0, 255)).toBe('solid');
    expect(classifyPixel(0, 255, 0, 255)).toBe('door');
    expect(classifyPixel(255, 128, 0, 255)).toBe('interaction');
  });
  it('forgives slightly-off colours', () => {
    expect(classifyPixel(240, 20, 10, 255)).toBe('enemy');
    expect(classifyPixel(250, 245, 30, 255)).toBe('start');
  });
  it('treats transparent and unrelated colours as empty', () => {
    expect(classifyPixel(0, 0, 0, 0)).toBe('empty');
    expect(classifyPixel(128, 128, 128, 255)).toBe('empty');
  });
});

describe('findBlobs', () => {
  const g = (rows: string[]): Cell[][] =>
    rows.map((r) => [...r].map((c) => (c === 'D' ? 'door' : c === 'E' ? 'enemy' : 'empty')));

  it('groups touching cells and keeps separate ones apart', () => {
    const grid = g(['..DD....E', '..DD.....', '..DD..E..']);
    expect(findBlobs(grid, 'door')).toEqual([{ cell: 'door', x: 2, y: 0, w: 2, h: 3 }]);
    expect(findBlobs(grid, 'enemy')).toHaveLength(2);
  });
});
