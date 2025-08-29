import { create } from "zustand"
import type { Admin } from "./../../../packages/types"  // adjust path as needed

// Utility: omit password_hash from Admin
type SafeAdmin = Omit<Admin, "password_hash" | "id" |"created_at">

interface UserStoreState {
  user: SafeAdmin | null
  setUser: (user: SafeAdmin) => void
  resetUser: () => void
  getUser: () => SafeAdmin | null
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,

  setUser: (user: SafeAdmin) => {
    set({ user })
  },

  resetUser: () => set({ user: null }),

  getUser: () => get().user,
}))
