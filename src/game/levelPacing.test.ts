import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { summarizeLevelPacing, validateBossOverchargeSupport, validateLateRoomSupport } from './levelPacing';

describe('late-room pacing support', () => {
  it('keeps the pressure rooms stocked with repair and power-up support', () => {
    const failures = LEVELS.flatMap(validateLateRoomSupport);

    expect(failures).toEqual([]);
  });

  it('requires shield support in the hardest laser-button room', () => {
    const room10 = LEVELS.find((level) => level.id === 10);

    expect(room10).toBeDefined();
    expect(validateLateRoomSupport({
      ...room10!,
      powerUps: (room10!.powerUps ?? []).filter((powerUp) => powerUp.kind !== 'shield')
    })).toContain('Level 10 needs a shield pickup for laser/button pressure.');
  });

  it('requires shield support for any late multi-button laser room, not only room 10', () => {
    expect(validateLateRoomSupport({
      id: 9,
      name: 'Synthetic pressure room',
      objective: 'buttons',
      tip: 'test',
      playerStart: { x: 0, z: 20 },
      exit: { x: 0, z: -21 },
      buttons: [
        { position: { x: -10, z: 10 }, opensDoorId: 'a' },
        { position: { x: 10, z: 10 }, opensDoorId: 'a' },
        { position: { x: -10, z: 0 }, opensDoorId: 'a' },
        { position: { x: 10, z: 0 }, opensDoorId: 'a' },
        { position: { x: 0, z: -10 }, opensDoorId: 'a' }
      ],
      lasers: [
        { position: { x: -8, z: 0 }, length: 24, axis: 'z', phase: 0 },
        { position: { x: 8, z: 0 }, length: 24, axis: 'z', phase: 1 }
      ],
      powerUps: [{ kind: 'repair', position: { x: 0, z: 0 } }]
    })).toContain('Level 9 needs a shield pickup for laser/button pressure.');
  });

  it('documents why the final boss arena is forgiving enough for a full run', () => {
    const boss = LEVELS.find((level) => level.objective === 'boss');

    expect(boss).toBeDefined();
    expect(summarizeLevelPacing(boss!)).toMatchObject({
      hasBoss: true,
      repairCount: 3,
      powerUpCount: 6,
      enemyCount: 7
    });
  });

  it('puts exactly one high-impact overcharge pickup in a risky final-boss position', () => {
    const boss = LEVELS.find((level) => level.objective === 'boss');

    expect(boss).toBeDefined();
    expect(validateBossOverchargeSupport(boss!)).toEqual([]);
  });

  it('includes boss overcharge policy in the late-room support guard', () => {
    const boss = LEVELS.find((level) => level.objective === 'boss');

    expect(boss).toBeDefined();
    expect(validateLateRoomSupport({
      ...boss!,
      powerUps: (boss!.powerUps ?? []).filter((powerUp) => powerUp.kind !== 'overcharge')
    })).toContain(`Level ${boss!.id} boss arena needs exactly one overcharge pickup.`);
  });
});
