import { BeatmapEditor, type TimelineViewport } from '@gamewota/beatmap-editor'
import type { Song as BeatmapSong } from '@gamewota/beatmap-editor'
import type { EditorNote, SnapDivision } from './types'

interface EditorCanvasProps {
  song: BeatmapSong
  bpm: number
  notes: EditorNote[]
  currentTime: number
  viewport: TimelineViewport
  snapEnabled: boolean
  snapDivision: SnapDivision
  offsetMs: number
  sfxEnabled: boolean
  sfxUrl: string
  onNotesChange: (notes: EditorNote[]) => void
}

export function EditorCanvas({
  song,
  bpm,
  notes,
  currentTime,
  viewport,
  snapEnabled,
  snapDivision,
  offsetMs,
  sfxEnabled,
  sfxUrl,
  onNotesChange,
}: EditorCanvasProps) {
  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body p-0">
        <BeatmapEditor
          key={song.id}
          song={song}
          bpm={bpm}
          notes={notes}
          onNotesChange={onNotesChange}
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
  )
}
