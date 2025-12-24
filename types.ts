
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  scale: number;
  type: 'BALL' | 'GIFT' | 'LIGHT';
  weight: number; // For physics-inspired lerp behavior
  color: string;
}

export interface FoliageData {
  chaosPositions: Float32Array;
  targetPositions: Float32Array;
  count: number;
}
