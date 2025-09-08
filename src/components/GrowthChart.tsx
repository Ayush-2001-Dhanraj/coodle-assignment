import React, {useMemo} from 'react';
import {Dimensions, View, Text, StyleSheet, Button, Alert} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryTheme,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryLegend,
} from 'victory-native';
import dayjs from 'dayjs';
import growthCharts from '../constants/who_growth_charts.json';
import {GrowthMeasurement, GrowthChartData} from '../models/types';
import {calculateWeightPercentile} from '../utils/percentile';

const {width: windowWidth} = Dimensions.get('window');

const PERCENTILES_TO_PLOT = [3, 10, 25, 50, 75, 90, 97];

const percentileStyles: Record<number, any> = {
  3: {stroke: '#FF6B6B', strokeWidth: 1.5, strokeDasharray: '4,4'},
  10: {stroke: '#FFA94D', strokeWidth: 1.5, strokeDasharray: '4,4'},
  25: {stroke: '#4D96FF', strokeWidth: 1.5, strokeDasharray: '2,2'},
  50: {stroke: '#1E3A8A', strokeWidth: 2.5}, // median darker + thicker
  75: {stroke: '#4D96FF', strokeWidth: 1.5, strokeDasharray: '2,2'},
  90: {stroke: '#FFA94D', strokeWidth: 1.5, strokeDasharray: '4,4'},
  97: {stroke: '#FF6B6B', strokeWidth: 1.5, strokeDasharray: '4,4'},
};

function monthFromDays(days: number) {
  return Math.round(days / 30.4375);
}

function buildPercentileSeries(gender: 'male' | 'female', maxMonths = 24) {
  const chartData =
    (growthCharts as GrowthChartData) || ({} as GrowthChartData);
  const genderData = gender === 'male' ? chartData.boys : chartData.girls;
  const series: Record<number, {x: number; y: number}[]> = {};
  PERCENTILES_TO_PLOT.forEach(p => (series[p] = []));

  for (let m = 0; m <= maxMonths; m++) {
    const monthRow = genderData?.[String(m)];
    if (!monthRow) continue;
    PERCENTILES_TO_PLOT.forEach(p => {
      const val = monthRow?.[String(p)];
      if (typeof val === 'number') {
        series[p].push({x: m, y: val});
      }
    });
  }

  return series;
}

// Only latest measurement per month
function latestWeightByMonth(measurements: GrowthMeasurement[]) {
  const map = new Map<number, GrowthMeasurement>();
  measurements.forEach(m => {
    const mo = monthFromDays(m.ageInDays);
    const existing = map.get(mo);
    if (!existing || dayjs(m.date).isAfter(dayjs(existing.date))) {
      map.set(mo, m);
    }
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([mo, m]) => ({x: mo, y: m.weightKg}));
}

export const GrowthChart: React.FC<{
  measurements: GrowthMeasurement[];
  gender: 'male' | 'female';
  maxMonths?: number;
}> = ({measurements, gender, maxMonths = 24}) => {
  const percentileSeries = useMemo(
    () => buildPercentileSeries(gender, maxMonths),
    [gender, maxMonths],
  );

  const points = useMemo(() => {
    // Group by month and keep only the latest measurement
    const latestByMonth = new Map<number, GrowthMeasurement>();
    measurements.forEach(m => {
      const mo = monthFromDays(m.ageInDays);
      const existing = latestByMonth.get(mo);
      if (!existing || dayjs(m.date).isAfter(dayjs(existing.date))) {
        latestByMonth.set(mo, m);
      }
    });

    return Array.from(latestByMonth.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([mo, m]) => {
        const pct =
          typeof calculateWeightPercentile === 'function'
            ? calculateWeightPercentile(mo, m.weightKg, gender)
            : undefined;
        return {
          x: mo,
          y: m.weightKg,
          tooltip: `${dayjs(m.date).format(
            'MMM D, YYYY',
          )}\n${m.weightKg.toFixed(2)} kg\n${pct ? pct.toFixed(1) + '%' : '—'}`,
        };
      });
  }, [measurements, gender]);

  const trend = useMemo(
    () => latestWeightByMonth(measurements),
    [measurements],
  );

  if (!measurements || measurements.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No weight measurements to show yet</Text>
      </View>
    );
  }

  const allYValues = [
    ...Object.values(percentileSeries).flatMap(arr => arr.map(p => p.y)),
    ...points.map(p => p.y),
  ];
  const minY = Math.max(0, Math.floor(Math.min(...allYValues) - 0.5));
  const maxY = Math.ceil(Math.max(...allYValues) + 0.5);

  return (
    <View style={styles.container}>
      <VictoryChart
        width={Math.min(windowWidth - 12, 820)}
        height={400}
        padding={{left: 60, right: 20, top: 20, bottom: 80}}
        domain={{y: [minY, maxY], x: [0, maxMonths]}}
        theme={VictoryTheme.material}
        containerComponent={
          <VictoryVoronoiContainer
            activateData={true}
            activateLabels={true}
            labels={({datum}) => (datum.tooltip ? datum.tooltip : '')}
            labelComponent={
              <VictoryTooltip
                cornerRadius={6}
                flyoutStyle={{fill: 'white', stroke: '#333'}}
                style={{fontSize: 12}}
              />
            }
          />
        }>
        <VictoryAxis
          tickFormat={t => `${t}m`}
          label="Age (months)"
          style={{
            axisLabel: {padding: 36},
            tickLabels: {fontSize: 10},
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Weight (kg)"
          style={{
            axisLabel: {padding: 40},
            tickLabels: {fontSize: 10},
          }}
        />

        {PERCENTILES_TO_PLOT.map(p => {
          const series = percentileSeries[p];
          if (!series || series.length === 0) return null;
          const style = percentileStyles[p];
          return (
            <VictoryLine
              key={`p-${p}`}
              data={series}
              interpolation="monotoneX"
              style={{data: style}}
            />
          );
        })}

        {trend.length > 0 && (
          <VictoryLine
            data={trend}
            interpolation="monotoneX"
            style={{data: {stroke: '#000', strokeWidth: 3}}}
          />
        )}

        <VictoryScatter data={points} size={5} style={{data: {fill: '#000'}}} />

        {/* Legend */}
        <VictoryLegend
          x={100}
          y={0}
          orientation="horizontal"
          gutter={15}
          itemsPerRow={4}
          style={{labels: {fontSize: 11}}}
          data={[
            ...PERCENTILES_TO_PLOT.map(p => ({
              name: `P${p}`,
              symbol: {fill: percentileStyles[p].stroke},
            })),
            {
              name: 'Child',
              symbol: {fill: '#000'},
            },
          ]}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {color: '#666', fontSize: 15},
});
