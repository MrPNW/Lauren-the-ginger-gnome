// Lauren's energy, the clock and the day counter. Plain TypeScript with no
// Phaser in it, so the rules are easy to read and to test.

export interface EnergyConfig {
  max: number;
  burstAmount: number;
  borrowAmount: number;
  cryEnergy: number;
}

export interface TimeConfig {
  startMinutes: number;
  cryMinutes: number;
  sleepMinutes: number;
}

export class EnergyState {
  energy: number;
  /** Energy borrowed from tomorrow. Tomorrow's bar starts lower by this much. */
  debt = 0;
  day = 1;
  /** Minutes since midnight of day 1. Keeps counting past 24 hours: a day only ends when Lauren sleeps. */
  minutes: number;

  constructor(private cfg: EnergyConfig, private time: TimeConfig) {
    this.energy = cfg.max;
    this.minutes = time.startMinutes;
  }

  get max(): number {
    return this.cfg.max;
  }

  get isEmpty(): boolean {
    return this.energy <= 0;
  }

  /** Clock time as "HH:MM" (wraps at midnight for display). */
  get clock(): string {
    const m = Math.floor(this.minutes) % (24 * 60);
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  spend(amount: number): void {
    this.energy = Math.max(0, this.energy - amount);
  }

  passTime(minutes: number): void {
    this.minutes += minutes;
  }

  /** Borrow from tomorrow. Returns false when tomorrow has nothing left to give. */
  borrow(amount: number): boolean {
    if (this.debt >= this.cfg.max) return false;
    const take = Math.min(amount, this.cfg.max - this.debt, this.cfg.max - this.energy);
    if (take <= 0) return false;
    this.energy += take;
    this.debt += take;
    return true;
  }

  burst(): boolean {
    return this.borrow(this.cfg.burstAmount);
  }

  /** Out-of-energy choice: take energy from tomorrow. */
  borrowFromTomorrow(): boolean {
    return this.borrow(this.cfg.borrowAmount);
  }

  /** Out-of-energy choice: one hour passes, very little energy comes back. */
  cry(): void {
    this.passTime(this.time.cryMinutes);
    this.energy = Math.min(this.cfg.max, this.cfg.cryEnergy);
  }

  /** Out-of-energy choice: eight hours pass and a new day starts, minus any debt. */
  sleep(): void {
    this.passTime(this.time.sleepMinutes);
    this.day += 1;
    this.energy = Math.max(0, this.cfg.max - this.debt);
    this.debt = 0;
  }
}
