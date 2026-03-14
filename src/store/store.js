import { configureStore } from '@reduxjs/toolkit'
import portfolioReducer from './portfolioSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    ui: uiReducer,
  },
})
