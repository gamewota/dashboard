import Container from '../components/Container'
import { fetchCurrencies } from '../features/currencies/currencySlice';
import type { CurrencyType } from '../features/currencies/currencySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store';
import { DataTable } from '../components/DataTable';

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Currency = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.currency);

  const columns : Column<CurrencyType>[] = [
    { header: '#', accessor: (_row: CurrencyType, i: number) => i + 1 as React.ReactNode },
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: (row: CurrencyType) => row.name ?? '-' },
    { header: 'Code', accessor: (row: CurrencyType) => row.code ?? '-' },
  ];

  useEffect(() => {
    dispatch(fetchCurrencies());
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
      <p>No currencies found.</p>
    </div>
  )

  return (
    <Container>
      <div className='overflow-x-auto'>
        <DataTable 
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No currencies found.'}
          columns={columns}
        />
      </div>
    </Container>
  )
}

export default Currency
