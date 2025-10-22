import axios from 'axios'
import toast from 'react-hot-toast'

// Configuración base de Axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
    console.log('DEBUG: Making logout API call to /v1/auth/logout')
    const response = await api.post('/api/v1/auth/logout')
    console.log('DEBUG: Logout API call completed, response:', response.data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },
}

// Funciones para planes estratégicos
export const plansAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/plans/')
    return response.data
  },

  getById: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}`)
    return response.data
  },

  create: async (planData) => {
    const response = await api.post('/api/v1/plans/', planData)
    return response.data
  },

  update: async (planId, planData) => {
    const response = await api.put(`/api/v1/plans/${planId}`, planData)
    return response.data
  },

  delete: async (planId) => {
    const response = await api.delete(`/api/v1/plans/${planId}`)
    return response.data
  },

  // Identidad de la empresa
  getCompanyIdentity: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/company-identity`)
    return response.data
  },

  updateCompanyIdentity: async (planId, identityData) => {
    console.log('DEBUG: Sending updateCompanyIdentity request with data:', identityData)
    const response = await api.put(`/api/v1/plans/${planId}/company-identity`, identityData)
    console.log('DEBUG: updateCompanyIdentity response:', response.data)
    return response.data
  },

  // Análisis estratégico
  getStrategicAnalysis: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/strategic-analysis`)
    return response.data
  },

  updateStrategicAnalysis: async (planId, analysisData) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategic-analysis`, analysisData)
    return response.data
  },

  // Herramientas de análisis
  getAnalysisTools: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/analysis-tools`)
    return response.data
  },

  updateAnalysisTools: async (planId, toolsData) => {
    const response = await api.put(`/api/v1/plans/${planId}/analysis-tools`, toolsData)
    return response.data
  },

  // Estrategias
  getStrategies: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/strategies`)
    return response.data
  },

  updateStrategies: async (planId, strategiesData) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategies`, strategiesData)
    return response.data
  },

  // Endpoints simplificados
  updateIdentitySimple: async (planId, identityData) => {
    const response = await api.put(`/api/v1/plans/${planId}/identity`, identityData)
    return response.data
  },

  updateSwotSimple: async (planId, swotData) => {
    const response = await api.put(`/api/v1/plans/${planId}/swot`, swotData)
    return response.data
  },

  updateToolsSimple: async (planId, toolsData) => {
    const response = await api.put(`/api/v1/plans/${planId}/tools`, toolsData)
    return response.data
  },

  updateStrategiesSimple: async (planId, strategiesData) => {
    const response = await api.put(`/api/v1/plans/${planId}/strategies-simple`, strategiesData)
    return response.data
  },

  // Resumen ejecutivo
  getExecutiveSummary: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/executive-summary`)
    return response.data
  },

  // Funciones para compartir planes
  inviteUser: async (planId, email) => {
    const response = await api.post(`/api/v1/plans/${planId}/invite`, { email })
    return response.data
  },

  acceptInvitation: async (planId, invitationId) => {
    const response = await api.post(`/api/v1/plans/${planId}/invitations/${invitationId}/accept`)
    return response.data
  },

  rejectInvitation: async (planId, invitationId) => {
    const response = await api.post(`/api/v1/plans/${planId}/invitations/${invitationId}/reject`)
    return response.data
  },

  getPlanUsers: async (planId) => {
    const response = await api.get(`/api/v1/plans/${planId}/users`)
    return response.data
  },

  removeUserFromPlan: async (planId, userId) => {
    const response = await api.delete(`/api/v1/plans/${planId}/users/${userId}`)
    return response.data
  },

  // Notificaciones
  getNotifications: async () => {
    const response = await api.get('/api/v1/plans/notifications')
    return response.data
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/api/v1/plans/notifications/${notificationId}/read`)
    return response.data
  },

  // Planes separados
  getOwnedPlans: async () => {
    const response = await api.get('/api/v1/plans/owned')
    return response.data
  },

  getSharedPlans: async () => {
    const response = await api.get('/api/v1/plans/shared')
    return response.data
  },
}

export default api
