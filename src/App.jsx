import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useScrollSpy } from './hooks/useScrollSpy'

export default function App() {
  useScrollSpy()

  return (
    <>
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
    </>
  )
}
