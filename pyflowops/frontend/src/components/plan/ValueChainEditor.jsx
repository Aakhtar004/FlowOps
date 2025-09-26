import React, { useState, useEffect } from 'react'
import { Save, Plus, Minus } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useAnalysisTools } from '../../hooks/useApi'

const ValueChainEditor = ({ planId, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()
  const { tools: toolsData, isLoading: dataLoading, updateTools } = useAnalysisTools(planId)

  const [evaluationData, setEvaluationData] = useState({})
  const [reflection, setReflection] = useState('')
  const [strengths, setStrengths] = useState(['', ''])
  const [weaknesses, setWeaknesses] = useState(['', ''])

  const evaluationItems = [
    "La empresa tiene una política sistematizada de cero defectos en la producción de productos/servicios.",
    "La empresa emplea los medios productivos tecnológicamente más avanzados de su sector.",
    "La empresa dispone de un sistema de información y control de gestión eficiente y eficaz.",
    "Los medios técnicos y tecnológicos de la empresa están preparados para competir en un futuro a corto, medio y largo plazo.",
    "La empresa es un referente en su sector en I+D+i.",
    "La excelencia de los procedimientos de la empresa (en ISO, etc.) son una principal fuente de ventaja competitiva.",
    "La empresa dispone de página web, y esta se emplea no sólo como escaparate virtual de productos/servicios, sino también para establecer relaciones con clientes y proveedores.",
    "Los productos/servicios que desarrolla nuestra empresa llevan incorporada una tecnología difícil de imitar.",
    "La empresa es referente en su sector en la optimización, en términos de coste, de su cadena de producción, siendo ésta una de sus principales ventajas competitivas.",
    "La informatización de la empresa es una fuente de ventaja competitiva clara respecto a sus competidores.",
    "Los canales de distribución de la empresa son una importante fuente de ventajas competitivas.",
    "Los productos/servicios de la empresa son altamente, y diferencialmente, valorados por el cliente respecto a nuestros competidores.",
    "La empresa dispone y ejecuta un sistemático plan de marketing y ventas.",
    "La empresa tiene optimizada su gestión financiera.",
    "La empresa busca continuamente el mejorar la relación con sus clientes cortando los plazos de ejecución, personalizando la oferta o mejorando las condiciones de entrega. Pero siempre partiendo de un plan previo.",
    "La empresa es referente en su sector en el lanzamiento de innovadores productos y servicio de éxito demostrado en el mercado.",
    "Los Recursos Humanos son especialmente responsables del éxito de la empresa, considerándolos incluso como el principal activo estratégico.",
    "Se tiene una plantilla altamente motivada, que conoce con claridad las metas, objetivos y estrategias de la organización.",
    "La empresa siempre trabaja conforme a una estrategia y objetivos claros.",
    "La gestión del circulante está optimizada.",
    "Se tiene definido claramente el posicionamiento estratégico de todos los productos de la empresa.",
    "Se dispone de una política de marca basada en la reputación que la empresa genera, en la gestión de relación con el cliente y en el posicionamiento estratégico previamente definido.",
    "La cartera de clientes de nuestra empresa está altamente fidelizada, ya que tenemos como principal propósito el deleitarlos día a día.",
    "Nuestra política y equipo de ventas y marketing es una importante ventaja competitiva de nuestra empresa respecto al sector.",
    "El servicio al cliente que prestamos es una de nuestras principales ventajas competitivas respecto a nuestros competidores."
  ]

  useEffect(() => {
    if (toolsData?.value_chain_primary) {
      setEvaluationData(toolsData.value_chain_primary)
    }
    if (toolsData?.value_chain_support?.reflection) {
      setReflection(toolsData.value_chain_support.reflection)
    }
    if (toolsData?.value_chain_support?.strengths) {
      setStrengths(toolsData.value_chain_support.strengths)
    }
    if (toolsData?.value_chain_support?.weaknesses) {
      setWeaknesses(toolsData.value_chain_support.weaknesses)
    }
  }, [toolsData])

  const handleEvaluationChange = (itemIndex, value) => {
    setEvaluationData(prev => ({
      ...prev,
      [itemIndex]: parseInt(value) || 0
    }))
  }

  const calculatePotential = () => {
    const values = Object.values(evaluationData)
    if (values.length === 0) return 0
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    return Math.round((average / 4) * 100)
  }

  const addStrength = () => {
    setStrengths([...strengths, ''])
  }

  const removeStrength = (index) => {
    if (strengths.length > 2) {
      setStrengths(strengths.filter((_, i) => i !== index))
    }
  }

  const updateStrength = (index, value) => {
    const newStrengths = [...strengths]
    newStrengths[index] = value
    setStrengths(newStrengths)
  }

  const addWeakness = () => {
    setWeaknesses([...weaknesses, ''])
  }

  const removeWeakness = (index) => {
    if (weaknesses.length > 2) {
      setWeaknesses(weaknesses.filter((_, i) => i !== index))
    }
  }

  const updateWeakness = (index, value) => {
    const newWeaknesses = [...weaknesses]
    newWeaknesses[index] = value
    setWeaknesses(newWeaknesses)
  }

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const processedData = {
        value_chain_primary: evaluationData,
        value_chain_support: {
          reflection,
          strengths: strengths.filter(s => s.trim()),
          weaknesses: weaknesses.filter(w => w.trim())
        }
      }

      await updateTools(processedData)
      success('Cadena de valor interna guardada correctamente')
      if (onSave) await onSave(processedData)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Error al guardar la cadena de valor interna')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Autodiagnóstico de la Cadena de Valor Interna</h3>
            <p className="card-description">
              Marca una opción por fila según el nivel de acuerdo (0-4).
            </p>
          </div>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left font-medium">Afirmación</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium w-16">0</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium w-16">1</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium w-16">2</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium w-16">3</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium w-16">4</th>
              </tr>
            </thead>
            <tbody>
              {evaluationItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm">{item}</td>
                  {[0, 1, 2, 3, 4].map((value) => (
                    <td key={value} className="border border-gray-300 px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`evaluation-${index}`}
                        value={value}
                        checked={evaluationData[index] === value}
                        onChange={(e) => handleEvaluationChange(index, e.target.value)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-900">
              POTENCIAL DE MEJORA DE LA CADENA DE VALOR INTERNA
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {calculatePotential()}%
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflexione sobre el resultado obtenido...
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="input"
              placeholder="Escribe tus reflexiones sobre el resultado del diagnóstico..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-green-700 mb-3">FORTALEZAS</h4>
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600 w-8">
                      F{index + 1}
                    </span>
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => updateStrength(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Fortaleza ${index + 1}`}
                    />
                    {strengths.length > 2 && (
                      <button
                        onClick={() => removeStrength(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addStrength}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-800 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Añadir fortaleza</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-red-700 mb-3">DEBILIDADES</h4>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-600 w-8">
                      D{index + 1}
                    </span>
                    <input
                      type="text"
                      value={weakness}
                      onChange={(e) => updateWeakness(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Debilidad ${index + 1}`}
                    />
                    {weaknesses.length > 2 && (
                      <button
                        onClick={() => removeWeakness(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addWeakness}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800 mt-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Añadir debilidad</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValueChainEditor