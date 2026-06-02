const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002/api/v1'

// Origen sin el sufijo /v1. Lo usan los endpoints de UserController, que el
// backend mapea a /api/users (fuera de /api/v1). Ver usersApi* más abajo.
export const API_ROOT = BASE_URL.replace(/\/v1$/, '')

const TOKEN_STORAGE_KEY = 'tempus.token'

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function authHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseError(res, path) {
  let body
  let message = `Request ${path} failed with ${res.status}`
  try {
    body = await res.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      message = body.message
    }
  } catch {
    // body was not JSON — keep default message
  }
  return new ApiError(res.status, message, body)
}

/**
 * @param {string} path
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export async function apiGet(path, signal, base = BASE_URL) {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders() },
    signal,
  })
  if (!res.ok) {
    throw await parseError(res, `GET ${path}`)
  }
  return res.json()
}

/**
 * Same as apiGet but returns null on 404 instead of throwing.
 * @param {string} path
 * @param {AbortSignal} [signal]
 * @returns {Promise<any|null>}
 */
export async function apiGetNullable(path, signal) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders() },
    signal,
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw await parseError(res, `GET ${path}`)
  }
  return res.json()
}

async function requestWithBody(method, path, body, signal, base = BASE_URL) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    throw await parseError(res, `${method} ${path}`)
  }
  if (res.status === 204) return undefined
  return res.json()
}

/**
 * @param {string} path
 * @param {unknown} body
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export function apiPost(path, body, signal, base = BASE_URL) {
  return requestWithBody('POST', path, body, signal, base)
}

/**
 * @param {string} path
 * @param {unknown} body
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export function apiPut(path, body, signal, base = BASE_URL) {
  return requestWithBody('PUT', path, body, signal, base)
}

/**
 * @param {string} path
 * @param {unknown} body
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export function apiPatch(path, body, signal, base = BASE_URL) {
  return requestWithBody('PATCH', path, body, signal, base)
}

/**
 * @param {string} path
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export async function apiDelete(path, signal, base = BASE_URL) {
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...authHeaders() },
    signal,
  })
  if (!res.ok) {
    throw await parseError(res, `DELETE ${path}`)
  }
  if (res.status === 204) return undefined
  return res.json()
}

// --- Endpoints de usuario (UserController → /api/users, fuera de /api/v1) ---
// Reutilizan los helpers de arriba pasando API_ROOT como base.
export function usersApiGet(path, signal) {
  return apiGet(path, signal, API_ROOT)
}

export function usersApiPut(path, body, signal) {
  return apiPut(path, body, signal, API_ROOT)
}

export function usersApiPatch(path, body, signal) {
  return apiPatch(path, body, signal, API_ROOT)
}
