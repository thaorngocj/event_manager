import { create } from 'zustand'

interface UIStore {
  eventSearchQuery: string
  setEventSearchQuery: (q: string) => void
  userSearchQuery: string
  setUserSearchQuery: (q: string) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  eventSearchQuery: '',
  setEventSearchQuery: (eventSearchQuery) => set({ eventSearchQuery }),
  userSearchQuery: '',
  setUserSearchQuery: (userSearchQuery) => set({ userSearchQuery }),
}))
