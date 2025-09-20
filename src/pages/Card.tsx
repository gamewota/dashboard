import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../features/cards/cardSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';

const Card = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.cards);

  const columns = [
    {header: '#', accessor: (_row: any, i: number) => i + 1 as React.ReactNode},
    {header: 'Card Name', accessor: (row: any) => row.name || '-'},
    {header: 'Art', accessor: (row: any) => row.art || '-'},
    {header: 'Card Element', accessor: (row: any) => row.element || '-'},
    {header: 'Card Variant Id', accessor: (row: any) => row.card_variant_id || '-'},
    {header: 'Rarity Id', accessor: (row: any) => row.rarity_id || '-'} 
  ]

  useEffect(() => {
    dispatch(fetchCards());
  }, [dispatch]);
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
          emptyMessage={'No cards found.'}
          columns={columns}
        />

      </div>
    </div>
  )
}

export default Card