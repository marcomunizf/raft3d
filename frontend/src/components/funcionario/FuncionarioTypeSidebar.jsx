export default function FuncionarioTypeSidebar({ availableTypes, activeType, onSelectType, typeLabel }) {
  if (!availableTypes || availableTypes.length <= 1) return null;

  return (
    <aside className="type-sidebar">
      <span className="type-sidebar-label">Tipo</span>
      {availableTypes.map((type) => (
        <button
          key={type}
          type="button"
          className={`type-sidebar-btn type-sidebar-btn--${type === 'RESINA' ? 'resina' : 'fdm'}${activeType === type ? ' type-sidebar-btn--active' : ''}`}
          onClick={() => onSelectType(type)}
        >
          {typeLabel[type]}
        </button>
      ))}
    </aside>
  );
}
