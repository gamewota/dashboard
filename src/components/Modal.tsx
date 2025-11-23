import React from 'react';

type ModalProps = {
  id?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Modal({ id, title, children, footer, className = '', isOpen, onClose }: ModalProps) {
  // Render controlled dialog: use `open` attribute when isOpen is true and call onClose when dialog closes
  return (
    <dialog
      id={id}
      className={["modal", className].filter(Boolean).join(' ')}
      open={!!isOpen}
      onClose={onClose}
    >
      <div className="modal-box">
        {title && <h3 className="font-bold text-lg">{title}</h3>}
        <div className="py-2">{children}</div>
        {footer ? <div className="modal-action">{footer}</div> : null}
      </div>
    </dialog>
  );
}
