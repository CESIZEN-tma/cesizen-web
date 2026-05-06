import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type Column } from '../shared/components/DataTable'

interface Row {
  name: string
  age: number
}

const columns: Column<Row>[] = [
  { label: 'Name', key: 'name', sortable: true },
  { label: 'Age', key: 'age', sortable: true },
]

const data: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
]

const getKey = (r: Row) => r.name

describe('DataTable', () => {
  it('renders all rows by default', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('filters rows based on search query', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'alice' },
    })
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
  })

  it('shows no results message when search has no match', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'xyz' },
    })
    expect(screen.getByText(/no results for/i)).toBeInTheDocument()
  })

  it('sorts rows ascending by name on first header click', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    fireEvent.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('Alice')
    expect(rows[1]).toHaveTextContent('Bob')
    expect(rows[2]).toHaveTextContent('Charlie')
  })

  it('sorts rows descending by name on second header click', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    fireEvent.click(screen.getByText('Name'))
    fireEvent.click(screen.getByText('Name'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('Charlie')
    expect(rows[1]).toHaveTextContent('Bob')
    expect(rows[2]).toHaveTextContent('Alice')
  })

  it('sorts rows ascending by age', () => {
    render(<DataTable columns={columns} data={data} getRowKey={getKey} />)
    fireEvent.click(screen.getByText('Age'))
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('Bob')
    expect(rows[1]).toHaveTextContent('Alice')
    expect(rows[2]).toHaveTextContent('Charlie')
  })

  it('shows empty state when data array is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowKey={getKey}
        emptyMessage="Aucune donnée"
      />
    )
    expect(screen.getByText('Aucune donnée')).toBeInTheDocument()
  })

  it('renders nested key values using dot notation', () => {
    interface Nested { user: { name: string }; score: number }
    const nestedCols: Column<Nested>[] = [
      { label: 'User', key: 'user.name' },
      { label: 'Score', key: 'score' },
    ]
    const nestedData: Nested[] = [{ user: { name: 'Dave' }, score: 42 }]
    render(
      <DataTable
        columns={nestedCols}
        data={nestedData}
        getRowKey={(r) => r.user.name}
      />
    )
    expect(screen.getByText('Dave')).toBeInTheDocument()
  })
})
