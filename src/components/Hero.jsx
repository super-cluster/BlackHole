import './Hero.css'
import { useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { Mail, Linkedin, Github, Zap, Radio } from 'lucide-react'
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
    if (!isDeleting && displayed.length < word.length)       timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80)
    else if (!isDeleting && displayed.length === word.length) timeout = setTimeout(() => setIsDeleting(true), 2200)
    else if (isDeleting && displayed.length > 0)              timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 45)
    else { setIsDeleting(false); setWordIndex(p => (p + 1) % TYPED_WORDS.length) }
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, wordIndex])

  return (
    <section id="hero" className="hero section">
      {/* Stars + Black hole: Three.js */}
      <ThreeBackground />

      {/* Grid overlay */}
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__content">
        {/* LEFT — card + actions */}
        <div className="hero__left">

          {/* Status badge */}
          <motion.div className="hero__badge" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <span className="hero__badge-dot" />
            <span>SIGNAL ACQUIRED — Open to new opportunities</span>
          </motion.div>

          {/* Main card */}
          <motion.div
            className="hero__card"
            initial={{ opacity:0, x:-40 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.7, delay:0.1, ease:[0.22, 1, 0.36, 1] }}
          >
            {/* Card header bar */}
            <div className="hero__card-header">
              <div className="hero__card-dots"><span/><span/><span/></div>
              <span className="hero__card-title-bar">ENTITY_PROFILE.exe</span>
              <Radio size={13} className="hero__card-icon" />
            </div>

            {/* Singularity avatar */}
            <div className="hero__singularity">
              <div className="hero__singularity-core">
                <div className="hero__singularity-inner">AG</div>
              </div>
              <div className="hero__singularity-disk" />
              <div className="hero__singularity-ring hero__singularity-ring--1" />
              <div className="hero__singularity-ring hero__singularity-ring--2" />
            </div>

            {/* Name */}
            <h1 className="hero__name">ANURAG</h1>
            <p className="hero__role">{personal.title}</p>

            {/* Typewriter */}
            <div className="hero__typewriter">
              <span className="hero__tw-label">SPEC:_</span>
              <span className="hero__tw-word">{displayed}</span>
              <span className="hero__tw-cursor">▋</span>
            </div>

            {/* Bio */}
            <p className="hero__bio">{personal.bio}</p>

            {/* Data grid */}
            <div className="hero__data-grid">
              {[['3+', 'YRS EXP'], ['5K+', 'HOTELS'], ['8', 'LANGUAGES'], ['0', 'DOWNTIME']].map(([v, l]) => (
                <div key={l} className="hero__data-cell">
                  <span className="hero__data-value">{v}</span>
                  <span className="hero__data-label">{l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div className="hero__actions" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.5 }}>
            <a href={`mailto:${personal.email}`} className="btn btn-primary hero__cta" id="hero-contact-btn">
              <Mail size={15} /> Initiate Contact
            </a>
            <button className="btn btn-outline" id="hero-log-btn" onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior:'smooth' })}>
              <Zap size={15} /> View Event Log
            </button>
          </motion.div>

          {/* Socials */}
          <motion.div className="hero__socials" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5, delay:0.7 }}>
            <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hero__social" id="hero-linkedin" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href={personal.github}   target="_blank" rel="noreferrer" className="hero__social" id="hero-github"   aria-label="GitHub">  <Github   size={17} /></a>
            <a href={`mailto:${personal.email}`}         className="hero__social" id="hero-email"    aria-label="Email">   <Mail     size={17} /></a>
          </motion.div>
        </div>

        {/* RIGHT — empty, shows the black hole Three.js scene */}
        <div className="hero__right" aria-hidden="true" />
      </div>

      {/* Scroll cue */}
      <div className="hero__scroll">
        <span className="hero__scroll-text">SCROLL</span>
        <div className="hero__scroll-line"><div className="hero__scroll-dot" /></div>
      </div>
    </section>
  )
}
