import { describe, expect, it } from 'vitest';
import { formatVictoryOverlayIntro } from './victoryCopy';

describe('victory overlay copy', () => {
  it('celebrates a full campaign run honestly', () => {
    expect(formatVictoryOverlayIntro({ completedRooms: 12, totalRooms: 12, gears: 18, score: 4200 })).toBe(
      'Бліц пройшов усі 12 кімнат, зібрав 18 шестерень і набрав 4200 очок.'
    );
  });

  it('does not claim all rooms after continuing from a late room', () => {
    expect(formatVictoryOverlayIntro({ completedRooms: 3, totalRooms: 12, gears: 5, score: 1200 })).toBe(
      'Бліц завершив фінальний відрізок: 3 з 12 кімнат, 5 шестерень і 1200 очок.'
    );
  });
});
