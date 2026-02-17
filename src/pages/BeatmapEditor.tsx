import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHasPermission } from '../hooks/usePermissions';
import { fetchSongs } from '../features/songs/songSlice';
import type { RootState, AppDispatch } from '../store';

type Song = {
  id: number;
  song_title: string;
  song_assets: string;
};

// Constants
const BEATMAP_EDITOR_URL = 'https://gamewota.github.io/beatmap-editor/';

export default function BeatmapEditor() {
  const dispatch = useDispatch<AppDispatch>();
  const canEditBeatmap = useHasPermission('beatmap.edit');
  const { data: songs, loading: songsLoading } = useSelector((state: RootState) => state.songs);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [selectedSong, setSelectedSong] = useState<number | null>(null);
  const [iframeUrl, setIframeUrl] = useState(BEATMAP_EDITOR_URL);

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  // Memoize song lookup to avoid unnecessary iterations
  const selectedSongData = useMemo(() => {
    if (!selectedSong) return null;
    return songs.find((s: Song) => s.id === selectedSong);
  }, [selectedSong, songs]);

  useEffect(() => {
    // Update iframe URL with selected song and user context
    let url = BEATMAP_EDITOR_URL;
    const params = new URLSearchParams();
    
    if (selectedSongData) {
      params.append('songId', String(selectedSongData.id));
      params.append('songTitle', selectedSongData.song_title);
      if (selectedSongData.song_assets) {
        params.append('songAssets', selectedSongData.song_assets);
      }
    }
    
    if (user) {
      params.append('userId', String(user.id));
      params.append('username', user.username);
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += '?' + queryString;
    }
    
    setIframeUrl(url);
  }, [selectedSongData, user]);

  if (!canEditBeatmap) {
    return (
      <div className="p-6 ml-0 md:ml-80">
        <div className="max-w-7xl mx-auto">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You don't have permission to access the Beatmap Editor. Please contact an administrator.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-0 md:ml-80">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Beatmap Editor</h1>
          <p className="text-base-content/70 mt-2">
            Create and edit beatmaps for rhythm game songs
          </p>
        </div>

        {/* Song Selection */}
        <div className="card bg-base-200 shadow-lg mb-4">
          <div className="card-body">
            <h2 className="card-title">Song Selection</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select a song to edit its beatmap</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedSong || ''}
                onChange={(e) => setSelectedSong(e.target.value ? Number(e.target.value) : null)}
                disabled={songsLoading}
              >
                <option value="">-- Select a song --</option>
                {songs.map((song: Song) => (
                  <option key={song.id} value={song.id}>
                    {song.song_title}
                  </option>
                ))}
              </select>
              {songsLoading && (
                <label className="label">
                  <span className="label-text-alt">Loading songs...</span>
                </label>
              )}
              {selectedSong && (
                <label className="label">
                  <span className="label-text-alt text-success">
                    Song data will be passed to the editor
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Embed the beatmap editor from GitHub Pages */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-0">
            <iframe
              src={iframeUrl}
              title="Beatmap Editor"
              className="w-full border-0"
              style={{ minHeight: '800px', height: 'calc(100vh - 200px)' }}
              allow="fullscreen"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 shadow-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">About</h2>
            <div className="space-y-2">
              <p>
                This beatmap editor is loaded directly from the{' '}
                <a
                  href="https://github.com/gamewota/beatmap-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  beatmap-editor repository
                </a>
                . All features and updates from the standalone editor are automatically available here.
              </p>
              <p className="text-sm text-base-content/70">
                <strong>Data Integration:</strong> The dashboard handles song data loading and user authentication. 
                Selected song information is passed to the editor via URL parameters for seamless integration.
              </p>
              <p className="text-sm text-base-content/70">
                <strong>Access Control:</strong> This page requires the <code className="badge badge-sm">beatmap.edit</code> permission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}