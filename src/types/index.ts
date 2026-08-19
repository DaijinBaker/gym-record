export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTimeSeconds: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface LoggedSet {
  id: string;
  targetReps: number;
  targetWeight: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
}

export interface SessionExercise {
  id: string;
  name: string;
  restTimeSeconds: number;
  notes?: string;
  sets: LoggedSet[];
}

export type WorkoutSessionStatus = 'in-progress' | 'completed';

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  exercises: SessionExercise[];
  status: WorkoutSessionStatus;
  startedAt: string;
  finishedAt?: string;
}

