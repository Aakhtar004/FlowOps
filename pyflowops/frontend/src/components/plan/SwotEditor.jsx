import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react'
import { useToast } from '../ui/Toast'

const SwotEditor = ({ planId, initialData, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToast()
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      strengths: '',
      weaknesses: '',
      opportunities: '',
      threats: ''
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
      const response = await fetch(`/api/v1/plans/${planId}/swot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar el análisis SWOT')
      }
      
      await onSave(data)
      success('Análisis SWOT guardado correctamente')
    } catch (err) {
      error('Error al guardar el análisis SWOT')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="card-title">Análisis SWOT</h3>
        </div>
        <p className="card-description">
          Analiza las fortalezas, debilidades, oportunidades y amenazas
        </p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fortalezas */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <label className="text-sm font-medium text-gray-700">
                  Fortalezas (Internas - Positivas)
                </label>
              </div>
              <textarea
                {...register('strengths', { 
                  required: 'Las fortalezas son requeridas',
                  minLength: { value: 20, message: 'Describe al menos 20 caracteres' }
                })}
                rows={4}
                className="input"
                placeholder="• Ventajas competitivas&#10;• Recursos únicos&#10;• Capacidades distintivas&#10;• Aspectos internos positivos..."
              />
              {errors.strengths && (
                <p className="text-red-500 text-sm">{errors.strengths.message}</p>
              )}
            </div>

            {/* Debilidades */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <label className="text-sm font-medium text-gray-700">
                  Debilidades (Internas - Negativas)
                </label>
              </div>
              <textarea
                {...register('weaknesses', { 
                  required: 'Las debilidades son requeridas',
                  minLength: { value: 20, message: 'Describe al menos 20 caracteres' }
                })}
                rows={4}
                className="input"
                placeholder="• Limitaciones de recursos&#10;• Procesos ineficientes&#10;• Carencias tecnológicas&#10;• Aspectos a mejorar..."
              />
              {errors.weaknesses && (
                <p className="text-red-500 text-sm">{errors.weaknesses.message}</p>
              )}
            </div>

            {/* Oportunidades */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <label className="text-sm font-medium text-gray-700">
                  Oportunidades (Externas - Positivas)
                </label>
              </div>
              <textarea
                {...register('opportunities', { 
                  required: 'Las oportunidades son requeridas',
                  minLength: { value: 20, message: 'Describe al menos 20 caracteres' }
                })}
                rows={4}
                className="input"
                placeholder="• Tendencias del mercado&#10;• Nuevas tecnologías&#10;• Cambios regulatorios favorables&#10;• Oportunidades de crecimiento..."
              />
              {errors.opportunities && (
                <p className="text-red-500 text-sm">{errors.opportunities.message}</p>
              )}
            </div>

            {/* Amenazas */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <label className="text-sm font-medium text-gray-700">
                  Amenazas (Externas - Negativas)
                </label>
              </div>
              <textarea
                {...register('threats', { 
                  required: 'Las amenazas son requeridas',
                  minLength: { value: 20, message: 'Describe al menos 20 caracteres' }
                })}
                rows={4}
                className="input"
                placeholder="• Competencia intensa&#10;• Cambios tecnológicos disruptivos&#10;• Riesgos regulatorios&#10;• Factores externos negativos..."
              />
              {errors.threats && (
                <p className="text-red-500 text-sm">{errors.threats.message}</p>
              )}
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Análisis SWOT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SwotEditor
