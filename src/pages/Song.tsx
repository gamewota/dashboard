import { useEffect, useState, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSongs, fetchSongById, clearSelectedSong, deleteSong } from '../features/songs/songSlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';
import { SongDetailModal } from '../components/SongDetailModal';
import { AddSongModal } from '../components/AddSongModal';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../hooks/useToast';

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
  accessor: keyof T | ((row: T, index: number) => ReactNode);
};

const Song = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { data, loading, error, selectedSong, selectedSongLoading, selectedSongError } = useSelector((state: RootState) => state.songs);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ songId: number; songTitle: string } | null>(null);
    const { showToast, ToastContainer } = useToast();

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

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleDeleteClick = (songId: number, songTitle: string) => {
        setDeleteConfirm({ songId, songTitle });
    };

    const handleCloseDeleteModal = () => {
        setDeleteConfirm(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await dispatch(deleteSong(deleteConfirm.songId)).unwrap();
            showToast(`"${deleteConfirm.songTitle}" has been deleted successfully`, 'success');
            setDeleteConfirm(null);
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to delete song', 'error');
        }
    };

    const columns: Column<Song>[] = [
        { header: '#', accessor: (_row: Song, i: number) => i + 1 as ReactNode },
        { header: 'Song Title', accessor: (row: Song) => row.song_title },
        { header: 'Song Assets', accessor: (row: Song) => row.song_assets ? <img src={row.song_assets} className='max-w-25' alt={row.song_title} /> : '-' },
        { header: 'Created At', accessor: (row: Song) => row.created_at || '-' },
        { header: 'Updated At', accessor: (row: Song) => row.updated_at || '-' },
        { 
            header: 'Actions', 
            accessor: (row: Song) => (
                <div className="flex gap-2">
                    <Button 
                        variant="info"
                        size="sm"
                        disabled={!row.song_id}
                        onClick={() => {
                            if (row.song_id != null) {
                                handleDetailClick(row.song_id);
                            }
                        }}
                    >
                        Detail
                    </Button>
                    <Button 
                        variant="primary"
                        size="sm"
                        disabled={!row.song_id}
                        onClick={() => {
                            if (row.song_id != null) {
                                handleEditBeatmapClick(row.song_id);
                            }
                        }}
                    >
                        Edit Beatmap
                    </Button>
                    <Button 
                        variant="error"
                        size="sm"
                        disabled={!row.song_id}
                        onClick={() => {
                            if (row.song_id != null) {
                                handleDeleteClick(row.song_id, row.song_title);
                            }
                        }}
                    >
                        Delete
                    </Button>
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
                <div className="flex justify-end mb-2">
                    <Button 
                        variant="primary"
                        size="sm"
                        onClick={handleOpenAddModal}
                    >
                        + Add New Song
                    </Button>
                </div>
                <DataTable<Song>
                    data={data}
                    loading={loading}
                    error={error}
                    emptyMessage={'No songs found.'}
                    columns={columns}
                />
            </div>

            <SongDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
                song={selectedSong}
                loading={selectedSongLoading}
                error={selectedSongError}
            />

            <AddSongModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={(songTitle) => showToast(`"${songTitle}" has been created successfully`, 'success')}
            />

            <Modal
                isOpen={!!deleteConfirm}
                onClose={handleCloseDeleteModal}
                title="Confirm Delete"
                footer={
                    <>
                        <Button variant="ghost" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="error" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                {deleteConfirm && (
                    <p>
                        Are you sure you want to delete <strong>&quot;{deleteConfirm.songTitle}&quot;</strong>?
                        This action cannot be undone.
                    </p>
                )}
            </Modal>

            <ToastContainer />
        </Container>
    );
}

export default Song;
