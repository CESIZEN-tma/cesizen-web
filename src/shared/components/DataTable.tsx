import React, { useState, useMemo } from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import type { IconType } from 'react-icons';
import { MdSearch, MdArrowUpward, MdArrowDownward, MdUnfoldMore } from 'react-icons/md';
import './styles/datatable.css';

export interface Column<T> {
  label: string;
  key: keyof T | string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
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

function resolveValue<T>(row: T, key: string): unknown {
  return key.includes('.')
    ? key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], row)
    : (row as Record<string, unknown>)[key];
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'string' && typeof b === 'string') {
    const dateA = Date.parse(a);
    const dateB = Date.parse(b);
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
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
  const [sort, setSort] = useState<SortState | null>(null);

  const handleSortClick = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const filteredData = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    let result = data;

    if (trimmed) {
      const terms = trimmed.split(/\s+/).filter(Boolean);
      result = result
        .map((row) => ({ row, score: scoreRow(row, terms) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ row }) => row);
    }

    if (sort) {
      result = [...result].sort((a, b) => {
        const valA = resolveValue(a, sort.key);
        const valB = resolveValue(b, sort.key);
        const cmp = compareValues(valA, valB);
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, query, sort]);

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
              {columns.map((column, index) => {
                const key = String(column.key);
                const isActive = sort?.key === key;
                return (
                  <th
                    key={index}
                    style={{ width: column.width }}
                    className={column.sortable ? 'datatable-th-sortable' : undefined}
                    onClick={column.sortable ? () => handleSortClick(key) : undefined}
                    aria-sort={
                      isActive ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    <span className="datatable-th-content">
                      {column.label}
                      {column.sortable && (
                        <span className={`datatable-sort-icon${isActive ? ' datatable-sort-icon--active' : ''}`}>
                          {isActive && sort!.direction === 'asc' ? (
                            <MdArrowUpward size={14} />
                          ) : isActive && sort!.direction === 'desc' ? (
                            <MdArrowDownward size={14} />
                          ) : (
                            <MdUnfoldMore size={14} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
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
                    const value = resolveValue(row, String(column.key));
                    return (
                      <td key={colIndex}>
                        {column.render ? column.render(value, row) : (value as React.ReactNode)}
                      </td>
                    );
                  })}
                  {actions && <td><div className="datatable-actions">{actions(row)}</div></td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
