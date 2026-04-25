import { getBossPhase } from './balance';

export type BossStatus = {
  percent: number;
  phaseIndex: 1 | 2 | 3;
  phaseName: string;
  warning: string;
  cssClass: `is-phase-${1 | 2 | 3}`;
  text: string;
};

const PHASE_COPY: Record<BossStatus['phaseIndex'], { phaseName: string; warning: string }> = {
  1: {
    phaseName: 'Розвідка',
    warning: 'повільні черги'
  },
  2: {
    phaseName: 'Натиск',
    warning: 'ширший залп'
  },
  3: {
    phaseName: 'Останній розряд',
    warning: 'рухайся колом'
  }
};

export function describeBossStatus(health: number, maxHealth: number): BossStatus {
  const safeMaxHealth = Math.max(0, maxHealth);
  const safeHealth = Math.min(Math.max(0, health), safeMaxHealth);
  const percent = safeMaxHealth > 0 ? Math.ceil((safeHealth / safeMaxHealth) * 100) : 0;
  const phase = getBossPhase(safeHealth, safeMaxHealth);
  const copy = PHASE_COPY[phase.index];

  return {
    percent,
    phaseIndex: phase.index,
    phaseName: copy.phaseName,
    warning: copy.warning,
    cssClass: `is-phase-${phase.index}`,
    text: `Турбо-Вартовий ${percent}% · Фаза ${phase.index}: ${copy.phaseName} · ${copy.warning}`
  };
}
