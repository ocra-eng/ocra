import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ThemeMode } from "@ocra/shared"
import { THEME_MODES, THEME_STORAGE_KEY } from "../constants"

interface ThemeState {
  mode: ThemeMode
}

const readStoredMode = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return THEME_MODES.includes(stored as ThemeMode)
    ? (stored as ThemeMode)
    : "system"
}

const initialState: ThemeState = { mode: readStoredMode() }

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
    },
  },
})

export const { setMode } = themeSlice.actions
export const themeReducer = themeSlice.reducer
