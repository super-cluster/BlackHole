import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeSection: 'hero',
    mobileMenuOpen: false,
    contactFormStatus: 'idle', // idle | success | error
  },
  reducers: {
    setActiveSection: (state, action) => {
      state.activeSection = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
    setContactFormStatus: (state, action) => {
      state.contactFormStatus = action.payload
    },
  },
})

export const { setActiveSection, toggleMobileMenu, closeMobileMenu, setContactFormStatus } = uiSlice.actions

export const selectActiveSection = (state) => state.ui.activeSection
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen
export const selectContactFormStatus = (state) => state.ui.contactFormStatus

export default uiSlice.reducer
