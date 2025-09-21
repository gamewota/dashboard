import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser, deleteUser, updateUserRoles } from '../features/users/userSlice';
import { fetchRoles, assignRoles, deleteUserRoles } from '../features/roles/roleSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import { useHasPermission } from '../hooks/usePermissions';
import MultiSelect from '../components/MultiSelect';
import { DataTable } from '../components/DataTable';

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

  const columns = 
  [
    { header: '#', accessor: (_row: any, i: number) => i + 1 as React.ReactNode },
    { header: 'First Name', accessor: (row: any) => row.first_name || '-' },
    { header: 'Last Name', accessor: (row: any) => row.last_name || '-' },
    { header: 'Username', accessor: (row: any) => row.username || '-' },
    { header: 'Email', accessor: (row: any) => row.email || '-' },
    { header: 'Is Verified', accessor: (row: any) => typeof row.is_verified === 'boolean' ? (row.is_verified ? 'True' : 'False') : '-' },
    { header: 'Created At', accessor: (row: any) => row.profile_created_at ? new Date(row.profile_created_at).toLocaleString() : '-' },
    { header: 'Updated At', accessor: (row: any) => row.profile_updated_at ? new Date(row.profile_updated_at).toLocaleString() : '-' },
    { header: 'Deleted At', accessor: (row: any) => row.profile_deleted_at ? new Date(row.profile_deleted_at).toLocaleString() : '-' },
    { header: 'Unbanned At', accessor: (row: any) => row.unbanned_at ? new Date(row.unbanned_at).toLocaleString() : '-' },
    { header: 'Roles', accessor: (row: any) => (
      <MultiSelect
        options={roles}
        initialSelected={row.roles.map((r: any) => r.role_id)}
        onAdd={handleAddRole(row.user_id, row.roles, roles)}
        onRemove={handleRemoveRole(row.user_id, row.roles)}
        onSuccess={(msg) => {
            const toastContainer = document.getElementById('toast-container-user');
            const toast = document.createElement('div');
            toast.className = 'alert alert-success';
            toast.innerHTML = `<span>${msg}</span>`;
            toastContainer?.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }}
        onFailure={(err) => {
            const toastContainer = document.getElementById('toast-container-user');
            const toast = document.createElement('div');
            toast.className = 'alert alert-error';
            toast.innerHTML = `<span>${String(err)}</span>`;
            toastContainer?.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }}
        formatAddMessage={(option) => `Role "${option.name}" has been assigned`}
        formatRemoveMessage={(option) => `Role "${option.name}" has been removed`}
        addButtonLabel="Add Role"
        emptyLabel="No roles selected"
        />
        )},
        { header: 'Actions', accessor: (row: any) => (
          <div className='flex align-center justify-center gap-3'>
            {canBanUser && (
              <button className='btn btn-error btn-sm' onClick={() => handleOpenBanUserModal(row.user_id, row.username)}>Ban</button>
            )}
              <button className='btn btn-error btn-sm' onClick={() => handleOpenDeleteUserModal(row.user_id, row.username)}>Delete</button>
          </div>
          )
        }
      ]

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

  const handleAddRole = (userId: number, userRoles: any[], roles: any[]) => async (roleId: number) => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);

  await dispatch(assignRoles({ userId, roleId, grantedBy: userLogin.id })).unwrap();

  const newRoles = [
    ...userRoles,
    {
      role_id: roleId,
      role_name: roles.find((r) => r.id === roleId)?.name || "",
      role_description: roles.find((r) => r.id === roleId)?.description || "",
      granted_by: userLogin.id,
      expires_at: null,
      granted_at: new Date().toISOString(),
    },
  ];
  dispatch(updateUserRoles({ userId, roles: newRoles }));
};

const handleRemoveRole = (userId: number, userRoles: any[]) => async (roleId: number) => {
  await dispatch(deleteUserRoles({ roleId, userId })).unwrap();
  const newRoles = userRoles.filter((r) => r.role_id !== roleId);
  dispatch(updateUserRoles({ userId, roles: newRoles }));
};

  


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
              <DataTable 
                data={data}
                loading={loading}
                error={error}
                emptyMessage={'No users found.'}
                columns={columns}
              />

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