import React from 'react';
import type { IconType } from 'react-icons';
import Icon from '../../shared/components/Icon';
import './styles/empty-state.css';

interface EmptyStateProps {
  message: string;
  icon?: IconType;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state-icon">
          <Icon icon={icon} size={48} color="var(--color-gray-400)" />
        </div>
      )}
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
