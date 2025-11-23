import Container from '../components/Container'
import { DataTable } from '../components/DataTable';
import { useEffect } from 'react';

// Local game items type (matches slice)
type GameItems = {
  id: number;
  name: string;
  description: string;
  tier: number;
  asset_id: number;
  element_id: number;
  game_items_type_id: number;
  created_at: string;
  updated_at: string;
};

import { useDispatch, useSelector } from 'react-redux';
import { fetchGameItems } from '../features/gameItems/gameItemsSlice';
import type { RootState, AppDispatch } from '../store';

const GameItems = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameItems = useSelector((state: RootState) => state.gameItems.data ?? []);
  const loading = useSelector((state: RootState) => state.gameItems.loading);
  const error = useSelector((state: RootState) => state.gameItems.error);


  useEffect(() => {
      dispatch(fetchGameItems());
    }, [dispatch]);

  return (
    <Container>
      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading game items...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}


      <div className='overflow-x-auto'>
        <h1 className="text-2xl font-bold mb-4">Game Items</h1>
        <DataTable<GameItems>
          columns={[
            { header: '#', accessor: (_row: GameItems, i: number) => i + 1 as React.ReactNode },
            { header: 'Name', accessor: 'name' as keyof GameItems },
            { header: 'Description', accessor: (row: GameItems) => row.description || '-' },
            { header: 'Tier', accessor: (row: GameItems) => row.tier || '-' },
            { header: 'Asset ID', accessor: (row: GameItems) => row.asset_id || '-' },
            { header: 'Element ID', accessor: (row: GameItems) => row.element_id || '-' },
            { header: 'Game Items Type ID', accessor: (row: GameItems) => row.game_items_type_id || '-' },
            { header: 'Created At', accessor: (row: GameItems) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: GameItems) => row.updated_at || '-' },
          ]}
          data={gameItems as GameItems[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No Game Items found.'}
        />
      </div>
    </Container>
  )
}

export default GameItems