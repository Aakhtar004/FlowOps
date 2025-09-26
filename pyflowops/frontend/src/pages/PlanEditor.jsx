import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, Building, Link as LinkIcon, TrendingUp, BarChart3, Target } from 'lucide-react'
import { usePlan } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdentityEditor from '../components/plan/IdentityEditor'
import ValueChainEditor from '../components/plan/ValueChainEditor'
import SwotEditor from '../components/plan/SwotEditor'
import AnalysisToolsEditor from '../components/plan/AnalysisToolsEditor'
import StrategiesEditor from '../components/plan/StrategiesEditor'

const PlanEditor = () => {
  const { planId } = useParams()
  const location = useLocation()
  const { data: plan, isLoading, error } = usePlan(planId)
  const { success, error: showError } = useToast()

  // Determinar la pestaña activa basada en la URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/identidad')) return 'identity'
    if (path.includes('/cadena-valor')) return 'value-chain'
    if (path.includes('/swot')) return 'swot'
    if (path.includes('/herramientas')) return 'tools'
    if (path.includes('/estrategias')) return 'strategies'
    return 'identity' // default
  }

  const activeTab = getActiveTab()

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
      id: 'swot',
      title: 'Análisis SWOT',
      path: `/plan/${planId}/swot`,
      icon: TrendingUp,
      component: SwotEditor
    },
    {
      id: 'tools',
      title: 'Herramientas de Análisis',
      path: `/plan/${planId}/herramientas`,
      icon: BarChart3,
      component: AnalysisToolsEditor
    },
    {
      id: 'strategies',
      title: 'Estrategias',
      path: `/plan/${planId}/estrategias`,
      icon: Target,
      component: StrategiesEditor
    }
  ]

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

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">{plan?.title}</h1>
            {plan?.description && (
              <p className="text-gray-600 mt-2">{plan.description}</p>
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
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-8">
        {ActiveComponent && (
          <ActiveComponent
            planId={planId}
            onSave={(data) => handleSectionSave(activeTab, data)}
          />
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso del Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {tabs.map((tab) => {
            const isCompleted = plan?.[tab.id] && Object.keys(plan[tab.id]).length > 0
            return (
              <div
                key={tab.id}
                className={`p-3 rounded-lg text-center ${
                  isCompleted ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'
                }`}
              >
                <div className="text-sm font-medium">{tab.title}</div>
                <div className="text-xs mt-1">
                  {isCompleted ? 'Completado' : 'Pendiente'}
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
