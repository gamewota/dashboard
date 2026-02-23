import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { 
  BeatmapEditor, 
  Waveform, 
  AudioScrubber,
  TimelineViewport,
  detectBPM,
  type Note, 
  type Song as BeatmapSong
} from '@gamewota/beatmap-editor'
import '@gamewota/beatmap-editor/style.css'
import Container from '../components/Container'
import { useToast } from '../hooks/useToast'
import { fetchSongById, clearSelectedSong } from '../features/songs/songSlice'
import type { RootState, AppDispatch } from '../store'
import type { Beatmap } from '../lib/schemas/song'


// Available songs for editing (fallback when no song_id param)
const AVAILABLE_SONGS: BeatmapSong[] = [
  {
    id: 'sukinanda',
    title: 'Suki Nanda',
    bpm: 180,
    duration: 258,
    audioUrl: 'https://gamecdn.b-cdn.net/music_audios/sukinanda.mp3'
  },
]

// Zod schema for validating imported beatmap notes
const ImportedNoteSchema = z.object({
  type: z.enum(['tap', 'hold']),
  time: z.number(),
  lane: z.number().optional(),
  column: z.number().optional(),
  duration: z.number().optional(),
});

const ImportedBeatmapSchema = z.object({
  notes: z.array(ImportedNoteSchema),
  offset: z.number().optional(),
});

