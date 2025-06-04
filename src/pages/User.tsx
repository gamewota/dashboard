import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../features/users/userSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect } from 'react';

const User = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {data, loading, error} = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  },[dispatch]);


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
        <div className="overflow-x-auto">
            <table className="table table-zebra">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Is Verified</th>
                        <th>Access Token</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Deleted At</th>
                    </tr>
                </thead>
                <tbody>
                {data && data.map((user, index) => (
                    <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.first_name || '-'}</td>
                    <td>{user.last_name || '-'}</td>
                    <td>{user.username || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                        {typeof user.is_verified === 'boolean'
                        ? user.is_verified
                            ? 'True'
                            : 'False'
                        : '-'}
                    </td>
                    <td>{user.access_token || '-'}</td>
                    <td>{user.profile_created_at ? new Date(user.profile_created_at).toLocaleString() : '-'}</td>
                    <td>{user.profile_updated_at ? new Date(user.profile_updated_at).toLocaleString() : '-'}</td>
                    <td>{user.profile_deleted_at ? new Date(user.profile_deleted_at).toLocaleString() : '-'}</td>
                    </tr>
            ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default User