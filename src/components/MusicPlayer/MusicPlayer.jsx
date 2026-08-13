import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkipBack, SkipForward, Play, Pause, Volume2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectPlaylist } from '../../store/portfolioSlice'
import useAudioPlayer from './useAudioPlayer'
import Waveform from './Waveform'
import './MusicPlayer.css'

function fmt(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicPlayer() {
  const playlist = useSelector(selectPlaylist)
  const {
    track,
    trackIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  } = useAudioPlayer(playlist)

  const progressRef = useRef(null)

  const handleProgressClick = useCallback(
    (e) => {
      const rect = progressRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      seek(Math.max(0, Math.min(100, pct)))
    },
    [seek]
  )

  if (!track) return null

  return (
    <motion.div
      className="mp"
      id="music-player"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label="Music Player"
    >
      {/* Header bar — matches hero card style */}
      <div className="mp__header">
        <div className="mp__dots">
          <span />
          <span />
          <span />
        </div>
        <span className="mp__header-label">NOW_PLAYING.exe</span>
        <Waveform isPlaying={isPlaying} />
      </div>

      {/* Album disc */}
      <div className="mp__disc-wrap">
        <div className={`mp__disc ${isPlaying ? 'mp__disc--spinning' : ''}`}>
          <div className="mp__disc-inner">
            <span className="mp__disc-label">♪</span>
          </div>
        </div>
      </div>

      {/* Track info with slide animation */}
      <div className="mp__info">
        <AnimatePresence mode="wait">
          <motion.p
            key={`title-${trackIndex}`}
            className="mp__title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {track.title}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`artist-${trackIndex}`}
            className="mp__artist"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            {track.artist}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="mp__progress-wrap">
        <span className="mp__time">{fmt(currentTime)}</span>
        <div
          className="mp__progress"
          ref={progressRef}
          onClick={handleProgressClick}
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="mp__progress-fill" style={{ width: `${progress}%` }}>
            <div className="mp__progress-thumb" />
          </div>
        </div>
        <span className="mp__time">{fmt(duration || track.duration)}</span>
      </div>

      {/* Controls */}
      <div className="mp__controls">
        <button
          className="mp__btn mp__btn--sm"
          onClick={prev}
          aria-label="Previous track"
          id="mp-prev"
        >
          <SkipBack size={14} />
        </button>
        <button
          className="mp__btn mp__btn--play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          id="mp-play"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          className="mp__btn mp__btn--sm"
          onClick={next}
          aria-label="Next track"
          id="mp-next"
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Volume */}
      <div className="mp__volume">
        <Volume2 size={13} className="mp__volume-icon" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mp__volume-slider"
          aria-label="Volume"
          id="mp-volume"
        />
      </div>
    </motion.div>
  )
}
