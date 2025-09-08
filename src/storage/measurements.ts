import AsyncStorage from '@react-native-async-storage/async-storage';
import {GrowthMeasurement} from '../models/types';

export const STORAGE_KEY = 'growth/v1/measurements';

// Load all measurements
export const loadMeasurements = async (): Promise<GrowthMeasurement[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to load measurements', error);
    return [];
  }
};

// Save all measurements
const saveAll = async (measurements: GrowthMeasurement[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
  } catch (error) {
    console.error('Failed to save measurements', error);
  }
};

// Add or overwrite measurement by date
export const saveMeasurement = async (measurement: GrowthMeasurement) => {
  const existing = await loadMeasurements();

  // Check if a measurement already exists for the same date
  const idx = existing.findIndex(m => m.date === measurement.date);
  if (idx !== -1) {
    existing[idx] = measurement; // overwrite
  } else {
    existing.push(measurement); // add new
  }

  await saveAll(existing);
};

// Update a measurement by ID
export const updateMeasurement = async (measurement: GrowthMeasurement) => {
  const existing = await loadMeasurements();
  const idx = existing.findIndex(m => m.id === measurement.id);
  if (idx === -1) throw new Error('Measurement not found');
  existing[idx] = measurement;
  await saveAll(existing);
};

// Delete a measurement by ID
export const deleteMeasurement = async (id: string) => {
  const existing = await loadMeasurements();
  const filtered = existing.filter(m => m.id !== id);
  await saveAll(filtered);
};
