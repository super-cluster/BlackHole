// Animated equalizer bars — plays when isPlaying=true, freezes when paused
export default function Waveform({ isPlaying }) {
  return (
    <div className="waveform" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <span
          key={n}
          className="waveform__bar"
          style={{
            animationDelay: `${(n - 1) * 0.1}s`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  )
}