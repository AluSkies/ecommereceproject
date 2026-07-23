import axiosClient from '@/store/axiosClient'

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

function toApiError(err) {
  const status = err.status ?? err.response?.status
  const message = err.message ?? 'Error desconocido'
  const body = err.body ?? err.response?.data
  return new ApiError(status, message, body)
}

export async function apiGet(path, signal) {
  try {
    const { data } = await axiosClient.get(path, { signal })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function apiGetNullable(path, signal) {
  try {
    const { data } = await axiosClient.get(path, { signal })
    return data
  } catch (err) {
    if (err.status === 404 || err.status === 204) return null
    throw toApiError(err)
  }
}

export async function apiPost(path, body, signal) {
  try {
    const { data } = await axiosClient.post(path, body, { signal })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function apiPut(path, body, signal) {
  try {
    const { data } = await axiosClient.put(path, body, { signal })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function apiPatch(path, body, signal) {
  try {
    const { data } = await axiosClient.patch(path, body, { signal })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function apiDelete(path, signal) {
  try {
    const res = await axiosClient.delete(path, { signal })
    if (res.status === 204) return undefined
    return res.data
  } catch (err) {
    throw toApiError(err)
  }
}
