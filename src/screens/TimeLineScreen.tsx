import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import {useGrowthStore} from '../store/useGrowthStore'; // your zustand store
import dayjs from 'dayjs';
import {GrowthChart} from '../components/GrowthChart';
import {useBabyStore} from '../store/useBabyStore';
import {generateRandomMeasurementsBatch} from '../utils/generaterandomMesures';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '../../App';

const TimeLineScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [view, setView] = useState<'timeline' | 'graph'>('graph');
  const measurements = useGrowthStore(s => s.measurements);
  const {profile} = useBabyStore();

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const gender: 'male' | 'female' = profile?.gender ?? 'male';

  return (
    <View style={styles.container}>
      <Button
        title="Generate Random Data"
        onPress={async () => {
          if (!profile?.birthDate) return;
          await generateRandomMeasurementsBatch(profile, 50);
          Alert.alert('50 random measurements added!');
        }}
      />
      {/* Toggle Buttons */}
      <View style={styles.toggle}>
        <TouchableOpacity onPress={() => setView('graph')}>
          <Text style={[styles.toggleBtn, view === 'graph' && styles.active]}>
            Graph
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('timeline')}>
          <Text
            style={[styles.toggleBtn, view === 'timeline' && styles.active]}>
            Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'timeline' ? (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 16}}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 32, color: '#666'}}>
              No measurements yet
            </Text>
          }
          renderItem={({item}) => {
            const dateLabel = dayjs(item.date).format('MMM D, YYYY');
            const age = `${Math.floor(item.ageInDays / 30)}m ${
              item.ageInDays % 30
            }d`;

            return (
              <View style={styles.card}>
                <Text style={styles.title}>
                  {dateLabel} ({age})
                </Text>
                <Text>
                  Weight: {item.weightKg.toFixed(2)} kg (
                  {item.weightPercentile ?? '--'} %)
                </Text>
                <Text>
                  Height: {item.heightCm.toFixed(1)} cm (
                  {item.heightPercentile ?? '--'} %)
                </Text>
                <Text>
                  Head: {item.headCm.toFixed(1)} cm (
                  {item.headPercentile ?? '--'} %)
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Add Entry', {date: item.date});
                    }}>
                    <Text style={styles.edit}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      useGrowthStore.getState().deleteMeasurement(item.id)
                    }>
                    <Text style={styles.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.graphContainer}>
          <GrowthChart
            measurements={measurements}
            gender={gender}
            maxMonths={24}
          />
        </View>
      )}
    </View>
  );
};

export default TimeLineScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f8f8'},
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  toggleBtn: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  active: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  title: {fontWeight: 'bold', fontSize: 16, marginBottom: 6},
  actions: {flexDirection: 'row', marginTop: 8},
  edit: {marginRight: 16, color: 'blue'},
  delete: {color: 'red'},
  graphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
