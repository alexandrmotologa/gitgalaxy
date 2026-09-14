import { FileDiff } from './types';

/**
 * Computes raw churn delta from a commit's file diff.
 * Deletions and modifications are weighted to reflect refactor effort.
 */
export function calculateChurnDelta(diff: FileDiff): number {
  return diff.additions + Math.round(diff.deletions * 1.5) + 5;
}

/**
 * Applies exponential decay to an existing heat value based on commit distance.
 * @param currentHeat Current heat [0.0, 1.0]
 * @param commitsElapsed Number of commits since file was modified
 * @param decayRate Decay factor per commit (default 0.96)
 */
export function applyHeatDecay(currentHeat: number, commitsElapsed: number, decayRate: number = 0.96): number {
  return Math.max(0.05, currentHeat * Math.pow(decayRate, commitsElapsed));
}

/**
 * Normalizes a raw churn score into [0.0, 1.0] heat range.
 */
export function normalizeHeat(score: number, maxScore: number = 500): number {
  if (maxScore <= 0) return 0.1;
  const ratio = score / maxScore;
  return Math.min(1.0, Math.max(0.05, Math.log10(1 + ratio * 9)));
}

/**
 * Returns RGB hex color based on heat value:
 * heat < 0.2: Calm Cyan / Space Blue (#06b6d4)
 * 0.2 <= heat < 0.6: Active Amber / Gold (#f59e0b)
 * heat >= 0.6: Blazing Crimson / Neon Red (#ef4444)
 */
export function getHeatColorHex(heat: number): string {
  if (heat < 0.2) {
    return '#06b6d4';
  } else if (heat < 0.6) {
    return '#f59e0b';
  } else {
    return '#ef4444';
  }
}

/**
 * Returns numeric [r, g, b] in range [0, 1] for WebGL Three.js colors.
 */
export function getHeatColorRgb(heat: number): [number, number, number] {
  if (heat < 0.2) {
    // Smooth transition from deep blue to cyan
    const t = heat / 0.2;
    return [
      0.02 + 0.02 * t,
      0.45 + 0.26 * t,
      0.75 + 0.08 * t,
    ];
  } else if (heat < 0.6) {
    // Cyan to Amber
    const t = (heat - 0.2) / 0.4;
    return [
      0.04 + 0.92 * t,
      0.71 - 0.09 * t,
      0.83 - 0.79 * t,
    ];
  } else {
    // Amber to Crimson/Neon Red
    const t = Math.min(1.0, (heat - 0.6) / 0.4);
    return [
      0.96 - 0.02 * t,
      0.62 - 0.35 * t,
      0.04 + 0.23 * t,
    ];
  }
}
