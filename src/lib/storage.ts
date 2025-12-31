import { CycleData } from './cycleCalculations';

const STORAGE_KEY = 'ancure_cycle_data';

export function saveLocalCycleData(data: CycleData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cycle data:', error);
  }
}

export function loadLocalCycleData(): CycleData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CycleData;
    }
    return null;
  } catch (error) {
    console.error('Failed to load cycle data:', error);
    return null;
  }
}

export function clearLocalCycleData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cycle data:', error);
  }
}

export function hasLocalData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
