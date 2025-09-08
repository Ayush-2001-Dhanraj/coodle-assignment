import AsyncStorage from '@react-native-async-storage/async-storage';
import {BabyProfile} from '../models/types';
import {STORAGE_KEY} from './measurements'; // Import the key from measurements

const PROFILE_KEY = 'growth/v1/profile';

export async function saveProfile(profile: BabyProfile) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

// Load profile
export async function loadProfile(): Promise<BabyProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading profile', e);
    return null;
  }
}

// Clear profile and all measurements
export async function clearProfile() {
  try {
    await AsyncStorage.multiRemove([PROFILE_KEY, STORAGE_KEY]);
  } catch (e) {
    console.error('Error clearing profile and measurements', e);
  }
}
