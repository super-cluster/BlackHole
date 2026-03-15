import './Contact.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { selectContactFormStatus, setContactFormStatus } from '../store/uiSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { Mail, Linkedin, MapPin, Send, CheckCircle, Radio } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const personal = useSelector(selectPersonal)
  const status   = useSelector(selectContactFormStatus)
  const dispatch = useDispatch()
  const [ref, inView] = useInView(0.08)
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(setContactFormStatus('success'))
    const subject = encodeURIComponent(form.subject || 'Portfolio Inquiry')
    const body    = encodeURIComponent(`Hi Anurag,\n\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.open(`mailto:${personal.email}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <section id="contact" className="section contact" ref={ref}>
      <div className="orb orb-violet" style={{ bottom:'-10%', right:'-8%', opacity:0.4, animationDelay:'-4s' }} />

      <div className="container">
        <motion.div className="contact__header" initial={{ opacity:0, y:30 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.65 }}>
          <span className="section-label">Transmit Signal</span>
          <h2 className="section-title">
            Let&apos;s <span className="highlight">bend gravity</span> together
          </h2>
          <p className="section-subtitle">
            Actively seeking new orbital paths and opportunities. Transmit a signal — my inbox is always receiving.
          </p>
        </motion.div>

        <div className="contact__grid">
          <motion.div className="card contact__info" initial={{ opacity:0, x:-30 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.65, delay:0.15 }}>
            <div className="contact__snail"><Radio size={36} className="contact__radio-icon" /></div>
            <h3 className="contact__info-title">Establish Contact</h3>
            <p className="contact__info-text">
              Whether you have a role, project, or simply want to discuss the nature of spacetime — I&apos;m always listening.
            </p>

            <div className="contact__links">
              <a href={`mailto:${personal.email}`} className="contact__link" id="contact-email-link">
                <div className="contact__link-icon"><Mail size={17} /></div>
                <div><div className="contact__link-label">Quantum Transmission (Email)</div><div className="contact__link-value">{personal.email}</div></div>
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact__link" id="contact-linkedin-link">
                <div className="contact__link-icon contact__link-icon--li"><Linkedin size={17} /></div>
                <div><div className="contact__link-label">Interstellar Network</div><div className="contact__link-value">linkedin.com/in/insideall</div></div>
              </a>
              <div className="contact__link">
                <div className="contact__link-icon contact__link-icon--loc"><MapPin size={17} /></div>
                <div><div className="contact__link-label">Origin Coordinates</div><div className="contact__link-value">{personal.location}</div></div>
              </div>
            </div>

            <div className="contact__avail">
              <span className="contact__avail-dot" />
              Signal active — open to new voyages
            </div>
          </motion.div>

          <motion.div className="card contact__form-card" initial={{ opacity:0, x:30 }} animate={inView ? { opacity:1, x:0 } : {}} transition={{ duration:0.65, delay:0.2 }}>
            {status === 'success' ? (
              <div className="contact__success">
                <CheckCircle size={50} className="contact__success-icon" />
                <h3>Signal Received! 🌌</h3>
                <p>Your transmission has crossed the event horizon. I&apos;ll respond before it escapes the singularity!</p>
                <button className="btn btn-outline" onClick={() => dispatch(setContactFormStatus('idle'))}>Send Another</button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label className="contact__label">Your Name *</label>
                    <input id="contact-name" className="contact__input" type="text" name="name" placeholder="Dr. Strange" required value={form.name} onChange={handleChange} />
                  </div>
                  <div className="contact__field">
                    <label className="contact__label">Your Email *</label>
                    <input id="contact-email" className="contact__input" type="email" name="email" placeholder="you@universe.com" required value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact__field">
                  <label className="contact__label">Subject</label>
                  <input id="contact-subject" className="contact__input" type="text" name="subject" placeholder="Job Opportunity / Collaboration" value={form.subject} onChange={handleChange} />
                </div>
                <div className="contact__field">
                  <label className="contact__label">Message *</label>
                  <textarea id="contact-message" className="contact__input contact__textarea" name="message" placeholder="Transmit your message across the void..." required rows={5} value={form.message} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary contact__submit" id="contact-submit-btn">
                  <Send size={15} /> Transmit Signal
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
