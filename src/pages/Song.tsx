import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSongs } from '../features/songs/songSlice';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';

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
    const {data, loading, error} = useSelector((state: RootState) => state.songs);

    const columns: Column<Song>[] = [
      { header: '#', accessor: (_row: Song, i: number) => i + 1 as React.ReactNode },
      { header: 'Song Title', accessor: (row: Song) => row.song_title },
      { header: 'Song Assets', accessor: (row: Song) => row.song_assets ? <img src={row.song_assets} className='max-w-[100px]'/> : '-' },
      { header: 'Created At', accessor: (row: Song) => row.created_at || '-' },
      { header: 'Updated At', accessor: (row: Song) => row.updated_at || '-' }
    ];


      useEffect(() => {
        dispatch(fetchSongs());
      },[dispatch]);
      if (loading) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
          <p>Loading...</p>
        </div>
      )
      if (error) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
          <p className='text-bold'>Error: {error}</p>
        </div>
      )
      if (!data || data.length === 0) return (
        <div className='min-h-screen w-screen flex justify-center items-center'>
          <p>No items found.</p>
        </div>
      )
  return (
    <div className='min-h-screen w-screen flex justify-center'>
        <div className='overflow-x-auto'>
            <DataTable<Song>
              data={data}
              loading={loading}
              error={error}
              emptyMessage={'No songs found.'}
              columns={columns}
            />
        </div>
    </div>
  )
}

export default Song