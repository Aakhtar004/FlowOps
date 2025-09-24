import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import { usePlan } from '../hooks/useApi'
import { useToast } from '../components/ui/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import IdentityEditor from '../components/plan/IdentityEditor'
import { useState } from 'react'
import StrategicObjectivesEditor from '../components/plan/StrategicObjectivesEditor'
import ValueChainDiagnosis from '../components/plan/ValueChainDiagnosis'
import BCGMatrix from '../components/plan/BCGMatrix'
import PorterMatrix from '../components/plan/PorterMatrix'
import PESTMatrix from '../components/plan/PESTMatrix'
import StrategiesIdentification from '../components/plan/StrategiesIdentification'
import CAMEMatrix from '../components/plan/CAMEMatrix'

const PlanEditor = () => {
  const { planId } = useParams()
  const { data: plan, isLoading, error } = usePlan(planId)
  const { success, error: showError } = useToast()
  const [activeSection, setActiveSection] = useState('identity')
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    swot: false,
    tools: false,
    strategies: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSectionSave = async (section, data) => {
    try {
      // Aquí se haría la llamada a la API para guardar los datos
      // Por ahora simulamos un guardado exitoso
      console.log(`Saving ${section}:`, data)
      
      // Simular un delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return Promise.resolve()
    } catch (err) {
      throw new Error('Error al guardar los datos')
    }
  }

  const sections = [
    {
      id: 'identity',
      title: 'Identidad Empresarial',
      description: 'Misión, visión, valores y objetivos',
      component: IdentityEditor
    },
    {
      id: 'strategic-objectives',
      title: 'Objetivos Estratégicos',
      description: 'Define misión y objetivos estratégicos/específicos',
      component: StrategicObjectivesEditor
    },
    {
      id: 'value-chain-diagnosis',
      title: 'Cadena de Valor Interna',
      description: 'Autodiagnóstico de la cadena de valor interna',
      component: ValueChainDiagnosis
    },
    {
      id: 'bcg-matrix',
      title: 'Matriz de Crecimiento - Participación BCG',
      description: 'Matriz BCG',
      component: BCGMatrix
    },
    {
      id: 'porter-matrix',
      title: 'Matriz de Porter',
      description: 'Matriz de análisis competitivo de Porter',
      component: PorterMatrix
    },
    {
      id: 'pest-matrix',
      title: 'PEST',
      description: 'Autodiagnóstico Entorno Global P.E.S.T.',
      component: PESTMatrix
    },
    {
      id: 'strategies-identification',
      title: 'Identificación de Estrategias',
      description: 'Identifica y lista las estrategias de tu empresa',
      component: StrategiesIdentification
    },
    {
      id: 'came-matrix',
      title: 'Matriz CAME',
      description: 'Construye la Matriz CAME para tu empresa',
      component: CAMEMatrix
    },
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
          <nav className="-mb-px flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Section Content */}
      <div className="space-y-8">
        {sections.map((section) => {
          const Component = section.component
          if (activeSection !== section.id) return null
          
          return (
            <Component
              key={section.id}
              planId={planId}
              initialData={plan?.[section.id] || {}}
              onSave={(data) => handleSectionSave(section.id, data)}
            />
          )
        })}
      </div>

      {/* Progress Indicator */}
      {/* ...existing code... */}
    </div>
  )
}

export default PlanEditor
