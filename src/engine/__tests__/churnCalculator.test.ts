import { describe, it, expect } from 'vitest';
import { calculateChurnDelta, applyHeatDecay, normalizeHeat, getHeatColorHex } from '../churnCalculator';

describe('churnCalculator', () => {
  it('calculates churn delta giving weight to deletions and base commit overhead', () => {
    const diff = {
      path: 'src/wal.rs',
      additions: 100,
      deletions: 20,
      type: 'modified' as const,
    };
    const delta = calculateChurnDelta(diff);
    // 100 + 20 * 1.5 + 5 = 135
    expect(delta).toBe(135);
  });

  it('decays heat value exponentially with elapsed commits', () => {
    const initialHeat = 0.8;
    const decayed = applyHeatDecay(initialHeat, 10, 0.95);
    expect(decayed).toBeLessThan(initialHeat);
    expect(decayed).toBeGreaterThanOrEqual(0.05);
  });

  it('normalizes heat accurately between 0.05 and 1.0', () => {
    expect(normalizeHeat(0)).toBe(0.05);
    expect(normalizeHeat(500, 500)).toBe(1.0);
    expect(normalizeHeat(250, 500)).toBeGreaterThan(0.2);
  });

  it('maps heat to proper color categories', () => {
    expect(getHeatColorHex(0.1)).toBe('#06b6d4'); // Calm cyan
    expect(getHeatColorHex(0.4)).toBe('#f59e0b'); // Active amber
    expect(getHeatColorHex(0.8)).toBe('#ef4444'); // Blazing crimson
  });
});
