import type { EditorNote } from './types'

interface StatsProps {
  notes: EditorNote[]
  currentTime: number
  duration: number
  songDuration: number
  selectedDifficulty?: string
}

export function Stats({
  notes,
  currentTime,
  duration,
  songDuration,
  selectedDifficulty,
}: StatsProps) {
  const tapNotes = notes.filter(n => n.type === 'tap').length
  const holdNotes = notes.filter(n => n.type === 'hold').length

  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="badge badge-lg">
            Notes: {notes.length}
          </div>
          <div className="badge badge-lg">
            Tap Notes: {tapNotes}
          </div>
          <div className="badge badge-lg">
            Hold Notes: {holdNotes}
          </div>
          <div className="badge badge-lg">
            Current Time: {currentTime.toFixed(2)}s
          </div>
          <div className="badge badge-lg">
            Duration: {(duration || songDuration).toFixed(2)}s
          </div>
          {selectedDifficulty && (
            <div className="badge badge-lg badge-primary">
              Level: {selectedDifficulty}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
