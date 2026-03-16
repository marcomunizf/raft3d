export default function Modal({ title, onClose, children, closeOnBackdrop = true }) {
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
