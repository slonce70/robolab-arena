import { describe, expect, it } from 'vitest';
import css from '../styles.css?raw';

describe('CSS custom properties', () => {
  it('does not reference undefined custom properties', () => {
    const defined = new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
    const referenced = [...css.matchAll(/var\(--([a-z0-9-]+)(?:\s*,[^)]*)?\)/gi)].map((match) => match[1]);

    expect(referenced.filter((name) => !defined.has(name))).toEqual([]);
  });
});
