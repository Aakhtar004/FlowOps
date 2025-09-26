import axios from 'axios'
import toast from 'react-hot-toast'

// Configuración base de Axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
      window.location.href = '/login'
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
    const response = await api.post('/v1/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/v1/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/v1/auth/logout')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/v1/auth/me')
    return response.data
  },
}

// Funciones para planes estratégicos
export const plansAPI = {
  getAll: async () => {
    const response = await api.get('/v1/plans/')
    return response.data
  },

  getById: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}`)
    return response.data
  },

  create: async (planData) => {
    const response = await api.post('/v1/plans/', planData)
    return response.data
  },

  update: async (planId, planData) => {
    const response = await api.put(`/api/v1/plans/${planId}`, planData)
    return response.data
  },

  delete: async (planId) => {
    const response = await api.delete(`/v1/plans/${planId}`)
    return response.data
  },

  // Identidad de la empresa
  getCompanyIdentity: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}/company-identity`)
    return response.data
  },

  updateCompanyIdentity: async (planId, identityData) => {
    const response = await api.put(`/v1/plans/${planId}/company-identity`, identityData)
    return response.data
  },

  // Análisis estratégico
  getStrategicAnalysis: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}/strategic-analysis`)
    return response.data
  },

  updateStrategicAnalysis: async (planId, analysisData) => {
    const response = await api.put(`/v1/plans/${planId}/strategic-analysis`, analysisData)
    return response.data
  },

  // Herramientas de análisis
  getAnalysisTools: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}/analysis-tools`)
    return response.data
  },

  updateAnalysisTools: async (planId, toolsData) => {
    const response = await api.put(`/v1/plans/${planId}/analysis-tools`, toolsData)
    return response.data
  },

  // Estrategias
  getStrategies: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}/strategies`)
    return response.data
  },

  updateStrategies: async (planId, strategiesData) => {
    const response = await api.put(`/v1/plans/${planId}/strategies`, strategiesData)
    return response.data
  },

  // Resumen ejecutivo
  getExecutiveSummary: async (planId) => {
    const response = await api.get(`/v1/plans/${planId}/executive-summary`)
    return response.data
  },
}

export default api
