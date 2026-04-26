import { describe, expect, it } from 'vitest';
import { beginRoom, completeRoom, createRunStats, formatDuration, formatRoomSummary, formatVictorySummary, recordRestart } from './runStats';

describe('run stats', () => {
  it('formats durations for player-facing summaries', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9_999)).toBe('0:09');
    expect(formatDuration(65_100)).toBe('1:05');
  });

  it('tracks restarts, room starts, and completed rooms without mutating history', () => {
    const start = createRunStats(1_000);
    const restarted = recordRestart(start);
    const roomTwo = beginRoom(completeRoom(restarted), 31_000);

    expect(start.restarts).toBe(0);
    expect(restarted.restarts).toBe(1);
    expect(roomTwo.completedRooms).toBe(1);
    expect(formatRoomSummary(roomTwo, 76_000)).toBe('Час кімнати 0:45 · пройдено 1 кімнату · 1 рестарт');
    expect(formatVictorySummary(completeRoom(roomTwo), 126_000)).toBe('Фінальний час 2:05 · пройдено 2 кімнати · 1 рестарт');
  });
});
