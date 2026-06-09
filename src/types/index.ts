export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTimeSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}
