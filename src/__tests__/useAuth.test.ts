import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}))

vi.mock('../shared/configs/axiosConfig', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

import { jwtDecode } from 'jwt-decode'
import { apiClient } from '../shared/configs/axiosConfig'
import { useAuth } from '../shared/hooks/useAuth'

const adminPayload = { role: 'Administrator', nameid: '1', email: 'admin@test.com', exp: 9999999999 }
const userPayload = { role: 'User', nameid: '2', email: 'user@test.com', exp: 9999999999 }

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('location', { href: '' })
  })

  it('initializes as not logged in when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.isAdmin).toBe(false)
  })

  it('initializes as logged in when a valid token exists', async () => {
    localStorage.setItem('accessToken', 'valid.jwt.token')
    vi.mocked(jwtDecode).mockReturnValue(userPayload)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('sets isAdmin true when token role is Administrator', async () => {
    localStorage.setItem('accessToken', 'admin.jwt.token')
    vi.mocked(jwtDecode).mockReturnValue(adminPayload)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isLoggedIn).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('login stores token and returns true on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'new.token' } })
    vi.mocked(jwtDecode).mockReturnValue(userPayload)
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let success: boolean
    await act(async () => {
      success = await result.current.login({ email: 'user@test.com', password: 'pass' })
    })
    expect(success!).toBe(true)
    expect(localStorage.getItem('accessToken')).toBe('new.token')
    expect(result.current.isLoggedIn).toBe(true)
  })

  it('login returns false when API call fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let success: boolean
    await act(async () => {
      success = await result.current.login({ email: 'bad@test.com', password: 'wrong' })
    })
    expect(success!).toBe(false)
    expect(result.current.isLoggedIn).toBe(false)
  })

  it('logout clears token and sets isLoggedIn to false', async () => {
    localStorage.setItem('accessToken', 'some.token')
    vi.mocked(jwtDecode).mockReturnValue(userPayload)
    vi.mocked(apiClient.post).mockResolvedValue({})
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => { await result.current.logout() })
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(result.current.isLoggedIn).toBe(false)
  })
})
