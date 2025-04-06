import { create } from 'zustand';

interface State {
  selectCategory(id: null | string): void;
  selectedCategoryID: null | string;
}

export const useStore = create<State>((set) => ({
  selectCategory: (id: string) => set(() => ({ selectedCategoryID: id })),
  selectedCategoryID: null,
}));
