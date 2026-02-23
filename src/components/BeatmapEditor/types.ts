import type { Note, Song as BeatmapSong } from '@gamewota/beatmap-editor'
import type { Beatmap } from '../../lib/schemas/song'

export interface EditorNote extends Note {
  column?: number
}

export interface BeatmapEditorState {
  song: BeatmapSong
  availableBeatmaps: Beatmap[]
  selectedDifficulty: string
  notes: EditorNote[]
  currentTime: number
  duration: number
  audioBuffer: AudioBuffer | null
  audioError: string | null
  isPlaying: boolean
  volume: number
  zoom: number
  snapEnabled: boolean
  snapDivision: 1 | 2 | 4 | 8 | 16
  sfxEnabled: boolean
  offsetMs: number
  bpm: number
  isDetectingBPM: boolean
}

export interface BeatmapEditorHandlers {
  onSeek: (time: number) => void
  onTogglePlay: () => void
  onStop: () => void
  onVolumeChange: (volume: number) => void
  onZoomChange: (zoom: number) => void
  onSnapEnabledChange: (enabled: boolean) => void
  onSnapDivisionChange: (division: 1 | 2 | 4 | 8 | 16) => void
  onSfxEnabledChange: (enabled: boolean) => void
  onOffsetChange: (offset: number) => void
  onBpmChange: (bpm: number) => void
  onNotesChange: (notes: EditorNote[]) => void
  onSelectedDifficultyChange: (difficulty: string) => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}
