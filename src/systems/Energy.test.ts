import { describe, expect, it } from 'vitest';
import { EnergyState } from './Energy';

const make = () =>
  new EnergyState(
    { max: 100, burstAmount: 25, borrowAmount: 50, cryEnergy: 10 },
    { startMinutes: 7 * 60, cryMinutes: 60, sleepMinutes: 8 * 60 },
  );

describe('EnergyState', () => {
  it('starts full on day 1 at 07:00', () => {
    const s = make();
    expect(s.energy).toBe(100);
    expect(s.day).toBe(1);
    expect(s.clock).toBe('07:00');
  });

  it('never drops below zero', () => {
    const s = make();
    s.spend(150);
    expect(s.energy).toBe(0);
    expect(s.isEmpty).toBe(true);
  });

  it('burst adds energy and the same amount of debt', () => {
    const s = make();
    s.spend(60);
    expect(s.burst()).toBe(true);
    expect(s.energy).toBe(65);
    expect(s.debt).toBe(25);
  });

  it('burst is refused when the bar is already full', () => {
    const s = make();
    expect(s.burst()).toBe(false);
    expect(s.debt).toBe(0);
  });

  it('cannot borrow more than a whole day', () => {
    const s = make();
    s.spend(100);
    s.borrowFromTomorrow();
    s.spend(100);
    s.borrowFromTomorrow();
    s.spend(100);
    expect(s.borrowFromTomorrow()).toBe(false);
    expect(s.debt).toBe(100);
  });

  it('crying moves the clock one hour and gives a little energy', () => {
    const s = make();
    s.spend(100);
    s.cry();
    expect(s.clock).toBe('08:00');
    expect(s.energy).toBe(10);
    expect(s.day).toBe(1);
  });

  it('sleeping moves 8 hours, starts a new day and pays back debt', () => {
    const s = make();
    s.spend(100);
    s.borrowFromTomorrow();
    s.passTime(14 * 60); // 21:00
    s.sleep();
    expect(s.day).toBe(2);
    expect(s.clock).toBe('05:00');
    expect(s.energy).toBe(50);
    expect(s.debt).toBe(0);
  });
});
