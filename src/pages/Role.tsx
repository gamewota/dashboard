import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchRoles } from '../features/roles/roleSlice';
import { useEffect } from 'react';


const Role = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.roles);
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
        <table className='table table-zebra'>
          <thead>
            <tr>
              <th>#</th>
              <th>Roles Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name || '-'}</td>
                <td>{item.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Role