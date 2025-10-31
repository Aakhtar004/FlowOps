import React, { useMemo, useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useAnalysisTools } from '../../hooks/useApi'

// Escala 1–5: Nada, Poco, Medio, Alto, Muy Alto
const scaleLabels = ['Nada', 'Poco', 'Medio', 'Alto', 'Muy Alto']

// Configuración de ítems por fuerza (orden y criterios según solicitud)
// Cada ítem incluye etiquetas de extremos para alinear bajo Hostil/Favorable.
const SECTIONS = [
  {
    key: 'rivalidad',
    title: 'Rivalidad empresas del sector',
    items: [
      { text: 'Crecimiento', left: 'Lento', right: 'Rápido' },
      { text: 'Naturaleza de los competidores', left: 'Muchos', right: 'Pocos' },
      { text: 'Exceso de capacidad productiva', left: 'Sí', right: 'No' },
      { text: 'Rentabilidad media del sector', left: 'Baja', right: 'Alta' },
      { text: 'Diferenciación del producto', left: 'Escasa', right: 'Elevada' },
      { text: 'Barreras de salida', left: 'Bajas', right: 'Altas' }
    ]
  },
  {
    key: 'barrerasEntrada',
    title: 'Barreras de Entrada',
    items: [
      { text: 'Economías de escala', left: 'No', right: 'Sí' },
      { text: 'Necesidad de capital', left: 'Bajas', right: 'Altas' },
      { text: 'Acceso a la tecnología', left: 'Fácil', right: 'Difícil' },
      { text: 'Reglamentos o leyes limitativos', left: 'No', right: 'Sí' },
      { text: 'Trámites burocráticos', left: 'No', right: 'Sí' },
      { text: 'Reacción esperada actuales competidores', left: 'Escasa', right: 'Enérgica' }
    ]
  },
  {
    key: 'poderClientes',
    title: 'Poder de los Clientes',
    items: [
      { text: 'Número de clientes', left: 'Pocos', right: 'Muchos' },
      { text: 'Posibilidad de integración ascendente', left: 'Pequeña', right: 'Grande' },
      { text: 'Rentabilidad de los clientes', left: 'Baja', right: 'Alta' },
      { text: 'Coste de cambio de proveedor para cliente', left: 'Bajo', right: 'Alto' }
    ]
  },
  {
    key: 'sustitutivos',
    title: 'Productos Sustitutivos',
    items: [
      { text: 'Disponibilidad de Productos Sustitutivos', left: 'Grande', right: 'Pequeña' }
    ]
  }
]

const sectionFieldMap = {
  rivalidad: 'porter_competitive_rivalry',
  barrerasEntrada: 'porter_threat_new_entrants',
  poderClientes: 'porter_buyer_power',
  sustitutivos: 'porter_threat_substitutes',
}

