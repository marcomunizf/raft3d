export default function AdminTypeSidebar({
  activeType,
  onSelectType,
  showDrawing = true,
  activeSection = 'production',
  onSelectSection = () => {},
}) {
  return (
    <aside className="type-sidebar">
      <span className="type-sidebar-label">Menu</span>
      <button
        type="button"
        className={`type-sidebar-btn type-sidebar-btn--resina${activeType === 'RESINA' ? ' type-sidebar-btn--active' : ''}`}
        onClick={() => {
          onSelectSection('production');
          onSelectType('RESINA');
        }}
      >
        Resina
      </button>
      <button
        type="button"
        className={`type-sidebar-btn type-sidebar-btn--fdm${activeType === 'FDM' ? ' type-sidebar-btn--active' : ''}`}
        onClick={() => {
          onSelectSection('production');
          onSelectType('FDM');
        }}
      >
        FDM
      </button>
      {showDrawing && (
        <button
          type="button"
          className={`type-sidebar-btn type-sidebar-btn--drawing${activeSection === 'drawing' ? ' type-sidebar-btn--active' : ''}`}
          onClick={() => onSelectSection('drawing')}
        >
          Desenho
        </button>
      )}
    </aside>
  );
}
