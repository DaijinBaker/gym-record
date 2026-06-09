import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useRoutineStore } from '../src/store/routineStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const loadRoutines = useRoutineStore((s) => s.load);

  useEffect(() => {
    loadRoutines();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});

