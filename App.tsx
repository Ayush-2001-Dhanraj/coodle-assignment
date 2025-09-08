import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TimeLineScreen from './src/screens/TimeLineScreen';
import EntryScreen from './src/screens/EntryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {COLORS} from './src/constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {loadProfile} from './src/storage/profile';
import dayjs from 'dayjs';
import {useBabyStore} from './src/store/useBabyStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const {
    profile,
    setProfile: setStoreProfile,
    setForceProfile,
    forceProfile,
  } = useBabyStore();
  const [loading, setLoading] = useState(true);

  const gender: 'male' | 'female' = 'male';
  const theme = {
    ...COLORS.common,
    ...(gender === 'male' ? COLORS.boys : COLORS.girls),
  };

  useEffect(() => {
    (async () => {
      const existing = await loadProfile();

      if (existing) {
        existing.birthDate = dayjs(existing.birthDate).format('YYYY-MM-DD');
        setStoreProfile(existing);
        setForceProfile(false);
      } else {
        // no profile exists
        setForceProfile(true);
        Alert.alert(
          'Profile Required',
          'Please enter your baby’s details to continue.',
        );
      }

      setLoading(false);
    })();
  }, [profile]);

  if (loading) return null; // or a splash/loading screen

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerTitle: 'Bu-Bu Ba-Ba',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopWidth: 0.5,
            borderTopColor: '#E5E7EB',
            paddingBottom: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({focused, color, size}) => {
            let iconName: string = '';

            if (route.name === 'Timeline') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Add Entry') {
              iconName = focused ? 'create' : 'create-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}>
        {forceProfile ? (
          <Tab.Screen name="Profile" component={ProfileScreen} />
        ) : (
          <>
            <Tab.Screen name="Timeline" component={TimeLineScreen} />
            <Tab.Screen name="Add Entry" component={EntryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
