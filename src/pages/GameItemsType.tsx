import Container from '../components/Container'
import { DataTable } from '../components/DataTable';
import { useEffect } from 'react';

// Local game items type (matches slice)
type GameItemsType = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

import { useDispatch, useSelector } from 'react-redux';
import { fetchGameItemsTypes } from '../features/gameItemsType/gameItemsTypeSlice';
import type { RootState, AppDispatch } from '../store';

const GameItemsType = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameItemsTypes = useSelector((state: RootState) => state.gameItemsTypes.data ?? []);
  const loading = useSelector((state: RootState) => state.gameItemsTypes.loading);
  const error = useSelector((state: RootState) => state.gameItemsTypes.error);


  useEffect(() => {
      dispatch(fetchGameItemsTypes());
    }, [dispatch]);

  return (
    <Container>
      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading game items types...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}


      <div className='overflow-x-auto'>
        <h1 className="text-2xl font-bold mb-4">Game Items Types</h1>
        <DataTable<GameItemsType>
          columns={[
            { header: '#', accessor: (_row: GameItemsType, i: number) => i + 1 as React.ReactNode },
            { header: 'Name', accessor: 'name' as keyof GameItemsType },
            { header: 'Description', accessor: (row: GameItemsType) => row.description || '-' },
            { header: 'Created At', accessor: (row: GameItemsType) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: GameItemsType) => row.updated_at || '-' },
          ]}
          data={gameItemsTypes as GameItemsType[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No Game Items Types found.'}
        />
      </div>
    </Container>
  )
}

export default GameItemsType