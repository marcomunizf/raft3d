export default function FuncionarioTypeSidebar({
  availableTypes,
  activeType,
  onSelectType,
  typeLabel,
  showDrawing = false,
  activeSection = 'production',
  onSelectSection = () => {},
}) {
  const hasProductionTypes = Array.isArray(availableTypes) && availableTypes.length > 0;
  if (!hasProductionTypes && !showDrawing) return null;

  return (
    <aside className="type-sidebar">
      <span className="type-sidebar-label">Menu</span>
      {hasProductionTypes &&
        availableTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`type-sidebar-btn type-sidebar-btn--${type === 'RESINA' ? 'resina' : 'fdm'}${
              activeSection === 'production' && activeType === type ? ' type-sidebar-btn--active' : ''
            }`}
            onClick={() => {
              onSelectSection('production');
              onSelectType(type);
            }}
          >
            {typeLabel[type]}
          </button>
        ))}
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
