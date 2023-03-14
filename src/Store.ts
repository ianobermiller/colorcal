import { create } from 'zustand';

interface State {
  selectedCategoryID: string | null;
  selectCategory(id: string | null): void;
}

export const useStore = create<State>((set) => ({
  selectCategory: (id: string) => set(() => ({ selectedCategoryID: id })),
  selectedCategoryID: null,
}));
