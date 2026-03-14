import './Footer.css'
import { useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { Mail, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  const personal = useSelector(selectPersonal)

  return (
    <footer className="footer">
      <div className="footer__wave">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" fill="var(--color-surface)" />
        </svg>
      </div>
      <div className="footer__inner container">
        <div className="footer__left">
          <span className="footer__skull">☠</span>
          <div>
            <span className="footer__name">ANURAG</span>
            <p className="footer__sub">SDE-2 · Full-Stack Developer</p>
          </div>
        </div>

        <div className="footer__center">
          <p className="footer__quote">&quot;The sea is not a limit — it&apos;s the beginning.&quot;</p>
          <p className="footer__copy">⚓ © {new Date().getFullYear()} Anurag · Built with React &amp; Redux</p>
        </div>

        <div className="footer__socials">
          <a href={`mailto:${personal.email}`}  className="footer__social" aria-label="Email">    <Mail size={16} /></a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" className="footer__social" aria-label="LinkedIn"> <Linkedin size={16} /></a>
          <a href={personal.github}   target="_blank" rel="noreferrer" className="footer__social" aria-label="GitHub">   <Github size={16} /></a>
        </div>
      </div>
    </footer>
  )
}
