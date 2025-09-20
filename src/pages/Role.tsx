import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchRoles } from '../features/roles/roleSlice';
import { useEffect } from 'react';
import { DataTable } from '../components/DataTable';


const Role = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.roles);

  const columns = 
    [
      { header: '#', accessor: (_row: any, i: number) => i + 1 as React.ReactNode },
      { header: 'Role Name', accessor: (row: { name: string; description: string }) => row.name },
      { header: 'Description', accessor: (row: { name: string; description: string }) => row.description },
    ]

  useEffect(() => {
      dispatch(fetchRoles());
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
        <h1 className='mb-3'>All Roles</h1>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          emptyMessage={'No roles found.'}
        />
      </div>
    </div>
  )
}

export default Role