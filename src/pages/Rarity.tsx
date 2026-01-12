import Container from '../components/Container'
import { fetchRarities } from '../features/cards/raritySlice';
import type { RarityType } from '../features/cards/raritySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';


type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};


const Rarity = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data, loading, error} = useSelector((state: RootState) => state.rarity);

    const columns : Column<RarityType>[] = [
        { header: '#', accessor: (_row: RarityType, i: number) => i + 1 as React.ReactNode },
        { header: 'Rarity Name', accessor: (row: RarityType) => row.name || '-' },
        { header: 'Probability', accessor: (row: RarityType) => row.probability || '-' },
        { header: 'Base Multiplier', accessor: (row: RarityType) => row.base_multiplier || '-' },
        { header: 'Incremental Multiplier', accessor: (row: RarityType) => row.increment_multiplier || '-' },
    ];

    useEffect(() => {
      dispatch(fetchRarities());
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


  return (
    <Container>
      <div className='overflow-x-auto'>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No Rarity found.'}
          columns={columns}
        />
      </div>
    </Container>
  )
}

export default Rarity