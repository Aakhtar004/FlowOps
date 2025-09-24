import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Building } from 'lucide-react'
import { useToast } from '../ui/Toast'

const IdentityEditor = ({ planId, initialData, onSave }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      mission: '',
      vision: '',
      values: '',
      objectives: ''
    }
  })

  // Manejo de lista dinámica de valores
  const [valuesList, setValuesList] = useState([''])

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.values) {
        try {
          const arr = JSON.parse(initialData.values)
          if (Array.isArray(arr)) setValuesList(arr.length ? arr : [''])
          else setValuesList([initialData.values])
        } catch {
          setValuesList([initialData.values])
        }
      } else {
        setValuesList([''])
      }
    }
  }, [initialData, reset])

  const handleValueChange = (idx, val) => {
    setValuesList(list => list.map((v, i) => i === idx ? val : v))
  }
  const handleAddValue = () => {
    setValuesList(list => [...list, ''])
  }
  const handleRemoveValue = (idx) => {
    setValuesList(list => list.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Guardar los valores como array JSON
      const submitData = { ...data, values: JSON.stringify(valuesList.filter(v => v.trim())) }
      const response = await fetch(`/api/v1/plans/${planId}/identity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(submitData)
      })
      if (!response.ok) {
        throw new Error('Error al guardar la identidad empresarial')
      }
      await onSave(submitData)
      success('Identidad empresarial guardada correctamente')
    } catch (err) {
      error('Error al guardar la identidad empresarial')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="card-title">Identidad de la Empresa</h3>
        </div>
        <p className="card-description">
          Define los elementos fundamentales de tu organización
        </p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Misión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Misión
            </label>
            <textarea
              {...register('mission', { 
                required: 'La misión es requerida',
                minLength: { value: 20, message: 'La misión debe tener al menos 20 caracteres' }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visión
            </label>
            <textarea
              {...register('vision', { 
                required: 'La visión es requerida',
                minLength: { value: 20, message: 'La visión debe tener al menos 20 caracteres' }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valores
            </label>
            <div className="space-y-2">
              {valuesList.map((valor, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={valor}
                    onChange={e => handleValueChange(idx, e.target.value)}
                    className="input flex-1"
                    placeholder={`Valor ${idx + 1}`}
                  />
                  {valuesList.length > 1 && (
                    <button type="button" onClick={() => handleRemoveValue(idx)} className="text-red-500 hover:text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddValue} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2">
                <span className="text-lg font-bold">+</span> Agregar valor
              </button>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || !isDirty || valuesList.filter(v => v.trim()).length === 0}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Identidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IdentityEditor
