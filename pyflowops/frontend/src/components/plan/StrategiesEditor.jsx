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
      game_matrix: '',
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
        game_matrix: Array.isArray(strategiesData.game_growth) ? strategiesData.game_growth.join('\n') : (strategiesData.game_growth || ''),
        implementation_timeline: typeof strategiesData.implementation_timeline === 'object' ? JSON.stringify(strategiesData.implementation_timeline, null, 2) : (strategiesData.implementation_timeline || ''),
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
      
      // Convertir strings a arrays donde sea necesario
      const processedData = {
        strategy_identification: data.strategies ? data.strategies.split('\n').filter(s => s.trim()) : [],
        game_growth: data.game_matrix ? data.game_matrix.split('\n').filter(g => g.trim()) : [],
        implementation_timeline: data.implementation_timeline ? JSON.parse(data.implementation_timeline) : {},
        priority_strategies: data.success_indicators ? data.success_indicators.split('\n').filter(p => p.trim()) : []
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
                required: 'Las estrategias son requeridas',
                minLength: { value: 30, message: 'Describe al menos 30 caracteres' }
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matriz GAME (Growth, Advantage, Management, Environment)
            </label>
            <textarea
              {...register('game_matrix', { 
                required: 'La matriz GAME es requerida',
                minLength: { value: 50, message: 'Desarrolla más detalle (mínimo 50 caracteres)' }
              })}
              rows={6}
              className="input"
              placeholder="Analiza cada estrategia según los criterios GAME:&#10;&#10;Growth (Crecimiento): ...&#10;Advantage (Ventaja competitiva): ...&#10;Management (Gestión): ...&#10;Environment (Entorno): ..."
            />
            {errors.game_matrix && (
              <p className="text-red-500 text-sm mt-1">{errors.game_matrix.message}</p>
            )}
          </div>

          {/* Timeline de Implementación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline de Implementación
            </label>
            <textarea
              {...register('implementation_timeline', { 
                required: 'El timeline es requerido',
                minLength: { value: 30, message: 'Describe el timeline con más detalle' }
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
                required: 'Los indicadores son requeridos',
                minLength: { value: 30, message: 'Define indicadores específicos y medibles' }
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
