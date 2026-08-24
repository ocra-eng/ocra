import { configureStore } from "@reduxjs/toolkit"
import { themeReducer } from "@ocra/ui"
import { membersApi } from "@/api/client"
import { sessionReducer } from "@/features/auth"

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    session: sessionReducer,
    [membersApi.reducerPath]: membersApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(membersApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
