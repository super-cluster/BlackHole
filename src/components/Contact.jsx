import './Contact.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectPersonal } from '../store/portfolioSlice'
import { selectContactFormStatus, setContactFormStatus } from '../store/uiSlice'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { Mail, Linkedin, MapPin, Send, CheckCircle, Anchor } from 'lucide-react'
import { useState } from 'react'

export default function Contact() {
  const personal = useSelector(selectPersonal)
  const status   = useSelector(selectContactFormStatus)
  const dispatch = useDispatch()
  const [ref, inView] = useInView(0.08)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(setContactFormStatus('success'))
    const subject = encodeURIComponent(form.subject || 'Portfolio Inquiry')
    const body = encodeURIComponent(`Hi Anurag,\n\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.open(`mailto:${personal.email}?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <section id="contact" className="section contact" ref={ref}>
      <div className="orb orb-gold" style={{ bottom: '-10%', right: '-8%', opacity: 0.4, animationDelay: '-4s' }} />

      <div className="container">
        <motion.div
          className="contact__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <span className="section-label">Send a Den Den Mushi</span>
          <h2 className="section-title">
            Let&apos;s set sail <span className="highlight">together</span>
          </h2>
          <p className="section-subtitle">
            Actively seeking new crew and opportunities. Send a transponder snail — my inbox is always open!
          </p>
        </motion.div>

        <div className="contact__grid">
          {/* Info */}
          <motion.div
            className="card contact__info"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            <div className="contact__snail">🐌</div>
            <h3 className="contact__info-title">Contact the Captain</h3>
            <p className="contact__info-text">
              Whether you have a role, a project, or just want to say &quot;Yo Ho Ho&quot; — I&apos;m all ears.
            </p>

            <div className="contact__links">
              <a href={`mailto:${personal.email}`} className="contact__link" id="contact-email-link">
                <div className="contact__link-icon">
                  <Mail size={17} />
                </div>
                <div>
                  <div className="contact__link-label">Transponder Snail (Email)</div>
                  <div className="contact__link-value">{personal.email}</div>
                </div>
              </a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" className="contact__link" id="contact-linkedin-link">
                <div className="contact__link-icon contact__link-icon--li">
                  <Linkedin size={17} />
                </div>
                <div>
                  <div className="contact__link-label">Pirate Network</div>
                  <div className="contact__link-value">linkedin.com/in/insideall</div>
                </div>
              </a>
              <div className="contact__link">
                <div className="contact__link-icon contact__link-icon--loc">
                  <MapPin size={17} />
                </div>
                <div>
                  <div className="contact__link-label">Port of Origin</div>
                  <div className="contact__link-value">{personal.location}</div>
                </div>
              </div>
            </div>

            <div className="contact__avail">
              <Anchor size={13} className="contact__avail-icon" />
              Open to new voyages
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="card contact__form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2 }}
          >
            {status === 'success' ? (
              <div className="contact__success">
                <CheckCircle size={50} className="contact__success-icon" />
                <h3>Message Sent! 🎉</h3>
                <p>Your transponder snail has been dispatched. I&apos;ll reply soon, Navigator!</p>
                <button className="btn btn-outline" onClick={() => dispatch(setContactFormStatus('idle'))}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label className="contact__label">Your Name *</label>
                    <input id="contact-name" className="contact__input" type="text" name="name" placeholder="Captain Jane" required value={form.name} onChange={handleChange} />
                  </div>
                  <div className="contact__field">
                    <label className="contact__label">Your Email *</label>
                    <input id="contact-email" className="contact__input" type="email" name="email" placeholder="captain@ship.com" required value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact__field">
                  <label className="contact__label">Subject</label>
                  <input id="contact-subject" className="contact__input" type="text" name="subject" placeholder="Job Opportunity / Collaboration" value={form.subject} onChange={handleChange} />
                </div>
                <div className="contact__field">
                  <label className="contact__label">Message *</label>
                  <textarea id="contact-message" className="contact__input contact__textarea" name="message" placeholder="Tell me about your adventure..." required rows={5} value={form.message} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary contact__submit" id="contact-submit-btn">
                  <Send size={15} />
                  Send Transponder Snail
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
