import './BlackholeVideo.css'
import { useState } from 'react'

/**
 * BlackholeVideo — plays a real black hole video in the right hero panel.
 *
 * ── HOW TO GET THE VIDEO (one-time setup) ───────────────────────────────────
 *
 * OPTION A — NASA Public Domain (recommended):
 *   1. Download from NASA SVS (Scientific Visualization Studio):
 *      https://svs.gsfc.nasa.gov/13326
 *   2. Click "Download" → MP4 1080p (~29 MB)
 *   3. Save as:  portfolio/public/blackhole.mp4
 *
 * OPTION B — Wikimedia Commons (same NASA video, public domain):
 *   https://commons.wikimedia.org/wiki/File:Black_Hole_Accretion_Disk_Visualization.webm
 *   Download the MP4 version → save as portfolio/public/blackhole.mp4
 *
 * OPTION C — YouTube-dl / yt-dlp (any video for personal use):
 *   yt-dlp "https://www.youtube.com/watch?v=ENd8Sz0AFOk" -o public/blackhole.mp4
 *
 * ────────────────────────────────────────────────────────────────────────────
 */
export default function BlackholeVideo() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  return (
    <div className="bh-video-wrap" aria-hidden="true">
      {/* Fallback gradient shown until video loads or if video is missing */}
      {!loaded && !error && (
        <div className="bh-video-fallback">
          <div className="bh-fallback-core" />
          <div className="bh-fallback-ring bh-fallback-ring--1" />
          <div className="bh-fallback-ring bh-fallback-ring--2" />
          <div className="bh-fallback-ring bh-fallback-ring--3" />
          <div className="bh-fallback-glow" />
        </div>
      )}

      <video
        className={`bh-video ${loaded ? 'bh-video--visible' : ''}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setLoaded(true)}
        onError={() => setError(true)}
      >
        <source src="/blackhole.mp4"  type="video/mp4"  />
        <source src="/blackhole.webm" type="video/webm" />
      </video>

      {/* Overlays */}
      <div className="bh-video-vignette" />
      <div className="bh-video-fade-left" />
    </div>
  )
}
