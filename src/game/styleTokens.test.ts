import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const cssPath = fileURLToPath(new URL('../styles.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

describe('CSS custom properties', () => {
  it('does not reference undefined custom properties', () => {
    const defined = new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
    const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)(?:\s*,[^)]*)?\)/gi)].map((match) => match[1]);

    expect(referenced.filter((name) => !defined.has(name))).toEqual([]);
  });

  it('keeps the critical shield health chip visually layered', () => {
    const selectorStart = css.indexOf('.health-chip.is-critical.is-shielded');
    const criticalShieldRule = selectorStart >= 0 ? css.slice(selectorStart, css.indexOf('}', selectorStart)) : '';

    expect(criticalShieldRule).toContain('rgba(255, 75, 85');
    expect(criticalShieldRule).toContain('rgba(84, 241, 255');
  });

  it('keeps simultaneous power chip states visually layered', () => {
    const selectorStart = css.indexOf('.power-chip.is-rapid.is-shielded.is-overcharged');
    const combinedPowerRule = selectorStart >= 0 ? css.slice(selectorStart, css.indexOf('}', selectorStart)) : '';

    expect(combinedPowerRule).toContain('rgba(255, 209, 102');
    expect(combinedPowerRule).toContain('rgba(84, 241, 255');
    expect(combinedPowerRule).toContain('rgba(255, 79, 163');
  });
});
