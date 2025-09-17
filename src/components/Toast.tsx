// src/components/Toast.tsx
import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
};

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  }[type];

  return (
    <div className="toast toast-top toast-end">
      <div className={`alert ${color}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};
