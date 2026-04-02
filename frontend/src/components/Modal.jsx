import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

export default function Modal({ title, onClose, children, closeOnBackdrop = true }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={() => {
        if (closeOnBackdrop) onClose?.();
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Fechar">
            ×
          </Button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
