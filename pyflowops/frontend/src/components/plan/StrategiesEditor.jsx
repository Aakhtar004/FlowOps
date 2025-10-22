import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Target, Lightbulb } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useStrategies } from '../../hooks/useApi'

const StrategiesEditor = ({ planId, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()
  const { strategies: strategiesData, isLoading: dataLoading, updateStrategies } = useStrategies(planId)
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      strategies: '',
      game_growth: '',
      game_avoid: '',
      game_merge: '',
      game_exit: '',
      implementation_timeline: '',
      success_indicators: ''
    }
  })

  useEffect(() => {
    if (strategiesData) {
      console.log('Strategies data received:', strategiesData) // Debug log

      // Los datos ya vienen como arrays gracias a los validadores de Pydantic
      const formData = {
        strategies: Array.isArray(strategiesData.strategy_identification) ? strategiesData.strategy_identification.join('\n') : (strategiesData.strategy_identification || ''),
        game_growth: Array.isArray(strategiesData.game_growth) ? strategiesData.game_growth.join('\n') : (strategiesData.game_growth || ''),
        game_avoid: Array.isArray(strategiesData.game_avoid) ? strategiesData.game_avoid.join('\n') : (strategiesData.game_avoid || ''),
        game_merge: Array.isArray(strategiesData.game_merge) ? strategiesData.game_merge.join('\n') : (strategiesData.game_merge || ''),
        game_exit: Array.isArray(strategiesData.game_exit) ? strategiesData.game_exit.join('\n') : (strategiesData.game_exit || ''),
        implementation_timeline: typeof strategiesData.implementation_timeline === 'object' && 'description' in strategiesData.implementation_timeline ? strategiesData.implementation_timeline.description : (typeof strategiesData.implementation_timeline === 'object' ? JSON.stringify(strategiesData.implementation_timeline, null, 2) : (strategiesData.implementation_timeline || '')),
        success_indicators: Array.isArray(strategiesData.priority_strategies) ? strategiesData.priority_strategies.join('\n') : (strategiesData.priority_strategies || '')
      }
      console.log('Strategies form data after processing:', formData) // Debug log
      reset(formData)
    }
  }, [strategiesData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Submitting strategies data:', data) // Debug log

      // Construir el objeto game_matrix
      const gameMatrixData = {
        growth: data.game_growth ? data.game_growth.split('\n').filter(s => s.trim()) : [],
        avoid: data.game_avoid ? data.game_avoid.split('\n').filter(s => s.trim()) : [],
        merge: data.game_merge ? data.game_merge.split('\n').filter(s => s.trim()) : [],
        exit: data.game_exit ? data.game_exit.split('\n').filter(s => s.trim()) : []
      }

      // Helper function for safe JSON parsing
      const safeJsonParse = (text) => {
        if (!text || !text.trim().startsWith('{')) {
          return {"description": text || ""};
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          console.warn('Invalid JSON, treating as description:', text);
          return {"description": text};
        }
      };

      // Enviar datos estructurados al endpoint completo
      const processedData = {
        strategy_identification: data.strategies ? data.strategies.split('\n').filter(s => s.trim()) : null,
        game_growth: gameMatrixData.growth,
        game_avoid: gameMatrixData.avoid,
        game_merge: gameMatrixData.merge,
        game_exit: gameMatrixData.exit,
        priority_strategies: data.success_indicators ? data.success_indicators.split('\n').filter(s => s.trim()) : null,
        implementation_timeline: data.implementation_timeline ? safeJsonParse(data.implementation_timeline) : null
      }

      await updateStrategies(processedData)
      success('Estrategias guardadas correctamente')
      if (onSave) await onSave(processedData)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Error al guardar las estrategias')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="card-title">Estrategias</h3>
        </div>
        <p className="card-description">
          Define las estrategias principales y su plan de implementación
        </p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Estrategias Identificadas */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <label className="text-sm font-medium text-gray-700">
                Estrategias Identificadas
              </label>
            </div>
            <textarea
              {...register('strategies', {
                required: 'Las estrategias son requeridas'
              })}
              rows={5}
              className="input"
              placeholder="Lista las estrategias principales basadas en el análisis SWOT:&#10;• Estrategia 1: ...&#10;• Estrategia 2: ...&#10;• Estrategia 3: ..."
            />
            {errors.strategies && (
              <p className="text-red-500 text-sm mt-1">{errors.strategies.message}</p>
            )}
          </div>

          {/* Matriz GAME */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matriz GAME (Growth, Avoid, Merge, Exit)
            </label>

            {/* Growth */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Growth (Crecimiento)
              </label>
              <textarea
                {...register('game_growth')}
                rows={3}
                className="input"
                placeholder="Estrategias de crecimiento: expansión de mercado, nuevos productos, etc."
              />
            </div>

            {/* Avoid */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Avoid (Evitar)
              </label>
              <textarea
                {...register('game_avoid')}
                rows={3}
                className="input"
                placeholder="Estrategias para evitar riesgos: diversificación, reducción de exposición, etc."
              />
            </div>

            {/* Merge */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Merge (Fusionar)
              </label>
              <textarea
                {...register('game_merge')}
                rows={3}
                className="input"
                placeholder="Estrategias de fusión o adquisición: alianzas estratégicas, joint ventures, etc."
              />
            </div>

            {/* Exit */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Exit (Salida)
              </label>
              <textarea
                {...register('game_exit')}
                rows={3}
                className="input"
                placeholder="Estrategias de salida: venta de activos, liquidación, cambio de giro, etc."
              />
            </div>
          </div>

          {/* Timeline de Implementación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline de Implementación
            </label>
            <textarea
              {...register('implementation_timeline', {
                required: 'El timeline es requerido'
              })}
              rows={4}
              className="input"
              placeholder="Define los plazos de implementación:&#10;• Corto plazo (0-6 meses): ...&#10;• Mediano plazo (6-18 meses): ...&#10;• Largo plazo (18+ meses): ..."
            />
            {errors.implementation_timeline && (
              <p className="text-red-500 text-sm mt-1">{errors.implementation_timeline.message}</p>
            )}
          </div>

          {/* Indicadores de Éxito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indicadores de Éxito (KPIs)
            </label>
            <textarea
              {...register('success_indicators', {
                required: 'Los indicadores son requeridos'
              })}
              rows={4}
              className="input"
              placeholder="Define cómo medirás el éxito:&#10;• Indicador 1: ...&#10;• Indicador 2: ...&#10;• Indicador 3: ..."
            />
            {errors.success_indicators && (
              <p className="text-red-500 text-sm mt-1">{errors.success_indicators.message}</p>
            )}
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Estrategias'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StrategiesEditor
