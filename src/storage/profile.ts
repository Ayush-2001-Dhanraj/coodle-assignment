import AsyncStorage from '@react-native-async-storage/async-storage';
import { BabyProfile } from '../models/types';

const PROFILE_KEY = 'growth/v1/profile';

export async function saveProfile(profile: BabyProfile) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export async function loadProfile(): Promise<BabyProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading profile', e);
    return null;
  }
}

export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (e) {
    console.error('Error clearing profile', e);
  }
}
