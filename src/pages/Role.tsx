import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchRoles, assignPermissionToRole, removePermissionFromRole } from '../features/roles/roleSlice';
import { fetchPermissions } from "../features/permissions/permissionsSlice";
import { DataTable } from '../components/DataTable';
import Container from '../components/Container';
import { useToast } from "../hooks/useToast";
import MultiSelect from '../components/MultiSelect';

// Local types to avoid `any` and satisfy ESLint/TS rules
type Permission = {
  id: number;
  name: string;
  description: string;
};

type RoleType = {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
};


const Role = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast, ToastContainer } = useToast();
  const {data, loading, error} = useSelector((state: RootState) => state.roles);
  const {data: permissionsData} = useSelector((state: RootState) => state.permissions)


  const columns =
    [
      { header: '#', accessor: (_row: RoleType, i: number) => i + 1 as React.ReactNode },
      { header: 'Role Name', accessor: (row: RoleType) => row.name },
      { header: 'Description', accessor: (row: RoleType) => row.description },
      { header: 'Permissions', accessor: (row: RoleType) => (
        <MultiSelect
          options={permissionsData as Permission[]}
          initialSelected={row.permissions.map((r) => r.id)}
          onAdd={(permissionId: number) => handleAddPermission(row.id, permissionId)}
          onRemove={(permissionId: number) => handleRemovePermission(row.id, permissionId)}
          onSuccess={(msg?: string) => showToast(msg || "Permission removed successfully ✅", "success")}
          onFailure={(err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            showToast(message || "Failed to remove permission ❌", "error");
          }}
        />
      )}
    ];

  useEffect(() => {
      dispatch(fetchRoles());
      dispatch(fetchPermissions());
    }, [dispatch]);


  const handleAddPermission = async (roleId: number, permissionId: number) => {
    try {
      await dispatch(assignPermissionToRole({ roleId, permissionId })).unwrap();
      dispatch(fetchRoles());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || "Failed to assign permission ❌", "error");
    }
  }

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await dispatch(removePermissionFromRole({ roleId, permissionId })).unwrap();
      dispatch(fetchRoles());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || "Failed to remove permission ❌", "error");
    }
  }

  

  if (loading) return (
    <Container className="items-center">
      <p>Loading...</p>
    </Container>
  )

  if (error) return (
    <Container className="items-center">
      <p className='text-bold'>Error: {error}</p>
    </Container>
  )


  if (!data || data.length === 0) return (
    <Container className="items-center">
      <p>No items found.</p>
    </Container>
  )

  return (
    <Container>
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
      <ToastContainer />
    </Container>
  )
}

export default Role