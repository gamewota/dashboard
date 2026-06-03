import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  TimelineViewport,
  detectBPM,
  type Song as BeatmapSong
} from '@gamewota/beatmap-editor'
import '@gamewota/beatmap-editor/style.css'
import Container from '../components/Container'
import { useToast } from '../hooks/useToast'
import { fetchSongById, clearSelectedSong, saveBeatmap, fetchDifficulties } from '../features/songs/songSlice'
import type { RootState, AppDispatch } from '../store'
import { ImportedBeatmapSchema, type Beatmap, type ImportedBeatmap } from '../lib/schemas/song'
import {
  Header,
  Controls,
  AudioVisualizer,
  EditorCanvas,
  Stats,
} from '../components/BeatmapEditor'
import type { EditorNote } from '../components/BeatmapEditor/types'

// Parse a validated beatmap JSON object into the editor's note model.
// Shared by file-import and loading an existing beatmap from the CDN.
// Per docs: cross-lane links are dropped (their endpoints stay as taps).
function parseBeatmapData(data: ImportedBeatmap): {
  notes: EditorNote[]
  bpm: number
  offsetMs: number
  chartUuid: string
} {
  const chart = data.charts[0]
  const importedOffset = data.offset

  const heldNoteUuids = new Set<string>()
  const importedNotes: EditorNote[] = []

  chart.links.forEach((link) => {
    if (link.startNote.lane !== link.endNote.lane) return
    heldNoteUuids.add(link.startNote.uuid)
    heldNoteUuids.add(link.endNote.uuid)
    const startTime = (link.startNote.songPos + importedOffset) / 1000
    const endTime = (link.endNote.songPos + importedOffset) / 1000
    importedNotes.push({
      id: link.startNote.uuid,
      type: 'hold',
      lane: link.startNote.lane,
      time: startTime,
      duration: Math.max(0, endTime - startTime),
    })
  })

  chart.notes.forEach((note) => {
    if (heldNoteUuids.has(note.uuid)) return
    importedNotes.push({
      id: note.uuid,
      type: 'tap',
      lane: note.lane,
      time: (note.songPos + importedOffset) / 1000,
    })
  })

  return {
    notes: importedNotes,
    bpm: data.bpm,
    offsetMs: importedOffset,
    chartUuid: chart.uuid,
  }
}

// No-op notes handler for review (read-only) mode — discards any edit attempt.
const noopNotesChange = () => {}

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



