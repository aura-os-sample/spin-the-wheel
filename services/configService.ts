import { OutcomeConfig } from '../types';
import { OUTCOME_CONFIGS as DEFAULTS } from '../constants';

const CONFIG_KEY = 'wheel_config';

export const getConfig = (): Record<string, OutcomeConfig> => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure structure integrity if we add fields later
      return { ...DEFAULTS, ...parsed };
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