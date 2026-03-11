export default function AdminTypeSidebar({ activeType, onSelectType }) {
  return (
    <aside className="type-sidebar">
      <span className="type-sidebar-label">Tipo</span>
      <button
        type="button"
        className={`type-sidebar-btn type-sidebar-btn--resina${activeType === 'RESINA' ? ' type-sidebar-btn--active' : ''}`}
        onClick={() => onSelectType('RESINA')}
      >
        Resina
      </button>
      <button
        type="button"
        className={`type-sidebar-btn type-sidebar-btn--fdm${activeType === 'FDM' ? ' type-sidebar-btn--active' : ''}`}
        onClick={() => onSelectType('FDM')}
      >
        FDM
      </button>
    </aside>
  );
}
