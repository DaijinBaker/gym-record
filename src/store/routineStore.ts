import { create } from 'zustand';
import { Routine } from '../types';
import { loadRoutines, saveRoutines } from '../storage';
import { moveWithinGroup } from '../utils/reorder';

interface RoutineState {
  routines: Routine[];
  load: () => Promise<void>;
  upsertRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  assignCategory: (routineId: string, categoryId: string | undefined) => Promise<void>;
  moveRoutineUp: (id: string) => Promise<void>;
  moveRoutineDown: (id: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  load: async () => {
    const routines = await loadRoutines();
    set({ routines });
  },
  upsertRoutine: async (routine) => {
    const current = get().routines;
    const exists = current.some((r) => r.id === routine.id);
    const updated = exists
      ? current.map((r) => (r.id === routine.id ? routine : r))
      : [...current, routine];
    set({ routines: updated });
    await saveRoutines(updated);
  },
  deleteRoutine: async (id) => {
    const updated = get().routines.filter((r) => r.id !== id);
    set({ routines: updated });
    await saveRoutines(updated);
  },
  assignCategory: async (routineId, categoryId) => {
    const updated = get().routines.map((r) =>
      r.id === routineId ? { ...r, categoryId } : r
    );
    set({ routines: updated });
    await saveRoutines(updated);
  },
  moveRoutineUp: async (id) => {
    const updated = moveWithinGroup(
      get().routines,
      id,
      'up',
      (r) => r.id,
      (r) => r.categoryId
    );
    if (!updated) return;
    set({ routines: updated });
    await saveRoutines(updated);
  },
  moveRoutineDown: async (id) => {
    const updated = moveWithinGroup(
      get().routines,
      id,
      'down',
      (r) => r.id,
      (r) => r.categoryId
    );
    if (!updated) return;
    set({ routines: updated });
    await saveRoutines(updated);
  },
}));

