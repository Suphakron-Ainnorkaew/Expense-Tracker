import React, { useState, useRef, useEffect } from 'react';

function CategoryDropdown({ value, onChange, options, iconMap, placeholder = 'เลือกหมวดหมู่' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  const SelectedIcon = value && iconMap[value];

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        className={`border rounded-xl p-2 w-full flex items-center bg-white shadow focus:outline-none focus:ring-2 focus:ring-green-400 ${open ? 'ring-2 ring-green-400' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {SelectedIcon && <SelectedIcon className="w-5 h-5 text-gray-400 mr-2" />}
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const Icon = iconMap[option];
            return (
              <li
                key={option}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-green-50 transition-colors ${option === value ? 'bg-green-100 font-semibold' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {Icon && <Icon className="w-5 h-5 text-gray-400 mr-2" />}
                <span>{option}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CategoryDropdown; 