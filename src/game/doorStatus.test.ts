import { describe, expect, it } from 'vitest';
import { describeDoorOpenedToast, describeDoorVisualStatus } from './doorStatus';

describe('door visual status', () => {
  it('keeps closed doors bright and blocking', () => {
    expect(describeDoorVisualStatus(false)).toEqual({
      targetY: 0,
      opacity: 0.78,
      emissiveIntensity: 1.1,
      isPassable: false
    });
  });

  it('dims open doors while moving them out of the path', () => {
    expect(describeDoorVisualStatus(true)).toEqual({
      targetY: 3.2,
      opacity: 0.34,
      emissiveIntensity: 0.55,
      isPassable: true
    });
  });

  it('announces when a pressure-door path opens', () => {
    expect(describeDoorOpenedToast(1)).toBe('Двері відкрито — шлях вільний.');
    expect(describeDoorOpenedToast(2)).toBe('Відкрито 2 двері — маршрут вільний.');
    expect(describeDoorOpenedToast(5)).toBe('Відкрито 5 дверей — маршрут вільний.');
  });
});
