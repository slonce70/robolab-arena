import { describe, expect, it } from 'vitest';
import { getControlsHint } from './controlsHint';

describe('controls hint copy', () => {
  it('lists every active keyboard shortcut exposed by gameplay', () => {
    const hint = getControlsHint();

    expect(hint).toContain('WASD');
    expect(hint).toContain('C - вид');
    expect(hint).toContain('Shift - ривок');
    expect(hint).toContain('Space/E - стрибок');
    expect(hint).toContain('R - перезапуск');
    expect(hint).toContain('Esc - пауза');
  });
});
