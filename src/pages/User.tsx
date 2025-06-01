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

  return (
    <div className='min-h-screen w-screen flex justify-center'>
        {loading && <p>Loading...</p>}
        {error && <p className='text-bold'>Error: {error}</p>}
        <div className="overflow-x-auto">
            <table className="table table-zebra">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Deleted At</th>
                        <th>Is Verified</th>
                    </tr>
                </thead>
                <tbody>
                {data && data.map((user, index) => (
                    <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.first_name || '-'}</td>
                    <td>{user.last_name || '-'}</td>
                    <td>{user.username || '-'}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                    <td>{user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}</td>
                    <td>{user.deleted_at ? new Date(user.deleted_at).toLocaleString() : '-'}</td>
                    <td>
                        {typeof user.is_verified === 'boolean'
                        ? user.is_verified
                            ? 'True'
                            : 'False'
                        : '-'}
                    </td>
                    </tr>
            ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default User