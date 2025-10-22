import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Menu, X, User, FileText, BarChart3, Bell, Check, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useApi'
import { useToast } from '../ui/Toast'
import { gql, useMutation, useQuery, useSubscription } from '@apollo/client'

const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications { id type message planId fromUserId status createdAt invitationId }
  }
`

const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(notificationId: $id) { message }
  }
`

const INVITATION_RECEIVED = gql`
  subscription InvitationReceived($userId: ID!) {
    invitationReceived(userId: $userId) { id type message planId fromUserId invitationId }
  }
`

const RESPOND_INVITATION = gql`
  mutation RespondInvitation($planId: ID!, $invitationId: ID!, $accept: Boolean!) {
    respondInvitation(planId: $planId, invitationId: $invitationId, accept: $accept) { message }
  }
`

const Header = ({ user }) => {
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
   const [isLoggingOut, setIsLoggingOut] = useState(false)
   const [processingInvitation, setProcessingInvitation] = useState(null)
   const { logoutAsync, user: authUser, isAuthenticated } = useAuth()
   const { data: notificationsData, refetch } = useQuery(NOTIFICATIONS_QUERY, {
     fetchPolicy: 'cache-and-network',
     errorPolicy: 'ignore',
     // Gate por token válido para evitar carreras en hidratación de estado
     skip: !isAuthenticated,
   })
   const [markRead] = useMutation(MARK_NOTIFICATION_READ, { onCompleted: () => refetch() })
   const [respondInvitationMutation, { loading: responding }] = useMutation(RESPOND_INVITATION, { onCompleted: () => refetch() })
   const { success, error } = useToast()
   const navigate = useNavigate()
   const notifications = notificationsData?.notifications || []
   const unreadCount = notifications.filter(n => n.status === 'unread').length

  useSubscription(INVITATION_RECEIVED, {
    variables: { userId: String(authUser?.id || authUser?.sub || '') },
    skip: !isAuthenticated,
    onData: ({ data }) => {
      const note = data?.data?.invitationReceived
      if (!note) return
      try { success?.(note.message || 'Nueva invitación') } catch (_) {}
      // Refrescar notificaciones para mostrar la nueva
      refetch()
    }
  })

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks

    console.log('DEBUG: Logout initiated from Header')
    setIsLoggingOut(true)
    try {
      await logoutAsync()
      console.log('DEBUG: Logout completed successfully, navigating to /login')
      success('Has cerrado sesión correctamente. ¡Hasta pronto!')
      navigate('/login')
    } catch (error) {
      console.error('DEBUG: Logout failed:', error)
      // Still navigate to login even if logout fails
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAcceptInvitation = async (planId, invitationId) => {
    if (processingInvitation) return
    setProcessingInvitation(invitationId)
    try {
      await respondInvitationMutation({ variables: { planId, invitationId, accept: true } })
      success('Invitación aceptada correctamente')
    } catch (err) {
      error('Error al aceptar la invitación')
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleRejectInvitation = async (planId, invitationId) => {
    if (processingInvitation) return
    setProcessingInvitation(invitationId)
    try {
      await respondInvitationMutation({ variables: { planId, invitationId, accept: false } })
      success('Invitación rechazada')
    } catch (err) {
      error('Error al rechazar la invitación')
    } finally {
      setProcessingInvitation(null)
    }
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

          {/* Notificaciones y usuario */}
          <div className="flex items-center space-x-4">
            {/* Campana de notificaciones */}
            {(
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-700 hover:text-primary-600 rounded-md transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No tienes notificaciones
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                              notification.status === 'unread' ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString('es-ES')}
                            </p>
                            {notification.type === 'plan_invitation' && notification.invitationId ? (
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={() => handleAcceptInvitation(notification.planId, notification.invitationId)}
                                  disabled={processingInvitation === notification.invitationId}
                                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => handleRejectInvitation(notification.planId, notification.invitationId)}
                                  disabled={processingInvitation === notification.invitationId}
                                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              notification.status === 'unread' && (
                                <button
                                  onClick={() => markRead({ variables: { id: notification.id } })}
                                  className="mt-2 text-xs text-primary-600 hover:text-primary-800 flex items-center"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marcar como leída
                                </button>
                              )
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <div className="px-4 py-2 border-t border-gray-200 text-center">
                        <button className="text-sm text-primary-600 hover:text-primary-800">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}

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
              disabled={isLoggingOut}
              className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? 'Cerrando...' : 'Salir'}</span>
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
                disabled={isLoggingOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 w-full text-left px-3 py-2 rounded-md text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
