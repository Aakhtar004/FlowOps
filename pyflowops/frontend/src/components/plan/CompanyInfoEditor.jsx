import { useState, useEffect } from 'react'
import { Building2, Upload, Save } from 'lucide-react'
import { usePlan } from '../../hooks/useApi'
import { useToast } from '../ui/Toast'
import { plansAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const CompanyInfoEditor = ({ planId }) => {
  const { data: plan, isLoading, refetch } = usePlan(planId)
  const { success, error: showError } = useToast()
  
  const [companyName, setCompanyName] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')
  const [promoters, setPromoters] = useState('')
  const [strategicUnits, setStrategicUnits] = useState(['', '', '', ''])
  const [conclusions, setConclusions] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (plan) {
      setCompanyName(plan.company_name || '')
      setCompanyLogoUrl(plan.company_logo_url || '')
      setPromoters(plan.promoters || '')
      setConclusions(plan.conclusions || '')
      
      // Parsear unidades estratégicas
      if (plan.strategic_units && Array.isArray(plan.strategic_units)) {
        const units = [...plan.strategic_units]
        while (units.length < 4) units.push('')
        setStrategicUnits(units.slice(0, 4))
      }
    }
  }, [plan])

  const handleStrategicUnitChange = (index, value) => {
    const newUnits = [...strategicUnits]
    newUnits[index] = value
    setStrategicUnits(newUnits)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Filtrar unidades estratégicas vacías
      const filteredUnits = strategicUnits.filter(unit => unit.trim() !== '')
      
      const data = {
        company_name: companyName.trim() || null,
        company_logo_url: companyLogoUrl.trim() || null,
        promoters: promoters.trim() || null,
        strategic_units: filteredUnits.length > 0 ? filteredUnits : null,
        conclusions: conclusions.trim() || null
      }

      await plansAPI.update(planId, data)
      await refetch()
      success('Información de la empresa guardada exitosamente')
    } catch (err) {
      console.error('Error al guardar información de la empresa:', err)
      showError('Error al guardar la información de la empresa')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            <h2 className="card-title">Información de la Empresa</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona la información general que aparecerá en el resumen ejecutivo
          </p>
        </div>
        
        <div className="card-content space-y-6">
          {/* Nombre de la empresa */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="Ej: Tecnología Innovadora S.A."
            />
            <p className="mt-1 text-sm text-gray-500">
              El nombre oficial de tu empresa o proyecto
            </p>
          </div>

          {/* Logo de la empresa */}
          <div>
            <label htmlFor="companyLogoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>URL del Logo</span>
              </div>
            </label>
            <input
              id="companyLogoUrl"
              type="url"
              value={companyLogoUrl}
              onChange={(e) => setCompanyLogoUrl(e.target.value)}
              className="input"
              placeholder="https://ejemplo.com/logo.png"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL de la imagen del logo de tu empresa (PNG, JPG o SVG)
            </p>
            
            {/* Vista previa del logo */}
            {companyLogoUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                <img
                  src={companyLogoUrl}
                  alt="Logo de la empresa"
                  className="h-24 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información Adicional para el Resumen
            </h3>
            
            {/* Emprendedores / Promotores */}
            <div className="mb-6">
              <label htmlFor="promoters" className="block text-sm font-medium text-gray-700 mb-2">
                Emprendedores / Promotores
              </label>
              <textarea
                id="promoters"
                value={promoters}
                onChange={(e) => setPromoters(e.target.value)}
                className="textarea"
                rows={3}
                placeholder="Nombres de los emprendedores o promotores del proyecto..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Las personas responsables de la dirección del proyecto
              </p>
            </div>

            {/* Unidades Estratégicas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidades Estratégicas de Negocio (hasta 4)
              </label>
              <div className="space-y-3">
                {strategicUnits.map((unit, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => handleStrategicUnitChange(index, e.target.value)}
                      className="input"
                      placeholder={`Unidad estratégica ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Las diferentes áreas o líneas de negocio de tu empresa
              </p>
            </div>

            {/* Conclusiones */}
            <div>
              <label htmlFor="conclusions" className="block text-sm font-medium text-gray-700 mb-2">
                Conclusiones del Plan Estratégico
              </label>
              <textarea
                id="conclusions"
                value={conclusions}
                onChange={(e) => setConclusions(e.target.value)}
                className="textarea"
                rows={6}
                placeholder="Escribe las conclusiones principales de tu plan estratégico..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Un resumen de los hallazgos y decisiones estratégicas clave
              </p>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !companyName.trim()}
              className="btn-primary"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Información
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyInfoEditor
