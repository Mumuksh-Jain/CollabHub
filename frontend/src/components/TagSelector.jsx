import { useState, useRef, useEffect } from 'react';

export default function TagSelector({ 
  options = [], 
  selectedTags = [], 
  onChange, 
  placeholder = "Select...", 
  label = "Tags",
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(option)
  );

  const handleSelect = (option) => {
    if (!selectedTags.includes(option)) {
      onChange([...selectedTags, option]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemove = (tagToRemove) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label>{label} {required && <span style={{ color: 'var(--accent-red)' }}>*</span>}</label>
      <div 
        className="skill-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: '44px',
          padding: '8px 12px',
          border: '1px solid var(--border-input)',
          background: 'transparent',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '4px 4px 0 var(--text)' : 'none',
          borderColor: isOpen ? 'var(--text)' : 'var(--border-input)'
        }}
      >
        {selectedTags.length === 0 && !isOpen && (
          <span style={{ color: '#bbb', fontSize: '14px' }}>{placeholder}</span>
        )}
        
        {selectedTags.map(tag => (
          <span 
            key={tag} 
            className="tag tag-tech"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              animation: 'scaleIn 0.2s ease both',
              background: 'var(--text)',
              color: '#fff',
              border: 'none'
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(tag);
              }}
              style={{
                border: 'none',
                background: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {isOpen && (
        <div 
          className="skill-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--bg-card)',
            border: '2px solid var(--text)',
            marginTop: '8px',
            boxShadow: '6px 6px 0 var(--text)',
            maxHeight: '240px',
            overflowY: 'auto',
            animation: 'fadeUp 0.2s ease both'
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border-input)',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="skill-list" style={{ padding: '4px 0' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--text)';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'inherit';
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {searchTerm ? 'No matches found' : 'All items selected'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
