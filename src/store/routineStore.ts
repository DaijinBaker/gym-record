import { create } from 'zustand';
import { Routine } from '../types';
import { loadRoutines, saveRoutines } from '../storage';

interface RoutineState {
  routines: Routine[];
  loaded: boolean;
  load: () => Promise<void>;
  upsertRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  loaded: false,
  load: async () => {
    const routines = await loadRoutines();
    set({ routines, loaded: true });
  },
  upsertRoutine: async (routine) => {
    const current = get().routines;
    const exists = current.some((r) => r.id === routine.id);
    const updated = exists
      ? current.map((r) => (r.id === routine.id ? routine : r))
      : [routine, ...current];
    set({ routines: updated });
    await saveRoutines(updated);
  },
  deleteRoutine: async (id) => {
    const updated = get().routines.filter((r) => r.id !== id);
    set({ routines: updated });
    await saveRoutines(updated);
  },
}));

