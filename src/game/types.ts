export type Vec2 = {
  x: number;
  z: number;
};

export type EnemyKind = 'drone' | 'turret' | 'beetle' | 'boss';

export type EnemyConfig = {
  kind: EnemyKind;
  position: Vec2;
};

export type TargetConfig = {
  position: Vec2;
};

export type CollectibleConfig = {
  position: Vec2;
};

export type ButtonConfig = {
  position: Vec2;
  opensDoorId: string;
};

export type DoorConfig = {
  id: string;
  position: Vec2;
};

export type LaserConfig = {
  position: Vec2;
  length: number;
  axis: 'x' | 'z';
  phase: number;
};

export type PowerUpKind = 'repair' | 'rapid' | 'shield';

export type PowerUpConfig = {
  kind: PowerUpKind;
  position: Vec2;
};

export type ObstacleConfig = {
  position: Vec2;
  size: {
    width: number;
    depth: number;
  };
  height?: number;
};

export type LevelObjective = 'targets' | 'enemies' | 'buttons' | 'survive-lasers' | 'boss';

export type LevelConfig = {
  id: number;
  name: string;
  objective: LevelObjective;
  tip: string;
  playerStart: Vec2;
  exit: Vec2;
  targets?: TargetConfig[];
  enemies?: EnemyConfig[];
  collectibles?: CollectibleConfig[];
  buttons?: ButtonConfig[];
  doors?: DoorConfig[];
  lasers?: LaserConfig[];
  powerUps?: PowerUpConfig[];
  obstacles?: ObstacleConfig[];
};