export default function PorterMatrix({ planId, onSave }) {
  const { success, error: showError } = useToast()
  const { tools: toolsData, isLoading: dataLoading, updateTools } = useAnalysisTools(planId)

  const [selections, setSelections] = useState({})
  const [oportunidades, setOportunidades] = useState([''])
  const [amenazas, setAmenazas] = useState([''])
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos desde backend si existen (intentar parsear JSON en campos de texto)
  useEffect(() => {
    const parseJsonSafe = (text) => {
      if (!text) return null
      try {
        const obj = typeof text === 'string' ? JSON.parse(text) : text
        return obj
      } catch (_) {
        return null
      }
    }

    if (toolsData) {
      const initialSelections = {}
      // Intentar recuperar selections por sección si se guardaron previamente
      Object.entries(sectionFieldMap).forEach(([key, field]) => {
        const parsed = parseJsonSafe(toolsData?.[field])
        if (parsed?.selections && Array.isArray(parsed.selections)) {
          initialSelections[key] = parsed.selections
        }
        // Oportunidades/Amenazas (solo una vez, usando rivalidad como fuente preferente)
        if (key === 'rivalidad') {
          if (parsed?.oportunidades && Array.isArray(parsed.oportunidades)) {
            setOportunidades(parsed.oportunidades.length ? parsed.oportunidades : [''])
          }
          if (parsed?.amenazas && Array.isArray(parsed.amenazas)) {
            setAmenazas(parsed.amenazas.length ? parsed.amenazas : [''])
          }
        }
      })
      setSelections(initialSelections)
    }
  }, [toolsData])

  const setSelection = (sectionKey, itemIndex, value) => {
    setSelections(prev => {
      const next = { ...prev }
      const arr = Array.isArray(next[sectionKey]) ? [...next[sectionKey]] : []
      arr[itemIndex] = value
      next[sectionKey] = arr
      return next
    })
  }

  const totalPercent = useMemo(() => {
    let sum = 0
    let totalItems = 0
    SECTIONS.forEach(sec => {
      const arr = selections[sec.key] || []
      totalItems += sec.items.length
      arr.forEach(v => {
        const n = Number(v) || 0
        sum += n
      })
    })
    const maxPossible = totalItems * 5
    if (maxPossible === 0) return 0
    return Math.round((sum / maxPossible) * 100)
  }, [selections])

  const conclusionText = useMemo(() => {
    const s = totalPercent
    if (s <= 30) return 'Estamos en un mercado altamente competitivo, en el que es muy difícil hacerse un hueco en el mercado.'
    if (s <= 60) return 'Estamos en un mercado de competitividad relativamente alta, pero con ciertas modificaciones en el producto y la política comercial de la empresa, podría encontrarse un nicho de mercado.'
    if (s <= 80) return 'La situación actual del mercado es favorable a la empresa.'
    return 'Estamos en una situación excelente para la empresa.'
  }, [totalPercent])

  const addOportunidad = () => setOportunidades(prev => [...prev, ''])
  const addAmenaza = () => setAmenazas(prev => [...prev, ''])
  const updateOportunidad = (i, v) => {
    setOportunidades(prev => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }
  const updateAmenaza = (i, v) => {
    setAmenazas(prev => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }
  const removeOportunidad = (i) => {
    setOportunidades(prev => prev.filter((_, idx) => idx !== i))
  }
  const removeAmenaza = (i) => {
    setAmenazas(prev => prev.filter((_, idx) => idx !== i))
  }

  const sectionScoreRaw = (key) => {
    const arr = selections[key] || []
    return arr.reduce((acc, v) => acc + (Number(v) || 0), 0)
  }

  const buildSectionPayload = (key) => {
    const sec = SECTIONS.find(s => s.key === key)
    const raw = sectionScoreRaw(key)
    const max = (sec?.items?.length || 0) * 5
    const percent = max ? Math.round((raw / max) * 100) : 0
    return {
      title: sec?.title,
      items: (sec?.items || []).map(i => (typeof i === 'string' ? i : i.text)),
      selections: selections[key] || [],
      scoreRaw: raw,
      scorePercent: percent,
      conclusion: conclusionText,
      ...(key === 'rivalidad' ? { oportunidades: oportunidades.filter(s => s.trim()), amenazas: amenazas.filter(s => s.trim()) } : {})
    }
  }

  const handleSave = async (e) => {
    e?.preventDefault?.()
    setIsSaving(true)
    try {
      const payload = {
        porter_competitive_rivalry: JSON.stringify(buildSectionPayload('rivalidad')),
        porter_buyer_power: JSON.stringify(buildSectionPayload('poderClientes')),
        porter_threat_substitutes: JSON.stringify(buildSectionPayload('sustitutivos')),
        porter_threat_new_entrants: JSON.stringify(buildSectionPayload('barrerasEntrada')),
      }

      await updateTools(payload)
      success('Matriz de Porter guardada correctamente')
      if (onSave) await onSave(payload)
    } catch (err) {
      console.error('Error al guardar Matriz de Porter:', err)
      showError('Error al guardar la Matriz de Porter')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Matriz de Porter</h3>
            <p className="card-description">Marque el nivel para cada afirmación. Escala 1–5.</p>
          </div>
          <button onClick={handleSave} className="btn-primary" disabled={isSaving || dataLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="card-content space-y-8">

        {/* Tabla de escala por secciones */}
        {SECTIONS.map(sec => (
          <div key={sec.key}>
            <h5 className="text-md font-semibold text-gray-800 mb-2">{sec.title}</h5>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">PERFIL COMPETITIVO</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Hostil</th>
                    {scaleLabels.slice(1, 4).map((_, i) => (
                      <th key={i} className="border border-gray-300 px-4 py-2 text-center font-semibold"></th>
                    ))}
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Favorable</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium">Afirmación</th>
                    {scaleLabels.map((lbl, i) => (
                      <th key={i} className="border border-gray-300 px-4 py-2 text-center font-medium w-24">{lbl}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-sm">{typeof item === 'string' ? item : item.text}</td>
                      {[1,2,3,4,5].map(val => (
                        <td key={val} className="border border-gray-300 px-2 py-2 text-center align-top">
                          <div className="flex flex-col items-center">
                            <input
                              type="radio"
                              name={`${sec.key}-${idx}`}
                              checked={(selections[sec.key]?.[idx] || 0) === val}
                              onChange={() => setSelection(sec.key, idx, val)}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            {val === 1 && (typeof item !== 'string') && (
                              <div className="text-[11px] text-gray-600 mt-1">{item.left}</div>
                            )}
                            {val === 5 && (typeof item !== 'string') && (
                              <div className="text-[11px] text-gray-600 mt-1">{item.right}</div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Conclusión y total */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-1">CONCLUSIÓN</span>
              <p className="text-sm text-gray-800">{conclusionText}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total (%)</span>
              <span className="text-2xl font-bold text-indigo-600">{totalPercent}%</span>
            </div>
          </div>
        </div>

        {/* Oportunidades y Amenazas */}
        <div className="space-y-6">
          <p className="text-sm text-gray-600">Identifique oportunidades y amenazas relevantes que se reflejen en el FODA del Plan Estratégico.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Oportunidades */}
            <div>
              <h4 className="text-green-700 font-semibold mb-3">OPORTUNIDADES</h4>
              <div className="space-y-2">
                {oportunidades.map((op, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600 w-8">O{index + 1}</span>
                    <input
                      type="text"
                      value={op}
                      onChange={(e) => updateOportunidad(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Oportunidad ${index + 1}`}
                    />
                    {oportunidades.length > 1 && (
                      <button type="button" className="btn-secondary text-red-600 hover:text-red-700 p-1" onClick={() => removeOportunidad(index)} aria-label="Eliminar oportunidad">-</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary text-sm" onClick={addOportunidad}>+ Añadir oportunidad</button>
              </div>
            </div>

            {/* Amenazas */}
            <div>
              <h4 className="text-red-700 font-semibold mb-3">AMENAZAS</h4>
              <div className="space-y-2">
                {amenazas.map((am, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-600 w-8">A{index + 1}</span>
                    <input
                      type="text"
                      value={am}
                      onChange={(e) => updateAmenaza(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Amenaza ${index + 1}`}
                    />
                    {amenazas.length > 1 && (
                      <button type="button" className="btn-secondary text-red-600 hover:text-red-700 p-1" onClick={() => removeAmenaza(index)} aria-label="Eliminar amenaza">-</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary text-sm" onClick={addAmenaza}>+ Añadir amenaza</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}