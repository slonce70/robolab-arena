import { describe, expect, it, vi } from 'vitest';
import { setClassNameIfChanged, setStylePropertyIfChanged, setTextIfChanged } from './domPerformance';

function fakeElement() {
  const style = {
    values: new Map<string, string>(),
    setProperty: vi.fn((name: string, value: string) => style.values.set(name, value)),
    getPropertyValue: vi.fn((name: string) => style.values.get(name) ?? '')
  };
  return {
    textContent: '',
    className: '',
    style
  } as unknown as HTMLElement;
}

describe('DOM performance helpers', () => {
  it('only writes changed text', () => {
    const element = fakeElement();

    expect(setTextIfChanged(element, 'A')).toBe(true);
    expect(element.textContent).toBe('A');
    expect(setTextIfChanged(element, 'A')).toBe(false);
    expect(setTextIfChanged(element, 'B')).toBe(true);
    expect(element.textContent).toBe('B');
  });

  it('only writes changed class names', () => {
    const element = fakeElement();

    expect(setClassNameIfChanged(element, 'chip is-ready')).toBe(true);
    expect(setClassNameIfChanged(element, 'chip is-ready')).toBe(false);
    expect(setClassNameIfChanged(element, 'chip')).toBe(true);
  });

  it('only writes changed style properties', () => {
    const element = fakeElement();

    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0.5')).toBe(true);
    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0.5')).toBe(false);
    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0')).toBe(true);
  });
});
