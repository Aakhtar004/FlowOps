import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, BarChart3, Users, Shield, Compass } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useAnalysisTools } from '../../hooks/useApi'

const AnalysisToolsEditor = ({ planId, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('value_chain')
  const { success, error: showError } = useToast()
  const { tools: toolsData, isLoading: dataLoading, updateTools } = useAnalysisTools(planId)
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      value_chain: '',
      participation_matrix: '',
      porter_forces: '',
      pest_analysis: ''
    }
  })

  useEffect(() => {
    if (toolsData) {
      console.log('Analysis tools data received:', toolsData) // Debug log
      
      // Map database fields to form fields - simplified for now
      const formData = {
        value_chain: toolsData.value_chain_primary && Object.keys(toolsData.value_chain_primary).length > 0 ? JSON.stringify(toolsData.value_chain_primary, null, 2) : '',
        participation_matrix: toolsData.participation_matrix && Object.keys(toolsData.participation_matrix).length > 0 ? JSON.stringify(toolsData.participation_matrix, null, 2) : '',
        porter_forces: toolsData.porter_competitive_rivalry || '',
        pest_analysis: toolsData.pest_political || ''
      }
      console.log('Analysis tools form data after processing:', formData) // Debug log
      reset(formData)
    }
  }, [toolsData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Submitting tools data:', data) // Debug log
      
      // Convertir datos del formulario al formato esperado por el backend
      const processedData = {
        value_chain_primary: data.value_chain ? JSON.parse(data.value_chain) : {},
        participation_matrix: data.participation_matrix ? JSON.parse(data.participation_matrix) : {},
        porter_competitive_rivalry: data.porter_forces || null,
        pest_political: data.pest_analysis || null
      }
      
      await updateTools(processedData)
      success('Herramientas de análisis guardadas correctamente')
      if (onSave) await onSave(processedData)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Error al guardar las herramientas de análisis')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'value_chain', name: 'Cadena de Valor', icon: BarChart3 },
    { id: 'participation_matrix', name: 'Matriz de Participación', icon: Users },
    { id: 'porter_forces', name: '5 Fuerzas de Porter', icon: Shield },
    { id: 'pest_analysis', name: 'Análisis PEST', icon: Compass }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h3 className="card-title">Herramientas de Análisis</h3>
        </div>
        <p className="card-description">
          Utiliza herramientas especializadas para un análisis profundo
        </p>
      </div>

      <div className="card-content">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cadena de Valor */}
          {activeTab === 'value_chain' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Cadena de Valor</h4>
              <textarea
                {...register('value_chain', { 
                  required: 'El análisis de cadena de valor es requerido',
                  minLength: { value: 50, message: 'Desarrolla más detalle (mínimo 50 caracteres)' }
                })}
                rows={8}
                className="input"
                placeholder="Analiza tu cadena de valor:&#10;&#10;ACTIVIDADES PRIMARIAS:&#10;• Logística interna: ...&#10;• Operaciones: ...&#10;• Logística externa: ...&#10;• Marketing y ventas: ...&#10;• Servicios: ...&#10;&#10;ACTIVIDADES DE APOYO:&#10;• Infraestructura: ...&#10;• Gestión de RRHH: ...&#10;• Desarrollo tecnológico: ...&#10;• Abastecimiento: ..."
              />
              {errors.value_chain && (
                <p className="text-red-500 text-sm mt-1">{errors.value_chain.message}</p>
              )}
            </div>
          )}

          {/* Matriz de Participación */}
          {activeTab === 'participation_matrix' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Matriz de Participación</h4>
              <textarea
                {...register('participation_matrix', { 
                  required: 'La matriz de participación es requerida',
                  minLength: { value: 50, message: 'Desarrolla más detalle (mínimo 50 caracteres)' }
                })}
                rows={8}
                className="input"
                placeholder="Define los stakeholders y su nivel de participación:&#10;&#10;STAKEHOLDERS INTERNOS:&#10;• Directivos: [Influencia/Interés]&#10;• Empleados TI: [Influencia/Interés]&#10;• Usuarios finales: [Influencia/Interés]&#10;&#10;STAKEHOLDERS EXTERNOS:&#10;• Clientes: [Influencia/Interés]&#10;• Proveedores: [Influencia/Interés]&#10;• Reguladores: [Influencia/Interés]&#10;&#10;ESTRATEGIAS DE GESTIÓN:&#10;• Gestionar de cerca: ...&#10;• Mantener satisfecho: ...&#10;• Mantener informado: ...&#10;• Monitorear: ..."
              />
              {errors.participation_matrix && (
                <p className="text-red-500 text-sm mt-1">{errors.participation_matrix.message}</p>
              )}
            </div>
          )}

          {/* 5 Fuerzas de Porter */}
          {activeTab === 'porter_forces' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">5 Fuerzas de Porter</h4>
              <textarea
                {...register('porter_forces', { 
                  required: 'El análisis de las 5 fuerzas es requerido',
                  minLength: { value: 50, message: 'Desarrolla más detalle (mínimo 50 caracteres)' }
                })}
                rows={8}
                className="input"
                placeholder="Analiza las 5 fuerzas competitivas:&#10;&#10;1. RIVALIDAD ENTRE COMPETIDORES:&#10;• Número de competidores: ...&#10;• Intensidad de competencia: ...&#10;&#10;2. AMENAZA DE NUEVOS ENTRANTES:&#10;• Barreras de entrada: ...&#10;• Facilidad de entrada: ...&#10;&#10;3. PODER DE NEGOCIACIÓN DE PROVEEDORES:&#10;• Concentración de proveedores: ...&#10;• Importancia del proveedor: ...&#10;&#10;4. PODER DE NEGOCIACIÓN DE CLIENTES:&#10;• Concentración de clientes: ...&#10;• Sensibilidad al precio: ...&#10;&#10;5. AMENAZA DE PRODUCTOS SUSTITUTOS:&#10;• Disponibilidad de sustitutos: ...&#10;• Costo de cambio: ..."
              />
              {errors.porter_forces && (
                <p className="text-red-500 text-sm mt-1">{errors.porter_forces.message}</p>
              )}
            </div>
          )}

          {/* Análisis PEST */}
          {activeTab === 'pest_analysis' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Análisis PEST</h4>
              <textarea
                {...register('pest_analysis', { 
                  required: 'El análisis PEST es requerido',
                  minLength: { value: 50, message: 'Desarrolla más detalle (mínimo 50 caracteres)' }
                })}
                rows={8}
                className="input"
                placeholder="Analiza los factores del entorno:&#10;&#10;POLÍTICOS:&#10;• Estabilidad política: ...&#10;• Regulaciones: ...&#10;• Políticas fiscales: ...&#10;&#10;ECONÓMICOS:&#10;• Crecimiento económico: ...&#10;• Inflación: ...&#10;• Tipo de cambio: ...&#10;&#10;SOCIALES:&#10;• Demografía: ...&#10;• Cultura: ...&#10;• Estilos de vida: ...&#10;&#10;TECNOLÓGICOS:&#10;• Innovación: ...&#10;• Automatización: ...&#10;• I+D: ..."
              />
              {errors.pest_analysis && (
                <p className="text-red-500 text-sm mt-1">{errors.pest_analysis.message}</p>
              )}
            </div>
          )}

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Análisis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AnalysisToolsEditor
