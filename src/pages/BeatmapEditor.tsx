import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { 
  BeatmapEditor, 
  Waveform, 
  AudioScrubber,
  TimelineViewport,
  type Note, 
  type Song 
} from '@gamewota/beatmap-editor'
import '@gamewota/beatmap-editor/style.css'
import Container from '../components/Container'

// Available songs for editing
const AVAILABLE_SONGS: Song[] = [
  {
    id: 'sukinanda',
    title: 'Suki Nanda',
    bpm: 180,
    duration: 258,
    audioUrl: 'https://gamecdn.b-cdn.net/music_audios/sukinanda.mp3'
  },
]

export default function BeatmapEditorPage() {
  // Selected song
  const [selectedSong, setSelectedSong] = useState<Song>(AVAILABLE_SONGS[0])
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  
  // Audio state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  
  // Zoom state (25% - 100%)
  const [zoom, setZoom] = useState(100)
  
  // Snap settings
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [snapDivision, setSnapDivision] = useState<1 | 2 | 4 | 8 | 16>(4)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  
  // Offset
  const [offsetMs, setOffsetMs] = useState(0)
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  
  // Set audio volume via effect (not a valid React prop)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])
  
  // Create shared viewport for syncing Waveform and BeatmapEditor
  const viewport = useMemo(() => new TimelineViewport(0, 800), [])
  
  // Update viewport when duration or zoom changes
  useEffect(() => {
    viewport.setDuration(duration * 1000 || selectedSong.duration * 1000)
  }, [duration, selectedSong.duration, viewport])
  
  useEffect(() => {
    viewport.setZoom(zoom / 100)
  }, [zoom, viewport])
  
  // Load audio and decode for waveform when song changes
  useEffect(() => {
    const controller = new AbortController()
    let audioContext: AudioContext | null = null
    
    const loadAudio = async () => {
      try {
        // Reset states
        setAudioBuffer(null)
        setNotes([])
        setCurrentTime(0)
        setDuration(0)
        
        // Fetch audio file with abort signal
        const response = await fetch(selectedSong.audioUrl, {
          signal: controller.signal
        })
        if (!response.ok) throw new Error('Failed to fetch audio')
        
        const arrayBuffer = await response.arrayBuffer()
        
        // Check if aborted before creating AudioContext
        if (controller.signal.aborted) return
        
        // Decode audio for waveform
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) throw new Error('AudioContext not supported')
        
        audioContext = new AudioContextClass()
        const decoded = await audioContext.decodeAudioData(arrayBuffer)
        
        // Only update state if not aborted
        if (!controller.signal.aborted) {
          setAudioBuffer(decoded)
          setDuration(decoded.duration)
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (error instanceof Error && error.message === 'Failed to fetch audio') return
        console.error('Failed to load audio:', error)
      }
    }
    
    loadAudio()
    
    return () => {
      controller.abort()
      if (audioContext) {
        audioContext.close().catch(() => {
          // Ignore close errors
        })
      }
    }
  }, [selectedSong])
  
  // Handle seek
  const handleSeek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration || selectedSong.duration))
    if (audioRef.current) {
      audioRef.current.currentTime = clampedTime
    }
    setCurrentTime(clampedTime)
  }, [duration, selectedSong.duration])
  
  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }, [isPlaying])
  
  // Handle stop - pause and reset to beginning
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentTime(0)
    // Reset played notes tracking so SFX will play again on next playback
    // Note: We can't access playedNotesRef directly, but the effect will handle it
  }, [])
  
  // Export beatmap
  const handleExport = useCallback(() => {
    const beatmapData = {
      songId: selectedSong.id,
      title: selectedSong.title,
      bpm: selectedSong.bpm,
      offset: offsetMs,
      notes: notes
    }
    const blob = new Blob([JSON.stringify(beatmapData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedSong.title.replace(/\s+/g, '_')}_beatmap.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedSong, notes, offsetMs])
  
  // Import beatmap
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.notes && Array.isArray(data.notes)) {
          setNotes(data.notes)
          if (data.offset !== undefined) {
            setOffsetMs(data.offset)
          }
        }
      } catch (error) {
        console.error('Failed to parse beatmap file:', error)
        alert('Invalid beatmap file')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }, [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to play/pause
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        togglePlay()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay])

  return (
    <Container className="min-h-screen items-center">
      <div className="w-full max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Beatmap Editor</h1>
              <p className="text-base-content/70 mt-1">
                Create and edit beatmaps for rhythm game songs
              </p>
            </div>
            
            {/* Song Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Song:</label>
              <select 
                className="select select-bordered select-sm"
                value={selectedSong.id}
                onChange={(e) => {
                  const song = AVAILABLE_SONGS.find(s => s.id === e.target.value)
                  if (song) setSelectedSong(song)
                }}
              >
                {AVAILABLE_SONGS.map(song => (
                  <option key={song.id} value={song.id}>
                    {song.title} ({song.bpm} BPM)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls Card */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Play/Pause Button */}
                <button 
                  className={`btn btn-circle ${isPlaying ? 'btn-error' : 'btn-primary'}`}
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                
                {/* Stop Button */}
                <button 
                  className="btn btn-circle btn-secondary"
                  onClick={handleStop}
                  title="Stop (Reset to beginning)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
                
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value)
                      setVolume(vol)
                      if (audioRef.current) {
                        audioRef.current.volume = vol
                      }
                    }}
                    className="range range-xs range-primary w-24"
                  />
                </div>
                
                <div className="divider divider-horizontal"></div>
                
                {/* Snap Settings */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={snapEnabled}
                      onChange={(e) => setSnapEnabled(e.target.checked)}
                    />
                    <span className="text-sm">Snap</span>
                  </label>
                  <select 
                    className="select select-bordered select-xs"
                    value={snapDivision}
                    onChange={(e) => setSnapDivision(Number(e.target.value) as 1 | 2 | 4 | 8 | 16)}
                    disabled={!snapEnabled}
                  >
                    <option value={1}>1/1</option>
                    <option value={2}>1/2</option>
                    <option value={4}>1/4</option>
                    <option value={8}>1/8</option>
                    <option value={16}>1/16</option>
                  </select>
                </div>
                
                {/* SFX Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={sfxEnabled}
                    onChange={(e) => setSfxEnabled(e.target.checked)}
                  />
                  <span className="text-sm">SFX</span>
                </label>
                
                <div className="divider divider-horizontal"></div>
                
                {/* Zoom Control */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="range range-xs range-primary w-24"
                  />
                  <span className="text-sm w-12">{zoom}%</span>
                </div>
                
                <div className="divider divider-horizontal"></div>
                
                {/* Offset Control */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">Offset:</span>
                  <input
                    type="number"
                    value={offsetMs}
                    onChange={(e) => setOffsetMs(Number(e.target.value))}
                    className="input input-bordered input-xs w-20"
                    step="10"
                  />
                  <span className="text-sm">ms</span>
                </div>
                
                <div className="flex-1"></div>
                
                {/* Import/Export */}
                <div className="flex items-center gap-2">
                  <label className="btn btn-sm btn-outline">
                    Import
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={handleImport}
                    />
                  </label>
                  <button className="btn btn-sm btn-primary" onClick={handleExport}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Element (Hidden) */}
          <audio
            ref={audioRef}
            src={selectedSong.audioUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Audio Scrubber */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-4">
              <AudioScrubber
                currentTime={currentTime}
                duration={duration || selectedSong.duration}
                onSeek={handleSeek}
                className="h-10 w-full"
              />
            </div>
          </div>

          {/* Waveform */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-0 overflow-hidden">
              <div 
                ref={waveformContainerRef}
                className="h-32 overflow-x-auto"
              >
                {audioBuffer ? (
                  <Waveform
                    audioBuffer={audioBuffer}
                    currentTime={currentTime}
                    viewport={viewport}
                    onSeek={handleSeek}
                    containerRef={waveformContainerRef}
                    disableCanvasInteraction={false}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-base-content/50">
                    {audioBuffer === null ? 'Loading audio waveform...' : 'No audio loaded'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beatmap Editor */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-0">
              <BeatmapEditor
                song={selectedSong}
                notes={notes}
                onNotesChange={setNotes}
                currentTime={currentTime}
                viewport={viewport}
                snapEnabled={snapEnabled}
                snapDivision={snapDivision}
                offsetMs={offsetMs}
                sfxEnabled={sfxEnabled}
                className="min-h-100"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="card bg-base-200 shadow">
            <div className="card-body p-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="badge badge-lg">
                  Notes: {notes.length}
                </div>
                <div className="badge badge-lg">
                  Tap Notes: {notes.filter(n => n.type === 'tap').length}
                </div>
                <div className="badge badge-lg">
                  Hold Notes: {notes.filter(n => n.type === 'hold').length}
                </div>
                <div className="badge badge-lg">
                  Current Time: {currentTime.toFixed(2)}s
                </div>
                <div className="badge badge-lg">
                  Duration: {(duration || selectedSong.duration).toFixed(2)}s
                </div>
              </div>
            </div>
          </div>

        </div>
    </Container>
  );
}