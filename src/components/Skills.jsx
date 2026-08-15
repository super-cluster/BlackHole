import './Skills.css'
import { useSelector } from 'react-redux'
import { selectSkills } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const CATEGORY_ICONS  = { 'Languages':'{ }', 'Frameworks':'⚙️', 'Cloud & DevOps':'☁️', 'Databases':'🗄️', 'Architecture':'🏗️' }
const CATEGORY_COLORS = { 'Languages':'var(--color-primary-light)', 'Frameworks':'var(--color-blue)', 'Cloud & DevOps':'var(--color-accent)', 'Databases':'#7ab8ff', 'Architecture':'var(--color-accent-light)' }

export default function Skills() {
  const skills = useSelector(selectSkills)
  const [ref, inView] = useInView(0.08)
  const categories = Object.entries(skills)

  return (
    <section id="skills" className="section skills" ref={ref}>
      <div className="orb orb-blue" style={{ top:'20%', left:'-8%', opacity:0.45, animationDelay:'-7s' }} />

      <div className="container">
        <motion.div className="skills__header" initial={{ opacity:0, y:30 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.65 }}>
          <span className="section-label">Dark Matter</span>
          <h2 className="section-title">
            The <span className="highlight">forces</span> I command
          </h2>
          <p className="section-subtitle">
            Quantum-tested technologies wielded across the spectrum of production engineering.
          </p>
        </motion.div>

        <div className="skills__grid">
          {categories.map(([category, items], catIdx) => {
            const color = CATEGORY_COLORS[category] || 'var(--color-primary-light)'
            return (
              <motion.div key={category} className="card skills__cat" initial={{ opacity:0, y:30 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.55, delay:0.1 + catIdx * 0.08 }} style={{ '--cat-color': color }}>
                <div className="skills__cat-bar" />
                <div className="skills__cat-header">
                  <span className="skills__cat-icon">{CATEGORY_ICONS[category]}</span>
                  <h3 className="skills__cat-name">{category}</h3>
                </div>
                <div className="skills__pills">
                  {items.map((skill, si) => (
                    <motion.span key={skill} className="skills__pill" initial={{ opacity:0, scale:0.75 }} animate={inView ? { opacity:1, scale:1 } : {}} transition={{ duration:0.3, delay:0.25 + catIdx * 0.08 + si * 0.05 }} style={{ '--pill-color': color }}>
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div className="skills__rack" initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.6, delay:0.7 }}>
          <div className="skills__rack-label">✦ FULL SPECTRUM</div>
          <div className="skills__rack-items">
            {['Java 17','Spring Boot','React','AWS','Docker','Redis','MariaDB','Microservices','REST APIs','Git','Jenkins','Splunk','Design Patterns','Concurrency'].map(t => (
              <span key={t} className="skills__rack-item">{t}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
