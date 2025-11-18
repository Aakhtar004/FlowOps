import axios from 'axios'
import toast from 'react-hot-toast'

// Resolver base URL de la API de forma robusta para entornos docker/host
const resolveApiBase = () => {
  const envUrl = import.meta?.env?.VITE_API_URL
  if (envUrl) {
    try {
      const u = new URL(envUrl)
      // Cuando la build usa 'http://backend:8000', el navegador del host no puede resolver 'backend'
      if (u.hostname === 'backend' && typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.hostname}:8000`
      }
      return envUrl
    } catch (_) {
      // Si no es una URL válida, continuar a fallback
    }
  }
  // Fallback por defecto: usar el host actual en puerto 8000
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`
  }
  return 'http://127.0.0.1:8000'
}

const API_BASE = resolveApiBase()

// Configuración base de Axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('DEBUG: Axios baseURL:', API_BASE)

// Interceptor para incluir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error
    
    if (response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Notificar globalmente al frontend que se perdió la autenticación
      try {
        window.dispatchEvent(new Event('auth:logout'))
      } catch (e) {
        // Ignorar si el entorno no soporta eventos
      }
      // Evitar navegación real durante pruebas (JSDOM no implementa navigation)
      if (!import.meta.env?.VITEST) {
        window.location.href = '/login'
      }
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.')
    } else if (response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.')
    } else if (response?.status === 404) {
      toast.error('Recurso no encontrado.')
    } else if (response?.status >= 500) {
      toast.error('Error del servidor. Por favor, intente más tarde.')
    } else if (response?.data?.message) {
      toast.error(response.data.message)
    } else {
      toast.error('Ha ocurrido un error inesperado.')
    }
    
    return Promise.reject(error)
  }
)

// Funciones de autenticación
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    // El backend espera OAuth2PasswordRequestForm: x-www-form-urlencoded
    const params = new URLSearchParams()
    if (credentials && typeof credentials === 'object') {
      if (credentials.username != null) params.append('username', String(credentials.username))
      if (credentials.password != null) params.append('password', String(credentials.password))
      // Opcional: scope, client_id, client_secret si existieran
    }
    const response = await api.post('/api/v1/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  logout: async () => {
    // Sin endpoint real; limpieza local
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:logout'))
    } catch (_) {}
    return { message: 'Sesión cerrada' }
  },
  getProfile: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },
}

// Funciones de planes
export const plansAPI = {
  getOwnedPlans: async () => {
    const response = await api.get('/api/v1/plans/owned')
    return response.data
  },
  getSharedPlans: async () => {
    const response = await api.get('/api/v1/plans/shared')
    return response.data
  },
  createPlan: async (planData) => {
    const response = await api.post('/api/v1/plans', planData)
    return response.data
  },
  deletePlan: async (planId) => {
    const response = await api.delete(`/api/v1/plans/${planId}`)
    return response.data
  },
  getById: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}`)
    return response.data
  },
  // Company Identity (full)
  updateCompanyIdentity: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/company-identity`, data)
    return response.data
  },
  getCompanyIdentity: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/company-identity`)
    return response.data
  },
  // Strategic Analysis (full)
  updateStrategicAnalysis: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategic-analysis`, data)
    return response.data
  },
  getStrategicAnalysis: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/strategic-analysis`)
    return response.data
  },
  // Analysis Tools (full)
  updateAnalysisTools: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/analysis-tools`, data)
    return response.data
  },
  getAnalysisTools: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/analysis-tools`)
    return response.data
  },
  // Strategies (full)
  updateStrategies: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategies`, data)
    return response.data
  },
  getStrategies: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/strategies`)
    return response.data
  },
  // Simplificados
  updateIdentitySimple: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/identity`, data)
    return response.data
  },
  updateSwotSimple: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/swot`, data)
    return response.data
  },
  updateToolsSimple: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/tools`, data)
    return response.data
  },
  updateStrategiesSimple: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategies-simple`, data)
    return response.data
  },

  // Usuarios del plan
  getPlanUsers: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/users`)
    return response.data
  },
  inviteUser: async (planId, email) => {
    const response = await api.post(`/api/v1/plans/${planId}/invite`, { email })
    return response.data
  },
  removeUserFromPlan: async (planId, userId) => {
    const response = await api.delete(`/api/v1/plans/${planId}/users/${userId}`)
    return response.data
  },
  getAll: async () => {
    const response = await api.get('/api/v1/plans')
    return response.data
  },
  create: async (planData) => {
    const response = await api.post('/api/v1/plans', planData)
    return response.data
  },
  update: async (planId, data) => {
    const response = await api.put(`/api/v1/plans/${planId}`, data)
    return response.data
  },
  delete: async (planId) => {
    const response = await api.delete(`/api/v1/plans/${planId}`)
    return response.data
  },
  getNotifications: async () => {
    const response = await api.get('/api/v1/plans/notifications')
    // Mapear campos del backend a los esperados por el frontend
    return (response.data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      message: n.message,
      planId: n.related_plan_id,
      invitationId: n.invitation_id,
      status: n.status,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }))
  },
  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/api/v1/plans/notifications/${notificationId}/read`)
    return response.data
  },
  getExecutiveSummary: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/executive-summary`)
    return response.data
  },
  // Invitaciones: aceptar / rechazar
  acceptInvitation: async (planId, invitationId) => {
    const response = await api.post(`/api/v1/plans/${planId}/invitations/${invitationId}/accept`)
    return response.data
  },
  rejectInvitation: async (planId, invitationId) => {
    const response = await api.post(`/api/v1/plans/${planId}/invitations/${invitationId}/reject`)
    return response.data
  },
  // PEST Analysis
  createOrUpdatePestAnalysis: async (planId, data) => {
    const response = await api.post(`/api/v1/plans/${planId}/pest`, data)
    return response.data
  },
  getPestAnalysis: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/pest`)
    return response.data
  },
  deletePestAnalysis: async (planId) => {
    const response = await api.delete(`/api/v1/plans/${planId}/pest`)
    return response.data
  },
}
