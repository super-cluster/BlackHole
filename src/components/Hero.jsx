import './Hero.css'
import { useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { Mail, Linkedin, Github, Anchor, Compass } from 'lucide-react'
import { useEffect, useState } from 'react'
import ThreeBackground from './ThreeBackground'

const TYPED_WORDS = [
  'Distributed Systems',
  'Spring Boot APIs',
  'React Modernizations',
  'Cloud Architecture',
  'Event-Driven Systems',
]

export default function Hero() {
  const personal = useSelector(selectPersonal)
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = TYPED_WORDS[wordIndex]
    let timeout
    if (!isDeleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    } else if (!isDeleting && displayed.length === word.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200)
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 45)
    } else {
      setIsDeleting(false)
      setWordIndex((p) => (p + 1) % TYPED_WORDS.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, wordIndex])

  return (
    <section id="hero" className="hero section">
      {/* Three.js 3D canvas */}
      <ThreeBackground />

      {/* Decorative ocean grid */}
      <div className="hero__grid" aria-hidden="true" />

      {/* Top decorative line */}
      <div className="hero__deco-line hero__deco-line--top" />

      <div className="container hero__content">

        {/* Status badge */}
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Anchor size={12} className="hero__badge-icon" />
          Open to new adventures &amp; opportunities
        </motion.div>

        {/* WANTED poster frame */}
        <motion.div
          className="hero__wanted"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero__wanted-header">
            <div className="hero__wanted-header-bar" />
            <span className="hero__wanted-label">— WANTED —</span>
            <div className="hero__wanted-header-bar" />
          </div>

          <div className="hero__wanted-body">
            {/* Avatar */}
            <div className="hero__avatar">
              <span className="hero__avatar-text">AG</span>
              <div className="hero__avatar-ring" />
              <div className="hero__avatar-glow" />
            </div>

            {/* Name + title */}
            <h1 className="hero__name">
              <span className="hero__name-first">ANURAG</span>
            </h1>
            <p className="hero__title">{personal.title}</p>

            {/* Typewriter */}
            <div className="hero__typewriter">
              <span className="hero__typewriter-prefix">Specializing in · </span>
              <span className="hero__typewriter-word">{displayed}</span>
              <span className="hero__typewriter-cursor">|</span>
            </div>

            {/* Bio */}
            <p className="hero__bio">{personal.bio}</p>

            {/* Bounty row */}
            <div className="hero__bounty">
              <div className="hero__bounty-item">
                <span className="hero__bounty-value">3+</span>
                <span className="hero__bounty-label">Years XP</span>
              </div>
              <div className="hero__bounty-sep">✦</div>
              <div className="hero__bounty-item">
                <span className="hero__bounty-value">5K+</span>
                <span className="hero__bounty-label">Hotels</span>
              </div>
              <div className="hero__bounty-sep">✦</div>
              <div className="hero__bounty-item">
                <span className="hero__bounty-value">8</span>
                <span className="hero__bounty-label">Languages</span>
              </div>
              <div className="hero__bounty-sep">✦</div>
              <div className="hero__bounty-item">
                <span className="hero__bounty-value">0</span>
                <span className="hero__bounty-label">Downtime</span>
              </div>
            </div>
          </div>

          <div className="hero__wanted-footer">
            <div className="hero__wanted-header-bar" />
            <span className="hero__wanted-location">📍 {personal.location}</span>
            <div className="hero__wanted-header-bar" />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a href={`mailto:${personal.email}`} className="btn btn-primary hero__cta-main" id="hero-contact-btn">
            <Mail size={15} />
            Send Transponder Snail
          </a>
          <button
            className="btn btn-outline"
            id="hero-voyage-btn"
            onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Compass size={15} />
            View Grand Voyage
          </button>
        </motion.div>

        {/* Social links */}
        <motion.div
          className="hero__socials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hero__social" id="hero-linkedin" aria-label="LinkedIn">
            <Linkedin size={17} />
          </a>
          <a href={personal.github} target="_blank" rel="noreferrer" className="hero__social" id="hero-github" aria-label="GitHub">
            <Github size={17} />
          </a>
          <a href={`mailto:${personal.email}`} className="hero__social" id="hero-email" aria-label="Email">
            <Mail size={17} />
          </a>
        </motion.div>
      </div>

      {/* Scroll down cue */}
      <div className="hero__scroll">
        <span className="hero__scroll-text">SCROLL</span>
        <div className="hero__scroll-line">
          <div className="hero__scroll-dot" />
        </div>
      </div>

      {/* Wave bottom */}
      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--color-bg-secondary)" />
        </svg>
      </div>
    </section>
  )
}
