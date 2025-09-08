import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  saveMeasurement,
  loadMeasurements,
  updateMeasurement,
  deleteMeasurement,
} from '../storage/measurements';
import {COLORS} from '../constants/colors';
import {GrowthMeasurement} from '../models/types';
import {useBabyStore} from '../store/useBabyStore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import {calculateWeightPercentile} from '../utils/percentile';
dayjs.extend(isSameOrAfter);

type Mode = 'new' | 'view' | 'edit';

const EntryScreen = () => {
  const {profile, forceProfile} = useBabyStore();

  const [existingEntry, setExistingEntry] = useState<GrowthMeasurement | null>(
    null,
  );
  const [mode, setMode] = useState<Mode>('new');
  const [dateEntered, setDateEntered] = useState<string>(''); // Tracks user's date input
  const [isValidDate, setIsValidDate] = useState(false); // Tracks if date input is valid
  const [loadingEntry, setLoadingEntry] = useState(false);

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [headUnit, setHeadUnit] = useState<'cm' | 'in'>('cm');

  const measurementSchema = z.object({
    date: z
      .string()
      .refine(val => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
        message: 'Date must be YYYY-MM-DD',
      })
      .refine(val => dayjs(val).isBefore(dayjs().add(1, 'day')), {
        message: 'Date cannot be in the future',
      })
      .refine(
        val =>
          !profile?.birthDate ||
          dayjs(val).isSameOrAfter(dayjs(profile.birthDate), 'day'),
        {
          message: "Date cannot be before baby's birthdate",
        },
      ),
    weight: z.number().positive('Weight must be positive'),
    height: z.number().positive('Height must be positive'),
    head: z.number().positive('Head circumference must be positive'),
    weightUnit: z.enum(['kg', 'lb']),
    heightUnit: z.enum(['cm', 'in']),
    headUnit: z.enum(['cm', 'in']),
  });

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<z.infer<typeof measurementSchema>>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: '',
      weight: 0,
      height: 0,
      head: 0,
      weightUnit,
      heightUnit,
      headUnit,
    },
  });

  // Load entry when a valid date is entered
  useEffect(() => {
    const validateAndLoad = async () => {
      if (existingEntry) {
        reset({
          date: existingEntry.date,
          weight:
            weightUnit === 'kg'
              ? existingEntry.weightKg
              : existingEntry.weightKg / 0.453592,
          height:
            heightUnit === 'cm'
              ? existingEntry.heightCm
              : existingEntry.heightCm / 2.54,
          head:
            headUnit === 'cm'
              ? existingEntry.headCm
              : existingEntry.headCm / 2.54,
          weightUnit,
          heightUnit,
          headUnit,
        });
      } else {
        setExistingEntry(null);
        reset({
          date: dateEntered,
          weight: 0,
          height: 0,
          head: 0,
          weightUnit,
          heightUnit,
          headUnit,
        });
      }

      setLoadingEntry(false);
    };

    if (isValidDate) validateAndLoad();
  }, [isValidDate, weightUnit, heightUnit, headUnit]);

  useEffect(() => {
    const validateAndLoad = async () => {
      if (
        !dayjs(dateEntered, 'YYYY-MM-DD', true).isValid() ||
        (profile?.birthDate &&
          dayjs(dateEntered).isBefore(dayjs(profile.birthDate), 'day')) ||
        dayjs(dateEntered).isAfter(dayjs(), 'day') ||
        (profile?.birthDate &&
          dayjs(dateEntered).isAfter(
            dayjs(profile.birthDate).add(2, 'year'),
            'day',
          ))
      ) {
        setIsValidDate(false);
        setExistingEntry(null);
        setMode('new');
        return;
      }

      setIsValidDate(true);
      setLoadingEntry(true);
      const all = await loadMeasurements();
      console.log('all', all);
      const found = all.find(
        m => dayjs(m.date).format('YYYY-MM-DD') === dateEntered,
      );

      if (found) {
        setExistingEntry(found);
        setMode('view');
        reset({
          date: found.date,
          weight:
            weightUnit === 'kg' ? found.weightKg : found.weightKg / 0.453592,
          height: heightUnit === 'cm' ? found.heightCm : found.heightCm / 2.54,
          head: headUnit === 'cm' ? found.headCm : found.headCm / 2.54,
          weightUnit,
          heightUnit,
          headUnit,
        });
      } else {
        setExistingEntry(null);
        setMode('new');
        reset({
          date: dateEntered,
          weight: 0,
          height: 0,
          head: 0,
          weightUnit,
          heightUnit,
          headUnit,
        });
      }
      setLoadingEntry(false);
    };

    if (dateEntered) validateAndLoad();
  }, [dateEntered]);

  const onSubmit = async (data: z.infer<typeof measurementSchema>) => {
    const weightKg = weightUnit === 'kg' ? data.weight : data.weight * 0.453592;
    const heightCm = heightUnit === 'cm' ? data.height : data.height * 2.54;
    const headCm = headUnit === 'cm' ? data.head : data.head * 2.54;

    const ageInDays = profile?.birthDate
      ? dayjs(data.date).diff(dayjs(profile.birthDate), 'day')
      : 0;
    const ageInMonths = Math.floor(ageInDays / 30.4375); // avg month length

    const weightPercentile = profile
      ? calculateWeightPercentile(ageInMonths, weightKg, profile.gender)
      : null;

    const measurement: GrowthMeasurement = {
      id: existingEntry ? existingEntry.id : Date.now().toString(),
      date: data.date,
      ageInDays,
      weightKg,
      heightCm,
      headCm,
      weightPercentile: weightPercentile ?? undefined,
    };

    if (existingEntry) {
      await updateMeasurement(measurement);
      Alert.alert('✅ Entry updated');
    } else {
      await saveMeasurement(measurement);
      Alert.alert('✅ New entry saved');
    }

    setMode('view');
    setExistingEntry(measurement);
  };

  const handleDelete = async () => {
    if (!existingEntry) return;
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this entry?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMeasurement(existingEntry.id);
            Alert.alert('🗑 Entry deleted');
            setMode('new');
            setExistingEntry(null);
            reset({
              date: dateEntered,
              weight: 0,
              height: 0,
              head: 0,
              weightUnit,
              heightUnit,
              headUnit,
            });
          },
        },
      ],
    );
  };

  if (!profile?.birthDate || forceProfile) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading baby profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{paddingBottom: 40}}>
      {/* Step 1: Date Selection */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          Choose a date to search or enter details
        </Text>
        <TextInput
          style={[
            styles.input,
            !isValidDate && dateEntered
              ? {borderColor: COLORS.common.error}
              : {},
          ]}
          placeholder="YYYY-MM-DD"
          value={dateEntered}
          onChangeText={setDateEntered}
        />
        {!isValidDate && dateEntered ? (
          <Text style={styles.errorText}>Invdalid Date choice!!</Text>
        ) : null}
      </View>

      {/* Step 2: Show rest of form only if valid date */}
      {isValidDate && !loadingEntry && (
        <>
          <Text style={styles.modeText}>
            {mode === 'new'
              ? 'Adding new entry for this day'
              : mode === 'view'
              ? 'Viewing entry for this day'
              : 'Editing existing entry'}
          </Text>

          {/* Weight */}
          <Controller
            control={control}
            name="weight"
            render={({field: {onChange, value}}) => (
              <View style={styles.inputWrapper}>
                <View style={styles.row}>
                  <Text style={styles.label}>Weight ({weightUnit})</Text>
                  <View style={styles.switchRow}>
                    <Text>kg</Text>
                    <Switch
                      value={weightUnit === 'lb'}
                      onValueChange={v => setWeightUnit(v ? 'lb' : 'kg')}
                      // disabled={mode === 'view'}
                    />
                    <Text>lb</Text>
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.weight && {borderColor: COLORS.common.error},
                  ]}
                  keyboardType="numeric"
                  value={value.toString()}
                  onChangeText={v => onChange(Number(v))}
                  editable={mode !== 'view'}
                />
                {errors.weight && (
                  <Text style={styles.errorText}>{errors.weight.message}</Text>
                )}
              </View>
            )}
          />

          {/* Height */}
          <Controller
            control={control}
            name="height"
            render={({field: {onChange, value}}) => (
              <View style={styles.inputWrapper}>
                <View style={styles.row}>
                  <Text style={styles.label}>Height ({heightUnit})</Text>
                  <View style={styles.switchRow}>
                    <Text>cm</Text>
                    <Switch
                      value={heightUnit === 'in'}
                      onValueChange={v => setHeightUnit(v ? 'in' : 'cm')}
                      // disabled={mode === 'view'}
                    />
                    <Text>in</Text>
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.height && {borderColor: COLORS.common.error},
                  ]}
                  keyboardType="numeric"
                  value={value.toString()}
                  onChangeText={v => onChange(Number(v))}
                  editable={mode !== 'view'}
                />
                {errors.height && (
                  <Text style={styles.errorText}>{errors.height.message}</Text>
                )}
              </View>
            )}
          />

          {/* Head */}
          <Controller
            control={control}
            name="head"
            render={({field: {onChange, value}}) => (
              <View style={styles.inputWrapper}>
                <View style={styles.row}>
                  <Text style={styles.label}>
                    Head Circumference ({headUnit})
                  </Text>
                  <View style={styles.switchRow}>
                    <Text>cm</Text>
                    <Switch
                      value={headUnit === 'in'}
                      onValueChange={v => setHeadUnit(v ? 'in' : 'cm')}
                      // disabled={mode === 'view'}
                    />
                    <Text>in</Text>
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.head && {borderColor: COLORS.common.error},
                  ]}
                  keyboardType="numeric"
                  value={value.toString()}
                  onChangeText={v => onChange(Number(v))}
                  editable={mode !== 'view'}
                />
                {errors.head && (
                  <Text style={styles.errorText}>{errors.head.message}</Text>
                )}
              </View>
            )}
          />

          {/* Buttons */}
          {mode === 'view' ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setMode('edit')}>
              <Text style={styles.saveBtnText}>Edit Entry</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit(onSubmit)}>
                <Text style={styles.saveBtnText}>
                  {mode === 'edit' ? 'Update Entry' : 'Save Entry'}
                </Text>
              </TouchableOpacity>

              {mode === 'edit' && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}>
                  <Text style={styles.saveBtnText}>Delete Entry</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default EntryScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, boxSizing: 'border-box'},
  modeText: {
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  inputWrapper: {marginBottom: 16},
  label: {fontWeight: '600', marginBottom: 4},
  input: {
    borderWidth: 1,
    borderColor: COLORS.common.textSecondary,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  switchRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {color: COLORS.common.error, marginTop: 4},
  saveBtn: {
    marginTop: 20,
    backgroundColor: COLORS.boys.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    marginTop: 20,
    backgroundColor: COLORS.common.chartLine,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: COLORS.common.error,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {color: '#fff', fontWeight: '700'},
});
