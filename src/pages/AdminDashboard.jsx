import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../services/firebase'
import './AdminDashboard.css'

/* ─── Constants ─── */
const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || ''
const MAX_VISITS = 500          // Firestore read limit per dashboard load
const SECTIONS_ORDER = ['hero', 'about', 'experience', 'projects', 'skills', 'contact']
const DEVICE_COLORS = { Desktop: '#6366f1', Mobile: '#06b6d4', Tablet: '#f59e0b', Other: '#475569' }
const BROWSER_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f87171']
const COUNTRY_FLAGS = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', CA: '🇨🇦', AU: '🇦🇺', FR: '🇫🇷',
  SG: '🇸🇬', NL: '🇳🇱', JP: '🇯🇵', BR: '🇧🇷', KR: '🇰🇷', PK: '🇵🇰', AE: '🇦🇪',
}

/* ─── Data Helpers ─── */
function toLocalDate(ts) {
  if (!ts) return null
  return ts.toDate ? ts.toDate() : new Date(ts)
}

function groupByField(visits, field) {
  const map = {}
  visits.forEach((v) => {
    const key = v[field] || 'Unknown'
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
}

function groupByDay(visits, days = 30) {
  const now = new Date()
  const buckets = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = 0
  }
  visits.forEach((v) => {
    const d = toLocalDate(v.timestamp)
    if (!d) return
    const key = d.toISOString().slice(0, 10)
    if (key in buckets) buckets[key]++
  })
  return Object.entries(buckets) // [{date, count}]
}

function todayCount(visits) {
  const today = new Date().toISOString().slice(0, 10)
  return visits.filter((v) => {
    const d = toLocalDate(v.timestamp)
    return d && d.toISOString().slice(0, 10) === today
  }).length
}

function uniqueCountries(visits) {
  return new Set(visits.map((v) => v.countryCode).filter(Boolean)).size
}

function avgSession(visits) {
  const valid = visits.filter((v) => v.sessionDurationSec > 0)
  if (!valid.length) return 0
  return Math.round(valid.reduce((s, v) => s + v.sessionDurationSec, 0) / valid.length)
}

function formatDuration(sec) {
  if (!sec) return '—'
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m ${sec % 60}s`
}

function fmtDate(ts) {
  const d = toLocalDate(ts)
  if (!d) return '—'
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function fmtRelative(ts) {
  const d = toLocalDate(ts)
  if (!d) return '—'
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

function sectionEngagement(visits) {
  const total = visits.length
  if (!total) return []
  const counts = {}
  SECTIONS_ORDER.forEach((s) => (counts[s] = 0))
  visits.forEach((v) => {
    if (!Array.isArray(v.sectionsViewed)) return
    v.sectionsViewed.forEach((s) => {
      if (counts[s] !== undefined) counts[s]++
    })
  })
  return SECTIONS_ORDER.map((s) => ({
    name: s,
    count: counts[s],
    pct: Math.round((counts[s] / total) * 100),
  }))
}

/* ─── Sub-components ─── */

function SummaryCard({ label, value, sub, icon, accentColor, trend }) {
  return (
    <div
      className="admin-card"
      style={{ '--card-accent': accentColor || 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
    >
      <div className="admin-card-label">
        <span>{icon}</span> {label}
      </div>
      <div className="admin-card-value">{value}</div>
      {sub && <div className="admin-card-sub">{sub}</div>}
      {trend && (
        <div className={`admin-card-trend ${trend.dir}`}>
          {trend.dir === 'trend-up' ? '↑' : '·'} {trend.label}
        </div>
      )}
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(([, c]) => c), 1)
  return (
    <div className="admin-bar-chart">
      {data.map(([date, count]) => {
        const shortDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        const heightPct = Math.max((count / max) * 100, count > 0 ? 4 : 0)
        return (
          <div key={date} className="admin-bar-col">
            <div
              className="admin-bar"
              style={{ height: `${heightPct}%` }}
            >
              <div className="admin-bar-tooltip">{shortDate}: {count} visit{count !== 1 ? 's' : ''}</div>
            </div>
            {/* Show label every 7th bar to avoid clutter */}
            {new Date(date).getDay() === 1 && (
              <div className="admin-bar-label">{shortDate}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RankedList({ items, colorVar, flagMap }) {
  const max = items[0]?.[1] || 1
  return (
    <div className="admin-ranked-list">
      {items.length === 0 && <div className="admin-empty"><div className="admin-empty-icon">📭</div>No data yet</div>}
      {items.map(([label, count], i) => {
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f87171', '#a78bfa', '#34d399', '#fb923c', '#60a5fa']
        const color = colors[i % colors.length]
        return (
          <div key={label} className="admin-rank-item">
            <div className="admin-rank-label">
              {flagMap?.[label] && <span>{flagMap[label]}</span>}
              {label}
            </div>
            <div className="admin-rank-bar-wrap">
              <div
                className="admin-rank-bar"
                style={{
                  '--bar-color': color,
                  width: `${(count / max) * 100}%`,
                  background: color,
                }}
              />
            </div>
            <div className="admin-rank-count">{count}</div>
          </div>
        )
      })}
    </div>
  )
}

function PillBreakdown({ items, colorMap }) {
  const total = items.reduce((s, [, c]) => s + c, 0) || 1
  const defaultColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f87171']
  return (
    <div className="admin-pills">
      {items.length === 0 && <div className="admin-empty">No data yet</div>}
      {items.map(([label, count], i) => (
        <div key={label} className="admin-pill">
          <div
            className="admin-pill-dot"
            style={{ '--pill-color': colorMap?.[label] || defaultColors[i % defaultColors.length] }}
          />
          {label}
          <span className="admin-pill-pct">{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function Funnel({ items, baseCount }) {
  const base = baseCount || items[0]?.count || 1
  return (
    <div className="admin-funnel">
      {items.map(({ name, count, pct }) => (
        <div key={name} className="admin-funnel-item">
          <div className="admin-funnel-name">{name}</div>
          <div className="admin-funnel-bar-wrap">
            <div className="admin-funnel-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="admin-funnel-pct">{pct}%</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('_adm_auth') === '1'
  )
  const [pwd, setPwd] = useState('')
  const [pwdError, setPwdError] = useState(false)

  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  /* ── Fetch ── */
  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'visits'), orderBy('timestamp', 'desc'), limit(MAX_VISITS))
      const snap = await getDocs(q)
      setVisits(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLastRefresh(new Date())
    } catch (e) {
      console.error('AdminDashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchVisits()
  }, [authed, fetchVisits])

  /* ── Auth ── */
  function handleLogin(e) {
    e.preventDefault()
    if (!ADMIN_PWD) {
      alert('VITE_ADMIN_PASSWORD env var is not set.')
      return
    }
    if (pwd === ADMIN_PWD) {
      sessionStorage.setItem('_adm_auth', '1')
      setAuthed(true)
      setPwdError(false)
    } else {
      setPwdError(true)
      setPwd('')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('_adm_auth')
    setAuthed(false)
    setVisits([])
  }

  /* ── Gate ── */
  if (!authed) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <div className="admin-gate-icon">🕳️</div>
          <div className="admin-gate-title">Analytics</div>
          <div className="admin-gate-sub">Enter your admin password to continue</div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              className="admin-gate-input"
              placeholder="Password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
            />
            {pwdError && <div className="admin-gate-error">Incorrect password. Try again.</div>}
            <button type="submit" className="admin-gate-btn">Enter →</button>
          </form>
        </div>
      </div>
    )
  }

  /* ── Derived data ── */
  const dayData      = groupByDay(visits, 30)
  const countries    = groupByField(visits, 'country')
  const countryCodes = groupByField(visits, 'countryCode')
  const referrers    = groupByField(visits, 'referrerLabel')
  const browsers     = groupByField(visits, 'browser')
  const devices      = groupByField(visits, 'device')
  const oses         = groupByField(visits, 'os')
  const funnel       = sectionEngagement(visits)
  const recent       = visits.slice(0, 50)

  const countryFlagMap = Object.fromEntries(
    countryCodes.map(([code]) => [
      countries.find((_, i) => countryCodes[i]?.[0] === code)?.[0] || code,
      COUNTRY_FLAGS[code] || '🌍',
    ])
  )

  // Build a flag map keyed by country name using what we have
  const countryNameFlagMap = {}
  visits.forEach((v) => {
    if (v.country && v.countryCode) {
      countryNameFlagMap[v.country] = COUNTRY_FLAGS[v.countryCode] || '🌍'
    }
  })

  const totalVisits  = visits.length
  const todayVisits  = todayCount(visits)
  const uniqueCtry   = uniqueCountries(visits)
  const avgDuration  = avgSession(visits)
  const topReferrer  = referrers[0]?.[0] || '—'

  return (
    <div className="admin-root">
      <div className="admin-wrap">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-left">
            <div className="admin-header-title">
              <span className="dot" />
              Visitor Analytics
            </div>
            <div className="admin-header-sub">
              {lastRefresh
                ? `Last refreshed ${lastRefresh.toLocaleTimeString('en-IN')} · Showing last ${MAX_VISITS} visits`
                : 'Loading…'}
            </div>
          </div>
          <div className="admin-header-actions">
            <button className="admin-btn admin-btn-ghost" onClick={handleLogout}>Sign out</button>
            <button className="admin-btn admin-btn-primary" onClick={fetchVisits} disabled={loading}>
              {loading ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        </div>

        {loading && visits.length === 0 ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            Fetching visit data…
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="admin-cards">
              <SummaryCard
                icon="👁️"
                label="Total Visits"
                value={totalVisits.toLocaleString()}
                sub={`All time (last ${MAX_VISITS} shown)`}
                accentColor="linear-gradient(90deg,#6366f1,#8b5cf6)"
              />
              <SummaryCard
                icon="📅"
                label="Today"
                value={todayVisits}
                sub="Visits in last 24h"
                accentColor="linear-gradient(90deg,#22c55e,#16a34a)"
                trend={todayVisits > 0 ? { dir: 'trend-up', label: 'Active today' } : { dir: 'trend-neutral', label: 'No visits yet' }}
              />
              <SummaryCard
                icon="🌍"
                label="Countries"
                value={uniqueCtry}
                sub="Unique locations"
                accentColor="linear-gradient(90deg,#06b6d4,#0284c7)"
              />
              <SummaryCard
                icon="⏱️"
                label="Avg Session"
                value={formatDuration(avgDuration)}
                sub="Average time on site"
                accentColor="linear-gradient(90deg,#f59e0b,#d97706)"
              />
              <SummaryCard
                icon="🔗"
                label="Top Referrer"
                value={topReferrer}
                sub={referrers[0] ? `${referrers[0][1]} visits` : 'No referral data'}
                accentColor="linear-gradient(90deg,#f87171,#dc2626)"
              />
            </div>

            {/* Visits Over Time */}
            <div className="admin-chart-wrap">
              <div className="admin-section-title">Visits — Last 30 Days</div>
              <div className="admin-panel">
                {dayData.every(([, c]) => c === 0) ? (
                  <div className="admin-empty">
                    <div className="admin-empty-icon">📊</div>
                    No visit data for the last 30 days yet
                  </div>
                ) : (
                  <BarChart data={dayData} />
                )}
              </div>
            </div>

            {/* Countries + Referrers */}
            <div className="admin-grid-2">
              <div>
                <div className="admin-section-title">Top Countries</div>
                <div className="admin-panel">
                  <RankedList items={countries} flagMap={countryNameFlagMap} />
                </div>
              </div>
              <div>
                <div className="admin-section-title">Traffic Sources</div>
                <div className="admin-panel">
                  <RankedList items={referrers} />
                </div>
              </div>
            </div>

            {/* Device + Browser + OS */}
            <div className="admin-grid-2" style={{ marginBottom: 28 }}>
              <div>
                <div className="admin-section-title">Devices</div>
                <div className="admin-panel">
                  <PillBreakdown items={devices} colorMap={DEVICE_COLORS} />
                </div>
              </div>
              <div>
                <div className="admin-section-title">Browsers</div>
                <div className="admin-panel">
                  <PillBreakdown
                    items={browsers}
                    colorMap={Object.fromEntries(browsers.map(([b], i) => [b, BROWSER_COLORS[i]]))}
                  />
                </div>
              </div>
            </div>

            {/* OS + Section Funnel */}
            <div className="admin-grid-2">
              <div>
                <div className="admin-section-title">Operating Systems</div>
                <div className="admin-panel">
                  <PillBreakdown items={oses} />
                </div>
              </div>
              <div>
                <div className="admin-section-title">Section Engagement Funnel</div>
                <div className="admin-panel">
                  {funnel.every((f) => f.count === 0) ? (
                    <div className="admin-empty">No section data yet — requires at least one completed session</div>
                  ) : (
                    <Funnel items={funnel} baseCount={funnel[0]?.count} />
                  )}
                </div>
              </div>
            </div>

            {/* Recent Visitors Table */}
            <div style={{ marginTop: 28 }}>
              <div className="admin-section-title">Recent Visitors</div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Browser</th>
                      <th>OS</th>
                      <th>Source</th>
                      <th>Session</th>
                      <th>Sections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#334155' }}>
                          No visits recorded yet
                        </td>
                      </tr>
                    )}
                    {recent.map((v) => {
                      const flag = v.countryCode ? (COUNTRY_FLAGS[v.countryCode] || '🌍') : ''
                      const location = [v.city, v.country].filter(Boolean).join(', ') || 'Unknown'
                      const devClass = (v.device || '').toLowerCase()
                      return (
                        <tr key={v.id}>
                          <td className="primary" title={fmtDate(v.timestamp)}>{fmtRelative(v.timestamp)}</td>
                          <td>{flag} {location}</td>
                          <td>
                            <span className={`admin-badge ${devClass}`}>{v.device || '—'}</span>
                          </td>
                          <td>{v.browser || '—'}</td>
                          <td>{v.os || '—'}</td>
                          <td>{v.referrerLabel || 'Direct'}</td>
                          <td>{formatDuration(v.sessionDurationSec)}</td>
                          <td>{Array.isArray(v.sectionsViewed) ? v.sectionsViewed.join(', ') : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  )
}
