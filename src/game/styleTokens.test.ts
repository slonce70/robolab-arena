import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const cssPath = fileURLToPath(new URL('../styles.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

function getCssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
}

describe('CSS custom properties', () => {
  it('does not reference undefined custom properties', () => {
    const defined = new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
    const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)(?:\s*,[^)]*)?\)/gi)].map((match) => match[1]);

    expect(referenced.filter((name) => !defined.has(name))).toEqual([]);
  });

  it('keeps the critical shield health chip visually layered', () => {
    const criticalShieldRule = getCssRule('.health-chip.is-critical.is-shielded');

    expect(criticalShieldRule).toContain('rgba(255, 75, 85');
    expect(criticalShieldRule).toContain('rgba(84, 241, 255');
  });

  it('keeps simultaneous power chip states visually layered', () => {
    const requiredLayeredPowerRules = [
      ['.power-chip.is-rapid.is-shielded', ['rgba(255, 209, 102', 'rgba(84, 241, 255']],
      ['.power-chip.is-rapid.is-overcharged', ['rgba(255, 209, 102', 'rgba(255, 79, 163']],
      ['.power-chip.is-shielded.is-overcharged', ['rgba(84, 241, 255', 'rgba(255, 79, 163']],
      ['.power-chip.is-rapid.is-shielded.is-overcharged', ['rgba(255, 209, 102', 'rgba(84, 241, 255', 'rgba(255, 79, 163']]
    ] as const;

    for (const [selector, colors] of requiredLayeredPowerRules) {
      const rule = getCssRule(selector);
      for (const color of colors) expect(rule, selector).toContain(color);
    }
  });

  it('makes the victory panel visibly celebratory', () => {
    const rule = getCssRule('.victory-panel');

    expect(rule).toContain('rgba(255, 209, 102');
    expect(rule).toContain('rgba(84, 241, 255');
  });
});
