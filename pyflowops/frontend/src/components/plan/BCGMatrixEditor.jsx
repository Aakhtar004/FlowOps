import React, { useState, useEffect } from 'react'
import { Save, Plus, Minus } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../ui/Toast'
import { useAnalysisTools } from '../../hooks/useApi'

const BCGMatrixEditor = ({ planId, onSave, strengthsCount = 0, weaknessesCount = 0 }) => {
  const { success, error: showError } = useToast()
  const { tools: toolsData, isLoading: dataLoading, updateTools } = useAnalysisTools(planId)

  // Datos base con colores distintivos para productos (dinámicos)
  const colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#A29BFE', '#55E6C1', '#FD79A8', '#00B894']
  const [productos, setProductos] = useState([
    { nombre: 'Producto 1', color: colorPalette[0] },
    { nombre: 'Producto 2', color: colorPalette[1] },
    { nombre: 'Producto 3', color: colorPalette[2] },
    { nombre: 'Producto 4', color: colorPalette[3] },
    { nombre: 'Producto 5', color: colorPalette[4] }
  ])
  const [añosDemanda, setAñosDemanda] = useState([2012, 2013, 2014, 2015, 2016, 2017])

  // Estados para las tres tablas de entrada
  const [ventasActuales, setVentasActuales] = useState(
    productos.reduce((acc, p) => ({ ...acc, [p.nombre]: 0 }), {})
  )

  const [demandaGlobal, setDemandaGlobal] = useState(
    productos.reduce((acc, p) => ({
      ...acc,
      [p.nombre]: añosDemanda.reduce((yearAcc, year) => ({ ...yearAcc, [year]: 0 }), {})
    }), {})
  )

  // Estado dinámico para competidores (sin límite fijo)
  const [ventasCompetidores, setVentasCompetidores] = useState(
    productos.reduce((acc, p) => ({
      ...acc,
      [p.nombre]: [{ empresa: '', ventas: 0 }] // Empezar con al menos un competidor
    }), {})
  )

  // Estados para decisiones estratégicas editables
  const [decisionesEstrategicas, setDecisionesEstrategicas] = useState(
    productos.reduce((acc, p) => ({ ...acc, [p.nombre]: 'Mantener' }), {})
  )

  // Estados para listas dinámicas (FODA)
  const [fortalezas, setFortalezas] = useState(['', ''])
  const [debilidades, setDebilidades] = useState(['', ''])

  const [isSaving, setIsSaving] = useState(false)
  const [añoInicialInput, setAñoInicialInput] = useState(añosDemanda[0] || new Date().getFullYear())

  // Cargar datos existentes desde el backend
  useEffect(() => {
    if (toolsData?.bcg_matrix_data) {
      const bcgData = toolsData.bcg_matrix_data
      if (bcgData.productos && Array.isArray(bcgData.productos)) setProductos(bcgData.productos)
      if (bcgData.years && Array.isArray(bcgData.years) && bcgData.years.length > 0) setAñosDemanda(bcgData.years)
      if (bcgData.ventasActuales) setVentasActuales(bcgData.ventasActuales)
      if (bcgData.demandaGlobal) setDemandaGlobal(bcgData.demandaGlobal)
      if (bcgData.ventasCompetidores) setVentasCompetidores(bcgData.ventasCompetidores)
      if (bcgData.decisionesEstrategicas) setDecisionesEstrategicas(bcgData.decisionesEstrategicas)
      if (bcgData.fortalezas) setFortalezas(bcgData.fortalezas)
      if (bcgData.debilidades) setDebilidades(bcgData.debilidades)
    }
  }, [toolsData])

  // Mantener sincronizado el input del año inicial cuando cambie la lista de años
  useEffect(() => {
    if (Array.isArray(añosDemanda) && añosDemanda.length > 0) {
      setAñoInicialInput(añosDemanda[0])
    }
  }, [añosDemanda])

  // ============================================================
  // FUNCIONES DE CÁLCULO CORREGIDAS
  // ============================================================

  // Calcular porcentaje de ventas sobre el total
  const calculateSalesShare = () => {
    const total = Object.values(ventasActuales).reduce((sum, val) => sum + parseFloat(val || 0), 0)
    if (total === 0) return {}
    
    return productos.reduce((acc, p) => ({
      ...acc,
      [p.nombre]: ((parseFloat(ventasActuales[p.nombre] || 0) / total) * 100).toFixed(2)
    }), {})
  }

  // Calcular TCM (Tasa de Crecimiento del Mercado) - dinámica según años
  const calculateTCM = () => {
    return productos.reduce((acc, producto) => {
      const firstYear = añosDemanda[0]
      const lastYear = añosDemanda[añosDemanda.length - 1]
      const periodCount = Math.max(1, añosDemanda.length - 1)
      const demandaStart = parseFloat(demandaGlobal[producto.nombre]?.[firstYear] || 0)
      const demandaEnd = parseFloat(demandaGlobal[producto.nombre]?.[lastYear] || 0)

      // Fórmula: TCM = (((Demanda[last] - Demanda[first]) / Demanda[first]) / periodos) * 100
      let tcm = 0
      if (demandaStart > 0) {
        tcm = (((demandaEnd - demandaStart) / demandaStart) / periodCount) * 100
      }
      
      return { ...acc, [producto.nombre]: tcm.toFixed(2) }
    }, {})
  }

  // Calcular PRM (Posicionamiento Relativo de Mercado)
  const calculatePRM = () => {
    return productos.reduce((acc, producto) => {
      const ventasProducto = parseFloat(ventasActuales[producto.nombre] || 0)
      const competidores = ventasCompetidores[producto.nombre] || []
      const ventasCompetidoresValidas = competidores
        .map(c => parseFloat(c.ventas || 0))
        .filter(v => v > 0)
      
      const mayorCompetidor = ventasCompetidoresValidas.length > 0 
        ? Math.max(...ventasCompetidoresValidas) 
        : 0
      
      const prm = mayorCompetidor > 0 
        ? (ventasProducto / mayorCompetidor).toFixed(2) 
        : 0
      
      return { ...acc, [producto.nombre]: prm }
    }, {})
  }

  // Determinar posicionamiento BCG
  const determinarPosicionamiento = (tcm, prm) => {
    const tcmNum = parseFloat(tcm)
    const prmNum = parseFloat(prm)
    
    if (tcmNum >= 10 && prmNum >= 1) return 'Estrella'
    if (tcmNum < 10 && prmNum >= 1) return 'Vaca'
    if (tcmNum >= 10 && prmNum < 1) return 'Incógnita'
    return 'Perro'
  }

  // Calcular valores para la matriz resumen
  const salesShare = calculateSalesShare()
  const tcmValues = calculateTCM()
  const prmValues = calculatePRM()

  // ============================================================
  // HANDLERS PARA TABLAS DINÁMICAS
  // ============================================================

  const handleVentaChange = (producto, value) => {
    setVentasActuales(prev => ({ ...prev, [producto]: value }))
  }

  const handleDemandaChange = (producto, año, value) => {
    setDemandaGlobal(prev => ({
      ...prev,
      [producto]: { ...prev[producto], [año]: value }
    }))
  }

  const handleCompetidorChange = (producto, index, field, value) => {
    setVentasCompetidores(prev => {
      const newCompetidores = [...prev[producto]]
      newCompetidores[index] = { ...newCompetidores[index], [field]: value }
      return { ...prev, [producto]: newCompetidores }
    })
  }

  // Gestión dinámica de productos
  const agregarProducto = () => {
    const nextIndex = productos.length
    const newNameBase = `Producto ${nextIndex + 1}`
    let newName = newNameBase
    const existingNames = new Set(productos.map(p => p.nombre))
    let suffix = 1
    while (existingNames.has(newName)) {
      newName = `${newNameBase}-${suffix++}`
    }
    const newColor = colorPalette[nextIndex % colorPalette.length]
    const nuevoProducto = { nombre: newName, color: newColor }
    setProductos(prev => [...prev, nuevoProducto])
    setVentasActuales(prev => ({ ...prev, [newName]: 0 }))
    setDecisionesEstrategicas(prev => ({ ...prev, [newName]: 'Mantener' }))
    setDemandaGlobal(prev => ({
      ...prev,
      [newName]: añosDemanda.reduce((acc, año) => ({ ...acc, [año]: 0 }), {})
    }))
    setVentasCompetidores(prev => ({ ...prev, [newName]: [{ empresa: '', ventas: 0 }] }))
  }

  const eliminarProducto = (index) => {
    const nombre = productos[index].nombre
    const nuevosProductos = productos.filter((_, i) => i !== index)
    setProductos(nuevosProductos)
    setVentasActuales(prev => {
      const { [nombre]: _, ...rest } = prev
      return rest
    })
    setDecisionesEstrategicas(prev => {
      const { [nombre]: _, ...rest } = prev
      return rest
    })
    setDemandaGlobal(prev => {
      const { [nombre]: _, ...rest } = prev
      return rest
    })
    setVentasCompetidores(prev => {
      const { [nombre]: _, ...rest } = prev
      return rest
    })
  }

  const handleProductoNombreChange = (index, nuevoNombre) => {
    const oldName = productos[index].nombre
    const sanitized = (nuevoNombre || '').trim()
    if (!sanitized || sanitized === oldName) return
    const nameExists = productos.some((p, i) => i !== index && p.nombre === sanitized)
    const finalName = nameExists ? `${sanitized}-${Date.now()}` : sanitized

    const nuevosProductos = productos.map((p, i) => (i === index ? { ...p, nombre: finalName } : p))
    setProductos(nuevosProductos)

    setVentasActuales(prev => {
      const { [oldName]: oldVal, ...rest } = prev
      return { ...rest, [finalName]: oldVal }
    })
    setDecisionesEstrategicas(prev => {
      const { [oldName]: oldVal, ...rest } = prev
      return { ...rest, [finalName]: oldVal }
    })
    setDemandaGlobal(prev => {
      const { [oldName]: oldVal, ...rest } = prev
      return { ...rest, [finalName]: oldVal }
    })
    setVentasCompetidores(prev => {
      const { [oldName]: oldVal, ...rest } = prev
      return { ...rest, [finalName]: oldVal }
    })
  }

  // Gestión dinámica de años de demanda
  const agregarAño = () => {
    const nextYear = Math.max(...añosDemanda) + 1
    const nuevosAños = [...añosDemanda, nextYear]
    setAñosDemanda(nuevosAños)
    setDemandaGlobal(prev => {
      const nuevo = { ...prev }
      productos.forEach(p => {
        nuevo[p.nombre] = { ...nuevo[p.nombre], [nextYear]: 0 }
      })
      return nuevo
    })
  }

  const eliminarUltimoAño = () => {
    if (añosDemanda.length <= 2) return
    const last = añosDemanda[añosDemanda.length - 1]
    const nuevosAños = añosDemanda.slice(0, -1)
    setAñosDemanda(nuevosAños)
    setDemandaGlobal(prev => {
      const nuevo = { ...prev }
      productos.forEach(p => {
        const { [last]: _, ...restYears } = nuevo[p.nombre] || {}
        nuevo[p.nombre] = restYears
      })
      return nuevo
    })
  }

  // Establecer año inicial y remapear valores por posición de columna
  const aplicarAñoInicial = () => {
    const nuevoInicio = parseInt(añoInicialInput, 10)
    if (isNaN(nuevoInicio) || nuevoInicio <= 0) return
    const oldYears = [...añosDemanda]
    const newYears = oldYears.map((_, idx) => nuevoInicio + idx)
    setAñosDemanda(newYears)
    setDemandaGlobal(prev => {
      const nuevo = { ...prev }
      productos.forEach(p => {
        const oldMap = nuevo[p.nombre] || {}
        const remap = {}
        oldYears.forEach((oldY, idx) => {
          const newY = newYears[idx]
          remap[newY] = oldMap[oldY] ?? 0
        })
        nuevo[p.nombre] = remap
      })
      return nuevo
    })
  }

  // Funciones dinámicas para competidores
  const agregarCompetidor = (producto) => {
    setVentasCompetidores(prev => ({
      ...prev,
      [producto]: [...prev[producto], { empresa: '', ventas: 0 }]
    }))
  }

  const eliminarCompetidor = (producto, index) => {
    setVentasCompetidores(prev => {
      const newCompetidores = prev[producto].filter((_, i) => i !== index)
      // Mantener al menos un competidor
      if (newCompetidores.length === 0) {
        newCompetidores.push({ empresa: '', ventas: 0 })
      }
      return { ...prev, [producto]: newCompetidores }
    })
  }

  const handleDecisionChange = (producto, decision) => {
    setDecisionesEstrategicas(prev => ({ ...prev, [producto]: decision }))
  }

  // Funciones para fortalezas y debilidades
  const agregarFortaleza = () => {
    setFortalezas([...fortalezas, ''])
  }

  const eliminarFortaleza = (index) => {
    if (fortalezas.length > 2) {
      setFortalezas(fortalezas.filter((_, i) => i !== index))
    }
  }

  const actualizarFortaleza = (index, value) => {
    const nuevas = [...fortalezas]
    nuevas[index] = value
    setFortalezas(nuevas)
  }

  const agregarDebilidad = () => {
    setDebilidades([...debilidades, ''])
  }

  const eliminarDebilidad = (index) => {
    if (debilidades.length > 2) {
      setDebilidades(debilidades.filter((_, i) => i !== index))
    }
  }

  const actualizarDebilidad = (index, value) => {
    const nuevas = [...debilidades]
    nuevas[index] = value
    setDebilidades(nuevas)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const bcgData = {
        productos,
        years: añosDemanda,
        ventasActuales,
        demandaGlobal,
        ventasCompetidores,
        decisionesEstrategicas,
        fortalezas,
        debilidades
      }

      // Guardar en el backend usando el hook
      await updateTools({ bcg_matrix_data: bcgData })
      
      // Notificar al componente padre (opcional)
      if (onSave) {
        await onSave(bcgData)
      }

      success('Matriz BCG guardada exitosamente')
    } catch (error) {
      console.error('Error al guardar matriz BCG:', error)
      showError(error.message || 'Error al guardar los datos')
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================
  // COMPONENTE GRÁFICO BCG
  // ============================================================
  const BCGChart = () => {
    const chartSize = 400
    const margin = 60
    const innerSize = chartSize - 2 * margin

    return (
      <div className="bg-white p-6 border rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Gráfico Visual Matriz BCG</h4>
        <div className="flex justify-center">
          <svg width={chartSize} height={chartSize} className="border">
            {/* Líneas divisorias */}
            <line x1={margin + innerSize/2} y1={margin} x2={margin + innerSize/2} y2={chartSize - margin} stroke="#ccc" strokeWidth="2" strokeDasharray="5,5" />
            <line x1={margin} y1={margin + innerSize/2} x2={chartSize - margin} y2={margin + innerSize/2} stroke="#ccc" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Ejes */}
            <line x1={margin} y1={chartSize - margin} x2={chartSize - margin} y2={chartSize - margin} stroke="#333" strokeWidth="2" />
            <line x1={margin} y1={margin} x2={margin} y2={chartSize - margin} stroke="#333" strokeWidth="2" />
            
            {/* Etiquetas de ejes */}
            <text x={chartSize/2} y={chartSize - 20} textAnchor="middle" className="text-sm font-medium">PRM (Posicionamiento Relativo de Mercado)</text>
            <text x={20} y={chartSize/2} textAnchor="middle" transform={`rotate(-90, 20, ${chartSize/2})`} className="text-sm font-medium">TCM (%)</text>
            
            {/* Etiquetas de cuadrantes */}
            <text x={margin + innerSize*0.25} y={margin + 20} textAnchor="middle" className="text-xs font-bold fill-blue-600">INCÓGNITA</text>
            <text x={margin + innerSize*0.75} y={margin + 20} textAnchor="middle" className="text-xs font-bold fill-yellow-600">ESTRELLA</text>
            <text x={margin + innerSize*0.25} y={chartSize - margin - 10} textAnchor="middle" className="text-xs font-bold fill-gray-600">PERRO</text>
            <text x={margin + innerSize*0.75} y={chartSize - margin - 10} textAnchor="middle" className="text-xs font-bold fill-green-600">VACA</text>
            
            {/* Burbujas de productos */}
            {productos.map((producto) => {
              const tcm = parseFloat(tcmValues[producto.nombre] || 0)
              const prm = parseFloat(prmValues[producto.nombre] || 0)
              const share = parseFloat(salesShare[producto.nombre] || 0)
              
              // Normalizar posiciones (TCM: 0-20%, PRM: 0-2)
              const x = margin + (Math.min(prm, 2) / 2) * innerSize
              const y = chartSize - margin - (Math.min(Math.max(tcm, -10), 20) + 10) / 30 * innerSize
              
              // Tamaño de burbuja proporcional al % de ventas
              const radius = Math.max(8, Math.min(30, share * 2))
              
              return (
                <g key={producto.nombre}>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={producto.color}
                    fillOpacity="0.7"
                    stroke={producto.color}
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    P{productos.findIndex(p => p.nombre === producto.nombre) + 1}
                  </text>
                </g>
              )
            })}
            
            {/* Marcas en los ejes */}
            <text x={margin + innerSize/2} y={chartSize - margin + 15} textAnchor="middle" className="text-xs">1.0</text>
            <text x={margin - 10} y={margin + innerSize/2 + 4} textAnchor="end" className="text-xs">10%</text>
          </svg>
        </div>
        
        {/* Leyenda */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {productos.map((producto, index) => (
            <div key={producto.nombre} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: producto.color }}
              ></div>
              <span className="text-xs">P{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TABLA 1: PREVISIÓN DE VENTAS */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            1. PREVISIÓN DE VENTAS
          </h3>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={agregarProducto} className="btn-secondary text-sm flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Añadir Producto</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PRODUCTOS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    VENTAS (S/)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    % S/ TOTAL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto, idx) => (
                  <tr key={producto.nombre}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: producto.color }}
                      ></div>
                      <input
                        type="text"
                        value={producto.nombre}
                        onChange={(e) => handleProductoNombreChange(idx, e.target.value)}
                        className="input w-40"
                        placeholder={`Producto ${idx + 1}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={ventasActuales[producto.nombre] || ''}
                        onChange={(e) => handleVentaChange(producto.nombre, e.target.value)}
                        className="input w-full"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {salesShare[producto.nombre] || '0.00'}%
                    </td>
                    <td className="px-4 py-3">
                      {productos.length > 1 && (
                        <button type="button" onClick={() => eliminarProducto(idx)} className="btn-secondary text-red-600 hover:text-red-700 p-1">
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 text-sm">TOTAL</td>
                  <td className="px-4 py-3 text-sm">
                    {Object.values(ventasActuales)
                      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {Object.values(salesShare)
                      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
                      .toFixed(2)}%
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA 2: EVOLUCIÓN DE LA DEMANDA GLOBAL */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. EVOLUCIÓN DE LA DEMANDA GLOBAL SECTOR (en miles de soles)
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={añoInicialInput}
                onChange={(e) => setAñoInicialInput(e.target.value)}
                className="input w-28"
                placeholder="Año inicial"
              />
              <button type="button" onClick={aplicarAñoInicial} className="btn-secondary text-sm">
                Fijar Año Inicial
              </button>
            </div>
            <button type="button" onClick={agregarAño} className="btn-secondary text-sm flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Añadir Año</span>
            </button>
            <button type="button" onClick={eliminarUltimoAño} className="btn-secondary text-sm flex items-center space-x-1">
              <Minus className="h-4 w-4" />
              <span>Quitar Último Año</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PRODUCTOS
                  </th>
                  {añosDemanda.map(año => (
                    <th key={año} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {año}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.nombre}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: producto.color }}
                      ></div>
                      <span>{producto.nombre}</span>
                    </td>
                    {añosDemanda.map(año => (
                      <td key={año} className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={demandaGlobal[producto.nombre]?.[año] || ''}
                          onChange={(e) => handleDemandaChange(producto.nombre, año, e.target.value)}
                          className="input w-full"
                          placeholder="0.00"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA 3: NIVELES DE VENTA DE LOS COMPETIDORES - DINÁMICO */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            3. NIVELES DE VENTA DE LOS COMPETIDORES DE CADA PRODUCTO
          </h3>
          <div className="space-y-6">
            {productos.map((producto) => {
              const competidores = ventasCompetidores[producto.nombre] || []
              const ventasMayores = competidores
                .map(c => parseFloat(c.ventas || 0))
                .filter(v => v > 0)
              const mayorVenta = ventasMayores.length > 0 
                ? Math.max(...ventasMayores) 
                : 0

              return (
                <div key={producto.nombre} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: producto.color }}
                      ></div>
                      <h4 className="text-md font-semibold text-gray-800">{producto.nombre}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => agregarCompetidor(producto.nombre)}
                      className="btn-secondary text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar Competidor</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border bg-white">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            EMPRESA
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            VENTAS
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            ACCIONES
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {competidores.map((competidor, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={competidor.empresa}
                                onChange={(e) =>
                                  handleCompetidorChange(
                                    producto.nombre,
                                    index,
                                    'empresa',
                                    e.target.value
                                  )
                                }
                                className="input w-full"
                                placeholder={`Competidor ${index + 1}`}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={competidor.ventas || ''}
                                onChange={(e) =>
                                  handleCompetidorChange(
                                    producto.nombre,
                                    index,
                                    'ventas',
                                    e.target.value
                                  )
                                }
                                className="input w-full"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-4 py-2">
                              {competidores.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => eliminarCompetidor(producto.nombre, index)}
                                  className="btn-secondary text-red-600 hover:text-red-700 p-1"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-yellow-50 font-semibold">
                          <td className="px-4 py-2 text-sm">MAYOR</td>
                          <td className="px-4 py-2 text-sm">{mayorVenta.toFixed(2)}</td>
                          <td className="px-4 py-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MATRIZ RESUMEN BCG */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            4. BCG RESUMEN
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    TCM (%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    PRM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    % S/ VTAS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Posicionamiento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => {
                  const tcm = tcmValues[producto.nombre]
                  const prm = prmValues[producto.nombre]
                  const share = salesShare[producto.nombre]
                  const posicionamiento = determinarPosicionamiento(tcm, prm)

                  const colorPosicionamiento = {
                    'Estrella': 'bg-yellow-100 text-yellow-800',
                    'Vaca': 'bg-green-100 text-green-800',
                    'Incógnita': 'bg-blue-100 text-blue-800',
                    'Perro': 'bg-gray-100 text-gray-800'
                  }[posicionamiento]

                  return (
                    <tr key={producto.nombre}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: producto.color }}
                        ></div>
                        <span>{producto.nombre}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tcm}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{prm}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{share}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${colorPosicionamiento}`}>
                          {posicionamiento}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* GRÁFICO VISUAL BCG */}
        <BCGChart />

        {/* LISTAS DINÁMICAS FODA (sin campo de reflexión) */}
        <div className="bg-white p-6 border rounded-lg space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">5. REFLEXIONES Y ANÁLISIS FODA</h3>

          {/* Sección Fortalezas y Debilidades en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Fortalezas */}
            <div>
              <h4 className="text-green-700 font-semibold mb-3">FORTALEZAS</h4>
              <div className="space-y-2">
                {fortalezas.map((fortaleza, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-8">F{strengthsCount + index + 1}</span>
                    <input
                      type="text"
                      value={fortaleza}
                      onChange={(e) => actualizarFortaleza(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Fortaleza ${strengthsCount + index + 1}`}
                    />
                    {fortalezas.length > 2 && (
                      <button
                        type="button"
                        onClick={() => eliminarFortaleza(index)}
                        className="btn-secondary text-red-600 hover:text-red-700 p-1"
                        aria-label="Eliminar fortaleza"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarFortaleza}
                  className="btn-secondary text-sm"
                >
                  + Añadir fortaleza
                </button>
              </div>
            </div>

            {/* Debilidades */}
            <div>
              <h4 className="text-red-700 font-semibold mb-3">DEBILIDADES</h4>
              <div className="space-y-2">
                {debilidades.map((debilidad, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-8">D{weaknessesCount + index + 1}</span>
                    <input
                      type="text"
                      value={debilidad}
                      onChange={(e) => actualizarDebilidad(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Debilidad ${weaknessesCount + index + 1}`}
                    />
                    {debilidades.length > 2 && (
                      <button
                        type="button"
                        onClick={() => eliminarDebilidad(index)}
                        className="btn-secondary text-red-600 hover:text-red-700 p-1"
                        aria-label="Eliminar debilidad"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={agregarDebilidad}
                  className="btn-secondary text-sm"
                >
                  + Añadir debilidad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <LoadingSpinner size="small" text="Guardando..." />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Matriz BCG
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BCGMatrixEditor
