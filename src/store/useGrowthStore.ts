import {create} from 'zustand';
import {
  loadMeasurements,
  saveMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../storage/measurements';
import {GrowthMeasurement} from '../models/types';

interface GrowthState {
  measurements: GrowthMeasurement[];
  loadAll: () => Promise<void>;
  addMeasurement: (m: GrowthMeasurement) => Promise<void>;
  updateMeasurement: (m: GrowthMeasurement) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  measurements: [],

  loadAll: async () => {
    const data = await loadMeasurements();
    set({measurements: data});
  },

  addMeasurement: async (m: GrowthMeasurement) => {
    await saveMeasurement(m);
    await get().loadAll(); // refresh
  },

  updateMeasurement: async (m: GrowthMeasurement) => {
    await updateMeasurement(m);
    await get().loadAll();
  },

  deleteMeasurement: async (id: string) => {
    await deleteMeasurement(id);
    await get().loadAll();
  },
}));
