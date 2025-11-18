import { useState, useEffect } from 'react'
import { useStrategies } from '../../hooks/useApi'
import LoadingSpinner from '../common/LoadingSpinner'

const StrategyIdentificationEditor = ({ planId, onSave }) => {
  const { strategies, isLoading, error } = useStrategies(planId)
  const [strategyList, setStrategyList] = useState([])

  useEffect(() => {
    if (strategies?.strategy_identification) {
      // Parsear si es JSON string
      try {
        const parsed = typeof strategies.strategy_identification === 'string'
          ? JSON.parse(strategies.strategy_identification)
          : strategies.strategy_identification

        setStrategyList(Array.isArray(parsed) ? parsed : [])
      } catch (e) {
        console.error('Error parsing strategy_identification:', e)
        setStrategyList([])
      }
    }
  }, [strategies])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="medium" text="Cargando estrategias..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error al cargar las estrategias</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Diagrama DAFO */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Fila 1 */}
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-cyan-100 border-cyan-400 text-cyan-900 min-h-[80px]">
          Matriz DAFO
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-orange-100 border-orange-400 text-orange-900 min-h-[80px]">
          OPORTUNIDADES
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-cyan-100 border-cyan-400 text-cyan-900 min-h-[80px]">
          AMENAZAS
        </div>

        {/* Fila 2 */}
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-yellow-100 border-yellow-400 text-yellow-900 min-h-[80px]">
          FORTALEZAS
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-indigo-100 border-indigo-400 text-indigo-900 min-h-[80px]">
          ESTRATEGIAS OFENSIVAS
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-indigo-100 border-indigo-400 text-indigo-900 min-h-[80px]">
          ESTRATEGIAS DEFENSIVAS
        </div>

        {/* Fila 3 */}
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-green-100 border-green-400 text-green-900 min-h-[80px]">
          DEBILIDADES
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-indigo-100 border-indigo-400 text-indigo-900 min-h-[80px]">
          ESTRATEGIAS DE REORIENTACIÓN
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg font-semibold border-2 bg-indigo-100 border-indigo-400 text-indigo-900 min-h-[80px]">
          ESTRATEGIAS DE SUPERVIVENCIA
        </div>
      </div>

      {/* Sección de Estrategias Identificadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mr-3">
            1
          </span>
          Identificación de Estrategias
        </h3>

        {strategyList && strategyList.length > 0 ? (
          <div className="space-y-3">
            {strategyList.map((strategy, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold mr-4 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{strategy}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No hay estrategias identificadas aún. Las estrategias aparecerán aquí una vez que sean agregadas.
            </p>
          </div>
        )}
      </div>

      {/* Información de descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Nota:</span> Las estrategias identificadas se generan a partir del análisis DAFO (Debilidades, Amenazas, Fortalezas y Oportunidades) de su empresa. Estas estrategias están organizadas según las tipologías resultantes del análisis matricial.
        </p>
      </div>
    </div>
  )
}

export default StrategyIdentificationEditor
