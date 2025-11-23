import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "../components/DataTable";
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../features/permissions/permissionsSlice";
import type { RootState, AppDispatch } from "../store";
import { PermissionModal } from "../components/PermissionModal";
import { useToast } from "../hooks/useToast";
import Container from '../components/Container';
import { Button } from '../components/Button';

// Local types to avoid `any`
type PermissionItem = {
  id: number;
  name: string;
  description: string;
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

const Permission = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast, ToastContainer } = useToast();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.permissions
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] =
    useState<{ id?: number; name: string; description: string }>();

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const columns: Column<PermissionItem>[] = [
  { header: "#", accessor: (_row: PermissionItem, i: number) => i + 1 },
    { header: "Name", accessor: (row: PermissionItem) => row.name },
    { header: "Description", accessor: (row: PermissionItem) => row.description },
          {
            header: "Actions",
            accessor: (row: { id: number; name: string; description: string }) => (
              <div className="flex gap-2">
                <Button
                  variant="warning"
                  size="xs"
                  onClick={() => {
                    setModalMode("edit");
                    setSelected(row);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="error"
                  size="xs"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]

  const handleSave = async (formData: { id?: number; name: string; description: string }) => {
    try {
      if (modalMode === "create") {
        await dispatch(createPermission({
          name: formData.name,
          description: formData.description,
        })).unwrap();
        showToast("Permission created successfully ✅", "success");
      } else if (modalMode === "edit" && formData.id !== undefined) {
        await dispatch(updatePermission({
          id: formData.id,
          name: formData.name,
          description: formData.description,
        })).unwrap();
        showToast("Permission updated successfully ✏️", "success");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast(message || "Something went wrong ❌", "error");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
        await dispatch(deletePermission(id)).unwrap()
        showToast("Permission deleted successfully ✅", "success")
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showToast(message || "Something went wrong ❌", "error");
  }
  }

  return (
    <Container className="flex-col items-center p-4">
      <div className="w-full max-w-5xl flex justify-end mb-4">
        <Button
          variant="primary"
          onClick={() => {
            setModalMode("create");
            setSelected(undefined);
            setIsModalOpen(true);
          }}
        >
          Add Permission
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        rowKey="id"
        loading={loading}
        error={error}
      />

      <PermissionModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selected}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
      <ToastContainer />
    </Container>
  );
};

export default Permission;
