import { useEffect } from 'react'
import Container from '../components/Container'
import { DataTable } from '../components/DataTable';

// Local element type (matches slice)
type ElementType = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};
import { useDispatch, useSelector } from 'react-redux';
import { fetchElements } from '../features/elements/elementSlice';
import type { RootState, AppDispatch } from '../store';

const Element = () => {
  const dispatch = useDispatch<AppDispatch>();
  const elements = useSelector((state: RootState) => state.elements.data ?? []);
  const loading = useSelector((state: RootState) => state.elements.loading);
  const error = useSelector((state: RootState) => state.elements.error);

  useEffect(() => {
    dispatch(fetchElements());
  }, [dispatch]);

  return (
    <Container className="flex-col items-center">
      {loading && (
        <div className='flex items-center'>
          <span className="loading loading-spinner" />
          <span className="ml-2">Loading elements...</span>
        </div>
      )}

      {error && (
        <div className='text-error'>Error: {error}</div>
      )}



      <div className='overflow-x-auto'>
        <h1 className="text-2xl font-bold mb-4">Elements</h1>
        <DataTable<ElementType>
          columns={[
            { header: '#', accessor: (_row: ElementType, i: number) => i + 1 as React.ReactNode },
            { header: 'Name', accessor: 'name' as keyof ElementType },
            { header: 'Description', accessor: (row: ElementType) => row.description || '-' },
            { header: 'Created At', accessor: (row: ElementType) => row.created_at || '-' },
            { header: 'Updated At', accessor: (row: ElementType) => row.updated_at || '-' },
          ]}
          data={elements as ElementType[]}
          rowKey={'id'}
          loading={loading}
          error={error}
          emptyMessage={'No elements found.'}
        />
      </div>
    </Container>
  )
}

export default Element