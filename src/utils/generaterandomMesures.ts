// randomMeasurements.ts
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import {GrowthMeasurement} from '../models/types';
import {saveAll, loadMeasurements} from '../storage/measurements';
import {calculateWeightPercentile} from './percentile';

dayjs.extend(minMax);

export async function generateRandomMeasurementsBatch(
  profile: {birthDate: string; gender: 'male' | 'female'},
  count = 50,
) {
  const birth = dayjs(profile.birthDate);
  const today = dayjs();
  const maxDate = dayjs.min(birth.add(2, 'year'), today);

  const newMeasurements: GrowthMeasurement[] = [];

  for (let i = 0; i < count; i++) {
    const randomDays = Math.floor(
      Math.random() * (maxDate.diff(birth, 'day') + 1),
    );
    const date = birth.add(randomDays, 'day');

    const weightKg = parseFloat((Math.random() * 5 + 3).toFixed(2));
    const heightCm = parseFloat((Math.random() * 25 + 45).toFixed(1));
    const headCm = parseFloat((Math.random() * 5 + 32).toFixed(1));

    const ageInDays = randomDays;
    const ageInMonths = Math.floor(ageInDays / 30.4375);

    const weightPercentile = calculateWeightPercentile(
      ageInMonths,
      weightKg,
      profile.gender,
    );

    newMeasurements.push({
      id: Date.now().toString() + i,
      date: date.format('YYYY-MM-DD'),
      ageInDays,
      weightKg,
      heightCm,
      headCm,
      weightPercentile: weightPercentile ?? undefined,
    });
  }

  // Load existing measurements
  const existing = await loadMeasurements();

  // Merge new measurements with existing ones (overwrite if same date)
  const merged = [...existing];
  newMeasurements.forEach(m => {
    const idx = merged.findIndex(e => e.date === m.date);
    if (idx !== -1) merged[idx] = m;
    else merged.push(m);
  });

  // Save everything at once
  await saveAll(merged);

  return merged; // return the full updated array
}
