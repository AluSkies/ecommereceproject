const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002/api/v1'

const TOKEN_STORAGE_KEY = 'tempus.token'

export class ApiError extends Error {
  status: number
  body?: unknown
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseError(res: Response, path: string): Promise<ApiError> {
  let body: unknown
  let message = `Request ${path} failed with ${res.status}`
  try {
    body = await res.json()
    if (body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string') {
      message = (body as { message: string }).message
    }
  } catch {
    // body was not JSON — keep default message
  }
  return new ApiError(res.status, message, body)
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...authHeaders() },
    signal,
  })
  if (!res.ok) {
    throw await parseError(res, `GET ${path}`)
  }
  return res.json() as Promise<T>
}

export async function apiPost<TRes, TBody = unknown>(
  path: string,
  body: TBody,
  signal?: AbortSignal,
): Promise<TRes> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    throw await parseError(res, `POST ${path}`)
  }
  if (res.status === 204) return undefined as TRes
  return res.json() as Promise<TRes>
}
