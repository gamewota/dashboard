import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  id?: string;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Modal(props: ModalProps) {
  const { id, title, children, footer, className = '', isOpen, onClose } = props;
  
  // Add Escape key listener before early return so it runs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // DaisyUI modal with backdrop - using modal-open class for proper centering
  return (
    <div 
      id={id}
      className={`modal modal-open ${className}`}
      role="dialog"
      aria-modal="true"
    >
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
