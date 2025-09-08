import {create} from 'zustand';
import {BabyProfile} from '../models/types';

interface BabyStore {
  profile: BabyProfile | null;
  forceProfile: boolean;
  setProfile: (p: BabyProfile | null) => void;
  setForceProfile: (v: boolean) => void;
}

export const useBabyStore = create<BabyStore>(set => ({
  profile: null,
  forceProfile: false,
  setProfile: p => set({profile: p}),
  setForceProfile: v => set({forceProfile: v}),
}));
