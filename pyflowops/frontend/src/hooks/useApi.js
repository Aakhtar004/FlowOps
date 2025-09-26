import { useQuery, useMutation, useQueryClient } from 'react-query'
import { authAPI, plansAPI } from '../services/api'
import toast from 'react-hot-toast'

// Hook para autenticación
export const useAuth = () => {
  const queryClient = useQueryClient()

  const loginMutation = useMutation(authAPI.login, {
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      queryClient.setQueryData('user', data.user)
      toast.success('¡Bienvenido!')
    },
    onError: (error) => {
      console.error('Error en login:', error)
    },
  })

  const registerMutation = useMutation(authAPI.register, {
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente. Ahora puedes iniciar sesión.')
    },
    onError: (error) => {
      console.error('Error en registro:', error)
    },
  })

  const logoutMutation = useMutation(authAPI.logout, {
    onSuccess: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      queryClient.clear()
      toast.success('Sesión cerrada exitosamente')
    },
  })

  const profileQuery = useQuery('user', authAPI.getProfile, {
    enabled: !!localStorage.getItem('token'),
    retry: false,
    staleTime: Infinity,
  })

  const isAuthenticated = !!localStorage.getItem('token')
  const user = profileQuery.data || JSON.parse(localStorage.getItem('user') || 'null')

  return {
    user,
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isLoading,
    isRegisterLoading: registerMutation.isLoading,
  }
}

// Hook para planes estratégicos
export const usePlans = () => {
  const queryClient = useQueryClient()

  const plansQuery = useQuery('plans', plansAPI.getAll)

  const createPlanMutation = useMutation(plansAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('plans')
      toast.success('Plan estratégico creado exitosamente')
    },
    onError: (error) => {
      console.error('Error al crear plan:', error)
    },
  })

  const updatePlanMutation = useMutation(
    ({ planId, data }) => plansAPI.update(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans')
        toast.success('Plan estratégico actualizado exitosamente')
      },
      onError: (error) => {
        console.error('Error al actualizar plan:', error)
      },
    }
  )

  const deletePlanMutation = useMutation(plansAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('plans')
      toast.success('Plan estratégico eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error al eliminar plan:', error)
    },
  })

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    error: plansQuery.error,
    createPlan: createPlanMutation.mutate,
    updatePlan: updatePlanMutation.mutate,
    deletePlan: deletePlanMutation.mutate,
    isCreating: createPlanMutation.isLoading,
    isUpdating: updatePlanMutation.isLoading,
    isDeleting: deletePlanMutation.isLoading,
  }
}

// Hook para un plan específico
export const usePlan = (planId) => {
  return useQuery(['plan', planId], () => plansAPI.getById(planId), {
    enabled: !!planId,
  })
}

// Hook para identidad de la empresa
export const useCompanyIdentity = (planId) => {
  console.log('useCompanyIdentity called with planId:', planId)
  
  const queryClient = useQueryClient()

  const identityQuery = useQuery(
    ['companyIdentity', planId],
    () => {
      console.log('Fetching company identity for planId:', planId)
      return plansAPI.getCompanyIdentity(planId)
    },
    {
      enabled: !!planId,
      retry: false,
      onSuccess: (data) => {
        console.log('Company identity loaded successfully:', data)
      },
      onError: (error) => {
        console.error('Error loading company identity:', error)
      }
    }
  )

  const updateIdentityMutation = useMutation(
    (data) => plansAPI.updateCompanyIdentity(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['companyIdentity', planId])
        toast.success('Identidad de la empresa actualizada')
      },
      onError: (error) => {
        console.error('Error al actualizar identidad:', error)
      },
    }
  )

  return {
    identity: identityQuery.data,
    isLoading: identityQuery.isLoading,
    error: identityQuery.error,
    updateIdentity: updateIdentityMutation.mutate,
    isUpdating: updateIdentityMutation.isLoading,
  }
}

