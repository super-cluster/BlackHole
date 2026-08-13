import { useEffect, useRef, useState, useCallback } from 'react'

export default function useAudioPlayer(playlist) {
  const audioRef = useRef(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  const track = playlist[trackIndex]

  // Init audio element once
  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  // Swap src when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    const wasPlaying = isPlaying
    audio.pause()
    audio.src = track.src
    audio.load()
    if (wasPlaying) audio.play().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Attach listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setTrackIndex(i => (i + 1) % playlist.length)
      setProgress(0)
      setCurrentTime(0)
      setIsPlaying(true)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [isPlaying])

  const next = useCallback(() => {
    setTrackIndex(i => (i + 1) % playlist.length)
    setProgress(0)
    setCurrentTime(0)
    setIsPlaying(true)
  }, [playlist.length])

  const prev = useCallback(() => {
    setTrackIndex(i => (i - 1 + playlist.length) % playlist.length)
    setProgress(0)
    setCurrentTime(0)
    setIsPlaying(true)
  }, [playlist.length])

  const seek = useCallback((pct) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = (pct / 100) * audio.duration
  }, [])

  return {
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
  }
}
