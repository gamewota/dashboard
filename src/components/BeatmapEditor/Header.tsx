import { useNavigate } from 'react-router-dom'
import type { Song as BeatmapSong } from '@gamewota/beatmap-editor'
import type { Beatmap } from '../../lib/schemas/song'

interface HeaderProps {
  isSpecificSongMode: boolean
  song: BeatmapSong
  availableSongs: BeatmapSong[]
  availableBeatmaps: Beatmap[]
  selectedDifficulty: string
  onSongChange: (song: BeatmapSong) => void
  onSelectedDifficultyChange: (difficulty: string) => void
}

export function Header({
  isSpecificSongMode,
  song,
  availableSongs,
  availableBeatmaps,
  selectedDifficulty,
  onSongChange,
  onSelectedDifficultyChange,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Beatmap Editor</h1>
        <p className="text-base-content/70 mt-1">
          Create and edit beatmaps for rhythm game songs
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

          {availableBeatmaps.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="difficulty-select" className="text-sm font-medium">Level:</label>
              <select
                id="difficulty-select"
                className="select select-bordered select-sm"
                value={selectedDifficulty}
                onChange={(e) => onSelectedDifficultyChange(e.target.value)}
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
  )
}
