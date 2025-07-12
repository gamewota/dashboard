import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser } from '../features/users/userSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import { useHasPermission } from '../hooks/usePermissions';

const User = () => {
  const dispatch = useDispatch<AppDispatch>();
  const canBanUser = useHasPermission('user.ban')
  const {data, loading, error} = useSelector((state: RootState) => state.users);
  const [formData, setFormData] = useState({
    userId: '',
    days: '',
    username: ''
  })

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
                        <th>Unbanned At</th>
                        {canBanUser && <th>Actions</th>}
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
                    <td>{user.unbanned_at ? new Date(user.unbanned_at).toLocaleString() : '-'}</td>
                    {canBanUser && (
                      <td>
                        <button className='btn btn-error btn-sm' onClick={() => {
                          const dialog = document.getElementById('ban_user') as HTMLDialogElement;
                          console.log('user id', user)
                          setFormData({...formData, 
                            userId: `${user.id}`,
                            username: user.username
                          })
                          dialog?.showModal()
                        }}>Ban</button>
                      </td>
                    )}
                    </tr>
            ))}
                </tbody>
            </table>
            <dialog id="ban_user" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Ban User</h3>
                <input 
                  className="input input-bordered w-full mt-2"
                  placeholder='Days' 
                  value={formData.days}
                  type='number'
                  onChange={(e) => setFormData({...formData, days: e.target.value})}
                />
                <div className="modal-action">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn">Close</button>
                  </form>
                  <button className='btn btn-error' onClick={() => {
                    const banDialog = document.getElementById('ban_user') as HTMLDialogElement;
                    const confirmDialog = document.getElementById('ban_user_confirmation') as HTMLDialogElement;
                    banDialog?.close()
                    confirmDialog?.showModal()
                  }}>
                    Ban User
                  </button>
                </div>
              </div>
            </dialog>
            <dialog id='ban_user_confirmation' className='modal'>
              <div className='modal-box'>
                <h1>Are you sure you want to ban user with id {formData.userId} for {formData.days} days?</h1>
                <div className='modal-action'>
                  <form method='dialog'>
                    <button className='btn'>Cancel</button>
                  </form>
                  <button className='btn btn-primary' onClick={async () => {
                    const dialog = document.getElementById('ban_user_confirmation') as HTMLDialogElement;
                    dialog?.close()
                    const toastContainer = document.getElementById('toast-container-user');
                    const toast = document.createElement('div');

                    const result = await dispatch(banUser({
                      userId: formData.userId,
                      days: formData.days
                    }))

                    if(banUser.fulfilled.match(result)) {
                      dispatch(fetchUsers())
                      setFormData({
                        userId: '',
                        days: '',
                        username: ''
                      })
                      toast.className = 'alert alert-success';
                      toast.innerHTML = `<span>${result.payload.message || 'User has been successfully baned'}</span>`;
                      toastContainer?.appendChild(toast);
                      setTimeout(() => {
                        toast.remove();
                      }, 3000)
                    } else {
                      setFormData({
                        userId: '',
                        days: '',
                        username: ''
                      })
                      toast.className = 'alert alert-error';
                      toast.innerHTML = `<span>${(result.payload as any).message || 'Failed to ban the user'}</span>`;
                      toastContainer?.appendChild(toast);
                      setTimeout(() => {
                        toast.remove();
                      }, 3000)
                      
                    }
                  }}>
                    Confirm
                  </button>
                </div>
              </div>
            </dialog>
            <div className="toast toast-top toast-end z-50" id="toast-container-user"></div>
        </div>
    </div>
  )
}

export default User