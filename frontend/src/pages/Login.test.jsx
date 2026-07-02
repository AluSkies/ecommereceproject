import '@testing-library/jest-dom'
import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import { Login } from './Login'

const originalFetch = global.fetch

describe('Login page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Login />
        </Provider>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('submits credentials and navigates on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', user: { id: 1, email: 'buyer1@tempus.local' } }),
    })

    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Login />
        </Provider>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'buyer1@tempus.local')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'buyer1@tempus.local', password: 'password123' }),
        }),
      )
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('shows invalid credentials message when login rejects with ApiError 401', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })

    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Login />
        </Provider>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'buyer1@tempus.local')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
    })
  })
})
