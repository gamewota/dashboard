import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'
import { 
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
import {
  Header,
  Controls,
  AudioVisualizer,
  EditorCanvas,
  Stats,
} from '../components/BeatmapEditor'

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

// Extended note type that includes optional column property
interface EditorNoteExt extends Note {
  column?: number;
}

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
  
  const { showToast, ToastContainer } = useToast()
  
  const isSpecificSongMode = !!song_id;
  
  const [song, setSong] = useState<BeatmapSong>(AVAILABLE_SONGS[0]);
  const [availableBeatmaps, setAvailableBeatmaps] = useState<Beatmap[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  
  // Notes state
  const [notes, setNotes] = useState<EditorNoteExt[]>([])
  
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
  
  // SFX URL - static string
  const sfxUrl = '/dashboard/sfx.mp3'
  
  // Offset
  const [offsetMs, setOffsetMs] = useState(0)
  
  // BPM
  const [bpm, setBpm] = useState(song.bpm)
  const [isDetectingBPM, setIsDetectingBPM] = useState(false)
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const bpmDetectedRef = useRef<Set<string>>(new Set())
  const songBpmRef = useRef(song.bpm)
  const showToastRef = useRef(showToast)
  
  songBpmRef.current = song.bpm
  showToastRef.current = showToast
  
  // Create shared viewport
  const viewport = useMemo(() => new TimelineViewport(0, 800), [])
  
  // Fetch song data when song_id param is present
  useEffect(() => {
    if (song_id) {
      const id = parseInt(song_id, 10);
      if (!isNaN(id)) {
        dispatch(fetchSongById(id));
      }
    }
    
    return () => {
      dispatch(clearSelectedSong());
    };
  }, [song_id, dispatch]);
  
  // Update song object when API data is loaded
  useEffect(() => {
    if (isSpecificSongMode && selectedSong) {
      let durationValue: number;
      if (selectedSong.audio_duration != null && selectedSong.audio_duration > 0) {
        durationValue = selectedSong.audio_duration;
      } else if (selectedSong.reff_end > selectedSong.reff_start) {
        durationValue = selectedSong.reff_end;
        console.warn('audio_duration missing, falling back to reff_end for duration calculation');
      } else {
        durationValue = 300;
        console.warn('audio_duration and reff_end unavailable, using default duration of 300s');
      }
        
      setSong({
        id: String(selectedSong.song_id),
        title: selectedSong.song_title,
        bpm: 120,
        duration: durationValue,
        audioUrl: selectedSong.audio_url,
      });
      
      setAvailableBeatmaps(selectedSong.beatmaps || []);
      setSelectedDifficulty('');
      setBpm(120);
      bpmDetectedRef.current.clear();
    }
  }, [isSpecificSongMode, selectedSong]);
  
  // Detect BPM when audio buffer is loaded
  useEffect(() => {
    if (!audioBuffer) return
    if (bpmDetectedRef.current.has(song.id)) return
    
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
          bpmDetectedRef.current.add(song.id)
        }
      } finally {
        if (!cancelled) {
          setIsDetectingBPM(false)
        }
      }
    }
    
    detect()
    
    return () => {
      cancelled = true
    }
  }, [audioBuffer, song.id])
  
  // Clear BPM detection tracking when song ID changes
  useEffect(() => {
    bpmDetectedRef.current.clear()
    setBpm(songBpmRef.current)
  }, [song.id])
  
  // Update viewport when duration or zoom changes
  useEffect(() => {
    viewport.setDuration(duration * 1000 || song.duration * 1000)
    viewport.setZoom(zoom / 100)
  }, [duration, song.duration, zoom, viewport])
  
  // Load audio and decode for waveform when song changes
  useEffect(() => {
    const controller = new AbortController()
    let audioContext: AudioContext | null = null
    
    const loadAudio = async () => {
      try {
        setAudioBuffer(null)
        setAudioError(null)
        setNotes([])
        setCurrentTime(0)
        setDuration(0)
        
        const response = await fetch(song.audioUrl, {
          signal: controller.signal
        })
        if (!response.ok) throw new Error('Failed to fetch audio')
        
        const arrayBuffer = await response.arrayBuffer()
        
        if (controller.signal.aborted) return
        
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) throw new Error('AudioContext not supported')
        
        audioContext = new AudioContextClass()
        const decoded = await audioContext.decodeAudioData(arrayBuffer)
        
        if (!controller.signal.aborted) {
          setAudioBuffer(decoded)
          setDuration(decoded.duration)
        }
      } catch (error) {
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
        audioContext.close().catch(() => {})
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
        showToastRef.current(
          `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        )
        setIsPlaying(false)
      }
    }
  }, [isPlaying])
  
  // Handle stop
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setCurrentTime(0)
  }, [])
  
  // Export beatmap
  const handleExport = useCallback(() => {
    const mappedItems = notes.map((note: EditorNoteExt, index: number) => ({
      button_type: note.type === 'hold' ? 1 : 0,
      button_direction: note.lane ?? note.column ?? (index % 5),
      button_duration: note.duration ? Math.round(note.duration) : 0,
      button_time: note.time ? note.time / 1000 : 0
    }))

    const matchedBeatmap = availableBeatmaps.find(
      bm => bm.difficulty_name === selectedDifficulty
    )
    const beatmapId = matchedBeatmap?.id ?? 0

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
    
    document.body.appendChild(a)
    a.click()
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
        const validationResult = ImportedBeatmapSchema.safeParse(parsedData);
        
        if (!validationResult.success) {
          console.error('Beatmap validation failed:', validationResult.error);
          showToast('Invalid beatmap file format', 'error');
          return;
        }
        
        const data = validationResult.data;
        const validatedNotes: EditorNoteExt[] = data.notes.map((note, index) => ({
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
    event.target.value = ''
  }, [showToast])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        togglePlay()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay])

  // Audio element volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Show loading state
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
        <Header
          isSpecificSongMode={isSpecificSongMode}
          song={song}
          availableSongs={AVAILABLE_SONGS}
          availableBeatmaps={availableBeatmaps}
          selectedDifficulty={selectedDifficulty}
          onSongChange={setSong}
          onSelectedDifficultyChange={setSelectedDifficulty}
        />

        <Controls
          isPlaying={isPlaying}
          volume={volume}
          zoom={zoom}
          snapEnabled={snapEnabled}
          snapDivision={snapDivision}
          sfxEnabled={sfxEnabled}
          offsetMs={offsetMs}
          bpm={bpm}
          isDetectingBPM={isDetectingBPM}
          onTogglePlay={togglePlay}
          onStop={handleStop}
          onVolumeChange={setVolume}
          onZoomChange={setZoom}
          onSnapEnabledChange={setSnapEnabled}
          onSnapDivisionChange={setSnapDivision}
          onSfxEnabledChange={setSfxEnabled}
          onOffsetChange={setOffsetMs}
          onBpmChange={setBpm}
          onExport={handleExport}
          onImport={handleImport}
        />

        <audio
          ref={audioRef}
          src={song.audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        <AudioVisualizer
          currentTime={currentTime}
          duration={duration}
          audioBuffer={audioBuffer}
          audioError={audioError}
          songDuration={song.duration}
          viewport={viewport}
          onSeek={handleSeek}
        />

        <EditorCanvas
          song={song}
          bpm={bpm}
          notes={notes}
          currentTime={currentTime}
          viewport={viewport}
          snapEnabled={snapEnabled}
          snapDivision={snapDivision}
          offsetMs={offsetMs}
          sfxEnabled={sfxEnabled}
          sfxUrl={sfxUrl}
          onNotesChange={setNotes}
        />

        <Stats
          notes={notes}
          currentTime={currentTime}
          duration={duration}
          songDuration={song.duration}
          selectedDifficulty={selectedDifficulty}
        />
      </div>
      <ToastContainer />
    </Container>
  );
}
