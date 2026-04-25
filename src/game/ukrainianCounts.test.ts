import { describe, expect, it } from 'vitest';
import { formatUkrainianCount } from './ukrainianCounts';

describe('Ukrainian count labels', () => {
  it('handles one, few, many, and teen exceptions', () => {
    const forms = { one: 'лазер', few: 'лазери', many: 'лазерів' };

    expect(formatUkrainianCount(1, forms)).toBe('1 лазер');
    expect(formatUkrainianCount(2, forms)).toBe('2 лазери');
    expect(formatUkrainianCount(5, forms)).toBe('5 лазерів');
    expect(formatUkrainianCount(11, forms)).toBe('11 лазерів');
    expect(formatUkrainianCount(22, forms)).toBe('22 лазери');
  });
});
