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

