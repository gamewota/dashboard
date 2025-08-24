import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser, deleteUser } from '../features/users/userSlice';
import { fetchRoles } from '../features/roles/roleSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import { useHasPermission } from '../hooks/usePermissions';

const User = () => {
  const dispatch = useDispatch<AppDispatch>();
  const canBanUser = useHasPermission('user.ban')
  const {data, loading, error} = useSelector((state: RootState) => state.users);
  const {data: roles} = useSelector((state: RootState) => state.roles);
  const [formData, setFormData] = useState({
    userId: '',
    days: '',
    username: ''
  })
  const [tempRole, setTempRole] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles())
  },[dispatch]);

  const handleOpenBanUserModal = (id : number, username : string) => {
    const dialog = document.getElementById('ban_user') as HTMLDialogElement;
    setFormData({
      ...formData,
      userId: `${id}`, // keep as string
      username
    });
    dialog?.showModal();
  };

  const handleCloseBanUserModal = () => {
    const banDialog = document.getElementById('ban_user') as HTMLDialogElement;
    const confirmDialog = document.getElementById('ban_user_confirmation') as HTMLDialogElement;
    banDialog?.close()
    confirmDialog?.showModal()
  }

  const handleConfirmationBanUser = async () => {
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
  }

  const handleOpenDeleteUserModal = (id : number, username : string) => {
    const dialog = document.getElementById('delete_user_confirmation') as HTMLDialogElement;
    setFormData({
      ...formData,
      userId: `${id}`, // keep as string
      username
    });
    dialog?.showModal();
  };

  const handleConfirmationDeleteUser = async () => {
    const dialog = document.getElementById('ban_user_confirmation') as HTMLDialogElement;
    dialog?.close()
    const toastContainer = document.getElementById('toast-container-user');
    const toast = document.createElement('div');

    const result = await dispatch(deleteUser(Number(formData.userId)))

    if(deleteUser.fulfilled.match(result)) {
      dispatch(fetchUsers())
      setFormData({
        userId: '',
        days: '',
        username: ''
      })
      toast.className = 'alert alert-success';
      toast.innerHTML = `<span>User has been successfully deleted</span>`;
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
      toast.innerHTML = `<span>Failed to delete the user</span>`;
      toastContainer?.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000)
      
    }
  }
  


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
            <div className='w-[90vw] h-[80vh] overflow-scroll'>
              <table className="table table-zebra">
                  <thead>
                  <tr>
                    <th className="sticky top-0 bg-base-200">#</th>
                    <th className="sticky top-0 bg-base-200">First Name</th>
                    <th className="sticky top-0 bg-base-200">Last Name</th>
                    <th className="sticky top-0 bg-base-200">Username</th>
                    <th className="sticky top-0 bg-base-200">Email</th>
                    <th className="sticky top-0 bg-base-200">Is Verified</th>
                    <th className="sticky top-0 bg-base-200">Created At</th>
                    <th className="sticky top-0 bg-base-200">Updated At</th>
                    <th className="sticky top-0 bg-base-200">Deleted At</th>
                    <th className="sticky top-0 bg-base-200">Unbanned At</th>
                    <th className="sticky top-0 bg-base-200">Roles</th>
                    <th className="sticky top-0 bg-base-200">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {data && data.map((user, index) => (
                      <tr key={user.user_id}>
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
                      <td>{user.profile_created_at ? new Date(user.profile_created_at).toLocaleString() : '-'}</td>
                      <td>{user.profile_updated_at ? new Date(user.profile_updated_at).toLocaleString() : '-'}</td>
                      <td>{user.profile_deleted_at ? new Date(user.profile_deleted_at).toLocaleString() : '-'}</td>
                      <td>{user.unbanned_at ? new Date(user.unbanned_at).toLocaleString() : '-'}</td>
                      <td className='min-w-[220px]'>
                        <div className="flex items-center gap-2">
                          <select
                            className="select select-sm"
                            // value={tempRole[user.user_id] || user.role || ''}
                            onChange={(e) =>
                              setTempRole({ ...tempRole, [user.user_id]: e.target.value })
                            }
                          >
                            <option value="">Select role</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.name}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              // handleChangeUserRole(user.user_id, tempRole[user.user_id])
                              console.log('test')
                            }
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className='flex align-center justify-center gap-3'>
                          {canBanUser && (
                              <button className='btn btn-error btn-sm' onClick={() => handleOpenBanUserModal(user.user_id, user.username)}>Ban</button>
                          )}
                          <button className='btn btn-error btn-sm' onClick={() => handleOpenDeleteUserModal(user.user_id, user.username)}>Delete</button>
                        </div>
                      </td>
                      </tr>
                    ))}
                  </tbody>
              </table>

            </div>
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
                  <button className='btn btn-error' onClick={handleCloseBanUserModal}>
                    Ban User
                  </button>
                </div>
              </div>
            </dialog>
            <div className="toast toast-top toast-end z-50" id="toast-container-user"></div>
            <dialog id='ban_user_confirmation' className='modal'>
              <div className='modal-box'>
                <h1>Are you sure you want to ban user {formData.username} for {formData.days} days?</h1>
                <div className='modal-action'>
                  <form method='dialog'>
                    <button className='btn'>Cancel</button>
                  </form>
                  <button className='btn btn-primary' onClick={handleConfirmationBanUser}>
                    Confirm
                  </button>
                </div>
              </div>
            </dialog>
            {/* delete user dialog */}
            <dialog id='delete_user_confirmation' className='modal'>
              <div className='modal-box'>
                <h1>Are you sure you want to delete user {formData.username}</h1>
                <div className='modal-action'>
                  <form method='dialog'>
                    <button className='btn'>Cancel</button>
                  </form>
                  <button className='btn btn-primary' onClick={handleConfirmationDeleteUser}>
                    Confirm
                  </button>
                </div>
              </div>
            </dialog>
        </div>
    </div>
  )
}

export default User