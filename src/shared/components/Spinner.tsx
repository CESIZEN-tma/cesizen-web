import React from 'react';
import './styles/spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner spinner-${size}`} role="status" aria-label="Loading">
        <svg className="spinner-icon" viewBox="0 0 24 24">
          <circle
            className="spinner-circle"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
};
