import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { SectionTitle } from '@/components/ui/SectionTitle'

interface LocationState {
  from?: { pathname: string }
}

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Credenciales inválidas' : err.message)
      } else {
        setError('No se pudo contactar al servidor. Intentá nuevamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-pearl flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Divider className="mb-4 mx-auto" />
          <SectionTitle centered subtitle="Ingresá para continuar con tu compra">
            Iniciar Sesión
          </SectionTitle>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-ash p-8 flex flex-col gap-6"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-xs tracking-widest uppercase text-ink-muted"
            >
              Email
            </label>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors"
              placeholder="buyer1@tempus.local"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs tracking-widest uppercase text-ink-muted"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-ash px-4 py-3 text-sm text-ink-primary bg-pearl focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="text-xs tracking-widest uppercase text-red-600 border-l-2 border-red-600 pl-3"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className={submitting ? 'opacity-60 cursor-not-allowed' : ''}
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>

          <p className="text-xs text-ink-muted text-center">
            ¿Aún no tenés cuenta?{' '}
            <Link
              to="/registro"
              className="text-gold hover:text-gold-dark tracking-widest uppercase"
            >
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
