import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../features/cards/cardSlice';
import type { Card } from '../features/cards/cardSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Card = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.cards);

  const columns: Column<Card>[] = [
    { header: '#', accessor: (_row: Card, i: number) => i + 1 as React.ReactNode },
    { header: 'Card Name', accessor: (row: Card) => row.name || '-' },
    { header: 'Art', accessor: (row: Card) => row.url ? <img src={row.url} alt={row.name} style={{ width: '50px', height: '50px' }} /> : '-' },
    { header: 'Card Element', accessor: (row: Card) => row.element_name || '-' },
    { header: 'Card Variant Id', accessor: (row: Card) => row.variant_name ?? '-' },
    { header: 'Rarity Id', accessor: (row: Card) => row.rarity_name ?? '-' },
  ];

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
    <Container>
      <div className='overflow-x-auto'>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No cards found.'}
          columns={columns}
        />
      </div>
    </Container>
  )
}

export default Card