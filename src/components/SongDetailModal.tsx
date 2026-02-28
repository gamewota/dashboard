import Modal from './Modal';
import type { SongDetail } from '../lib/schemas/song';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: SongDetail | null;
  loading: boolean;
  error: string | null;
}

export function SongDetailModal({ isOpen, onClose, song, loading, error }: SongDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={song?.song_title || 'Song Details'}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-infinity loading-lg text-warning"></span>
        </div>
      ) : song ? (
        <div className="space-y-4">
          {/* Artwork */}
          <div className="flex justify-center">
            <img 
              src={song.artwork_url} 
              alt={song.song_title}
              className="max-w-48 rounded-lg shadow-lg"
            />
          </div>

          {/* Song Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Song ID</span>
              <p className="font-medium">{song.song_id}</p>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Element ID</span>
              <p className="font-medium">{song.element_id ?? '-'}</p>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Title</span>
              <p className="font-medium">{song.song_title}</p>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Reff Duration</span>
              <p className="font-medium">{song.reff_duration != null ? `${song.reff_duration}s` : '-'}</p>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Reff Start</span>
              <p className="font-medium">{song.reff_start != null ? `${song.reff_start}s` : '-'}</p>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Reff End</span>
              <p className="font-medium">{song.reff_end != null ? `${song.reff_end}s` : '-'}</p>
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-2">
            <h4 className="font-bold text-lg">Media URLs</h4>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Audio URL</span>
              <a 
                href={song.audio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-primary truncate hover:underline"
              >
                {song.audio_url}
              </a>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="text-sm text-base-content/50">Video URL</span>
              <a 
                href={song.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-primary truncate hover:underline"
              >
                {song.video_url}
              </a>
            </div>
          </div>

          {/* Asset Keys */}
          <div className="space-y-2">
            <h4 className="font-bold text-lg">Asset Keys</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-base-200 p-3 rounded-lg">
                <span className="text-sm text-base-content/50">Artwork Asset Key</span>
                <p className="font-mono text-sm">{song.artwork_asset_key}</p>
              </div>
              <div className="bg-base-200 p-3 rounded-lg">
                <span className="text-sm text-base-content/50">Audio Asset Key</span>
                <p className="font-mono text-sm">{song.audio_asset_key}</p>
              </div>
              <div className="bg-base-200 p-3 rounded-lg">
                <span className="text-sm text-base-content/50">Video Asset Key</span>
                <p className="font-mono text-sm">{song.video_asset_key}</p>
              </div>
            </div>
          </div>

          {/* Beatmaps */}
          {song.beatmaps && song.beatmaps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Beatmaps</h4>
              <div className="grid grid-cols-1 gap-2">
                {song.beatmaps.map((beatmap) => (
                  <div key={beatmap.difficulty_name} className="bg-base-200 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="badge badge-primary">{beatmap.difficulty_name}</span>
                      <p className="font-mono text-xs mt-1 text-base-content/50">{beatmap.beatmap_asset_key}</p>
                    </div>
                    <a 
                      href={beatmap.beatmap_asset_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 flex-col gap-2">
          <p className="text-error">Failed to load song details.</p>
          {error && <p className="text-sm text-base-content/50">{error}</p>}
        </div>
      )}
      
      <div className="modal-action">
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
