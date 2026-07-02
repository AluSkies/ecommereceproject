import '@testing-library/jest-dom'
import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { makeStore } from '@/redux/store'
import { Register } from './Register'

const originalFetch = global.fetch

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/email/i), 'new@tempus.local')
  await userEvent.type(screen.getByLabelText(/^Contraseña/i), 'password123')
  await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/i), 'password123')
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Nueva')
  await userEvent.type(screen.getByLabelText(/apellido/i), 'Cuenta')
  await userEvent.type(screen.getByLabelText(/dirección/i), 'Av. Siempre Viva 742')
  await userEvent.type(screen.getByLabelText(/ciudad/i), 'Buenos Aires')
  await userEvent.type(screen.getByLabelText(/código postal/i), '1000')
}

describe('Register page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Register />
        </Provider>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('shows password mismatch validation error', async () => {
    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Register />
        </Provider>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/^Contraseña/i), 'password123')
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/i), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits registration and navigates on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token', user: { id: 2, email: 'new@tempus.local' } }),
    })

    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Register />
        </Provider>
      </MemoryRouter>,
    )

    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'new@tempus.local',
            password: 'password123',
            firstName: 'Nueva',
            lastName: 'Cuenta',
            phone: undefined,
            line1: 'Av. Siempre Viva 742',
            line2: undefined,
            city: 'Buenos Aires',
            region: undefined,
            postalCode: '1000',
            countryCode: 'AR',
          }),
        }),
      )
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('renders server validation errors when API returns field validations', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        validations: {
          email: 'El email no es válido',
        },
      }),
    })

    render(
      <MemoryRouter>
        <Provider store={makeStore()}>
          <Register />
        </Provider>
      </MemoryRouter>,
    )

    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/el email no es válido/i)).toBeInTheDocument()
    })
  })
})
