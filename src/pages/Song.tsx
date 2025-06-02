import { useDispatch, useSelector } from 'react-redux';
import { fetchSongs } from '../features/songs/songSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';

const Song = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data, loading, error} = useSelector((state: RootState) => state.songs);


      useEffect(() => {
        dispatch(fetchSongs());
      },[dispatch]);
    if (loading) return <p>Loading...</p>;
    if (error) return <p className='text-bold'>Error: {error}</p>;
    if (!data || data.length === 0) return <p>No items found.</p>;
  return (
    <div className='min-h-screen w-screen flex justify-center'>
        <div className='overflow-x-auto'>
            <table className='table table-zebra'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Song Title</th>
                        <th>Song Assets</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Deleted At</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((song,index) => (
                        <tr key={song.id}>
                            <td>{index + 1}</td>
                            <td>{song.song_title || '-'}</td>
                            <td>{song.song_assets ? <img src={song.song_assets} className='max-w-[100px]'/> : '-'}</td>
                            <td>{song.created_at || '-'}</td>
                            <td>{song.updated_at || '-'}</td>
                            <td>{song.deleted_at || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Song