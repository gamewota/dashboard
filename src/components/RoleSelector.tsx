import { useState, useRef } from "react";
import { useDispatch} from 'react-redux';
import type { AppDispatch } from '../store';
import { assignRoles, deleteUserRoles } from "../features/roles/roleSlice";
import { updateUserRoles } from "../features/users/userSlice";

type Role = {
  id: number;
  name: string;
  description: string;
};

type UserRole = {
  role_id: number;
  role_name: string;
  role_description: string;
  granted_by: number;
  expires_at: string | null;
  granted_at: string;
};

type RoleSelectorProps = {
  userId: number;      // the user we’re assigning roles to
  roles: Role[];       // all available roles
  userRoles: UserRole[]; // roles already assigned to the user
};

export default function RoleSelector({ userId, roles, userRoles }: RoleSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<HTMLDivElement>(null);

  // store selected role IDs
  const [selected, setSelected] = useState<number[]>(
    userRoles.map((r) => r.role_id)
  );

  const showToast = (message: string, type: "success" | "error") => {
    if (!toastRef.current) return;
    const toast = document.createElement("div");
    toast.className = `alert ${type === "success" ? "alert-success" : "alert-error"} mb-2`;
    toast.innerHTML = `<span>${message}</span>`;
    toastRef.current.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2500);
  };
  

  const handleAddRole = (roleId: number) => {
  const userLogin = localStorage.getItem("user");
  if (!userLogin) return;

  const userLoginId = JSON.parse(userLogin).id;

  // optimistic UI update
  setSelected((prev) => [...prev, roleId]);

  dispatch(assignRoles({ userId, roleId, grantedBy: userLoginId }))
    .unwrap()
   .then((result) => {
      const newRoles = [
        ...userRoles,
        {
          role_id: roleId,
          role_name: roles.find(r => r.id === roleId)?.name || "",
          role_description: roles.find(r => r.id === roleId)?.description || "",
          granted_by: userLoginId,
          expires_at: null,
          granted_at: new Date().toISOString(),
        }
      ];
      dispatch(updateUserRoles({ userId, roles: newRoles }));
      showToast(result.message || "Role assigned successfully!", "success");
    }).catch((err) => {
      showToast(err?.message || "Failed to assign role", "error");
    })
};

const handleRemoveRole = (roleId: number) => {
  const assignment = userRoles.find((r) => r.role_id === roleId);
  if (!assignment) return;

  // optimistic UI update
  setSelected((prev) => prev.filter((id) => id !== roleId));

  dispatch(deleteUserRoles({ roleId: assignment.role_id, userId }))
    .unwrap()
    .then((result) => {
      const newRoles = userRoles.filter(r => r.role_id !== roleId);
      dispatch(updateUserRoles({ userId, roles: newRoles }));
      showToast(result.message || "Role removed successfully!", "success");
    }).catch((err) => {
      showToast(err?.message || "Failed to remove role", "error")
    });
};


  return (
    <div className="form-control w-full">
      {/* Selected roles */}
      <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[44px]">
        {selected.length > 0 ? (
          selected.map((roleId) => {
            const role = roles.find((r) => r.id === roleId);
            if (!role) return null;
            return (
              <div
                key={role.id}
                className="badge badge-outline gap-2 px-3 py-2 flex items-center"
              >
                {role.name}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role.id)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-gray-400">No roles selected</span>
        )}
      </div>

      {/* Dropdown to add roles */}
      <div className="dropdown mt-2">
        <label tabIndex={0} className="btn btn-sm">
          Add Role
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-10"
        >
          {roles
            .filter((role) => !selected.includes(role.id))
            .map((role) => (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => handleAddRole(role.id)}
                  title={role.description}
                >
                  {role.name}
                </button>
              </li>
            ))}
          {roles.filter((r) => !selected.includes(r.id)).length === 0 && (
            <li className="text-gray-400 text-sm px-2 py-1">All roles added</li>
          )}
        </ul>
      </div>
      <div ref={toastRef} className="toast toast-top toast-end z-50" />
    </div>
  );
}
