import { useDispatch, useSelector } from 'react-redux';
import { fetchSongs } from '../features/songs/songSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';

const Song = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data, loading, error} = useSelector((state: RootState) => state.songs);

    const columns = 
      [
        {header: '#', accessor: (_row : any, i: number) => i + 1 as React.ReactNode},
        {header: 'Song Title', accessor: (row: any) => row.song_title},
        {header: 'Song Assets', accessor: (row: any) => row.song_assets ? <img src={row.song_assets} className='max-w-[100px]'/> : '-'},
        {header: 'Created At', accessor: (row: any) => row.created_at || '-'},
        {header: 'Updated At', accessor: (row: any) => row.updated_at || '-'}
      ]


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
            <DataTable 
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