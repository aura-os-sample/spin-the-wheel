import { OutcomeConfig, WheelSlice } from './types';

// Configuration based on requirements
export const OUTCOME_CONFIGS: Record<string, OutcomeConfig> = {
  '200': {
    id: '200',
    label: '200 OK',
    color: '#0F2854', // Green
    probability: 0.40,
    maxLimit: 50,
  },
  '301': {
    id: '301',
    label: '301 Go to Counter',
    color: '#1C4D8D', // Amber
    probability: 0.25,
    maxLimit: 25,
  },
  '302': {
    id: '302',
    label: '302 Go to Another Place',
    color: '#4988C4', // Yellow
    probability: 0.25,
    maxLimit: 25,
  },
  '404': {
    id: '404',
    label: '404 Better Luck Next Time',
    color: '#BDE8F5', // Red
    probability: 0.10,
    maxLimit: 20, // Set reasonable limit for "???"
  },
};

// The physical visual slices on the wheel (6 slices total)
// Order matters for the visual layout
export const WHEEL_SLICES: WheelSlice[] = [
  { label: '200', outcomeId: '200', color: OUTCOME_CONFIGS['200'].color },
  { label: '404', outcomeId: '404', color: OUTCOME_CONFIGS['404'].color },
  { label: '301', outcomeId: '301', color: OUTCOME_CONFIGS['301'].color },
  { label: '200', outcomeId: '200', color: OUTCOME_CONFIGS['200'].color },
  { label: '404', outcomeId: '404', color: OUTCOME_CONFIGS['404'].color },
  { label: '302', outcomeId: '302', color: OUTCOME_CONFIGS['302'].color },
];
