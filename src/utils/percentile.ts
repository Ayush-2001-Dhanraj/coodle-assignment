import {GrowthChartData, AgePercentiles} from '../models/types';
import growthCharts from '../constants/who_growth_charts.json'; // your JSON

// helper: linear interpolation between (x1, y1) and (x2, y2)
function interpolate(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  if (x2 === x1) return y1; // avoid divide by zero
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

export function calculateWeightPercentile(
  ageInMonths: number,
  weightKg: number,
  gender: 'male' | 'female',
): number | null {
  const chartData: GrowthChartData = growthCharts as GrowthChartData;

  const genderData = gender === 'male' ? chartData.boys : chartData.girls;
  const percentiles: AgePercentiles | undefined =
    genderData[ageInMonths.toString()];

  if (!percentiles) return null;

  // WHO percentiles are keys as strings ("1", "3", "5" ...)
  const entries = Object.entries(percentiles)
    .map(([p, w]) => ({percentile: Number(p), weight: w}))
    .sort((a, b) => a.weight - b.weight);

  // below minimum
  if (weightKg <= entries[0].weight) {
    return entries[0].percentile;
  }

  // above maximum
  if (weightKg >= entries[entries.length - 1].weight) {
    return entries[entries.length - 1].percentile;
  }

  // find bracketing percentiles
  for (let i = 0; i < entries.length - 1; i++) {
    const curr = entries[i];
    const next = entries[i + 1];
    if (weightKg >= curr.weight && weightKg <= next.weight) {
      return interpolate(
        weightKg,
        curr.weight,
        curr.percentile,
        next.weight,
        next.percentile,
      );
    }
  }

  return null;
}
