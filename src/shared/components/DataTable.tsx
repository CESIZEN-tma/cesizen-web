import React, { useState, useMemo } from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import type { IconType } from 'react-icons';
import { MdSearch } from 'react-icons/md';
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

function flattenToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(flattenToString).join(' ');
  if (typeof value === 'object') return Object.values(value as object).map(flattenToString).join(' ');
  return '';
}

function scoreRow<T>(row: T, terms: string[]): number {
  const haystack = flattenToString(row).toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
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
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return data;
    const terms = trimmed.split(/\s+/).filter(Boolean);
    return data
      .map((row) => ({ row, score: scoreRow(row, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ row }) => row);
  }, [data, query]);

  if (loading) {
    return <Spinner size="large" />;
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className="datatable-container">
      <div className="datatable-search">
        <MdSearch className="datatable-search-icon" />
        <input
          type="text"
          className="datatable-search-input"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="datatable-no-results"
                >
                  No results for &ldquo;{query}&rdquo;
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