// Hook para análisis estratégico
export const useStrategicAnalysis = (planId) => {
  console.log('useStrategicAnalysis called with planId:', planId)
  
  const queryClient = useQueryClient()

  const analysisQuery = useQuery(
    ['strategicAnalysis', planId],
    () => {
      console.log('Fetching strategic analysis for planId:', planId)
      return plansAPI.getStrategicAnalysis(planId)
    },
    {
      enabled: !!planId,
      retry: false,
      onSuccess: (data) => {
        console.log('Strategic analysis loaded successfully:', data)
      },
      onError: (error) => {
        console.error('Error loading strategic analysis:', error)
      }
    }
  )

  const updateAnalysisMutation = useMutation(
    (data) => plansAPI.updateStrategicAnalysis(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['strategicAnalysis', planId])
        toast.success('Análisis estratégico actualizado')
      },
      onError: (error) => {
        console.error('Error al actualizar análisis:', error)
      },
    }
  )

  return {
    analysis: analysisQuery.data,
    isLoading: analysisQuery.isLoading,
    error: analysisQuery.error,
    updateAnalysis: updateAnalysisMutation.mutate,
    isUpdating: updateAnalysisMutation.isLoading,
  }
}

// Hook para herramientas de análisis
export const useAnalysisTools = (planId) => {
  console.log('useAnalysisTools called with planId:', planId)
  
  const queryClient = useQueryClient()

  const toolsQuery = useQuery(
    ['analysisTools', planId],
    () => {
      console.log('Fetching analysis tools for planId:', planId)
      return plansAPI.getAnalysisTools(planId)
    },
    {
      enabled: !!planId,
      retry: false,
      onSuccess: (data) => {
        console.log('Analysis tools loaded successfully:', data)
      },
      onError: (error) => {
        console.error('Error loading analysis tools:', error)
      }
    }
  )

  const updateToolsMutation = useMutation(
    (data) => plansAPI.updateAnalysisTools(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['analysisTools', planId])
        toast.success('Herramientas de análisis actualizadas')
      },
      onError: (error) => {
        console.error('Error al actualizar herramientas:', error)
      },
    }
  )

  return {
    tools: toolsQuery.data,
    isLoading: toolsQuery.isLoading,
    error: toolsQuery.error,
    updateTools: updateToolsMutation.mutate,
    isUpdating: updateToolsMutation.isLoading,
  }
}

// Hook para estrategias
export const useStrategies = (planId) => {
  console.log('useStrategies called with planId:', planId)
  
  const queryClient = useQueryClient()

  const strategiesQuery = useQuery(
    ['strategies', planId],
    () => {
      console.log('Fetching strategies for planId:', planId)
      return plansAPI.getStrategies(planId)
    },
    {
      enabled: !!planId,
      retry: false,
      onSuccess: (data) => {
        console.log('Strategies loaded successfully:', data)
      },
      onError: (error) => {
        console.error('Error loading strategies:', error)
      }
    }
  )

  const updateStrategiesMutation = useMutation(
    (data) => plansAPI.updateStrategies(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['strategies', planId])
        toast.success('Estrategias actualizadas')
      },
      onError: (error) => {
        console.error('Error al actualizar estrategias:', error)
      },
    }
  )

  return {
    strategies: strategiesQuery.data,
    isLoading: strategiesQuery.isLoading,
    error: strategiesQuery.error,
    updateStrategies: updateStrategiesMutation.mutate,
    isUpdating: updateStrategiesMutation.isLoading,
  }
}

// Hook para resumen ejecutivo
export const useExecutiveSummary = (planId) => {
  console.log('useExecutiveSummary called with planId:', planId)
  
  return useQuery(
    ['executiveSummary', planId],
    () => {
      console.log('Fetching executive summary for planId:', planId)
      return plansAPI.getExecutiveSummary(planId)
    },
    {
      enabled: !!planId,
      refetchInterval: 30000, // Refrescar cada 30 segundos
      onSuccess: (data) => {
        console.log('Executive summary loaded successfully:', data)
      },
      onError: (error) => {
        console.error('Error loading executive summary:', error)
      }
    }
  )
}
