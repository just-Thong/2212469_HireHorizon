import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, JobFilters } from '@/types/job';

interface JobStore {
  savedJobIds: string[];
  filters: JobFilters;
  saveJob: (id: string) => void;
  removeJob: (id: string) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: JobFilters = {
  query: '',
  location: '',
  type: [],
  category: [],
};

export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      savedJobIds: [],
      filters: initialFilters,
      saveJob: (id) =>
        set((state) => ({
          savedJobIds: state.savedJobIds.includes(id)
            ? state.savedJobIds
            : [...state.savedJobIds, id],
        })),
      removeJob: (id) =>
        set((state) => ({
          savedJobIds: state.savedJobIds.filter((jobId) => jobId !== id),
        })),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'job-storage',
      partialize: (state) => ({ savedJobIds: state.savedJobIds }),
    }
  )
);
