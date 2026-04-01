import React from 'react';
import './styles/input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {rest.required && <span className="input-required"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...rest}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};
