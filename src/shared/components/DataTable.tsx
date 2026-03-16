import React from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import type { IconType } from 'react-icons';
import './styles/datatable.css';

export interface Column<T> {
  label: string;
  key: keyof T | string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: IconType;
  emptyAction?: React.ReactNode;
  getRowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  emptyAction,
  getRowKey,
  actions,
}: DataTableProps<T>) {
  if (loading) {
    return <Spinner size="large" />;
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className="datatable-wrapper">
      <table className="datatable">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={{ width: column.width }}>
                {column.label}
              </th>
            ))}
            {actions && <th style={{ width: 'auto' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column, colIndex) => {
                const value = typeof column.key === 'string' && column.key.includes('.')
                  ? column.key.split('.').reduce((obj: any, key) => obj?.[key], row)
                  : (row as any)[column.key];

                return (
                  <td key={colIndex}>
                    {column.render ? column.render(value, row) : value}
                  </td>
                );
              })}
              {actions && <td className="datatable-actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
