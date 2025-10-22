import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Building, Plus, Minus } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useCompanyIdentity } from '../../hooks/useApi'

const IdentityEditor = ({ planId, onSave }) => {
  console.log('IdentityEditor component rendered with planId:', planId) // Debug log

  const [isLoading, setIsLoading] = useState(false)
  const [formInitialized, setFormInitialized] = useState(false)
  const { success, error: showError } = useToast()
  const { identity: identityData, isLoading: dataLoading, updateIdentity } = useCompanyIdentity(planId)

  // Estado para objetivos estratégicos
  const [generalObjectives, setGeneralObjectives] = useState([
    { id: 1, text: '', specificObjectives: [{ id: 1, text: '' }, { id: 2, text: '' }] },
    { id: 2, text: '', specificObjectives: [{ id: 1, text: '' }, { id: 2, text: '' }] }
  ])

  console.log('IdentityEditor hook data:', { identityData, dataLoading, planId, formInitialized }) // Debug log

  const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      mission: '',
      vision: '',
      values: ''
    }
  })

  console.log('IdentityEditor form state:', { errors, isDirty }) // Debug log

  useEffect(() => {
    if (identityData && !formInitialized && !dataLoading) {
      console.log('IdentityEditor useEffect triggered with data:', identityData) // Debug log

      // Los datos ya vienen como arrays gracias a los validadores de Pydantic
      const mission = identityData.mission || ''
      const vision = identityData.vision || ''
      const values = Array.isArray(identityData.values) ? identityData.values.join('\n') : (identityData.values || '')

      console.log('IdentityEditor setting form values:', { mission, vision, values }) // Debug log

      setValue('mission', mission)
      setValue('vision', vision)
      setValue('values', values)

      // Cargar objetivos estratégicos si existen
      console.log('DEBUG: Loading objectives from identityData:', identityData.general_objectives)
      if (identityData.general_objectives && Array.isArray(identityData.general_objectives) && identityData.general_objectives.length > 0) {
        const loadedObjectives = identityData.general_objectives.map((obj, index) => ({
          id: index + 1,
          text: obj.text || '',
          specificObjectives: obj.specific_objectives && Array.isArray(obj.specific_objectives)
            ? obj.specific_objectives.map((spec, specIndex) => ({ id: specIndex + 1, text: spec.text || '' }))
            : [{ id: 1, text: '' }, { id: 2, text: '' }]
        }))
        console.log('DEBUG: Setting general objectives:', loadedObjectives)
        setGeneralObjectives(loadedObjectives)
      } else {
        console.log('DEBUG: No objectives found or empty array, keeping default objectives')
        // Keep the default objectives so user can fill them
      }

      setFormInitialized(true)
      console.log('IdentityEditor form initialized successfully') // Debug log
    } else if (!identityData && !dataLoading) {
      console.log('IdentityEditor useEffect: no identityData available, dataLoading:', dataLoading) // Debug log
    }
  }, [identityData, dataLoading, formInitialized, setValue])

  const updateGeneralObjective = (index, text) => {
    const newObjectives = [...generalObjectives]
    newObjectives[index].text = text
    setGeneralObjectives(newObjectives)
  }

  const updateSpecificObjective = (generalIndex, specificIndex, text) => {
    const newObjectives = [...generalObjectives]
    newObjectives[generalIndex].specificObjectives[specificIndex].text = text
    setGeneralObjectives(newObjectives)
  }

  const addSpecificObjective = (generalIndex) => {
    const newObjectives = [...generalObjectives]
    const nextId = Math.max(...newObjectives[generalIndex].specificObjectives.map(obj => obj.id)) + 1
    newObjectives[generalIndex].specificObjectives.push({ id: nextId, text: '' })
    setGeneralObjectives(newObjectives)
  }

  const removeSpecificObjective = (generalIndex, specificIndex) => {
    const newObjectives = [...generalObjectives]
    if (newObjectives[generalIndex].specificObjectives.length > 2) {
      newObjectives[generalIndex].specificObjectives.splice(specificIndex, 1)
      setGeneralObjectives(newObjectives)
    }
  }

  const addGeneralObjective = () => {
    const nextId = Math.max(...generalObjectives.map(obj => obj.id)) + 1
    setGeneralObjectives([...generalObjectives, {
      id: nextId,
      text: '',
      specificObjectives: [{ id: 1, text: '' }, { id: 2, text: '' }]
    }])
  }

  const removeGeneralObjective = (index) => {
    if (generalObjectives.length > 1) {
      const newObjectives = [...generalObjectives]
      newObjectives.splice(index, 1)
      setGeneralObjectives(newObjectives)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      console.log('Submitting identity data:', data) // Debug log

      // Convertir strings a arrays donde sea necesario
      const filteredObjectives = generalObjectives.filter(obj => obj.text.trim() !== '').map(obj => ({
        text: obj.text,
        specific_objectives: obj.specificObjectives.filter(spec => spec.text.trim() !== '').map(spec => ({ text: spec.text }))
      }))

      const processedData = {
        ...data,
        values: data.values ? data.values.split('\n').filter(v => v.trim()) : [],
        general_objectives: filteredObjectives
      }

      console.log('DEBUG: Processed objectives data:', processedData.general_objectives)
      await updateIdentity(processedData)
      success('Identidad empresarial guardada correctamente')
      if (onSave) await onSave(processedData)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Error al guardar la identidad empresarial')
    } finally {
      setIsLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando identidad empresarial...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="card-title">Identidad Empresarial</h3>
        </div>
        <p className="card-description">
          Define los elementos fundamentales de tu organización
        </p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Sección A: Identidad Básica */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Identidad de la Empresa
            </h4>

            {/* Misión */}
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                Misión
              </label>
              <textarea
                id="mission"
                {...register('mission', {
                  required: 'La misión es requerida'
                })}
                rows={3}
                className="input"
                placeholder="Define el propósito fundamental de tu organización..."
              />
              {errors.mission && (
                <p className="text-red-500 text-sm mt-1">{errors.mission.message}</p>
              )}
            </div>

            {/* Visión */}
            <div>
              <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                Visión
              </label>
              <textarea
                id="vision"
                {...register('vision', {
                  required: 'La visión es requerida'
                })}
                rows={3}
                className="input"
                placeholder="Describe cómo ves tu organización en el futuro..."
              />
              {errors.vision && (
                <p className="text-red-500 text-sm mt-1">{errors.vision.message}</p>
              )}
            </div>

            {/* Valores */}
            <div>
              <label htmlFor="values" className="block text-sm font-medium text-gray-700 mb-2">
                Valores
              </label>
              <textarea
                id="values"
                {...register('values', {
                  required: 'Los valores son requeridos'
                })}
                rows={4}
                className="input"
                placeholder="Lista los valores fundamentales de tu organización (uno por línea)..."
              />
              {errors.values && (
                <p className="text-red-500 text-sm mt-1">{errors.values.message}</p>
              )}
            </div>
          </div>

          {/* Sección B: Objetivos Estratégicos Detallados */}
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900">
              Objetivos Estratégicos Detallados
            </h4>
            <p className="text-sm text-gray-600">
              Define los objetivos generales y específicos de tu empresa.
            </p>

            {/* Objetivos Generales */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-md font-medium text-gray-800">Objetivos Generales o Estratégicos</h5>
                <button
                  type="button"
                  onClick={addGeneralObjective}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir objetivo general</span>
                </button>
              </div>
              <div className="space-y-6">
                {generalObjectives.map((generalObj, generalIndex) => (
                  <div key={generalObj.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Objetivo general #{generalObj.id}
                      </label>
                      {generalObjectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGeneralObjective(generalIndex)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={generalObj.text}
                      onChange={(e) => updateGeneralObjective(generalIndex, e.target.value)}
                      className="input mb-4"
                      placeholder={`Define el objetivo general ${generalObj.id}...`}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-sm font-medium text-gray-700">Objetivos Específicos</h6>
                        <button
                          type="button"
                          onClick={() => addSpecificObjective(generalIndex)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Añadir objetivo específico</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {generalObj.specificObjectives.map((specificObj, specificIndex) => (
                          <div key={specificObj.id} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 w-40 flex-shrink-0">
                              Objetivo específico #{specificObj.id}
                            </span>
                            <input
                              type="text"
                              value={specificObj.text}
                              onChange={(e) => updateSpecificObjective(generalIndex, specificIndex, e.target.value)}
                              className="input flex-1"
                              placeholder={`Define el objetivo específico ${specificObj.id}...`}
                            />
                            {generalObj.specificObjectives.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeSpecificObjective(generalIndex, specificIndex)}
                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Identidad Empresarial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IdentityEditor
