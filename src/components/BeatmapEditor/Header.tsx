import { useNavigate } from 'react-router-dom'
import type { Song as BeatmapSong } from '@gamewota/beatmap-editor'
import type { Beatmap, Difficulty } from '../../lib/schemas/song'

interface HeaderProps {
  isSpecificSongMode: boolean
  song: BeatmapSong
  availableSongs: BeatmapSong[]
  availableBeatmaps: Beatmap[]
  difficulties: Difficulty[]
  selectedDifficulty: string
  onSongChange: (song: BeatmapSong) => void
  onSelectedDifficultyChange: (difficulty: string) => void
  isReviewMode?: boolean
  isApproving?: boolean
  isSelectedApproved?: boolean
  onApprove?: () => void
  onReject?: () => void
}

export function Header({
  isSpecificSongMode,
  song,
  availableSongs,
  availableBeatmaps,
  difficulties,
  selectedDifficulty,
  onSongChange,
  onSelectedDifficultyChange,
  isReviewMode = false,
  isApproving = false,
  isSelectedApproved = false,
  onApprove,
  onReject,
}: HeaderProps) {
  // Which difficulties already have a saved beatmap on this song (for labeling).
  const savedDifficulties = new Set(
    availableBeatmaps.map((bm) => bm.difficulty_name.toLowerCase()),
  )
  const navigate = useNavigate()

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">
          {isReviewMode ? 'Beatmap Review' : 'Beatmap Editor'}
        </h1>
        <p className="text-base-content/70 mt-1">
          {isReviewMode
            ? 'Play the song with the chart, then approve or reject'
            : 'Create and edit beatmaps for rhythm game songs'}
        </p>
      </div>

      {!isSpecificSongMode ? (
        <div className="flex items-center gap-2">
          <label htmlFor="song-select" className="text-sm font-medium">Song:</label>
          <select
            id="song-select"
            className="select select-bordered select-sm"
            value={song.id}
            onChange={(e) => {
              const matchedSong = availableSongs.find(s => s.id === e.target.value)
              if (matchedSong) onSongChange(matchedSong)
            }}
          >
            {availableSongs.map(availableSong => (
              <option key={availableSong.id} value={availableSong.id}>
                {availableSong.title} ({availableSong.bpm} BPM)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-lg badge-primary">{song.title}</span>

          <div className="flex items-center gap-2">
            <label htmlFor="difficulty-select" className="text-sm font-medium">Level:</label>
            <select
              id="difficulty-select"
              className="select select-bordered select-sm"
              value={selectedDifficulty}
              onChange={(e) => onSelectedDifficultyChange(e.target.value)}
            >
              <option value="">Select difficulty...</option>
              {difficulties
                // In review mode only existing beatmaps are reviewable.
                .filter((d) => !isReviewMode || savedDifficulties.has(d.name.toLowerCase()))
                .map((difficulty) => (
                  <option key={difficulty.id} value={difficulty.name}>
                    {difficulty.name}
                    {savedDifficulties.has(difficulty.name.toLowerCase()) ? '' : ' (new)'}
                  </option>
                ))}
            </select>
          </div>

          {isReviewMode && (
            <div className="flex items-center gap-2">
              {isSelectedApproved ? (
                <>
                  <span className="badge badge-success gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                  <button
                    className="btn btn-sm btn-outline btn-warning"
                    onClick={onReject}
                    disabled={isApproving || !selectedDifficulty}
                    title="Remove approval (send back for review)"
                  >
                    {isApproving ? (
                      <span className="loading loading-spinner loading-xs" aria-label="Submitting" role="status"></span>
                    ) : (
                      'Revoke approval'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={onReject}
                    disabled={isApproving || !selectedDifficulty}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={onApprove}
                    disabled={isApproving || !selectedDifficulty}
                    title="Approve this beatmap"
                  >
                    {isApproving ? (
                      <span className="loading loading-spinner loading-xs" aria-label="Submitting" role="status"></span>
                    ) : (
                      'Approve'
                    )}
                  </button>
                </>
              )}
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
  )
}
