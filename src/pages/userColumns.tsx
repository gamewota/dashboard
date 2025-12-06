import MultiSelect from '../components/MultiSelect';
import type { MultiSelectOption } from '../components/MultiSelect';
import { Button } from '../components/Button';

// Local types (kept here to avoid changing other files)
export type UserRole = {
  role_id: number;
  role_name: string;
  role_description: string;
  granted_by: number;
  expires_at: string | null;
  granted_at: string;
};

export type UserItem = {
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

export type RoleSimple = {
  id: number;
  name: string;
  description: string;
};

type Params = {
  roles: RoleSimple[] | undefined;
  handleAddRole: (userId: number, userRoles: UserRole[], rolesList: RoleSimple[]) => (roleId: number) => Promise<void>;
  handleRemoveRole: (userId: number, userRoles: UserRole[]) => (roleId: number) => Promise<void>;
  showToast: (msg: string, variant?: 'success' | 'error' | 'info' | 'warning') => void;
  canBanUser: boolean;
  handleOpenBanUserModal: (id: number, username: string) => void;
  handleOpenDeleteUserModal: (id: number, username: string) => void;
};

export function getUserColumns({
  roles,
  handleAddRole,
  handleRemoveRole,
  showToast,
  canBanUser,
  handleOpenBanUserModal,
  handleOpenDeleteUserModal,
}: Params) {
  const roleOptions = (roles ?? []) as RoleSimple[];

  const columns = [
    { header: '#', accessor: (_row: UserItem, i: number) => i + 1 },
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
        options={roleOptions}
        initialSelected={row.roles.map((r: UserRole) => r.role_id)}
        onAdd={handleAddRole(row.user_id, row.roles, roleOptions)}
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
          <Button variant="error" size="sm" onClick={() => handleOpenBanUserModal(row.user_id, row.username)}>Ban</Button>
        )}
        <Button variant="error" size="sm" onClick={() => handleOpenDeleteUserModal(row.user_id, row.username)}>Delete</Button>
      </div>
    )}
  ];

  return columns;
}

export default getUserColumns;
