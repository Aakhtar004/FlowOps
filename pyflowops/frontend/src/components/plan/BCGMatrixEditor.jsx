import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { useToast } from '../ui/Toast'
import { useAnalysisTools } from '../../hooks/useApi'

const BCGMatrixEditor = ({ planId, onSave }) => {
  const { success, error: showError } = useToast()
  const { tools: toolsData, isLoading: dataLoading, updateTools } = useAnalysisTools(planId)

  // Datos base
  const productos = ['Producto 1', 'Producto 2', 'Producto 3', 'Producto 4', 'Producto 5']
  const añosDemanda = [2012, 2013, 2014, 2015, 2016, 2017]
  const periodosTCM = ['2012-2013', '2013-2014', '2014-2015', '2015-2016', '2016-2017']

  // Estados para las tres tablas de entrada
  const [ventasActuales, setVentasActuales] = useState(
    productos.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  )

  const [demandaGlobal, setDemandaGlobal] = useState(
    productos.reduce((acc, p) => ({
      ...acc,
      [p]: añosDemanda.reduce((yearAcc, year) => ({ ...yearAcc, [year]: 0 }), {})
    }), {})
  )

  const [ventasCompetidores, setVentasCompetidores] = useState(
    productos.reduce((acc, p) => ({
      ...acc,
      [p]: Array(9).fill(null).map(() => ({ empresa: '', ventas: 0 }))
    }), {})
  )

  // Estados para reflexiones y listas
  const [reflexion, setReflexion] = useState('')
  const [fortalezas, setFortalezas] = useState(['', ''])
  const [debilidades, setDebilidades] = useState(['', ''])

  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos existentes desde el backend
  useEffect(() => {
    if (toolsData?.bcg_matrix_data) {
      const bcgData = toolsData.bcg_matrix_data
      if (bcgData.ventasActuales) setVentasActuales(bcgData.ventasActuales)
      if (bcgData.demandaGlobal) setDemandaGlobal(bcgData.demandaGlobal)
      if (bcgData.ventasCompetidores) setVentasCompetidores(bcgData.ventasCompetidores)
      if (bcgData.reflexion) setReflexion(bcgData.reflexion)
      if (bcgData.fortalezas) setFortalezas(bcgData.fortalezas)
      if (bcgData.debilidades) setDebilidades(bcgData.debilidades)
    }
  }, [toolsData])

  // ============================================================
  // FUNCIONES DE CÁLCULO
  // ============================================================

  // Calcular porcentaje de ventas sobre el total
  const calculateSalesShare = () => {
    const total = Object.values(ventasActuales).reduce((sum, val) => sum + parseFloat(val || 0), 0)
    if (total === 0) return {}
    
    return productos.reduce((acc, p) => ({
      ...acc,
      [p]: ((parseFloat(ventasActuales[p] || 0) / total) * 100).toFixed(2)
    }), {})
  }

  // Calcular TCM (Tasa de Crecimiento del Mercado)
  const calculateTCM = () => {
    return productos.reduce((acc, producto) => {
      const años = añosDemanda
      const demandas = años.map(año => parseFloat(demandaGlobal[producto]?.[año] || 0))
      
      // Calcular crecimiento promedio anual
      let totalCrecimiento = 0
      let periodosValidos = 0
      
      for (let i = 1; i < demandas.length; i++) {
        if (demandas[i - 1] > 0) {
          const crecimiento = ((demandas[i] - demandas[i - 1]) / demandas[i - 1]) * 100
          totalCrecimiento += crecimiento
          periodosValidos++
        }
      }
      
      const tcm = periodosValidos > 0 ? (totalCrecimiento / periodosValidos).toFixed(2) : 0
      return { ...acc, [producto]: tcm }
    }, {})
  }

  // Calcular PRM (Posicionamiento Relativo de Mercado)
  const calculatePRM = () => {
    return productos.reduce((acc, producto) => {
      const ventasProducto = parseFloat(ventasActuales[producto] || 0)
      const competidores = ventasCompetidores[producto] || []
      const ventasCompetidoresValidas = competidores
        .map(c => parseFloat(c.ventas || 0))
        .filter(v => v > 0)
      
      const mayorCompetidor = ventasCompetidoresValidas.length > 0 
        ? Math.max(...ventasCompetidoresValidas) 
        : 0
      
      const prm = mayorCompetidor > 0 
        ? (ventasProducto / mayorCompetidor).toFixed(2) 
        : 0
      
      return { ...acc, [producto]: prm }
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

  // Generar decisión estratégica
  const generarDecisionEstrategica = (posicionamiento) => {
    const decisiones = {
      'Estrella': 'Invertir y crecer',
      'Vaca': 'Mantener y cosechar',
      'Incógnita': 'Analizar y decidir',
      'Perro': 'Desinvertir o eliminar'
    }
    return decisiones[posicionamiento] || 'N/A'
  }

  // Calcular valores para la matriz resumen
  const salesShare = calculateSalesShare()
  const tcmValues = calculateTCM()
  const prmValues = calculatePRM()

  // ============================================================
  // HANDLERS
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
        ventasActuales,
        demandaGlobal,
        ventasCompetidores,
        reflexion,
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

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TABLA 1: PREVISIÓN DE VENTAS */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            1. PREVISIÓN DE VENTAS
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PRODUCTOS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    VENTAS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    % S/ TOTAL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {producto}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={ventasActuales[producto] || ''}
                        onChange={(e) => handleVentaChange(producto, e.target.value)}
                        className="input w-full"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {salesShare[producto] || '0.00'}%
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA 2: EVOLUCIÓN DE LA DEMANDA GLOBAL */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. EVOLUCIÓN DE LA DEMANDA GLOBAL SECTOR (en miles de soles)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PRODUCTOS
                  </th>
                  {añosDemanda.map((año) => (
                    <th
                      key={año}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {año}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {producto}
                    </td>
                    {añosDemanda.map((año) => (
                      <td key={año} className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={demandaGlobal[producto]?.[año] || ''}
                          onChange={(e) =>
                            handleDemandaChange(producto, año, e.target.value)
                          }
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

        {/* TABLA 3: NIVELES DE VENTA DE COMPETIDORES */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            3. NIVELES DE VENTA DE LOS COMPETIDORES DE CADA PRODUCTO
          </h3>
          <div className="space-y-6">
            {productos.map((producto) => {
              const competidores = ventasCompetidores[producto] || []
              const ventasMayores = competidores
                .map(c => parseFloat(c.ventas || 0))
                .filter(v => v > 0)
              const mayorVenta = ventasMayores.length > 0 
                ? Math.max(...ventasMayores) 
                : 0

              return (
                <div key={producto} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {producto}
                  </h4>
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
                                    producto,
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
                                    producto,
                                    index,
                                    'ventas',
                                    e.target.value
                                  )
                                }
                                className="input w-full"
                                placeholder="0.00"
                              />
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-yellow-50 font-semibold">
                          <td className="px-4 py-2 text-sm">MAYOR</td>
                          <td className="px-4 py-2 text-sm">{mayorVenta.toFixed(2)}</td>
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            4. BCG RESUMEN Y DECISIÓN ESTRATÉGICA
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Decisión Estratégica
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => {
                  const tcm = tcmValues[producto]
                  const prm = prmValues[producto]
                  const share = salesShare[producto]
                  const posicionamiento = determinarPosicionamiento(tcm, prm)
                  const decision = generarDecisionEstrategica(posicionamiento)

                  const colorPosicionamiento = {
                    'Estrella': 'bg-yellow-100 text-yellow-800',
                    'Vaca': 'bg-green-100 text-green-800',
                    'Incógnita': 'bg-blue-100 text-blue-800',
                    'Perro': 'bg-gray-100 text-gray-800'
                  }[posicionamiento]

                  return (
                    <tr key={producto}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {producto}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tcm}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{prm}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{share}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${colorPosicionamiento}`}>
                          {posicionamiento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{decision}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* REFLEXIONES Y LISTAS */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            5. REFLEXIONES Y ANÁLISIS
          </h3>

          {/* Reflexión */}
          <div>
            <label className="form-label">Reflexión sobre la Matriz BCG</label>
            <textarea
              value={reflexion}
              onChange={(e) => setReflexion(e.target.value)}
              className="input w-full"
              rows={4}
              placeholder="Escribe tu reflexión sobre los resultados de la matriz BCG..."
            />
          </div>

          {/* Fortalezas */}
          <div>
            <label className="form-label">Fortalezas Identificadas</label>
            <div className="space-y-2">
              {fortalezas.map((fortaleza, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={fortaleza}
                    onChange={(e) => actualizarFortaleza(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Fortaleza ${index + 1}`}
                  />
                  {fortalezas.length > 2 && (
                    <button
                      type="button"
                      onClick={() => eliminarFortaleza(index)}
                      className="btn-secondary text-red-600 hover:text-red-700"
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
                + Agregar Fortaleza
              </button>
            </div>
          </div>

          {/* Debilidades */}
          <div>
            <label className="form-label">Debilidades Identificadas</label>
            <div className="space-y-2">
              {debilidades.map((debilidad, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={debilidad}
                    onChange={(e) => actualizarDebilidad(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Debilidad ${index + 1}`}
                  />
                  {debilidades.length > 2 && (
                    <button
                      type="button"
                      onClick={() => eliminarDebilidad(index)}
                      className="btn-secondary text-red-600 hover:text-red-700"
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
                + Agregar Debilidad
              </button>
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
