import { useEffect } from 'react'
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

/* ─── User-Agent Parsers ─── */
function parseBrowser(ua) {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  return 'Other'
}

function parseOS(ua) {
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Other'
}

function parseDevice(ua) {
  if (/Mobi|Android/.test(ua) && !/iPad/.test(ua)) return 'Mobile'
  if (/iPad|Tablet/.test(ua)) return 'Tablet'
  return 'Desktop'
}

function getUtmParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    utmSource: p.get('utm_source') || null,
    utmMedium: p.get('utm_medium') || null,
    utmCampaign: p.get('utm_campaign') || null,
  }
}

function getReferrerLabel(ref) {
  if (!ref) return 'Direct'
  try {
    const host = new URL(ref).hostname.replace('www.', '')
    if (host.includes('linkedin')) return 'LinkedIn'
    if (host.includes('github')) return 'GitHub'
    if (host.includes('google')) return 'Google'
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X'
    if (host.includes('facebook')) return 'Facebook'
    if (host.includes('reddit')) return 'Reddit'
    return host
  } catch {
    return 'Unknown'
  }
}

const SECTIONS = ['hero', 'about', 'experience', 'projects', 'skills', 'contact']

/**
 * useVisitorTracking — fires once per browser session.
 *
 * Behaviour:
 *  • Skips localhost & 127.0.0.1 (dev environments)
 *  • Skips headless/bot user-agents (navigator.webdriver)
 *  • Deduplicates via sessionStorage so refreshes don't double-count
 *  • Writes an initial visit doc to Firestore immediately
 *  • Tracks sections scrolled-into-view via IntersectionObserver
 *  • Updates the doc with sessionDuration + sectionsViewed on pagehide
 */
export function useVisitorTracking() {
  useEffect(() => {
    // Guard: skip dev environments
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return

    // Guard: skip bots / headless browsers
    if (navigator.webdriver) return

    // Guard: deduplicate — one visit per browser session
    if (sessionStorage.getItem('_vt_tracked')) return

    let docRef = null
    const visitedSections = new Set(['hero']) // hero is always in view on load
    const startTime = Date.now()

    async function writeVisit() {
      const ua = navigator.userAgent

      // Geo lookup via ipapi.co (free, no key required, 1k req/day)
      let geo = {}
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          const d = await res.json()
          geo = {
            country: d.country_name || null,
            countryCode: d.country_code || null,
            city: d.city || null,
            region: d.region || null,
            lat: d.latitude || null,
            lng: d.longitude || null,
            isp: d.org || null,
            timezone: d.timezone || null,
          }
        }
      } catch {
        // best-effort: geo stays empty if API is unreachable
      }

      const payload = {
        timestamp: serverTimestamp(),
        browser: parseBrowser(ua),
        os: parseOS(ua),
        device: parseDevice(ua),
        language: navigator.language || null,
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null,
        referrer: document.referrer || null,
        referrerLabel: getReferrerLabel(document.referrer),
        path: window.location.pathname,
        ...getUtmParams(),
        ...geo,
        // These are updated on pagehide:
        sessionDurationSec: null,
        sectionsViewed: ['hero'],
      }

      try {
        docRef = await addDoc(collection(db, 'visits'), payload)
        sessionStorage.setItem('_vt_tracked', '1')
      } catch {
        // silently fail — never break the portfolio experience
      }
    }

    writeVisit()

    // Track which sections the visitor scrolled to
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visitedSections.add(entry.target.id)
        })
      },
      { threshold: 0.3 }
    )

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) sectionObserver.observe(el)
    })

    // On page hide: patch the doc with final session stats
    const handlePageHide = async () => {
      sectionObserver.disconnect()
      if (!docRef) return
      try {
        await updateDoc(docRef, {
          sessionDurationSec: Math.round((Date.now() - startTime) / 1000),
          sectionsViewed: Array.from(visitedSections),
        })
      } catch {
        // best-effort
      }
    }

    window.addEventListener('pagehide', handlePageHide, { once: true })

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      sectionObserver.disconnect()
    }
  }, [])
}
