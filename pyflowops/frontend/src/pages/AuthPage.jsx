import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, LogIn, UserPlus, BarChart3 } from 'lucide-react'
import { useAuth } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Esquemas de validación
const loginSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

const registerSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  full_name: yup
    .string()
    .required('El nombre completo es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
})

const AuthPage = ({ mode = 'login' }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()

  const isLogin = mode === 'login'
  const schema = isLogin ? loginSchema : registerSchema

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        await login(data)
        success(`¡Bienvenido ${data.username}! Has iniciado sesión correctamente.`)
        navigate('/dashboard')
      } else {
        await register(data)
        success(`¡Registro exitoso! Usuario ${data.username} creado correctamente. Ya puedes iniciar sesión.`)
        reset()
        navigate('/login')
      }
    } catch (err) {
      console.error('Error en autenticación:', err)
      if (isLogin) {
        error('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      } else {
        error('Error al registrar usuario. El nombre de usuario o email ya existe.')
      }
    }
  }

  const isLoading = isLogin ? isLoginLoading : isRegisterLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BarChart3 className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Accede a tu cuenta para gestionar tus planes estratégicos'
              : 'Regístrate para comenzar a crear planes estratégicos'
            }
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="form-label">
                Nombre de Usuario
              </label>
              <input
                {...registerField('username')}
                type="text"
                autoComplete="username"
                className="input w-full"
                placeholder="Tu nombre de usuario"
              />
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            {/* Email (solo registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  {...registerField('email')}
                  type="email"
                  autoComplete="email"
                  className="input w-full"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* Full Name (solo registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="full_name" className="form-label">
                  Nombre Completo
                </label>
                <input
                  {...registerField('full_name')}
                  type="text"
                  autoComplete="name"
                  className="input w-full"
                  placeholder="Tu nombre completo"
                />
                {errors.full_name && (
                  <p className="form-error">{errors.full_name.message}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...registerField('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="input w-full pr-10"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password (solo registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    {...registerField('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input w-full pr-10"
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="small" text="" />
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </>
              )}
            </button>
          </div>

          {/* Enlaces */}
          <div className="text-center">
            {isLogin ? (
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Regístrate
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Inicia sesión
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
