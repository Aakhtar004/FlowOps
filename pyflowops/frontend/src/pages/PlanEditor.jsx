import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, Building, Link as LinkIcon, TrendingUp, BarChart3, Target, Users, Mail, UserMinus, Crown, FileText } from 'lucide-react'
import { usePlan, useCompanyIdentity, useStrategicAnalysis, useAnalysisTools, useStrategies, useAuth, usePlans } from '../hooks/useApi'
import { plansAPI } from '../services/api'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdentityEditor from '../components/plan/IdentityEditor'
import ValueChainEditor from '../components/plan/ValueChainEditor'
import BCGMatrixEditor from '../components/plan/BCGMatrixEditor'
import SwotEditor from '../components/plan/SwotEditor'
import AnalysisToolsEditor from '../components/plan/AnalysisToolsEditor'
import StrategiesEditor from '../components/plan/StrategiesEditor'
import CompanyInfoEditor from '../components/plan/CompanyInfoEditor'
import UsersManager from '../components/plan/UsersManager'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient, useMutation as useReactQueryMutation } from 'react-query'

const PlanEditor = () => {
  // ============================================================
  // TODOS LOS HOOKS DEBEN ESTAR AL INICIO (NO CONDICIONALES)
  // ============================================================
  const { planId } = useParams()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { data: plan, isLoading, error } = usePlan(planId)
  const { identity, error: identityError } = useCompanyIdentity(planId)
  const { analysis, error: analysisError } = useStrategicAnalysis(planId)
  const { tools, error: toolsError } = useAnalysisTools(planId)
  const { strategies, error: strategiesError } = useStrategies(planId)
  const { success, error: showError } = useToast()

  // Determinar la pestaña activa basada en la URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/informacion-empresa')) return 'company-info'
    if (path.includes('/identidad')) return 'identity'
    if (path.includes('/cadena-valor')) return 'value-chain'
    if (path.includes('/bcg-matrix')) return 'bcg-matrix'
    if (path.includes('/porter')) return 'porter'
    if (path.includes('/pest')) return 'pest'
    if (path.includes('/strategies-identification')) return 'strategies-identification'
    if (path.includes('/came-matrix')) return 'came-matrix'
    if (path.includes('/usuarios')) return 'users'
    return 'company-info' // default
  }

  const activeTab = getActiveTab()

  const queryClient = useQueryClient()
  const updatePlanMutation = useReactQueryMutation(
    ({ planId, data }) => plansAPI.update(planId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['plan', variables.planId])
      },
      onError: (error) => {
        console.error('Error al actualizar plan:', error)
      },
    }
  )
  const updatePlan = updatePlanMutation.mutateAsync
  const isUpdatingPlan = updatePlanMutation.isLoading
  const [isEditingMeta, setIsEditingMeta] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Sincronizar estado local del editor de metadatos con el plan cargado
  useEffect(() => {
    if (plan) {
      setMetaTitle(plan.title || '')
      setMetaDescription(plan.description || '')
    }
  }, [plan])

  // Manejo de errores de las consultas
  useEffect(() => {
    if (identityError) {
      console.error('Error al cargar identidad empresarial:', identityError)
    }
    if (analysisError) {
      console.error('Error al cargar análisis estratégico:', analysisError)
    }
    if (toolsError) {
      console.error('Error al cargar herramientas de análisis:', toolsError)
    }
    if (strategiesError) {
      console.error('Error al cargar estrategias:', strategiesError)
    }
  }, [identityError, analysisError, toolsError, strategiesError])

  // ============================================================
  // VALIDACIONES Y RETURNS CONDICIONALES (DESPUÉS DE HOOKS)
  // ============================================================

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="large" text="Cargando plan estratégico..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">No se pudo cargar el plan estratégico.</p>
          <Link to="/dashboard" className="btn-primary">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!identity || !analysis || !tools || !strategies) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">No se pudieron cargar los datos del plan. Por favor, verifica tu conexión o autenticación.</p>
          <Link to="/dashboard" className="btn-primary">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================
  // FUNCIONES Y LÓGICA DEL COMPONENTE
  // ============================================================

  const handleSectionSave = async (section, data) => {
    try {
      console.log(`Saving ${section}:`, data)
      await new Promise(resolve => setTimeout(resolve, 500))
      return Promise.resolve()
    } catch (err) {
      throw new Error('Error al guardar los datos')
    }
  }

  const tabs = [
    {
      id: 'company-info',
      title: 'Información de la Empresa',
      path: `/plan/${planId}/informacion-empresa`,
      icon: FileText,
      component: CompanyInfoEditor
    },
    {
      id: 'identity',
      title: 'Identidad Empresarial',
      path: `/plan/${planId}/identidad`,
      icon: Building,
      component: IdentityEditor
    },
    {
      id: 'value-chain',
      title: 'Cadena de Valor Interna',
      path: `/plan/${planId}/cadena-valor`,
      icon: LinkIcon,
      component: ValueChainEditor
    },
    {
      id: 'bcg-matrix',
      title: 'Matriz de Crecimiento-Participación BCG',
      path: `/plan/${planId}/bcg-matrix`,
      icon: BarChart3,
      component: BCGMatrixEditor
    },
    {
      id: 'porter',
      title: 'Matriz de Porter',
      path: `/plan/${planId}/porter`,
      icon: TrendingUp,
      component: null, // Implementación a futuro
      disabled: true
    },
    {
      id: 'pest',
      title: 'Análisis PEST',
      path: `/plan/${planId}/pest`,
      icon: Target,
      component: null, // Implementación a futuro
      disabled: true
    },
    {
      id: 'strategies-identification',
      title: 'Identificación de Estrategias',
      path: `/plan/${planId}/strategies-identification`,
      icon: Target,
      component: null, // Implementación a futuro
      disabled: true
    },
    {
      id: 'came-matrix',
      title: 'Matriz CAME',
      path: `/plan/${planId}/came-matrix`,
      icon: BarChart3,
      component: null, // Implementación a futuro
      disabled: true
    }
  ]

  // Function to calculate completion percentage for each section
  const calculateSectionCompletion = (sectionId) => {
    switch (sectionId) {
      case 'identity':
        if (!identity) return 0
        const identityFields = [identity.mission, identity.vision, identity.values?.length > 0, identity.general_objectives?.length > 0]
        const identityCompleted = identityFields.filter(Boolean).length
        return Math.round((identityCompleted / identityFields.length) * 100)

      case 'value-chain':
        if (!tools) return 0
        const valueChainFields = [
          Object.keys(tools.value_chain_primary || {}).length > 0,
          Object.keys(tools.value_chain_support || {}).length > 0
        ]
        const valueChainCompleted = valueChainFields.filter(Boolean).length
        return Math.round((valueChainCompleted / valueChainFields.length) * 100)

      case 'bcg-matrix':
        // TODO: Implementar cálculo cuando se integre con backend
        return 0

      default:
        return 0
    }
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  const handleMetaSave = async (e) => {
    e?.preventDefault?.()
    if (!planId) return
    const payload = { title: metaTitle, description: metaDescription }
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      await updatePlan({ planId, data: payload })
      setIsEditingMeta(false)
    } catch (err) {
      // Silenciar y dejar que las capas superiores muestren toasts
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
          <div className="flex-1">
            {!isEditingMeta ? (
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">{plan?.title}</h1>
                  <button
                    className="btn-secondary ml-4"
                    onClick={() => setIsEditingMeta(true)}
                    title="Editar título y descripción"
                  >
                    Editar
                  </button>
                </div>
                {plan?.description && (
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleMetaSave} className="space-y-3">
                <input
                  type="text"
                  name="title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="input w-full"
                  placeholder="Título del plan"
                  disabled={isUpdatingPlan}
                />
                <textarea
                  name="description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="input w-full"
                  placeholder="Descripción del plan"
                  rows={3}
                  disabled={isUpdatingPlan}
                />
                <div className="flex space-x-2">
                  <button type="submit" className="btn-primary" disabled={isUpdatingPlan}>
                    Guardar
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditingMeta(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
          <Link
            to={`/plan/${planId}/resumen`}
            className="btn-secondary"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Resumen
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isDisabled = tab.disabled
              
              return (
                <Link
                  key={tab.id}
                  to={isDisabled ? '#' : tab.path}
                  onClick={(e) => isDisabled && e.preventDefault()}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={isDisabled ? 'Implementación a futuro' : ''}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                  {isDisabled && (
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                      Próximamente
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-8">
        {activeTab === 'users' ? (
          <UsersManager />
        ) : ActiveComponent ? (
          <ActiveComponent
            planId={planId}
            onSave={(data) => handleSectionSave(activeTab, data)}
          />
        ) : tabs.find(tab => tab.id === activeTab)?.disabled ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Implementación a Futuro
            </h3>
            <p className="text-gray-500">
              Esta sección estará disponible en próximas versiones del sistema.
            </p>
          </div>
        ) : null}
      </div>

      {/* Progress Indicator */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso del Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tabs
            .filter(tab => tab.id !== 'users' && !tab.disabled)
            .map((tab) => {
              const completion = calculateSectionCompletion(tab.id)
              return (
                <div
                  key={tab.id}
                  className="p-3 rounded-lg text-center bg-white border"
                >
                  <div className="text-sm font-medium text-gray-900">{tab.title}</div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{completion}% completado</div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default PlanEditor
