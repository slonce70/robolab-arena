import { formatUkrainianCount } from './ukrainianCounts';

export type RunStats = {
  startedAtMs: number;
  roomStartedAtMs: number;
  completedRooms: number;
  restarts: number;
};

export function createRunStats(nowMs: number): RunStats {
  return {
    startedAtMs: nowMs,
    roomStartedAtMs: nowMs,
    completedRooms: 0,
    restarts: 0
  };
}

export function beginRoom(stats: RunStats, nowMs: number): RunStats {
  return {
    ...stats,
    roomStartedAtMs: nowMs
  };
}

export function recordRestart(stats: RunStats): RunStats {
  return {
    ...stats,
    restarts: stats.restarts + 1
  };
}

export function completeRoom(stats: RunStats): RunStats {
  return {
    ...stats,
    completedRooms: stats.completedRooms + 1
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRoomSummary(stats: RunStats, nowMs: number): string {
  return `Час кімнати ${formatDuration(nowMs - stats.roomStartedAtMs)} · пройдено ${formatCompletedRooms(stats.completedRooms)} · ${formatRestarts(stats.restarts)}`;
}

export function formatVictorySummary(stats: RunStats, nowMs: number): string {
  return `Фінальний час ${formatDuration(nowMs - stats.startedAtMs)} · пройдено ${formatCompletedRooms(stats.completedRooms)} · ${formatRestarts(stats.restarts)}`;
}

function formatCompletedRooms(count: number): string {
  return formatUkrainianCount(count, { one: 'кімнату', few: 'кімнати', many: 'кімнат' });
}

function formatRestarts(count: number): string {
  return formatUkrainianCount(count, { one: 'рестарт', few: 'рестарти', many: 'рестартів' });
}
