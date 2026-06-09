import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine } from '../types';

const ROUTINES_KEY = '@gymrecord/routines';

export async function loadRoutines(): Promise<Routine[]> {
  try {
    const json = await AsyncStorage.getItem(ROUTINES_KEY);
    return json ? (JSON.parse(json) as Routine[]) : [];
  } catch {
    return [];
  }
}

export async function saveRoutines(routines: Routine[]): Promise<void> {
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
}
