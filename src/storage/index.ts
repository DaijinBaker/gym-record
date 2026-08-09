import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, Category } from '../types';

const ROUTINES_KEY = '@gymrecord/routines';
const CATEGORIES_KEY = '@gymrecord/categories';

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

export async function loadCategories(): Promise<Category[]> {
  try {
    const json = await AsyncStorage.getItem(CATEGORIES_KEY);
    return json ? (JSON.parse(json) as Category[]) : [];
  } catch {
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
