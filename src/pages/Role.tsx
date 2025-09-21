import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchRoles, assignPermissionToRole, removePermissionFromRole } from '../features/roles/roleSlice';
import { fetchPermissions } from "../features/permissions/permissionsSlice";
import { useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useToast } from "../hooks/useToast";
import MultiSelect from '../components/MultiSelect';


const Role = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast, ToastContainer } = useToast();
  const {data, loading, error} = useSelector((state: RootState) => state.roles);
  const {data: permissionsData} = useSelector((state: RootState) => state.permissions)


  const columns = 
    [
      { header: '#', accessor: (_row: any, i: number) => i + 1 as React.ReactNode },
      { header: 'Role Name', accessor: (row: { name: string; description: string }) => row.name },
      { header: 'Description', accessor: (row: { name: string; description: string }) => row.description },
      {header: 'Permissions', accessor: (row: any) => (
        <MultiSelect 
          options={permissionsData}
          initialSelected={row.permissions.map((r: any) => r.id)}
          onAdd={(permissionId) => handleAddPermission(row.id, permissionId)}
          onRemove={(permissionId) => handleRemovePermission(row.id, permissionId)}
          onSuccess={(msg) => showToast(msg || "Permission removed successfully ✅", "success")}
          onFailure={(err : any) => showToast(err || "Failed to remove permission ❌", "error")}
        />
      )}
    ]

  useEffect(() => {
      dispatch(fetchRoles());
      dispatch(fetchPermissions());
    }, [dispatch]);


  const handleAddPermission = async (roleId: number, permissionId: number) => {
    try {
      await dispatch(assignPermissionToRole({roleId, permissionId})).unwrap();
      dispatch(fetchRoles())
    } catch (err : any) {
      showToast(err || "Failed to assign permission ❌", "error");
    }
  }

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      await dispatch(removePermissionFromRole({roleId, permissionId})).unwrap();
      dispatch(fetchRoles())
    } catch (err: any) {
      showToast(err || "Failed to remove permission ❌", "error");
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
    </div>
  )
}

export default Role