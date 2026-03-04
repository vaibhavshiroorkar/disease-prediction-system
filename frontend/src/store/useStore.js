import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Prediction History ─────────────
      history: [],
      addToHistory: (entry) =>
        set((state) => ({
          history: [
            {
              ...entry,
              id: Date.now(),
              timestamp: new Date().toISOString(),
            },
            ...state.history,
          ].slice(0, 50), // Keep last 50 entries
        })),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
    }),
    {
      name: 'disease-prediction-storage',
      version: 1,
    }
  )
);

export default useStore;
