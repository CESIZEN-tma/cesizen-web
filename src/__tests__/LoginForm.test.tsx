import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '../services/auth-service/components/LoginForm'

vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../shared/hooks/useAuth'

describe('LoginForm', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    mockLogin.mockReset()
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loading: false,
      isLoggedIn: false,
      isAdmin: false,
      logout: vi.fn(),
    })
  })

  const renderForm = () =>
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    )

  it('renders email and password fields', () => {
    renderForm()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('shows error when email is empty on submit', async () => {
    renderForm()
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText("L'email est requis")).toBeInTheDocument()
    })
  })

  it('shows error when email format is invalid', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'notanemail' },
    })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  it('shows error when password is too short', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: '123' },
    })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/au moins 6 caractères/i)).toBeInTheDocument()
    })
  })

  it('blocks submission when honeypot is filled', async () => {
    renderForm()
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')!
    fireEvent.change(honeypot, { target: { value: 'bot' } })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' },
    })
    fireEvent.submit(document.querySelector('form')!)
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login with credentials on valid submit', async () => {
    mockLogin.mockResolvedValue(true)
    renderForm()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' },
    })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
    })
  })

  it('shows error message when login fails', async () => {
    mockLogin.mockResolvedValue(false)
    renderForm()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' },
    })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument()
    })
  })
})
