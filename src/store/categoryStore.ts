import { create } from 'zustand';
import { Category } from '../types';
import { loadCategories, saveCategories } from '../storage';
import { generateId } from '../utils/id';
import { moveWithinGroup } from '../utils/reorder';

interface CategoryState {
  categories: Category[];
  load: () => Promise<void>;
  addCategory: (name: string, parentId?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setCategoryParent: (id: string, parentId: string | undefined) => Promise<void>;
  moveCategoryUp: (id: string) => Promise<void>;
  moveCategoryDown: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  load: async () => {
    const categories = await loadCategories();
    set({ categories });
  },
  addCategory: async (name, parentId) => {
    const category: Category = {
      id: generateId(),
      name: name.trim(),
      parentId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().categories, category];
    set({ categories: updated });
    await saveCategories(updated);
  },
  deleteCategory: async (id) => {
    const updated = get().categories.filter((c) => c.id !== id);
    set({ categories: updated });
    await saveCategories(updated);
  },
  setCategoryParent: async (id, parentId) => {
    const updated = get().categories.map((c) => (c.id === id ? { ...c, parentId } : c));
    set({ categories: updated });
    await saveCategories(updated);
  },
  moveCategoryUp: async (id) => {
    const updated = moveWithinGroup(
      get().categories,
      id,
      'up',
      (c) => c.id,
      (c) => c.parentId
    );
    if (!updated) return;
    set({ categories: updated });
    await saveCategories(updated);
  },
  moveCategoryDown: async (id) => {
    const updated = moveWithinGroup(
      get().categories,
      id,
      'down',
      (c) => c.id,
      (c) => c.parentId
    );
    if (!updated) return;
    set({ categories: updated });
    await saveCategories(updated);
  },
}));
