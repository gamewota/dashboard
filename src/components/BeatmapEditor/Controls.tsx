interface ControlsProps {
  isPlaying: boolean
  volume: number
  zoom: number
  snapEnabled: boolean
  snapDivision: 1 | 2 | 4 | 8 | 16
  sfxEnabled: boolean
  offsetMs: number
  bpm: number
  isDetectingBPM: boolean
  onTogglePlay: () => void
  onStop: () => void
  onVolumeChange: (volume: number) => void
  onZoomChange: (zoom: number) => void
  onSnapEnabledChange: (enabled: boolean) => void
  onSnapDivisionChange: (division: 1 | 2 | 4 | 8 | 16) => void
  onSfxEnabledChange: (enabled: boolean) => void
  onOffsetChange: (offset: number) => void
  onBpmChange: (bpm: number) => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function Controls({
  isPlaying,
  volume,
  zoom,
  snapEnabled,
  snapDivision,
  sfxEnabled,
  offsetMs,
  bpm,
  isDetectingBPM,
  onTogglePlay,
  onStop,
  onVolumeChange,
  onZoomChange,
  onSnapEnabledChange,
  onSnapDivisionChange,
  onSfxEnabledChange,
  onOffsetChange,
  onBpmChange,
  onExport,
  onImport,
}: ControlsProps) {
  return (
    <div className="card bg-base-200 shadow-lg">
      <div className="card-body p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Play/Pause Button */}
          <button
            className={`btn btn-circle ${isPlaying ? 'btn-error' : 'btn-primary'}`}
            onClick={onTogglePlay}
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
            onClick={onStop}
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
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
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
                onChange={(e) => onSnapEnabledChange(e.target.checked)}
              />
              <span className="text-sm">Snap</span>
            </label>
            <select
              className="select select-bordered select-xs"
              value={snapDivision}
              onChange={(e) => onSnapDivisionChange(Number(e.target.value) as 1 | 2 | 4 | 8 | 16)}
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
                onChange={(e) => onSfxEnabledChange(e.target.checked)}
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
              onChange={(e) => onZoomChange(Number(e.target.value))}
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
              onChange={(e) => onOffsetChange(Number(e.target.value))}
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
              onChange={(e) => onBpmChange(Number(e.target.value))}
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
                onChange={onImport}
              />
            </label>
            <button className="btn btn-sm btn-primary" onClick={onExport}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
