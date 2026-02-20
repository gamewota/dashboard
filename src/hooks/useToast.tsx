// src/hooks/useToast.tsx
import { useState, useCallback } from "react";
import { Toast } from "../components/Toast";

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  const showToast = useCallback((
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setToast({ message, type });
  }, []);

  const ToastContainer = () =>
    toast ? (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    ) : null;

  return { showToast, ToastContainer };
};
