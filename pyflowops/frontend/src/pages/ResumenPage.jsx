import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { useExecutiveSummary, usePlan } from '../hooks/useApi'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ResumenPage = () => {
  const { planId } = useParams()
  const { data: plan, isLoading: planLoading } = usePlan(planId)
  const { data: summary, isLoading: summaryLoading, refetch } = useExecutiveSummary(planId)

  const isLoading = planLoading || summaryLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="large" text="Generando resumen ejecutivo..." />
      </div>
    )
  }

  if (!plan || !summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">No se pudo cargar el resumen del plan.</p>
          <Link to="/dashboard" className="btn-primary">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const completionPercentage = summary.completion_percentage || 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to={`/plan/${planId}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al Editor
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resumen Ejecutivo</h1>
              <p className="text-gray-600">{plan.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="btn-outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Progreso de completitud */}
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Progreso del Plan</h3>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(completionPercentage)}% completado
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de secciones */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Identidad de la Empresa */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Identidad de la Empresa</h3>
          </div>
          <div className="card-content">
            {summary.company_identity ? (
              <div className="space-y-3">
                {summary.company_identity.mission && (
                  <div>
                    <h4 className="font-medium text-gray-900">Misión</h4>
                    <p className="text-sm text-gray-600">{summary.company_identity.mission}</p>
                  </div>
                )}
                {summary.company_identity.vision && (
                  <div>
                    <h4 className="font-medium text-gray-900">Visión</h4>
                    <p className="text-sm text-gray-600">{summary.company_identity.vision}</p>
                  </div>
                )}
                {summary.company_identity.values && (() => {
                  try {
                    const valuesArray = typeof summary.company_identity.values === 'string' 
                      ? JSON.parse(summary.company_identity.values) 
                      : summary.company_identity.values;
                    return valuesArray && valuesArray.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900">Valores</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {valuesArray.map((value, index) => (
                            <li key={index}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  } catch (e) {
                    console.error('Error parsing values:', e);
                    return null;
                  }
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Sección pendiente de completar</p>
            )}
          </div>
        </div>

        {/* Análisis Estratégico */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Análisis Estratégico</h3>
          </div>
          <div className="card-content">
            {summary.strategic_analysis ? (
              <div className="space-y-3">
                {summary.strategic_analysis.internal_strengths && summary.strategic_analysis.internal_strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-700">Fortalezas</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {summary.strategic_analysis.internal_strengths.slice(0, 3).map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.strategic_analysis.external_opportunities && summary.strategic_analysis.external_opportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700">Oportunidades</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {summary.strategic_analysis.external_opportunities.slice(0, 3).map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Sección pendiente de completar</p>
            )}
          </div>
        </div>
      </div>

      {/* Insights y Recomendaciones */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Key Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Insights Clave</h3>
          </div>
          <div className="card-content">
            {summary.key_insights && summary.key_insights.length > 0 ? (
              <ul className="space-y-2">
                {summary.key_insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
                    <span className="text-sm text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Los insights se generarán automáticamente cuando completes más secciones del plan.
              </p>
            )}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recomendaciones</h3>
          </div>
          <div className="card-content">
            {summary.recommendations && summary.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {summary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Las recomendaciones aparecerán aquí basadas en tu análisis estratégico.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Próximos Pasos</h3>
          </div>
          <div className="card-content">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link
                to={`/plan/${planId}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-1">Completar Identidad</h4>
                <p className="text-xs text-gray-600">Define misión, visión y valores</p>
              </Link>
              <Link
                to={`/plan/${planId}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-1">Análisis SWOT</h4>
                <p className="text-xs text-gray-600">Analiza fortalezas y oportunidades</p>
              </Link>
              <Link
                to={`/plan/${planId}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-1">Herramientas</h4>
                <p className="text-xs text-gray-600">Usa Porter, PEST y más</p>
              </Link>
              <Link
                to={`/plan/${planId}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-1">Estrategias</h4>
                <p className="text-xs text-gray-600">Define estrategias GAME</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumenPage
