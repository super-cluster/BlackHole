import './About.css'
import { useSelector } from 'react-redux'
import { selectPersonal, selectEducation } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { Mail, Linkedin, MapPin, GraduationCap, Award, Anchor } from 'lucide-react'

const STATS = [
  { value: '3+',  label: 'Years in Orbit',   icon: '🌀' },
  { value: '5K+', label: 'Systems Powered',   icon: '⚡' },
  { value: '8',   label: 'Lang Horizons',     icon: '🌌' },
  { value: '0',   label: 'System Collapses',  icon: '🕳️' },
]

export default function About() {
  const personal   = useSelector(selectPersonal)
  const education  = useSelector(selectEducation)
  const [ref, inView] = useInView(0.12)

  return (
    <section id="about" className="section about" ref={ref}>
      {/* bg orbs */}
      <div className="orb orb-ocean" style={{ top: '-10%', right: '-5%', opacity: 0.6, animationDelay: '-3s' }} />

      <div className="container">
        <motion.div
          className="about__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <span className="section-label">Entity Profile</span>
          <h2 className="section-title">
            Code that bends <span className="highlight">spacetime</span>
          </h2>
          <p className="section-subtitle">
            3+ years engineering distributed systems that power thousands of hospitality venues across the known universe.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="about__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="about__stat">
              <span className="about__stat-icon">{s.icon}</span>
              <span className="about__stat-value">{s.value}</span>
              <span className="about__stat-label">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="about__grid">
          {/* LEFT — identity card */}
          <motion.div
            className="card about__identity"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="about__identity-top">
              <div className="about__avatar">
                <span className="about__avatar-text">AG</span>
                <div className="about__avatar-ring" />
              </div>
              <div>
                <h3 className="about__identity-name">{personal.name}</h3>
                <p className="about__identity-rank">{personal.title}</p>
              </div>
            </div>

            <div className="about__identity-divider">
              <Anchor size={13} className="about__identity-anchor" />
            </div>

            <div className="about__contact-list">
              <a href={`mailto:${personal.email}`} className="about__contact-item">
                <Mail size={14} />
                <span>{personal.email}</span>
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="about__contact-item">
                <Linkedin size={14} />
                <span>linkedin.com/in/insideall</span>
              </a>
              <div className="about__contact-item">
                <MapPin size={14} />
                <span>{personal.location}</span>
              </div>
            </div>

            <div className="about__crew-badge">
              <span className="about__crew-dot" />
              Seeking new orbital paths &amp; opportunities
            </div>
          </motion.div>

          {/* RIGHT */}
          <div className="about__right">
            <motion.div
              className="card about__bio-card"
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
            <h3 className="about__card-title">🌌 System Log</h3>
              <p className="about__bio-text">
                Software Engineer III at <strong>Sabre Hospitality</strong> — engineering systems at the scale of black holes, powering thousands of hotels worldwide. My work spans cloud-agnostic storage, global payment gateways, zero-downtime migrations, and modern React frontends.
              </p>
              <p className="about__bio-text">
                I thrive at the gravitational center of <strong>backend reliability</strong> and <strong>frontend craftsmanship</strong> — writing code that is clean, performant, and battle-hardened.
              </p>
            </motion.div>

            <motion.div
              className="card about__edu-card"
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <h3 className="about__card-title">
                <GraduationCap size={17} />
                Origin Coordinates
              </h3>
              <p className="about__edu-degree">{education.degree}</p>
              <p className="about__edu-inst">{education.institution}</p>
              <div className="about__edu-row">
                <span className="about__edu-period">{education.period}</span>
                <span className="about__edu-cgpa">
                  <Award size={13} />
                  {education.cgpa}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
