import React from 'react';
import type { IconType } from 'react-icons';
import './styles/button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'warning' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon: IconComponent,
  iconPosition = 'left',
  children,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn-spinner" />}
      {!loading && IconComponent && iconPosition === 'left' && (
        <IconComponent size={size === 'small' ? 16 : 18} />
      )}
      {children && <span>{children}</span>}
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent size={size === 'small' ? 16 : 18} />
      )}
    </button>
  );
};
