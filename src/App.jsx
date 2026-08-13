import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useVisitorTracking } from './hooks/useVisitorTracking'
import AdminDashboard from './pages/AdminDashboard'

// The main portfolio page
function Portfolio() {
  useScrollSpy()

  return (
    <>
      {/* Star glow — ambient gradient light across the void */}
      {/* <div className="star-glow" aria-hidden="true" /> */}

      {/* Subtle noise grain overlay */}
      <div className="noise" aria-hidden="true" />

      <Navbar />

      <main>
        <Hero />
        <div className="divider" />
        <About />
        <div className="divider" />
        <Experience />
        <div className="divider" />
        <Projects />
        <div className="divider" />
        <Skills />
        <div className="divider" />
        <Contact />
      </main>

      <Footer />

      {/* Floating music player — fixed position, visible on all sections */}
      <MusicPlayer />
    </>
  )
}

export default function App() {
  // Fire visitor tracking on every page load (skips localhost + bots automatically)
  useVisitorTracking()

  return (
    <Routes>
      {/* Main portfolio */}
      <Route path="/" element={<Portfolio />} />

      {/* Obscure admin route — password-gated analytics dashboard */}
      <Route path="/blackhole-stats" element={<AdminDashboard />} />

      {/* Catch-all → portfolio */}
      <Route path="*" element={<Portfolio />} />
    </Routes>
  )
}
