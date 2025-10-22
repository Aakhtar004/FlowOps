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
      value_chain_primary: '',
      value_chain_support: '',
      participation_matrix: '',
      porter_competitive_rivalry: '',
      porter_supplier_power: '',
      porter_buyer_power: '',
      porter_threat_substitutes: '',
      porter_threat_new_entrants: '',
      pest_political: '',
      pest_economic: '',
      pest_social: '',
      pest_technological: ''
    }
  })

  useEffect(() => {
    if (toolsData) {
      console.log('Analysis tools data received:', toolsData) // Debug log

      // Map database fields to form fields
      const formData = {
        value_chain_primary: toolsData.value_chain_primary && typeof toolsData.value_chain_primary === 'object' && 'description' in toolsData.value_chain_primary ? toolsData.value_chain_primary.description : (toolsData.value_chain_primary && Object.keys(toolsData.value_chain_primary).length > 0 ? JSON.stringify(toolsData.value_chain_primary, null, 2) : ''),
        value_chain_support: toolsData.value_chain_support && Object.keys(toolsData.value_chain_support).length > 0 ? JSON.stringify(toolsData.value_chain_support, null, 2) : '',
        participation_matrix: toolsData.participation_matrix && typeof toolsData.participation_matrix === 'object' && 'description' in toolsData.participation_matrix ? toolsData.participation_matrix.description : (toolsData.participation_matrix && Object.keys(toolsData.participation_matrix).length > 0 ? JSON.stringify(toolsData.participation_matrix, null, 2) : ''),
        porter_competitive_rivalry: toolsData.porter_competitive_rivalry || '',
        porter_supplier_power: toolsData.porter_supplier_power || '',
        porter_buyer_power: toolsData.porter_buyer_power || '',
        porter_threat_substitutes: toolsData.porter_threat_substitutes || '',
        porter_threat_new_entrants: toolsData.porter_threat_new_entrants || '',
        pest_political: toolsData.pest_political || '',
        pest_economic: toolsData.pest_economic || '',
        pest_social: toolsData.pest_social || '',
        pest_technological: toolsData.pest_technological || ''
      }
      console.log('Analysis tools form data after processing:', formData) // Debug log
      reset(formData)
    }
  }, [toolsData, reset])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Submitting tools data:', data) // Debug log

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

      // Prepare structured data for backend
      const processedData = {
        value_chain_primary: data.value_chain_primary ? safeJsonParse(data.value_chain_primary) : null,
        value_chain_support: null,
        participation_matrix: data.participation_matrix ? safeJsonParse(data.participation_matrix) : null,
        porter_competitive_rivalry: data.porter_competitive_rivalry || null,
        porter_supplier_power: data.porter_supplier_power || null,
        porter_buyer_power: data.porter_buyer_power || null,
        porter_threat_substitutes: data.porter_threat_substitutes || null,
        porter_threat_new_entrants: data.porter_threat_new_entrants || null,
        pest_political: data.pest_political || null,
        pest_economic: data.pest_economic || null,
        pest_social: data.pest_social || null,
        pest_technological: data.pest_technological || null
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
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Cadena de Valor</h4>

              {/* Actividades Primarias */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Actividades Primarias</h5>
                <textarea
                  {...register('value_chain_primary')}
                  rows={6}
                  className="input"
                  placeholder="Describe las actividades primarias de tu cadena de valor:&#10;&#10;• Logística interna: ...&#10;• Operaciones: ...&#10;• Logística externa: ...&#10;• Marketing y ventas: ...&#10;• Servicios: ..."
                />
              </div>

              {/* Actividades de Apoyo */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Actividades de Apoyo</h5>
                <textarea
                  {...register('value_chain_support')}
                  rows={6}
                  className="input"
                  placeholder="Describe las actividades de apoyo de tu cadena de valor:&#10;&#10;• Infraestructura: ...&#10;• Gestión de RRHH: ...&#10;• Desarrollo tecnológico: ...&#10;• Abastecimiento: ..."
                />
              </div>
            </div>
          )}

          {/* Matriz de Participación */}
          {activeTab === 'participation_matrix' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Matriz de Participación</h4>
              <textarea
                {...register('participation_matrix')}
                rows={8}
                className="input"
                placeholder="Define los stakeholders y su nivel de participación:&#10;&#10;STAKEHOLDERS INTERNOS:&#10;• Directivos: [Influencia/Interés]&#10;• Empleados TI: [Influencia/Interés]&#10;• Usuarios finales: [Influencia/Interés]&#10;&#10;STAKEHOLDERS EXTERNOS:&#10;• Clientes: [Influencia/Interés]&#10;• Proveedores: [Influencia/Interés]&#10;• Reguladores: [Influencia/Interés]&#10;&#10;ESTRATEGIAS DE GESTIÓN:&#10;• Gestionar de cerca: ...&#10;• Mantener satisfecho: ...&#10;• Mantener informado: ...&#10;• Monitorear: ..."
              />
            </div>
          )}

          {/* 5 Fuerzas de Porter */}
          {activeTab === 'porter_forces' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">5 Fuerzas de Porter</h4>

              {/* Rivalidad entre Competidores */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">1. Rivalidad entre Competidores</h5>
                <textarea
                  {...register('porter_competitive_rivalry')}
                  rows={4}
                  className="input"
                  placeholder="Analiza la rivalidad entre competidores:&#10;• Número de competidores: ...&#10;• Intensidad de competencia: ...&#10;• Crecimiento del mercado: ..."
                />
              </div>

              {/* Poder de Negociación de Proveedores */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">2. Poder de Negociación de Proveedores</h5>
                <textarea
                  {...register('porter_supplier_power')}
                  rows={4}
                  className="input"
                  placeholder="Analiza el poder de los proveedores:&#10;• Concentración de proveedores: ...&#10;• Importancia del proveedor: ...&#10;• Costo de cambio: ..."
                />
              </div>

              {/* Poder de Negociación de Clientes */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">3. Poder de Negociación de Clientes</h5>
                <textarea
                  {...register('porter_buyer_power')}
                  rows={4}
                  className="input"
                  placeholder="Analiza el poder de los clientes:&#10;• Concentración de clientes: ...&#10;• Sensibilidad al precio: ...&#10;• Información disponible: ..."
                />
              </div>

              {/* Amenaza de Productos Sustitutos */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">4. Amenaza de Productos Sustitutos</h5>
                <textarea
                  {...register('porter_threat_substitutes')}
                  rows={4}
                  className="input"
                  placeholder="Analiza la amenaza de sustitutos:&#10;• Disponibilidad de sustitutos: ...&#10;• Costo de cambio para clientes: ...&#10;• Rendimiento relativo: ..."
                />
              </div>

              {/* Amenaza de Nuevos Entrantes */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">5. Amenaza de Nuevos Entrantes</h5>
                <textarea
                  {...register('porter_threat_new_entrants')}
                  rows={4}
                  className="input"
                  placeholder="Analiza la amenaza de nuevos entrantes:&#10;• Barreras de entrada: ...&#10;• Economías de escala: ...&#10;• Acceso a canales de distribución: ..."
                />
              </div>
            </div>
          )}

          {/* Análisis PEST */}
          {activeTab === 'pest_analysis' && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Análisis PEST</h4>

              {/* Políticos */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Políticos</h5>
                <textarea
                  {...register('pest_political')}
                  rows={4}
                  className="input"
                  placeholder="Analiza los factores políticos:&#10;• Estabilidad política: ...&#10;• Regulaciones y leyes: ...&#10;• Políticas fiscales: ...&#10;• Comercio internacional: ..."
                />
              </div>

              {/* Económicos */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Económicos</h5>
                <textarea
                  {...register('pest_economic')}
                  rows={4}
                  className="input"
                  placeholder="Analiza los factores económicos:&#10;• Crecimiento económico: ...&#10;• Inflación: ...&#10;• Tipo de cambio: ...&#10;• Tasa de desempleo: ..."
                />
              </div>

              {/* Sociales */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Sociales</h5>
                <textarea
                  {...register('pest_social')}
                  rows={4}
                  className="input"
                  placeholder="Analiza los factores sociales:&#10;• Demografía: ...&#10;• Cultura y valores: ...&#10;• Estilos de vida: ...&#10;• Nivel educativo: ..."
                />
              </div>

              {/* Tecnológicos */}
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-2">Tecnológicos</h5>
                <textarea
                  {...register('pest_technological')}
                  rows={4}
                  className="input"
                  placeholder="Analiza los factores tecnológicos:&#10;• Innovación: ...&#10;• Automatización: ...&#10;• Investigación y desarrollo: ...&#10;• Adopción de tecnología: ..."
                />
              </div>
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
