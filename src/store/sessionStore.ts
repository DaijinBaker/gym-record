import { create } from 'zustand';
import { Routine, WorkoutSession, LoggedSet } from '../types';
import { loadSessions, saveSessions } from '../storage';
import { generateId } from '../utils/id';

interface SessionState {
  sessions: WorkoutSession[];
  load: () => Promise<void>;
  startSession: (routine: Routine) => Promise<WorkoutSession>;
  updateSet: (
    sessionId: string,
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<LoggedSet, 'reps' | 'weight' | 'completed'>>
  ) => Promise<void>;
  addSet: (sessionId: string, exerciseId: string) => Promise<void>;
  removeSet: (sessionId: string, exerciseId: string, setId: string) => Promise<void>;
  finishSession: (sessionId: string) => Promise<void>;
  discardSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  load: async () => {
    const sessions = await loadSessions();
    set({ sessions });
  },
  startSession: async (routine) => {
    const newSession: WorkoutSession = {
      id: generateId(),
      routineId: routine.id,
      routineName: routine.name,
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      exercises: routine.exercises.map((ex) => ({
        id: generateId(),
        name: ex.name,
        restTimeSeconds: ex.restTimeSeconds,
        notes: ex.notes,
        sets: Array.from({ length: ex.sets }, () => ({
          id: generateId(),
          targetReps: ex.reps,
          targetWeight: ex.weight,
          reps: null,
          weight: null,
          completed: false,
        })),
      })),
    };
    const updated = [...get().sessions, newSession];
    set({ sessions: updated });
    await saveSessions(updated);
    return newSession;
  },
  updateSet: async (sessionId, exerciseId, setId, patch) => {
    const updated = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        exercises: s.exercises.map((e) => {
          if (e.id !== exerciseId) return e;
          return {
            ...e,
            sets: e.sets.map((st) => (st.id === setId ? { ...st, ...patch } : st)),
          };
        }),
      };
    });
    set({ sessions: updated });
    await saveSessions(updated);
  },
  addSet: async (sessionId, exerciseId) => {
    const updated = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        exercises: s.exercises.map((e) => {
          if (e.id !== exerciseId) return e;
          const last = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: generateId(),
                targetReps: last?.targetReps ?? 0,
                targetWeight: last?.targetWeight ?? 0,
                reps: null,
                weight: null,
                completed: false,
              },
            ],
          };
        }),
      };
    });
    set({ sessions: updated });
    await saveSessions(updated);
  },
  removeSet: async (sessionId, exerciseId, setId) => {
    const updated = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        exercises: s.exercises.map((e) =>
          e.id !== exerciseId ? e : { ...e, sets: e.sets.filter((st) => st.id !== setId) }
        ),
      };
    });
    set({ sessions: updated });
    await saveSessions(updated);
  },
  finishSession: async (sessionId) => {
    const updated = get().sessions.map((s) =>
      s.id === sessionId
        ? { ...s, status: 'completed' as const, finishedAt: new Date().toISOString() }
        : s
    );
    set({ sessions: updated });
    await saveSessions(updated);
  },
  discardSession: async (sessionId) => {
    const updated = get().sessions.filter((s) => s.id !== sessionId);
    set({ sessions: updated });
    await saveSessions(updated);
  },
}));

export function findLastLoggedSet(
  sessions: WorkoutSession[],
  exerciseName: string
): { weight: number; reps: number; date: string } | null {
  const completed = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));

  for (const session of completed) {
    const exercise = session.exercises.find((e) => e.name === exerciseName);
    if (!exercise) continue;
    const loggedSets = exercise.sets.filter(
      (st) => st.completed && st.reps !== null && st.weight !== null
    );
    if (loggedSets.length === 0) continue;
    const last = loggedSets[loggedSets.length - 1];
    return { weight: last.weight as number, reps: last.reps as number, date: session.finishedAt as string };
  }
  return null;
}

export function findInProgressSession(
  sessions: WorkoutSession[],
  routineId: string
): WorkoutSession | undefined {
  return sessions.find((s) => s.status === 'in-progress' && s.routineId === routineId);
}
