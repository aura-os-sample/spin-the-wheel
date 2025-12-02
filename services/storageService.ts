import { SpinRecord, OutcomeId } from '../types';

const STORAGE_KEY = 'spin_wheel_history';

export const getHistory = (): SpinRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse history", error);
    return [];
  }
};

export const saveSpin = (outcomeId: OutcomeId) => {
  const history = getHistory();
  const newRecord: SpinRecord = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    outcomeId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newRecord, ...history]));
  return newRecord;
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCounts = (): Record<OutcomeId, number> => {
  const history = getHistory();
  const counts: Record<string, number> = {
    '200': 0,
    '301': 0,
    '302': 0,
    '404': 0,
  };
  
  history.forEach(record => {
    if (counts[record.outcomeId] !== undefined) {
      counts[record.outcomeId]++;
    }
  });

  return counts as Record<OutcomeId, number>;
};
