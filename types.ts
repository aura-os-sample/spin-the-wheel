export type OutcomeId = '200' | '301' | '302' | '404';

export interface OutcomeConfig {
  id: OutcomeId;
  label: string;
  color: string;
  probability: number; // 0 to 1
  maxLimit: number;
}

export interface SpinRecord {
  id: string;
  timestamp: number;
  outcomeId: OutcomeId;
}

export interface WheelSlice {
  label: string;
  outcomeId: OutcomeId;
  color: string;
  startAngle?: number;
  endAngle?: number;
}
