import { useRef } from 'react'
import { AudioScrubber, Waveform, type TimelineViewport } from '@gamewota/beatmap-editor'

interface AudioVisualizerProps {
  currentTime: number
  duration: number
  audioBuffer: AudioBuffer | null
  audioError: string | null
  songDuration: number
  viewport: TimelineViewport
  onSeek: (time: number) => void
}

export function AudioVisualizer({
  currentTime,
  duration,
  audioBuffer,
  audioError,
  songDuration,
  viewport,
  onSeek,
}: AudioVisualizerProps) {
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      {/* Audio Scrubber */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body p-4">
          <AudioScrubber
            currentTime={currentTime}
            duration={duration || songDuration}
            onSeek={onSeek}
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
                onSeek={onSeek}
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
    </>
  )
}
