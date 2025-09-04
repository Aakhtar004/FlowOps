import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Menu, X, User, FileText, BarChart3 } from 'lucide-react'
import { useAuth } from '../../hooks/useApi'
import { useToast } from '../ui/Toast'

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth()
  const { info } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    info('Has cerrado sesión correctamente. ¡Hasta pronto!')
    navigate('/login')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PyFlowOps</h1>
                <p className="text-xs text-gray-500">Plan Estratégico TI</p>
              </div>
            </Link>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FileText className="inline-block w-4 h-4 mr-2" />
              Mis Planes
            </Link>
          </nav>

          {/* Usuario y menú */}
          <div className="flex items-center space-x-4">
            {/* Información del usuario */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
              </div>
            </div>

            {/* Botón de logout desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-white">
              {/* Información del usuario móvil */}
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* Enlaces de navegación móvil */}
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span>Mis Planes</span>
              </Link>

              {/* Logout móvil */}
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
