import './Navbar.css'
import { useDispatch, useSelector } from 'react-redux'
import { toggleMobileMenu, closeMobileMenu, selectMobileMenuOpen, selectActiveSection } from '../store/uiSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { id: 'about',      label: 'The Legend' },
  { id: 'experience', label: 'Grand Voyage' },
  { id: 'projects',   label: 'Conquests' },
  { id: 'skills',     label: 'Arsenal' },
  { id: 'contact',    label: 'Reach Out' },
]

export default function Navbar() {
  const dispatch   = useDispatch()
  const mobileOpen = useSelector(selectMobileMenuOpen)
  const active     = useSelector(selectActiveSection)

  const handleNav = (id) => {
    dispatch(closeMobileMenu())
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        {/* LOGO */}
        <button className="navbar__logo" onClick={() => handleNav('hero')} id="navbar-logo">
          <span className="navbar__logo-skull">☠</span>
          <span className="navbar__logo-name">ANURAG</span>
          <span className="navbar__logo-sub">SDE-2</span>
        </button>

        {/* DESKTOP LINKS */}
        <nav className="navbar__links" role="navigation">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              className={`navbar__link ${active === link.id ? 'navbar__link--active' : ''}`}
              onClick={() => handleNav(link.id)}
              id={`nav-${link.id}`}
            >
              {link.label}
              {active === link.id && (
                <motion.span
                  className="navbar__link-underline"
                  layoutId="nav-underline"
                />
              )}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <a href="mailto:anuragcooldavkh@gmail.com" className="btn btn-primary navbar__cta" id="navbar-hire-btn">
          Hire Me ⚡
        </a>

        {/* HAMBURGER */}
        <button
          className="navbar__hamburger"
          onClick={() => dispatch(toggleMobileMenu())}
          aria-label="Toggle menu"
          id="navbar-hamburger"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                className={`navbar__mobile-link ${active === link.id ? 'active' : ''}`}
                onClick={() => handleNav(link.id)}
              >
                {link.label}
              </button>
            ))}
            <a href="mailto:anuragcooldavkh@gmail.com" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Hire Me ⚡
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
