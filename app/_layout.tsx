
import { Tabs, useGlobalSearchParams } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from '../components/Icon';
import { colors } from '../styles/commonStyles';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();

    if (Platform.OS === 'web') {
      // If there's a new emulate parameter, store it
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        // If no emulate parameter, try to get from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };

    // Use stored emulate value if available, otherwise use the current emulate parameter
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: Platform.OS === 'ios' ? 20 : 10,
              paddingTop: 10,
              height: Platform.OS === 'ios' ? 90 : 70,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Startbildschirm',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Administrator',
              tabBarIcon: ({ color, size }) => (
                <Icon name="shield-checkmark" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
