import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(
  persist(
    (set) => ({
      history: [],
      watchlist: [],
      playbackPositions: {}, // { itemId: seconds }

      setPlaybackPosition: (itemId, position) => set((state) => ({
        playbackPositions: { ...state.playbackPositions, [itemId]: position }
      })),

      getPlaybackPosition: (itemId) => {
        const state = useStore.getState();
        return state.playbackPositions[itemId] || 0;
      },

      addToHistory: (item) => set((state) => {
        const filtered = state.history.filter((i) => i.id !== item.id);
        return { history: [item, ...filtered].slice(0, 50) }; // Giữ tối đa 50 phim
      }),

      toggleWatchlist: (item) => set((state) => {
        const exists = state.watchlist.find((i) => i.id === item.id);
        if (exists) {
          return { watchlist: state.watchlist.filter((i) => i.id !== item.id) };
        }
        return { watchlist: [item, ...state.watchlist] };
      }),
    }),
    {
      name: 'meophim-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
