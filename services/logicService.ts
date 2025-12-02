import { OutcomeId } from '../types';
import { getConfig } from './configService';
import { getCounts } from './storageService';

export const determineOutcome = (): OutcomeId | null => {
  const currentCounts = getCounts();
  const configMap = getConfig();
  const candidates: OutcomeId[] = [];
  let totalProbabilityWeight = 0;

  // 1. Filter available outcomes based on limits
  (Object.keys(configMap) as OutcomeId[]).forEach((key) => {
    const config = configMap[key];
    const currentCount = currentCounts[key] || 0;

    if (currentCount < config.maxLimit) {
      candidates.push(key);
      totalProbabilityWeight += config.probability;
    }
  });

  // If no candidates are left (limits reached)
  if (candidates.length === 0) {
    return null;
  }

  // 2. Generate random number within the normalized range
  const random = Math.random() * totalProbabilityWeight;

  // 3. Select winner based on cumulative weight
  let accumulatedWeight = 0;
  for (const outcomeId of candidates) {
    accumulatedWeight += configMap[outcomeId].probability;
    if (random <= accumulatedWeight) {
      return outcomeId;
    }
  }

  // Fallback
  return candidates[candidates.length - 1];
};