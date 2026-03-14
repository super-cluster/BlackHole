import './About.css'
import { useSelector } from 'react-redux'
import { selectPersonal, selectEducation } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { Mail, Linkedin, MapPin, GraduationCap, Award, Anchor } from 'lucide-react'

const STATS = [
  { value: '3+',  label: 'Years at Sea',      icon: '⚓' },
  { value: '5K+', label: 'Hotels Powered',    icon: '🏨' },
  { value: '8',   label: 'Languages Sailed',  icon: '🌍' },
  { value: '0',   label: 'Downtime Battles',  icon: '⚡' },
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
          <span className="section-label">The Legend</span>
          <h2 className="section-title">
            A Pirate who writes <span className="highlight">clean code</span>
          </h2>
          <p className="section-subtitle">
            Sailing the tech seas for 3+ years — engineering enterprise systems that serve thousands of hospitality venues worldwide.
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
              Seeking new crew &amp; adventures
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
              <h3 className="about__card-title">⚔️ The Captain&apos;s Log</h3>
              <p className="about__bio-text">
                I&apos;m a Software Engineer III at <strong>Sabre Hospitality</strong>, crafting enterprise-grade software that powers thousands of hotels across the globe. My voyages span designing cloud-agnostic storage systems, integrating global payment gateways, and modernizing legacy codebases — all while shipping beautiful React frontends.
              </p>
              <p className="about__bio-text">
                I thrive at the crossroads of <strong>backend reliability</strong> and <strong>frontend craftsmanship</strong>, writing code that is clean, performant, and battle-hardened.
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
                Academy of Origins
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
