import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4002/api/v1'
const TOKEN_KEY = 'tempus.token'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Inyección de dependencia para evitar el ciclo axiosClient → store → slices →
// axiosClient. store.js registra el handler apenas crea el store.
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

// Acá un 401 es la respuesta esperada (credenciales inválidas), no una sesión
// vencida: no hay que desloguear ni tapar el mensaje del formulario.
const AUTH_PATHS = ['/auth/login', '/auth/register']

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url ?? ''

    // Solo 401. Un 403 es "autenticado pero sin permiso" (p. ej. comprador
    // pegándole a un endpoint de admin) y desloguear ahí sería incorrecto.
    if (status === 401 && !AUTH_PATHS.some((p) => url.includes(p))) {
      onUnauthorized?.()
    }

    const message =
      err.response?.data?.message ??
      err.response?.data?.mensaje ??
      err.message ??
      'Error desconocido'
    const error = new Error(message)
    error.status = status
    error.body = err.response?.data
    return Promise.reject(error)
  },
)

export default axiosClient