export default function BeatmapEditorPage() {
  const { song_id } = useParams<{ song_id?: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedSong, selectedSongLoading, selectedSongError } = useSelector((state: RootState) => state.songs);
  
  // Toast notification
  const { showToast, ToastContainer } = useToast()
  
  // Determine if we're in "specific song mode" or "selector mode"
  const isSpecificSongMode = !!song_id;
  
  // Build song object from API data or use selector
  const [song, setSong] = useState<BeatmapSong>(AVAILABLE_SONGS[0]);
  
  // Level/Difficulty selection
  const [availableBeatmaps, setAvailableBeatmaps] = useState<Beatmap[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  
  // Fetch song data when song_id param is present
  useEffect(() => {
    if (song_id) {
      const id = parseInt(song_id, 10);
      if (!isNaN(id)) {
        dispatch(fetchSongById(id));
      }
    }
    
    // Cleanup when unmounting
    return () => {
      dispatch(clearSelectedSong());
    };
  }, [song_id, dispatch]);
  
  // Update song object when API data is loaded
  useEffect(() => {
    if (isSpecificSongMode && selectedSong) {
      // Prefer audio_duration if present, then fall back to reff_end, then default
      let duration: number;
      if (selectedSong.audio_duration != null && selectedSong.audio_duration > 0) {
        duration = selectedSong.audio_duration;
      } else if (selectedSong.reff_end > selectedSong.reff_start) {
        duration = selectedSong.reff_end;
        console.warn('audio_duration missing, falling back to reff_end for duration calculation');
      } else {
        duration = 300; // generic safe default
        console.warn('audio_duration and reff_end unavailable, using default duration of 300s');
      }
        
      setSong({
        id: String(selectedSong.song_id),
        title: selectedSong.song_title,
        bpm: 120, // Default BPM, will be auto-detected
        duration: duration,
        audioUrl: selectedSong.audio_url,
      });
      
      // Set available beatmaps
      setAvailableBeatmaps(selectedSong.beatmaps || []);
      
      // Reset difficulty selection when song changes
      setSelectedDifficulty('');
      
      // Reset BPM when song changes - it will be auto-detected from audio
      setBpm(120);
      bpmDetectedRef.current.clear();
    }
  }, [isSpecificSongMode, selectedSong]);
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  
  // Audio state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  
  // Zoom state (25% - 100%)
  const [zoom, setZoom] = useState(100)
  
  // Snap settings
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [snapDivision, setSnapDivision] = useState<1 | 2 | 4 | 8 | 16>(4)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  
  // SFX URL - static string, no need for useMemo
  const sfxUrl = '/dashboard/sfx.mp3'
  
  // Offset
  const [offsetMs, setOffsetMs] = useState(0)
  
  // BPM (editable, auto-detected from audio)
  const [bpm, setBpm] = useState(song.bpm)
  const [isDetectingBPM, setIsDetectingBPM] = useState(false)
  
  // Refs - must be defined before effects that use them
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  const bpmDetectedRef = useRef<Set<string>>(new Set())
  // Use refs that are updated directly in event handlers to avoid effect overhead
  const songBpmRef = useRef(song.bpm)
  const showToastRef = useRef(showToast)
  
  // Sync refs immediately (no effect needed - these are just for callbacks)
  songBpmRef.current = song.bpm
  showToastRef.current = showToast
  
  // Detect BPM when audio buffer is loaded (only once per song)
  useEffect(() => {
    if (!audioBuffer) return
    
    // Check if already detected for this song
    if (bpmDetectedRef.current.has(song.id)) return
    
    // Use a cancelled flag to prevent stale updates
    let cancelled = false
    
    const detect = async () => {
      setIsDetectingBPM(true)
      try {
        const result = await detectBPM(audioBuffer)
        if (!cancelled) {
          setBpm(result.bpm)
          if (result.offsetMs !== 0) {
            setOffsetMs(result.offsetMs)
          }
          bpmDetectedRef.current.add(song.id)
          showToastRef.current(`BPM detected: ${result.bpm}`, 'success')
        }
      } catch (error) {
        if (!cancelled) {
          console.error('BPM detection failed:', error)
          showToastRef.current('BPM detection failed, using song default', 'warning')
          setBpm(songBpmRef.current)
          bpmDetectedRef.current.add(song.id) // Mark as processed even on failure
        }
      } finally {
        if (!cancelled) {
          setIsDetectingBPM(false)
        }
      }
    }
    
    detect()
    
    // Cleanup function to cancel in-flight detection
    return () => {
      cancelled = true
    }
  }, [audioBuffer, song.id])
  
  // Clear BPM detection tracking when song ID changes (not when song object changes)
  useEffect(() => {
    bpmDetectedRef.current.clear()
    setBpm(songBpmRef.current)
  }, [song.id])
  
  // Volume is set directly in the onChange handler (no effect needed)
  
  // Create shared viewport for syncing Waveform and BeatmapEditor
  const viewport = useMemo(() => new TimelineViewport(0, 800), [])
  
  // Update viewport when duration or zoom changes (combined into single effect)
  useEffect(() => {
    viewport.setDuration(duration * 1000 || song.duration * 1000)
    viewport.setZoom(zoom / 100)
  }, [duration, song.duration, zoom, viewport])
  
  // Load audio and decode for waveform when song changes
  // Only depend on song.id and song.audioUrl to avoid unnecessary refetches
  useEffect(() => {
    const controller = new AbortController()
    let audioContext: AudioContext | null = null
    
    const loadAudio = async () => {
      try {
        // Reset states
        setAudioBuffer(null)
        setAudioError(null)
        setNotes([])
        setCurrentTime(0)
        setDuration(0)
        
        // Fetch audio file with abort signal
        const response = await fetch(song.audioUrl, {
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
        // Ignore abort errors and errors after intentional abort/cleanup
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (controller.signal.aborted) return
        console.error('Failed to load audio:', error)
        setAudioError(error instanceof Error ? error.message : 'Failed to load audio')
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
  }, [song.id, song.audioUrl])
  
  // Handle seek
  const handleSeek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(time, duration || song.duration))
    if (audioRef.current) {
      audioRef.current.currentTime = clampedTime
    }
    setCurrentTime(clampedTime)
  }, [duration, song.duration])
  
  // Handle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      try {
        await audioRef.current.play()
      } catch (error) {
        console.error('Failed to play audio:', error)
        // Show error toast to user
        showToastRef.current(
          `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        )
        // Update state to reflect that playback didn't start
        setIsPlaying(false)
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
  
  // Export beatmap with structured format
  const handleExport = useCallback(() => {
    // Map editor notes to the required format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedItems = notes.map((note: any, index: number) => ({
      button_type: note.type === 'hold' ? 1 : 0,
      button_direction: note.lane ?? note.column ?? (index % 5),
      button_duration: note.duration ? Math.round(note.duration) : 0,
      button_time: note.time ? note.time / 1000 : 0
    }))

    // Find the existing beatmap entry to get the real ID
    const matchedBeatmap = availableBeatmaps.find(
      bm => bm.difficulty_name === selectedDifficulty
    )
    const beatmapId = matchedBeatmap?.id ?? 0 // fallback to 0 if no match or no id

    const beatmapData = {
      beatmap: {
        id: beatmapId,
        song_id: parseInt(song.id, 10) || 0,
        difficulty: selectedDifficulty || 'default',
        items: mappedItems
      }
    }
    
    const blob = new Blob([JSON.stringify(beatmapData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeSongName = song.title.replace(/\s+/g, '_')
    const safeDifficulty = selectedDifficulty || 'default'
    a.download = `${safeSongName}_${safeDifficulty}_beatmaps.json`
    
    // Append to body for compatibility with older browsers
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [song, notes, selectedDifficulty, availableBeatmaps])
  
  // Import beatmap
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target?.result as string)
        
        // Validate with Zod schema
        const validationResult = ImportedBeatmapSchema.safeParse(parsedData);
        
        if (!validationResult.success) {
          console.error('Beatmap validation failed:', validationResult.error);
          showToast('Invalid beatmap file format', 'error');
          return;
        }
        
        const data = validationResult.data;
        
        // Transform validated notes to the expected Note type
        const validatedNotes: Note[] = data.notes.map((note, index) => ({
          id: `imported-${index}`,
          type: note.type,
          time: note.time,
          lane: note.lane ?? note.column ?? 0,
          column: note.column,
          duration: note.duration,
        }));
        
        setNotes(validatedNotes);
        if (data.offset !== undefined) {
          setOffsetMs(data.offset);
        }
        showToast('Beatmap imported successfully', 'success');
      } catch (error) {
        console.error('Failed to parse beatmap file:', error)
        showToast('Invalid beatmap file', 'error')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }, [showToast])
  
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

  // Show loading state when fetching specific song
  if (isSpecificSongMode && selectedSongLoading) {
    return (
      <Container className="min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-infinity loading-xl text-warning"></span>
          <p className="text-lg">Loading song data...</p>
        </div>
      </Container>
    );
  }

  // Show error state
  if (isSpecificSongMode && selectedSongError) {
    return (
      <Container className="min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-error text-xl">⚠️ Error</div>
          <p>{selectedSongError}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/songs')}
          >
            Back to Songs
          </button>
        </div>
      </Container>
    );
  }

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
            
            {/* Song Selector (only in non-specific song mode) */}
            {!isSpecificSongMode ? (
              <div className="flex items-center gap-2">
                <label htmlFor="song-select" className="text-sm font-medium">Song:</label>
                <select 
                  id="song-select"
                  className="select select-bordered select-sm"
                  value={song.id}
                  onChange={(e) => {
                    const matchedSong = AVAILABLE_SONGS.find(s => s.id === e.target.value)
                    if (matchedSong) setSong(matchedSong)
                  }}
                >
                  {AVAILABLE_SONGS.map(availableSong => (
                    <option key={availableSong.id} value={availableSong.id}>
                      {availableSong.title} ({availableSong.bpm} BPM)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-lg badge-primary">{song.title}</span>
                
                {/* Difficulty/Level Selector */}
                {availableBeatmaps.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="difficulty-select" className="text-sm font-medium">Level:</label>
                    <select 
                      id="difficulty-select"
                      className="select select-bordered select-sm"
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                      <option value="">Select difficulty...</option>
                      {availableBeatmaps.map((beatmap) => (
                        <option key={beatmap.difficulty_name} value={beatmap.difficulty_name}>
                          {beatmap.difficulty_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => navigate('/dashboard/songs')}
                >
                  Back to Songs
                </button>
              </div>
            )}
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
                  aria-label={isPlaying ? 'Pause' : 'Play'}
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
                  aria-label="Stop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
                
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                      // Volume is set synchronously on the ref, no effect needed
                      if (audioRef.current) {
                        audioRef.current.volume = vol
                      }
                    }}
                    className="range range-xs range-primary w-24"
                    aria-label="Volume"
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
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={sfxEnabled}
                      onChange={(e) => setSfxEnabled(e.target.checked)}
                    />
                    <span className="text-sm">SFX</span>
                  </label>
                </div>
                
                <div className="divider divider-horizontal"></div>
                
                {/* Zoom Control */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="range range-xs range-primary w-24"
                    aria-label="Zoom"
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
                    aria-label="Offset in milliseconds"
                  />
                  <span className="text-sm">ms</span>
                </div>
                
                <div className="divider divider-horizontal"></div>
                
                {/* BPM Control */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">BPM:</span>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="input input-bordered input-xs w-16"
                    min="1"
                    max="999"
                    step="1"
                    disabled={isDetectingBPM}
                    aria-busy={isDetectingBPM}
                    aria-label="Beats per minute"
                  />
                  {isDetectingBPM && (
                    <span className="loading loading-spinner loading-xs" aria-label="Detecting BPM" role="status"></span>
                  )}
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
            src={song.audioUrl}
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
                duration={duration || song.duration}
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
                {audioError ? (
                  <div className="h-full flex items-center justify-center text-error">
                    Error: {audioError}
                  </div>
                ) : audioBuffer ? (
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
                    Loading audio waveform...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Beatmap Editor */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body p-0">
              <BeatmapEditor
                key={song.id}
                song={song}
                bpm={bpm}
                notes={notes}
                onNotesChange={setNotes}
                currentTime={currentTime}
                viewport={viewport}
                snapEnabled={snapEnabled}
                snapDivision={snapDivision}
                offsetMs={offsetMs}
                sfxEnabled={sfxEnabled}
                sfxUrl={sfxUrl}
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
                  Duration: {(duration || song.duration).toFixed(2)}s
                </div>
                {selectedDifficulty && (
                  <div className="badge badge-lg badge-primary">
                    Level: {selectedDifficulty}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        <ToastContainer />
    </Container>
  );
}
