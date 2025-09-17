import { useState, useEffect } from "react";

type PermissionModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: { id?: number; name: string; description: string };
  onClose: () => void;
  onSave: (data: { id?: number; name: string; description: string }) => void;
};

export const PermissionModal = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}: PermissionModalProps) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDesc(initialData.description || "");
    } else {
      setName("");
      setDesc("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">
          {mode === "create" ? "Add Permission" : "Edit Permission"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Permission name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSave({ id: initialData?.id, name, description: desc })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};