export default function BeatmapEditorPage() {
  const { song_id } = useParams<{ song_id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewMode = searchParams.get('mode') === 'review';
  const initialDifficulty = searchParams.get('difficulty');
  const dispatch = useDispatch<AppDispatch>();
  const { selectedSong, selectedSongLoading, selectedSongError, difficulties } = useSelector((state: RootState) => state.songs);
  
  const { showToast, ToastContainer } = useToast()
  
  const isSpecificSongMode = !!song_id;
  
  const [song, setSong] = useState<BeatmapSong>(AVAILABLE_SONGS[0]);
  const [availableBeatmaps, setAvailableBeatmaps] = useState<Beatmap[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Notes state
  const [notes, setNotes] = useState<EditorNote[]>([])
  
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

  // Chart UUID (stable across exports; replaced on import)
  const chartUuidRef = useRef<string>(crypto.randomUUID())
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const bpmDetectedRef = useRef<Set<string>>(new Set())
  const songBpmRef = useRef(song.bpm)
  const showToastRef = useRef(showToast)
  
  songBpmRef.current = song.bpm
  showToastRef.current = showToast
  
  // Create shared viewport
  const viewport = useMemo(() => new TimelineViewport(0, 800), [])

  // Completeness is informational only (a song isn't fully playable until all
  // difficulties exist). Approval is per-beatmap and not gated on this.
  // Difficulties from /difficulties that have no saved beatmap on this song.
  const missingDifficulties = useMemo(() => {
    if (difficulties.length === 0) return []
    const saved = new Set(availableBeatmaps.map((bm) => bm.difficulty_name.toLowerCase()))
    return difficulties.filter((d) => !saved.has(d.name.toLowerCase()))
  }, [difficulties, availableBeatmaps])

  // Approval state of the currently selected difficulty's beatmap (if saved).
  const isSelectedApproved = useMemo(() => {
    const bm = availableBeatmaps.find(
      (b) => b.difficulty_name.toLowerCase() === selectedDifficulty.toLowerCase(),
    )
    return bm?.is_approved === true
  }, [availableBeatmaps, selectedDifficulty])
  
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

  // Load difficulty options (name -> id) needed to build the save payload.
  useEffect(() => {
    if (difficulties.length === 0) {
      dispatch(fetchDifficulties());
    }
  }, [dispatch, difficulties.length]);
  
  // Update song object when API data is loaded
  useEffect(() => {
    if (isSpecificSongMode && selectedSong) {
      let durationValue: number;
      if (selectedSong.audio_duration != null && selectedSong.audio_duration > 0) {
        durationValue = selectedSong.audio_duration;
      } else if (selectedSong.reff_end != null && selectedSong.reff_start != null && selectedSong.reff_end > selectedSong.reff_start) {
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
      
      const beatmaps = selectedSong.beatmaps || [];
      // Honor a difficulty passed via query (e.g. from the review entry point),
      // otherwise default to easy.
      const requestedBeatmap = initialDifficulty
        ? beatmaps.find((bm) => bm.difficulty_name.toLowerCase() === initialDifficulty.toLowerCase())
        : undefined;
      const easyBeatmap = beatmaps.find(
        (bm) => bm.difficulty_name.toLowerCase() === 'easy',
      );
      setSelectedDifficulty((requestedBeatmap ?? easyBeatmap)?.difficulty_name ?? '');
      setBpm(120);
      bpmDetectedRef.current.clear();
    }
    // Keyed on song identity so a save-triggered refresh of selectedSong doesn't
    // reset the user's selected difficulty / bpm. availableBeatmaps is synced
    // separately below so completeness still updates on refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpecificSongMode, selectedSong?.song_id, initialDifficulty]);

  // Keep the beatmap list in sync on every selectedSong refresh (e.g. after a
  // save) so the difficulty dropdown and completeness banner stay accurate.
  useEffect(() => {
    if (isSpecificSongMode && selectedSong) {
      setAvailableBeatmaps(selectedSong.beatmaps || []);
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
  
  // Load the existing chart directly from the beatmap's notes_data when a
  // difficulty is selected, hydrating notes/bpm/offset so admins edit the
  // current chart instead of a blank one. (No CDN fetch — notes_data is the
  // JSONB stored on the beatmap record and works even before the asset exists.)
  useEffect(() => {
    if (!isSpecificSongMode || !selectedDifficulty) return

    const beatmap = availableBeatmaps.find(
      (bm) => bm.difficulty_name === selectedDifficulty,
    )
    const notesData = beatmap?.notes_data
    if (!notesData) return

    const validation = ImportedBeatmapSchema.safeParse(notesData)
    if (!validation.success) {
      console.error('Existing beatmap validation failed:', validation.error)
      showToastRef.current('Existing beatmap has an invalid format', 'error')
      return
    }

    const parsed = parseBeatmapData(validation.data)
    chartUuidRef.current = parsed.chartUuid
    setNotes(parsed.notes)
    setBpm(parsed.bpm)
    setOffsetMs(parsed.offsetMs)
    // BPM/offset come from the saved chart; don't let detection overwrite them.
    bpmDetectedRef.current.add(song.id)
  }, [isSpecificSongMode, selectedDifficulty, availableBeatmaps, song.id])

  // Update viewport when duration or zoom changes
  useEffect(() => {
    viewport.setDuration(duration * 1000 || song.duration * 1000)
    viewport.setZoom(zoom / 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- viewport is a stable reference from useMemo
  }, [duration, song.duration, zoom])
  
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
  
  // Build the beatmap payload from the current editor state.
  // Shared by Export (download) and Save (upload to backend) so both stay in sync.
  const buildBeatmapPayload = useCallback(() => {
    const beatDurationMs = bpm > 0 ? 60000 / bpm : 0
    const toSchemaNote = (
      uuid: string,
      lane: number,
      timeSeconds: number,
    ) => {
      const songPos = timeSeconds * 1000 - offsetMs
      return {
        uuid,
        songPos,
        beat: beatDurationMs > 0 ? Math.round((songPos / beatDurationMs) * 100) / 100 : 0,
        label: '',
        lane,
      }
    }

    const exportedNotes: ReturnType<typeof toSchemaNote>[] = []
    const exportedLinks: { uuid: string; startNote: ReturnType<typeof toSchemaNote>; endNote: ReturnType<typeof toSchemaNote> }[] = []

    notes.forEach((note) => {
      const lane = note.lane ?? note.column ?? 0
      const startUuid = note.id || crypto.randomUUID()
      const startNote = toSchemaNote(startUuid, lane, note.time)

      if (note.type === 'hold' && note.duration && note.duration > 0) {
        const endNote = toSchemaNote(
          crypto.randomUUID(),
          lane,
          note.time + note.duration,
        )
        exportedNotes.push(startNote, endNote)
        exportedLinks.push({
          uuid: crypto.randomUUID(),
          startNote,
          endNote,
        })
      } else {
        exportedNotes.push(startNote)
      }
    })

    // The chart structure (stored as JSONB in notes_data, also the export format).
    const notesData = {
      song_id: parseInt(song.id, 10) || 0,
      difficulty: selectedDifficulty || 'default',
      bpm,
      offset: offsetMs,
      charts: [
        {
          uuid: chartUuidRef.current,
          laneCount: 5,
          notes: exportedNotes,
          links: exportedLinks,
        },
      ],
    }

    // Editor-level counts (taps + holds = total notes; holds tracked separately).
    const holdCount = notes.filter(
      (n) => n.type === 'hold' && n.duration && n.duration > 0,
    ).length

    return {
      notesData,
      noteCount: notes.length,
      holdCount,
      // Each note contributes 1 to combo (holds count once); refine if scoring differs.
      maxCombo: notes.length,
    }
  }, [song.id, notes, selectedDifficulty, bpm, offsetMs])

  // Export beatmap (download as JSON file)
  const handleExport = useCallback(() => {
    const { notesData } = buildBeatmapPayload()

    const blob = new Blob([JSON.stringify(notesData, null, 2)], { type: 'application/json' })
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
  }, [buildBeatmapPayload, song.title, selectedDifficulty])

  // Save beatmap to the backend. New difficulties are created (POST); existing
  // ones are updated (PUT /beatmaps/:song_id/:difficulty_id). Saving always
  // submits as unapproved so the chart goes back through review.
  const handleSave = useCallback(async () => {
    if (!isSpecificSongMode) {
      showToastRef.current('Open a song from the dashboard to save', 'warning')
      return
    }
    if (!selectedDifficulty) {
      showToastRef.current('Select a difficulty before saving', 'warning')
      return
    }

    const difficulty = difficulties.find(
      (d) => d.name.toLowerCase() === selectedDifficulty.toLowerCase(),
    )
    if (!difficulty) {
      showToastRef.current(`Unknown difficulty "${selectedDifficulty}"`, 'error')
      return
    }

    const { notesData, noteCount, holdCount, maxCombo } = buildBeatmapPayload()
    // If this difficulty already has a saved beatmap, update it by its id; else create.
    const existing = availableBeatmaps.find(
      (bm) => bm.difficulty_name.toLowerCase() === selectedDifficulty.toLowerCase(),
    )
    // Updates require a beatmap id — fail loudly rather than silently creating a duplicate.
    if (existing && existing.id == null) {
      showToastRef.current('Cannot update this beatmap: missing beatmap id', 'error')
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        saveBeatmap({
          song_id: parseInt(song.id, 10) || 0,
          difficulty_id: difficulty.id,
          notes_data: notesData,
          note_count: noteCount,
          hold_count: holdCount,
          max_combo: maxCombo,
          is_approved: false,
          beatmapId: existing?.id,
        }),
      ).unwrap()
      // After saving, warn if the song still lacks other difficulties.
      // (availableBeatmaps updates via the refreshed selectedSong; recompute
      //  the gap optimistically by excluding the one we just saved.)
      const stillMissing = missingDifficulties.filter(
        (d) => d.name.toLowerCase() !== selectedDifficulty.toLowerCase(),
      )
      if (stillMissing.length > 0) {
        showToastRef.current(
          `${selectedDifficulty} saved. Still missing: ${stillMissing.map((d) => d.name).join(', ')}`,
          'warning',
        )
      } else {
        showToastRef.current('Beatmap saved — all difficulties complete, pending approval', 'success')
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to save beatmap'
      showToastRef.current(message, 'error')
    } finally {
      setIsSaving(false)
    }
  }, [isSpecificSongMode, selectedDifficulty, difficulties, buildBeatmapPayload, availableBeatmaps, missingDifficulties, song.id, dispatch])

  // Approve or reject the beatmap under review. Sends only is_approved via PUT
  // so the reviewed chart is never altered by the approval action itself.
  const handleApproval = useCallback(async (isApproved: boolean) => {
    const difficulty = difficulties.find(
      (d) => d.name.toLowerCase() === selectedDifficulty.toLowerCase(),
    )
    if (!difficulty) {
      showToastRef.current(`Unknown difficulty "${selectedDifficulty}"`, 'error')
      return
    }

    // Approval is per-beatmap, so its id is required.
    const existing = availableBeatmaps.find(
      (bm) => bm.difficulty_name.toLowerCase() === selectedDifficulty.toLowerCase(),
    )
    if (existing?.id == null) {
      showToastRef.current('Cannot find this beatmap to approve', 'error')
      return
    }

    setIsApproving(true)
    try {
      await dispatch(
        saveBeatmap({
          song_id: parseInt(song.id, 10) || 0,
          difficulty_id: difficulty.id,
          is_approved: isApproved,
          beatmapId: existing.id,
        }),
      ).unwrap()
      showToastRef.current(
        isApproved
          ? 'Beatmap approved'
          : isSelectedApproved
            ? 'Approval removed'
            : 'Beatmap rejected',
        isApproved ? 'success' : 'warning',
      )
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update approval'
      showToastRef.current(message, 'error')
    } finally {
      setIsApproving(false)
    }
  }, [difficulties, selectedDifficulty, availableBeatmaps, isSelectedApproved, song.id, dispatch])

  // Import beatmap
  const handleImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target?.result as string)
        const validationResult = ImportedBeatmapSchema.safeParse(parsedData)

        if (!validationResult.success) {
          console.error('Beatmap validation failed:', validationResult.error)
          showToast('Invalid beatmap file format', 'error')
          return
        }

        const parsed = parseBeatmapData(validationResult.data)
        chartUuidRef.current = parsed.chartUuid
        setNotes(parsed.notes)
        setBpm(parsed.bpm)
        setOffsetMs(parsed.offsetMs)
        showToast('Beatmap imported successfully', 'success')
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
          difficulties={difficulties}
          selectedDifficulty={selectedDifficulty}
          onSongChange={setSong}
          onSelectedDifficultyChange={setSelectedDifficulty}
          isReviewMode={isReviewMode}
          isApproving={isApproving}
          isSelectedApproved={isSelectedApproved}
          onApprove={() => handleApproval(true)}
          onReject={() => handleApproval(false)}
        />

        {isSpecificSongMode && difficulties.length > 0 && (
          missingDifficulties.length > 0 ? (
            <div role="alert" className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0020.66 16L13.73 4a2 2 0 00-3.46 0L3.34 16A2 2 0 005.07 19z" />
              </svg>
              <span>
                <strong>{difficulties.length - missingDifficulties.length}/{difficulties.length} difficulties saved.</strong>{' '}
                A song needs all difficulties to go live. Missing:{' '}
                {missingDifficulties.map((d) => d.name).join(', ')}.
              </span>
            </div>
          ) : (
            <div role="alert" className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All {difficulties.length} difficulties saved — song is complete.</span>
            </div>
          )
        )}

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
          onSave={isSpecificSongMode && !isReviewMode ? handleSave : undefined}
          isSaving={isSaving}
          canSave={!!selectedDifficulty}
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
          // Review mode is read-only: discard edits so the chart can't change.
          onNotesChange={isReviewMode ? noopNotesChange : setNotes}
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
