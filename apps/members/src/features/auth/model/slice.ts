import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

/**
 * Mirrors the Supabase session only. The member record itself comes from
 * the API via RTK Query, so there is one source of truth for member data
 * rather than a copy kept in sync by effects (the v1 mistake).
 */
export type SessionStatus =
  | "loading"
  | "anonymous"
  | "otp-sent"
  | "authenticated"

interface SessionState {
  status: SessionStatus
  /** Email a code was sent to, kept for the verify step and resends. */
  pendingEmail: string | null
}

const initialState: SessionState = { status: "loading", pendingEmail: null }

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    otpRequested: (state, action: PayloadAction<string>) => {
      state.status = "otp-sent"
      state.pendingEmail = action.payload
    },
    sessionResolved: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? "authenticated" : "anonymous"
      if (action.payload) state.pendingEmail = null
    },
    loginRestarted: (state) => {
      state.status = "anonymous"
      state.pendingEmail = null
    },
  },
})

export const { otpRequested, sessionResolved, loginRestarted } =
  sessionSlice.actions
export const sessionReducer = sessionSlice.reducer
