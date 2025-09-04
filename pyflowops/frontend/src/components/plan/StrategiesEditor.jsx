import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Target, Lightbulb } from 'lucide-react'
import { useToast } from '../ui/Toast'

const StrategiesEditor = ({ planId, initialData, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToast()
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      strategies: '',
      game_matrix: '',
      implementation_timeline: '',
      success_indicators: ''
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/plans/${planId}/strategies-simple`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar las estrategias')
      }
      
      await onSave(data)
      success('Estrategias guardadas correctamente')
    } catch (err) {
      error('Error al guardar las estrategias')
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
