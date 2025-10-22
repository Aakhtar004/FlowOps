import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Building2, Calendar, Users, Target, TrendingUp } from 'lucide-react'
import { usePlan, useCompanyIdentity, useStrategicAnalysis, useStrategies } from '../hooks/useApi'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ResumenPage = () => {
  const { planId } = useParams()
  const { data: plan, isLoading: planLoading } = usePlan(planId)
  const { identity, isLoading: identityLoading } = useCompanyIdentity(planId)
  const { analysis, isLoading: analysisLoading } = useStrategicAnalysis(planId)
  const { strategies, isLoading: strategiesLoading } = useStrategies(planId)

  const isLoading = planLoading || identityLoading || analysisLoading || strategiesLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="large" text="Cargando resumen ejecutivo..." />
      </div>
    )
  }

  if (!plan) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/plan/${planId}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Editor
            </Link>
            <button className="btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del resumen */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Encabezado con Logo */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center border border-gray-200">
          {plan.company_logo_url && (
            <div className="flex justify-center mb-6">
              <img
                src={plan.company_logo_url}
                alt="Logo de la empresa"
                className="h-32 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Resumen Ejecutivo
          </h1>
          <p className="text-xl text-gray-600">{plan.title}</p>
        </div>

        {/* Datos Generales */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-primary-600" />
            Datos Generales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre de la Empresa / Proyecto</p>
              <p className="text-base text-gray-900 mt-1">
                {plan.company_name || plan.title || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Fecha de Elaboración
              </p>
              <p className="text-base text-gray-900 mt-1">
                {formatDate(plan.created_at)}
              </p>
            </div>
            {plan.promoters && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Emprendedores / Promotores
                </p>
                <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">
                  {plan.promoters}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Misión, Visión y Valores */}
        {identity && (
          <>
            {identity.mission && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Misión</h2>
                <p className="text-gray-700 leading-relaxed">{identity.mission}</p>
              </div>
            )}

            {identity.vision && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Visión</h2>
                <p className="text-gray-700 leading-relaxed">{identity.vision}</p>
              </div>
            )}

            {identity.values && identity.values.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Valores</h2>
                <ul className="list-disc list-inside space-y-2">
                  {identity.values.map((value, index) => (
                    <li key={index} className="text-gray-700">
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Unidades Estratégicas */}
        {plan.strategic_units && plan.strategic_units.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unidades Estratégicas</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.strategic_units.map((unit, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{unit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objetivos Estratégicos */}
        {identity && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-primary-600" />
              Objetivos Estratégicos
            </h2>
            
            {identity.strategic_mission && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Misión</h3>
                <p className="text-gray-700">{identity.strategic_mission}</p>
              </div>
            )}

            {identity.general_objectives && identity.general_objectives.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Objetivos Generales o Estratégicos</h3>
                {identity.general_objectives.map((objective, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-start mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mr-2 flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-gray-800 font-medium">{objective.text}</p>
                    </div>
                    
                    {objective.specific_objectives && objective.specific_objectives.length > 0 && (
                      <div className="ml-8 mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Objetivos Específicos:</h4>
                        <ul className="space-y-1">
                          {objective.specific_objectives.map((specific, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-primary-600 mr-2">•</span>
                              <span className="text-gray-700 text-sm">{specific.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Análisis FODA */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis FODA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fortalezas */}
              {analysis.internal_strengths && analysis.internal_strengths.length > 0 && (
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Fortalezas</h3>
                  <ul className="space-y-2">
                    {analysis.internal_strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Oportunidades */}
              {analysis.external_opportunities && analysis.external_opportunities.length > 0 && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Oportunidades</h3>
                  <ul className="space-y-2">
                    {analysis.external_opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">⬆</span>
                        <span className="text-gray-700 text-sm">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Debilidades */}
              {analysis.internal_weaknesses && analysis.internal_weaknesses.length > 0 && (
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-orange-700 mb-3">Debilidades</h3>
                  <ul className="space-y-2">
                    {analysis.internal_weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2 mt-1">⚠</span>
                        <span className="text-gray-700 text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenazas */}
              {analysis.external_threats && analysis.external_threats.length > 0 && (
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Amenazas</h3>
                  <ul className="space-y-2">
                    {analysis.external_threats.map((threat, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">✕</span>
                        <span className="text-gray-700 text-sm">{threat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Identificación de Estrategia */}
        {strategies && strategies.strategy_identification && strategies.strategy_identification.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary-600" />
              Identificación de Estrategia
            </h2>
            <div className="space-y-3">
              {strategies.strategy_identification.map((strategy, index) => (
                <div key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{strategy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones Competitivas */}
        {strategies && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones Competitivas</h2>
            
            <div className="space-y-6">
              {strategies.game_growth && strategies.game_growth.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Estrategias de Crecimiento</h3>
                  <div className="space-y-2">
                    {strategies.game_growth.map((action, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-sm font-medium text-gray-500 mr-3 w-16 flex-shrink-0">
                          Acción {index + 1}
                        </span>
                        <p className="text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {strategies.game_avoid && strategies.game_avoid.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 mb-3">Estrategias de Evitar</h3>
                  <div className="space-y-2">
                    {strategies.game_avoid.map((action, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-sm font-medium text-gray-500 mr-3 w-16 flex-shrink-0">
                          Acción {(strategies.game_growth?.length || 0) + index + 1}
                        </span>
                        <p className="text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {strategies.game_merge && strategies.game_merge.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Estrategias de Fusión</h3>
                  <div className="space-y-2">
                    {strategies.game_merge.map((action, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-sm font-medium text-gray-500 mr-3 w-16 flex-shrink-0">
                          Acción {(strategies.game_growth?.length || 0) + (strategies.game_avoid?.length || 0) + index + 1}
                        </span>
                        <p className="text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {strategies.game_exit && strategies.game_exit.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Estrategias de Salida</h3>
                  <div className="space-y-2">
                    {strategies.game_exit.map((action, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-sm font-medium text-gray-500 mr-3 w-16 flex-shrink-0">
                          Acción {(strategies.game_growth?.length || 0) + (strategies.game_avoid?.length || 0) + (strategies.game_merge?.length || 0) + index + 1}
                        </span>
                        <p className="text-gray-700">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conclusiones */}
        {plan.conclusions && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusiones</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {plan.conclusions}
            </p>
          </div>
        )}

        {/* Footer con fecha */}
        <div className="text-center text-sm text-gray-500 mt-8 pb-8">
          <p>Documento generado el {formatDate(new Date())}</p>
          <p className="mt-1">{plan.company_name || plan.title} - Resumen Ejecutivo del Plan Estratégico</p>
        </div>
      </div>
    </div>
  )
}

export default ResumenPage
