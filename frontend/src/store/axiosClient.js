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

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
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
