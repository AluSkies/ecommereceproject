const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002/api/v1'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed with ${res.status}`)
  }
  return res.json() as Promise<T>
}
