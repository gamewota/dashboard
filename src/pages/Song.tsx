import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSongs, fetchSongById, clearSelectedSong } from '../features/songs/songSlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';
import Modal from '../components/Modal';

// Local Song type to avoid `any`
type Song = {
  song_id?: number;
  song_title: string;
  song_assets: string | null;
  created_at: string;
  updated_at: string;
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Song = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { data, loading, error, selectedSong, selectedSongLoading } = useSelector((state: RootState) => state.songs);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleDetailClick = (songId: number) => {
        dispatch(fetchSongById(songId));
        setIsDetailModalOpen(true);
    };

    const handleEditBeatmapClick = (songId: number) => {
        navigate(`/dashboard/${songId}/beatmap-editor`);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        dispatch(clearSelectedSong());
    };

    const columns: Column<Song>[] = [
        { header: '#', accessor: (_row: Song, i: number) => i + 1 as React.ReactNode },
        { header: 'Song Title', accessor: (row: Song) => row.song_title },
        { header: 'Song Assets', accessor: (row: Song) => row.song_assets ? <img src={row.song_assets} className='max-w-25' alt={row.song_title} /> : '-' },
        { header: 'Created At', accessor: (row: Song) => row.created_at || '-' },
        { header: 'Updated At', accessor: (row: Song) => row.updated_at || '-' },
        { 
            header: 'Actions', 
            accessor: (row: Song) => (
                <div className="flex gap-2">
                    <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleDetailClick(row.song_id || 0)}
                    >
                        Detail
                    </button>
                    <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditBeatmapClick(row.song_id || 0)}
                    >
                        Edit Beatmap
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        dispatch(fetchSongs());
    }, [dispatch]);

    if (loading) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
            <p>Loading...</p>
        </div>
    );

    if (error) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
            <p className='text-bold'>Error: {error}</p>
        </div>
    );

    if (!data || data.length === 0) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
            <p>No items found.</p>
        </div>
    );

    return (
        <Container>
            <div className='overflow-x-auto'>
                <DataTable<Song>
                    data={data}
                    loading={loading}
                    error={error}
                    emptyMessage={'No songs found.'}
                    columns={columns}
                />
            </div>

            {/* Song Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
                title={selectedSong?.song_title || 'Song Details'}
            >
                {selectedSongLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-infinity loading-lg text-warning"></span>
                    </div>
                ) : selectedSong ? (
                    <div className="space-y-4">
                        {/* Artwork */}
                        <div className="flex justify-center">
                            <img 
                                src={selectedSong.artwork_url} 
                                alt={selectedSong.song_title}
                                className="max-w-48 rounded-lg shadow-lg"
                            />
                        </div>

                        {/* Song Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Song ID</span>
                                <p className="font-medium">{selectedSong.song_id}</p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Element ID</span>
                                <p className="font-medium">{selectedSong.element_id}</p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Title</span>
                                <p className="font-medium">{selectedSong.song_title}</p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Reff Duration</span>
                                <p className="font-medium">{selectedSong.reff_duration}s</p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Reff Start</span>
                                <p className="font-medium">{selectedSong.reff_start}s</p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Reff End</span>
                                <p className="font-medium">{selectedSong.reff_end}s</p>
                            </div>
                        </div>

                        {/* Media URLs */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg">Media URLs</h4>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Audio URL</span>
                                <a 
                                    href={selectedSong.audio_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-primary truncate hover:underline"
                                >
                                    {selectedSong.audio_url}
                                </a>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <span className="text-sm text-gray-500">Video URL</span>
                                <a 
                                    href={selectedSong.video_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-primary truncate hover:underline"
                                >
                                    {selectedSong.video_url}
                                </a>
                            </div>
                        </div>

                        {/* Asset Keys */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg">Asset Keys</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="bg-base-200 p-3 rounded-lg">
                                    <span className="text-sm text-gray-500">Artwork Asset Key</span>
                                    <p className="font-mono text-sm">{selectedSong.artwork_asset_key}</p>
                                </div>
                                <div className="bg-base-200 p-3 rounded-lg">
                                    <span className="text-sm text-gray-500">Audio Asset Key</span>
                                    <p className="font-mono text-sm">{selectedSong.audio_asset_key}</p>
                                </div>
                                <div className="bg-base-200 p-3 rounded-lg">
                                    <span className="text-sm text-gray-500">Video Asset Key</span>
                                    <p className="font-mono text-sm">{selectedSong.video_asset_key}</p>
                                </div>
                            </div>
                        </div>

                        {/* Beatmaps */}
                        {selectedSong.beatmaps && selectedSong.beatmaps.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg">Beatmaps</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedSong.beatmaps.map((beatmap, index) => (
                                        <div key={index} className="bg-base-200 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <span className="badge badge-primary">{beatmap.difficulty_name}</span>
                                                <p className="font-mono text-xs mt-1 text-gray-500">{beatmap.beatmap_asset_key}</p>
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
                    <div className="flex justify-center items-center h-64">
                        <p>Failed to load song details.</p>
                    </div>
                )}
                
                <div className="modal-action">
                    <button className="btn" onClick={handleCloseModal}>Close</button>
                </div>
            </Modal>
        </Container>
    );
};

export default Song;
