import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../features/cards/cardSlice';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';

type CardItem = {
  id: number;
  name: string;
  art?: string | null;
  element?: string | null;
  card_variant_id?: number | null;
  rarity_id?: number | null;
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Card = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.cards);

  const columns: Column<CardItem>[] = [
    { header: '#', accessor: (_row: CardItem, i: number) => i + 1 as React.ReactNode },
    { header: 'Card Name', accessor: (row: CardItem) => row.name || '-' },
    { header: 'Art', accessor: (row: CardItem) => row.art || '-' },
    { header: 'Card Element', accessor: (row: CardItem) => row.element || '-' },
    { header: 'Card Variant Id', accessor: (row: CardItem) => row.card_variant_id ?? '-' },
    { header: 'Rarity Id', accessor: (row: CardItem) => row.rarity_id ?? '-' },
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