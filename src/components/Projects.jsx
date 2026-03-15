import './Projects.css'
import { useSelector } from 'react-redux'
import { selectProjects } from '../store/portfolioSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { useState } from 'react'

function TiltCard({ children, className }) {
  const [style, setStyle] = useState({})
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setStyle({ transform: `perspective(700px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale3d(1.025,1.025,1.025)`, transition: 'transform 0.1s ease' })
  }
  const handleLeave = () => setStyle({ transform: 'perspective(700px) rotateY(0) rotateX(0) scale3d(1,1,1)', transition: 'transform 0.5s ease' })
  return <div className={className} style={style} onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</div>
}

export default function Projects() {
  const projects = useSelector(selectProjects)
  const [ref, inView] = useInView(0.08)

  return (
    <section id="projects" className="section projects" ref={ref}>
      <div className="orb orb-orange" style={{ top:'10%', right:'-5%', opacity:0.45, animationDelay:'-2s' }} />

      <div className="container">
        <motion.div className="proj__header" initial={{ opacity:0, y:30 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.65 }}>
          <span className="section-label">Singularity Events</span>
          <h2 className="section-title">
            Systems I&apos;ve <span className="highlight">built &amp; launched</span>
          </h2>
          <p className="section-subtitle">
            Key gravity wells forged in the fires of production — projects that bend systems to their will.
          </p>
        </motion.div>

        <div className="proj__grid">
          {projects.map((project, idx) => (
            <motion.div key={project.id} initial={{ opacity:0, y:40 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.65, delay:0.1 + idx * 0.13 }} className="proj__tilt-wrap">
              <TiltCard className="proj__card card">
                <div className="proj__top-bar" />
                <div className="proj__number">{String(idx+1).padStart(2,'0')}</div>
                <div className="proj__icon-row">
                  <div className="proj__icon" style={{ background:`${project.color}18`, border:`1px solid ${project.color}35` }}>
                    <span>{project.icon}</span>
                  </div>
                </div>
                <h3 className="proj__title">{project.title}</h3>
                <p className="proj__desc">{project.desc}</p>
                <div className="proj__tags">
                  {project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
                <div className="proj__glow" style={{ background:`radial-gradient(circle at 50% 0%, ${project.color}20, transparent 60%)` }} />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
