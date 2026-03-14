import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setActiveSection } from '../store/uiSlice'

const SECTIONS = ['hero', 'about', 'experience', 'projects', 'skills', 'contact']

/**
 * useScrollSpy — tracks which section is in view and updates Redux state.
 */
export function useScrollSpy() {
  const dispatch = useDispatch()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dispatch(setActiveSection(entry.target.id))
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [dispatch])
}
