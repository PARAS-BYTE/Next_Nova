import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useNavStore = create(persist((set) => ({
    navState: null,
    setNavState: (data) => set({ navState: data })
}), { 
    name: 'nav-state', 
    storage: createJSONStorage(() => typeof window !== 'undefined' ? sessionStorage : undefined) 
}));
