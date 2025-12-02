import { OutcomeConfig } from '../types';
import { OUTCOME_CONFIGS as DEFAULTS } from '../constants';

const CONFIG_KEY = 'wheel_config';

export const getConfig = (): Record<string, OutcomeConfig> => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults while keeping label/color from defaults and
      // only taking editable fields (probability & maxLimit) from stored values.
      // This prevents stale/default labels (from previous versions) from
      // overriding values set in code constants.ts.
      const merged: Record<string, OutcomeConfig> = {};
      Object.keys(DEFAULTS).forEach((k) => {
        const def = DEFAULTS[k];
        const storedItem = parsed[k] || {};
        merged[k] = {
          ...def,
          // Only override fields that are deliberately editable
          probability: storedItem.probability ?? def.probability,
          maxLimit: storedItem.maxLimit ?? def.maxLimit,
        } as OutcomeConfig;
      });
      // If there are any keys in parsed that are not present in DEFAULTS,
      // include them as-is so we don't lose user-defined outcomes (backwards compat)
      Object.keys(parsed).forEach((k) => {
        if (!merged[k]) merged[k] = parsed[k];
      });
      return merged;
    }
  } catch (e) {
    console.error("Failed to load config", e);
  }
  return DEFAULTS;
};

export const saveConfig = (newConfig: Record<string, OutcomeConfig>) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
  // Dispatch a custom event so components can react immediately if needed
  window.dispatchEvent(new Event('configUpdated'));
};

export const resetConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
  window.dispatchEvent(new Event('configUpdated'));
  return DEFAULTS;
};