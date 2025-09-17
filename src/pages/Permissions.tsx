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
    } catch (err: any) {
      showToast(err || "Something went wrong ❌", "error");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
        await dispatch(deletePermission(id)).unwrap()
        showToast("Permission deleted successfully ✅", "success")
    } catch (err: any) {
        showToast(err || "Something went wrong ❌", "error");
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center p-4">
      <div className="w-full max-w-5xl flex justify-end mb-4">
        <button
          className="btn btn-primary"
          onClick={() => {
            setModalMode("create");
            setSelected(undefined);
            setIsModalOpen(true);
          }}
        >
          Add Permission
        </button>
      </div>

      <DataTable
        columns={[
          { header: "#", accessor: (_row, i) => i + 1 },
          { header: "Name", accessor: "name" },
          { header: "Description", accessor: "description" },
          {
            header: "Actions",
            accessor: (row) => (
              <div className="flex gap-2">
                <button
                  className="btn btn-xs btn-warning"
                  onClick={() => {
                    setModalMode("edit");
                    setSelected(row);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
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
    </div>
  );
};

export default Permission;
