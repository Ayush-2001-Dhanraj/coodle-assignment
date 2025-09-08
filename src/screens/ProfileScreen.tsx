import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {saveProfile, loadProfile, clearProfile} from '../storage/profile';
import {BabyProfile} from '../models/types';
import {COLORS} from '../constants/colors';
import {TouchableOpacity} from 'react-native';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthDate: z
    .string()
    .refine(val => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
      message: 'Birthdate must be YYYY-MM-DD',
    })
    .refine(
      val => {
        const [year, month, day] = val.split('-').map(Number);

        // Year validation
        if (year < 2000 || year > dayjs().year()) return false; // Example: year must be 2000-current
        return true;
      },
      {message: 'Invalid year'},
    )
    .refine(
      val => {
        const [year, month] = val.split('-').map(Number);
        return month >= 1 && month <= 12;
      },
      {message: 'Month must be between 1 and 12'},
    )
    .refine(
      val => {
        const [year, month, day] = val.split('-').map(Number);
        // Check day validity for the month (including leap year for Feb)
        if (day < 1) return false;
        const maxDays = [
          31,
          year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
          31,
          30,
          31,
          30,
          31,
          31,
          30,
          31,
          30,
          31,
        ];
        return day <= maxDays[month - 1];
      },
      {message: 'Invalid day for the selected month/year'},
    )
    .refine(val => dayjs(val).isBefore(dayjs(), 'day'), {
      message: 'Birthdate cannot be in the future',
    })
    .refine(val => dayjs().diff(dayjs(val), 'year') <= 5, {
      message: 'Age must be 0-5 years',
    }),
  gender: z.enum(['male', 'female']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileScreen = () => {
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [editing, setEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {name: '', birthDate: '', gender: 'male'},
  });

  useEffect(() => {
    (async () => {
      const existing = await loadProfile();
      if (existing) {
        existing.birthDate = dayjs(existing.birthDate).format('YYYY-MM-DD');
        setProfile(existing);
        reset(existing);
      }
    })();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const newProfile: BabyProfile = {
      id: profile?.id ?? Date.now().toString(),
      ...data,
    };
    await saveProfile(newProfile);
    setProfile(newProfile);
    setEditing(false);
    Alert.alert('✅ Profile saved');
  };

  const onDelete = () => {
    Alert.alert('Delete Profile', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await clearProfile();
          setProfile(null);
          reset({name: '', birthDate: '', gender: 'male'});
          Alert.alert('🗑️ Profile deleted');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({field: {onChange, value}}) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Baby's Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.name && {borderColor: COLORS.common.error},
              ]}
              placeholder="Enter name"
              value={value}
              editable={editing || !profile}
              onChangeText={onChange}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      {/* Birthdate */}
      <Controller
        control={control}
        name="birthDate"
        render={({field: {onChange, value}}) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Birthdate</Text>
            <TextInput
              style={[
                styles.input,
                errors.birthDate && {borderColor: COLORS.common.error},
              ]}
              placeholder="YYYY-MM-DD"
              value={value}
              editable={editing || !profile}
              onChangeText={onChange}
            />
            {errors.birthDate && (
              <Text style={styles.errorText}>{errors.birthDate.message}</Text>
            )}
          </View>
        )}
      />

      {/* Gender */}
      <Controller
        control={control}
        name="gender"
        render={({field: {onChange, value}}) => (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {['male', 'female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    value === g && {backgroundColor: COLORS.common.success},
                  ]}
                  disabled={!editing && !!profile}
                  onPress={() => onChange(g as 'male' | 'female')}>
                  <Text style={styles.genderText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender.message}</Text>
            )}
          </View>
        )}
      />

      {/* Action buttons */}
      <View style={styles.actions}>
        {!profile || editing ? (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSubmit(onSubmit)}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  inputWrapper: {marginBottom: 16},
  label: {fontWeight: '600', marginBottom: 4},
  input: {
    borderWidth: 1,
    borderColor: COLORS.common.textSecondary,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  errorText: {color: COLORS.common.error, marginTop: 4},
  genderRow: {flexDirection: 'row', gap: 10},
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.common.textSecondary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  genderText: {fontWeight: '600'},
  actions: {flexDirection: 'row', marginTop: 24, gap: 12},
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.boys.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {color: '#fff', fontWeight: '700'},
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.common.warning,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {color: '#fff', fontWeight: '700'},
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.common.error,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {color: '#fff', fontWeight: '700'},
});
