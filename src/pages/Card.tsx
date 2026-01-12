import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../features/cards/cardSlice';
import type { CardType } from '../features/cards/cardSlice';
import { useEffect, useState } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';
import { Button } from '../components/Button';
import AddCardModal from '../components/AddCardModal';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Card = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.cards);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<CardType>[] = [
    { header: '#', accessor: (_row: CardType, i: number) => i + 1 as React.ReactNode },
    { header: 'Card Name', accessor: (row: CardType) => row.name || '-' },
    { header: 'Art', accessor: (row: CardType) => row.url ? <img src={row.url} alt={row.name} style={{ width: '50px', height: '50px' }} /> : '-' },
    { header: 'Card Element', accessor: (row: CardType) => row.element_name || '-' },
    { header: 'Card Variant Id', accessor: (row: CardType) => row.variant_name ?? '-' },
    { header: 'Rarity Id', accessor: (row: CardType) => row.rarity_name ?? '-' },
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // refresh list after potential add
    dispatch(fetchCards());
  };
  return (
    <Container>
      <div className='overflow-x-auto'>
        <div className='flex justify-end mb-3'>
         <Button variant='primary' onClick={openModal}>Add Card</Button>
        </div>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No cards found.'}
          columns={columns}
        />
      </div>
      <AddCardModal isOpen={isModalOpen} onClose={closeModal} />
    </Container>
  )
}

export default Card