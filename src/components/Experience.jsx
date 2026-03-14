import './Experience.css'
import { useSelector } from 'react-redux'
import { selectExperience } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { MapPin, Calendar } from 'lucide-react'

export default function Experience() {
  const experience = useSelector(selectExperience)
  const [ref, inView] = useInView(0.08)

  return (
    <section id="experience" className="section experience" ref={ref}>
      <div className="orb orb-gold" style={{ bottom: '-15%', left: '-8%', opacity: 0.5, animationDelay: '-5s' }} />

      <div className="container">
        <motion.div
          className="exp__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <span className="section-label">Grand Voyage</span>
          <h2 className="section-title">
            Where I&apos;ve <span className="highlight">sailed & conquered</span>
          </h2>
          <p className="section-subtitle">
            Charting the waters of enterprise hospitality-tech — delivering production-grade systems at scale.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="exp__timeline">
          {experience.map((job, jobIdx) => (
            <motion.div
              key={job.id}
              className="exp__job"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.12 + jobIdx * 0.1 }}
            >
              {/* Company header */}
              <div className="exp__ship-card card">
                <div className="exp__ship-flag">⚔️</div>
                <div className="exp__ship-info">
                  <h3 className="exp__ship-name">{job.company}</h3>
                  <p className="exp__ship-rank">{job.role}</p>
                  <div className="exp__ship-meta">
                    <span><Calendar size={12} /> {job.period}</span>
                    <span className="exp__meta-dot">·</span>
                    <span><MapPin size={12} /> {job.location}</span>
                  </div>
                </div>
                <div className="exp__current-flag">
                  <span className="exp__current-dot" />
                  CURRENT
                </div>
              </div>

              {/* Log entries */}
              <div className="exp__log-grid">
                {job.highlights.map((h, idx) => (
                  <motion.div
                    key={idx}
                    className="card exp__log-entry"
                    initial={{ opacity: 0, y: 18 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.06 }}
                  >
                    <div className="exp__log-number">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="exp__log-icon">{h.icon}</div>
                    <div className="exp__log-content">
                      <h4 className="exp__log-title">{h.title}</h4>
                      <p className="exp__log-desc">{h.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
