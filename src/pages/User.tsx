import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser, deleteUser, updateUserRoles } from '../features/users/userSlice';
import { fetchRoles, assignRoles, deleteUserRoles } from '../features/roles/roleSlice';
import type { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import { getUserColumns } from './userColumns';
import { useToast } from '../hooks/useToast';
import Container from '../components/Container';
import Modal from '../components/Modal';
import { Button } from '../components/Button';
import { useHasPermission } from '../hooks/usePermissions';
// columns moved to separate module
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
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // columns are created after handler functions so closures capture defined values

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles())
  },[dispatch]);

  const handleOpenBanUserModal = (id : number, username : string) => {
    setFormData({
      ...formData,
      userId: `${id}`, // keep as string
      username
    });
    setIsBanOpen(true);
  };

  const handleCloseBanUserModal = () => {
    // close ban dialog and open confirmation dialog
    setIsBanOpen(false);
    setIsBanConfirmOpen(true);
  }

  const handleConfirmationBanUser = async () => {
    // close confirmation dialog
    setIsBanConfirmOpen(false);
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
      showToast(payload?.message || 'User has been successfully banned', 'success');
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
    setFormData({
      ...formData,
      userId: `${id}`, // keep as string
      username
    });
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmationDeleteUser = async () => {
    // close delete confirmation
    setIsDeleteConfirmOpen(false);
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

  // create columns after handlers so the handlers exist when building callbacks
  const columns = getUserColumns({
    roles: roles as RoleSimple[] | undefined,
    handleAddRole,
    handleRemoveRole,
    showToast,
    canBanUser,
    handleOpenBanUserModal,
    handleOpenDeleteUserModal,
  });

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
              isOpen={isBanOpen}
              onClose={() => setIsBanOpen(false)}
              title="Ban User"
              footer={
                <>
                  <Button onClick={() => setIsBanOpen(false)}>Close</Button>
                  <Button variant="error" onClick={handleCloseBanUserModal}>
                    Ban User
                  </Button>
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
              isOpen={isBanConfirmOpen}
              onClose={() => setIsBanConfirmOpen(false)}
              title={`Are you sure you want to ban user ${formData.username} for ${formData.days} days?`}
              footer={
                <>
                  <Button onClick={() => setIsBanConfirmOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleConfirmationBanUser}>
                    Confirm
                  </Button>
                </>
              }
            />
            {/* delete user dialog */}
            <Modal
              id='delete_user_confirmation'
              isOpen={isDeleteConfirmOpen}
              onClose={() => setIsDeleteConfirmOpen(false)}
              title={`Are you sure you want to delete user ${formData.username}`}
              footer={
                <>
                  <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleConfirmationDeleteUser}>
                    Confirm
                  </Button>
                </>
              }
            />
        </div>
    </Container>
  )
}

export default User