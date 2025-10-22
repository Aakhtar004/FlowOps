import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useStrategicAnalysis } from '../../hooks/useApi'

const SwotEditor = ({ planId, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()
  const { analysis: swotData, isLoading: dataLoading, updateAnalysis } = useStrategicAnalysis(planId)
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      strengths: '',
      weaknesses: '',
      opportunities: '',
      threats: ''
    }
  })

  useEffect(() => {
    if (swotData) {
      console.log('SWOT data received:', swotData) // Debug log
      
      // Los datos ya vienen como arrays gracias a los validadores de Pydantic
      const formData = {
        strengths: Array.isArray(swotData.internal_strengths) ? swotData.internal_strengths.join('\n') : (swotData.internal_strengths || ''),
        weaknesses: Array.isArray(swotData.internal_weaknesses) ? swotData.internal_weaknesses.join('\n') : (swotData.internal_weaknesses || ''),
        opportunities: Array.isArray(swotData.external_opportunities) ? swotData.external_opportunities.join('\n') : (swotData.external_opportunities || ''),
        threats: Array.isArray(swotData.external_threats) ? swotData.external_threats.join('\n') : (swotData.external_threats || '')
      }
      console.log('SWOT form data after processing:', formData) // Debug log
      reset(formData)
    }
  }, [swotData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Submitting SWOT data:', data) // Debug log
      
      // Convertir strings a arrays donde sea necesario
      const processedData = {
        internal_strengths: data.strengths ? data.strengths.split('\n').filter(s => s.trim()) : [],
        internal_weaknesses: data.weaknesses ? data.weaknesses.split('\n').filter(w => w.trim()) : [],
        external_opportunities: data.opportunities ? data.opportunities.split('\n').filter(o => o.trim()) : [],
        external_threats: data.threats ? data.threats.split('\n').filter(t => t.trim()) : []
      }
      
      await updateAnalysis(processedData)
      success('Análisis SWOT guardado correctamente')
      if (onSave) await onSave(processedData)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Error al guardar el análisis SWOT')
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
                  required: 'Las fortalezas son requeridas'
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
                  required: 'Las debilidades son requeridas'
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
                  required: 'Las oportunidades son requeridas'
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
                  required: 'Las amenazas son requeridas'
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
