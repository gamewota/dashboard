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

export default function Modal(props: ModalProps) {
  const { title, children, footer, className = '', isOpen, onClose } = props;
  
  if (!isOpen) return null;
  
  // DaisyUI modal with backdrop - using modal-open class for proper centering
  return (
    <div className={`modal modal-open ${className}`}>
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Close button in top right */}
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        
        {title && <h3 className="font-bold text-lg pr-8">{title}</h3>}
        <div className="py-2">{children}</div>
        {footer ? <div className="modal-action">{footer}</div> : null}
      </div>
      
      {/* Backdrop - click to close */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
