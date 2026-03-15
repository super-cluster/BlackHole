import './Footer.css'
import { useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { Mail, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  const personal = useSelector(selectPersonal)
  return (
    <footer className="footer">
      <div className="footer__divider" />
      <div className="footer__inner container">
        <div className="footer__left">
          <span className="footer__icon">🕳</span>
          <div>
            <span className="footer__name">ANURAG</span>
            <p className="footer__sub">SDE-2 · Full-Stack Developer</p>
          </div>
        </div>
        <div className="footer__center">
          <p className="footer__quote">&ldquo;Not even light escapes a great vision.&rdquo;</p>
          <p className="footer__copy">✦ © {new Date().getFullYear()} Anurag · React + Redux + Three.js</p>
        </div>
        <div className="footer__socials">
          <a href={`mailto:${personal.email}`}  className="footer__social" aria-label="Email">    <Mail size={16} /></a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" className="footer__social" aria-label="LinkedIn"><Linkedin size={16} /></a>
          <a href={personal.github}   target="_blank" rel="noreferrer" className="footer__social" aria-label="GitHub">  <Github   size={16} /></a>
        </div>
      </div>
    </footer>
  )
}
