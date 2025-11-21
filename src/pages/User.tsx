import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser, deleteUser, updateUserRoles } from '../features/users/userSlice';
import { fetchRoles, assignRoles, deleteUserRoles } from '../features/roles/roleSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import Container from '../components/Container';
import Modal from '../components/Modal';
import { useHasPermission } from '../hooks/usePermissions';
import MultiSelect from '../components/MultiSelect';
import type { MultiSelectOption } from '../components/MultiSelect';
import { DataTable } from '../components/DataTable';

// Local types (mirror of slice shapes) to avoid `any`
type UserRole = {
  role_id: number;
  role_name: string;
  role_description: string;
  granted_by: number;
  expires_at: string | null;
  granted_at: string;
};

type UserItem = {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  profile_created_at: string;
  profile_updated_at: string;
  profile_deleted_at: string | null;
  is_verified: boolean;
  unbanned_at: string | null;
  roles: UserRole[];
};

type RoleSimple = {
  id: number;
  name: string;
  description: string;
};

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

  const { showToast, ToastContainer } = useToast();

  const columns = 
  [
    { header: '#', accessor: (_row: UserItem, i: number) => i + 1 as React.ReactNode },
    { header: 'First Name', accessor: (row: UserItem) => row.first_name || '-' },
    { header: 'Last Name', accessor: (row: UserItem) => row.last_name || '-' },
    { header: 'Username', accessor: (row: UserItem) => row.username || '-' },
    { header: 'Email', accessor: (row: UserItem) => row.email || '-' },
    { header: 'Is Verified', accessor: (row: UserItem) => typeof row.is_verified === 'boolean' ? (row.is_verified ? 'True' : 'False') : '-' },
    { header: 'Created At', accessor: (row: UserItem) => row.profile_created_at ? new Date(row.profile_created_at).toLocaleString() : '-' },
    { header: 'Updated At', accessor: (row: UserItem) => row.profile_updated_at ? new Date(row.profile_updated_at).toLocaleString() : '-' },
    { header: 'Deleted At', accessor: (row: UserItem) => row.profile_deleted_at ? new Date(row.profile_deleted_at).toLocaleString() : '-' },
    { header: 'Unbanned At', accessor: (row: UserItem) => row.unbanned_at ? new Date(row.unbanned_at).toLocaleString() : '-' },
    { header: 'Roles', accessor: (row: UserItem) => (
      <MultiSelect
        options={roles as RoleSimple[]}
        initialSelected={row.roles.map((r: UserRole) => r.role_id)}
        onAdd={handleAddRole(row.user_id, row.roles, roles as RoleSimple[])}
        onRemove={handleRemoveRole(row.user_id, row.roles)}
        onSuccess={(msg?: string) => showToast(msg || 'Success', 'success')}
        onFailure={(err?: unknown) => showToast(String(err) || 'Error', 'error')}
  formatAddMessage={(option: MultiSelectOption<number>) => `Role "${option.name}" has been assigned`}
  formatRemoveMessage={(option: MultiSelectOption<number>) => `Role "${option.name}" has been removed`}
        addButtonLabel="Add Role"
        emptyLabel="No roles selected"
        />
        )},
        { header: 'Actions', accessor: (row: UserItem) => (
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
  // use centralized toast
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
      const payload = result.payload as { message?: string } | undefined;
      showToast(payload?.message || 'User has been successfully baned', 'success');
    } else {
      setFormData({
        userId: '',
        days: '',
        username: ''
      })
      const payload = result.payload as { message?: string } | undefined;
      showToast(payload?.message || 'Failed to ban the user', 'error');
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
    const result = await dispatch(deleteUser(Number(formData.userId)))

    if(deleteUser.fulfilled.match(result)) {
      dispatch(fetchUsers())
      setFormData({
        userId: '',
        days: '',
        username: ''
      })
      showToast('User has been successfully deleted', 'success');
    } else {
      setFormData({
        userId: '',
        days: '',
        username: ''
      })
      showToast('Failed to delete the user', 'error');
    }
  }

  const handleAddRole = (userId: number, userRoles: UserRole[], rolesList: RoleSimple[]) =>
    async (roleId: number) => {
      const userLogin = JSON.parse(localStorage.getItem("user") || '{}') as { id?: number };

      await dispatch(assignRoles({ userId, roleId, grantedBy: userLogin.id ?? 0 })).unwrap();

      const newRoles: UserRole[] = [
        ...userRoles,
        {
          role_id: roleId,
          role_name: rolesList.find((r) => r.id === roleId)?.name || "",
          role_description: rolesList.find((r) => r.id === roleId)?.description || "",
          granted_by: userLogin.id ?? 0,
          expires_at: null,
          granted_at: new Date().toISOString(),
        },
      ];
      dispatch(updateUserRoles({ userId, roles: newRoles }));
    };

  const handleRemoveRole = (userId: number, userRoles: UserRole[]) => async (roleId: number) => {
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
    <Container>
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
            <Modal
              id="ban_user"
              title="Ban User"
              footer={
                <>
                  <form method="dialog">
                    <button className="btn">Close</button>
                  </form>
                  <button className='btn btn-error' onClick={handleCloseBanUserModal}>
                    Ban User
                  </button>
                </>
              }
            >
              <input 
                className="input input-bordered w-full mt-2"
                placeholder='Days' 
                value={formData.days}
                type='number'
                onChange={(e) => setFormData({...formData, days: e.target.value})}
              />
            </Modal>
            <ToastContainer />
            <Modal
              id='ban_user_confirmation'
              title={`Are you sure you want to ban user ${formData.username} for ${formData.days} days?`}
              footer={
                <>
                  <form method='dialog'>
                    <button className='btn'>Cancel</button>
                  </form>
                  <button className='btn btn-primary' onClick={handleConfirmationBanUser}>
                    Confirm
                  </button>
                </>
              }
            />
            {/* delete user dialog */}
            <Modal
              id='delete_user_confirmation'
              title={`Are you sure you want to delete user ${formData.username}`}
              footer={
                <>
                  <form method='dialog'>
                    <button className='btn'>Cancel</button>
                  </form>
                  <button className='btn btn-primary' onClick={handleConfirmationDeleteUser}>
                    Confirm
                  </button>
                </>
              }
            />
        </div>
    </Container>
  )
}

export default User