import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TimeLineScreen from './src/screens/TimeLineScreen';
import EntryScreen from './src/screens/EntryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {COLORS} from './src/constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function App() {
  const gender: 'male' | 'female' = 'male';
  const theme = {
    ...COLORS.common,
    ...(gender === 'male' ? COLORS.boys : COLORS.girls),
  };

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

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'create' : 'create-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}>
        <Tab.Screen name="Home" component={TimeLineScreen} />
        <Tab.Screen name="Profile" component={EntryScreen} />
        <Tab.Screen name="Settings" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
