import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'EN' | 'VI'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'VI',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'va-language-vi' }
  )
)
