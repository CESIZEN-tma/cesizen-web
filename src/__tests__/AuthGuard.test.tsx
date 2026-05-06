import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AuthGuard from '../shared/components/AuthGuard'

vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../shared/hooks/useAuth'

const mockAuth = (overrides: Partial<ReturnType<typeof useAuth>>) => {
  vi.mocked(useAuth).mockReturnValue({
    isLoggedIn: false,
    loading: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  })
}

describe('AuthGuard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders children when user is authenticated', () => {
    mockAuth({ isLoggedIn: true })
    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    mockAuth({ isLoggedIn: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders nothing (spinner) while authentication is loading', () => {
    mockAuth({ isLoggedIn: false, loading: true })
    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected content</div>
        </AuthGuard>
      </MemoryRouter>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
