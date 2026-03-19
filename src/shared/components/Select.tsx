import React from 'react';
import './styles/select.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  children,
  className = '',
  id,
  ...rest
}) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`select-wrapper ${className}`}>
      {label && (
        <label className="select-label" htmlFor={selectId}>
          {label}
          {rest.required && <span className="select-required"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`select-field ${error ? 'select-error' : ''}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
};
