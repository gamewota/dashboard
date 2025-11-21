import React from 'react';

type ModalProps = {
  id?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Modal({ id, title, children, footer, className = '' }: ModalProps) {
  return (
    <dialog id={id} className={["modal", className].filter(Boolean).join(' ')}>
      <div className="modal-box">
        {title && <h3 className="font-bold text-lg">{title}</h3>}
        <div className="py-2">{children}</div>
        {footer ? <div className="modal-action">{footer}</div> : null}
      </div>
    </dialog>
  );
}
