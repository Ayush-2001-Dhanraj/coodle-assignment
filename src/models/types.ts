export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string; // ISO string
  gender: 'male' | 'female';
}

export interface GrowthMeasurement {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  ageInDays: number; // computed from baby's birthDate
  weightKg: number; // stored in SI units (kg)
  heightCm: number; // stored in SI units (cm)
  headCm: number; // stored in SI units (cm)
  weightPercentile?: number; // 0–100
  heightPercentile?: number;
  headPercentile?: number;
}

export interface AgePercentiles {
  [percentile: string]: number;
}

export interface GenderGrowthData {
  [ageInMonths: string]: AgePercentiles;
}

export interface GrowthChartData {
  boys: GenderGrowthData;
  girls: GenderGrowthData;
}
